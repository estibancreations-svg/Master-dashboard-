import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  ExternalLink, 
  FileCode, 
  HardDrive, 
  Search, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  AlertCircle,
  Sparkles,
  Inbox,
  ClipboardCheck,
  Calendar
} from 'lucide-react';
import { Project, DriveFileAttachment, GoogleTask, PipelineNode } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { fetchTaskLists, fetchTasks } from '../workspaceApi';

interface ProjectDashboardProps {
  projects: Project[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  accessToken: string | null;
  pipelineNodes?: PipelineNode[];
}

export function DashboardWidget({ 
  pipelineStepsCount, 
  totalAttachments, 
  lastModifiedDate 
}: { 
  pipelineStepsCount: number; 
  totalAttachments: number; 
  lastModifiedDate: string; 
}) {
  const formattedDate = lastModifiedDate
    ? new Date(lastModifiedDate).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-3xs" id="dashboard-widget">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
          <TrendingUp className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-800 font-sans">Active Project Telemetry</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Pipeline steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs" id="widget-steps-stat">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Pipeline Steps</p>
            <h4 className="text-lg font-extrabold font-sans text-slate-800 mt-0.5">{pipelineStepsCount}</h4>
          </div>
        </div>

        {/* Total attachments */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs" id="widget-attachments-stat">
          <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-lg shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Attachments</p>
            <h4 className="text-lg font-extrabold font-sans text-slate-800 mt-0.5">{totalAttachments}</h4>
          </div>
        </div>

        {/* Last Modified */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs min-w-0" id="widget-modified-stat">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Last Modified</p>
            <h4 className="text-[11px] font-bold font-mono text-slate-700 mt-1 truncate" title={formattedDate}>
              {formattedDate}
            </h4>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProjectDashboard({ 
  projects, 
  activeProjectId, 
  setActiveProjectId,
  accessToken,
  pipelineNodes = []
}: ProjectDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'active' | 'production' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [copiedWebhookId, setCopiedWebhookId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  
  // State for preview / inline feedback
  const [previewFile, setPreviewFile] = useState<DriveFileAttachment | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Google Tasks collection state
  const [completedTasks, setCompletedTasks] = useState<GoogleTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;

  // Statistics
  const totalProjects = projects.length;
  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const totalAttachments = projects.reduce((acc, p) => acc + (p.driveAttachments?.length || 0), 0);
  const activeWorkflowCount = projects.filter(p => p.status === 'active' || p.status === 'production').length;

  // Filter & Search projects
  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Load recently completed tasks
  useEffect(() => {
    let active = true;
    
    // Default system fallback checkpoints if user is offline or lack lists
    const mockCompleted: GoogleTask[] = [
      { id: 'm1', title: 'Register Estibancreations intake bucket', notes: 'Configured folder scanning on Google Drive', status: 'completed' },
      { id: 'm2', title: 'Compile initial JSON webhook topology', notes: 'Set up n8n JSON output definitions', status: 'completed' },
      { id: 'm3', title: 'Connect active model weaver node', notes: 'Integrated gemini-2.5-flash prompts', status: 'completed' }
    ];

    if (!accessToken) {
      setCompletedTasks(mockCompleted);
      return;
    }

    const loadCompletedTasks = async () => {
      setTasksLoading(true);
      try {
        const lists = await fetchTaskLists(accessToken);
        if (!active) return;
        if (lists && lists.length > 0) {
          const items = await fetchTasks(accessToken, lists[0].id);
          if (!active) return;
          const completed = items.filter(t => t.status === 'completed');
          if (completed.length > 0) {
            setCompletedTasks(completed.slice(0, 4)); // Get top 4 most recent completed
          } else {
            setCompletedTasks(mockCompleted);
          }
        } else {
          setCompletedTasks(mockCompleted);
        }
      } catch (err) {
        console.warn('Could not load Google Tasks for dashboard, using fallback checkpoints.', err);
        if (active) {
          setCompletedTasks(mockCompleted);
        }
      } finally {
        if (active) {
          setTasksLoading(false);
        }
      }
    };

    loadCompletedTasks();
    return () => {
      active = false;
    };
  }, [accessToken]);

  const handleCopyWebhook = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedWebhookId(id);
    setTimeout(() => setCopiedWebhookId(null), 2000);
  };

  const handleToggleCompleted = async (project: Project) => {
    setIsUpdatingStatus(project.id);
    try {
      const docRef = doc(db, 'projects', project.id);
      const newStatus = project.status === 'completed' ? 'active' : 'completed';
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error toggling project status:', err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const downloadFile = async (file: DriveFileAttachment) => {
    if (!accessToken) {
      setDownloadError('Authentication token is missing. Please log in again.');
      return;
    }
    
    setIsDownloading(file.id);
    setDownloadError(null);
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Google Drive returned ${response.status}: ${await response.text()}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err?.message || 'Download failed. Ensure you have permissions for this file.');
    } finally {
      setIsDownloading(null);
    }
  };

  const getStatusBadgeStyles = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-55 text-emerald-800 border-emerald-200';
      case 'production':
        return 'bg-purple-55 text-purple-800 border-purple-200';
      case 'active':
        return 'bg-amber-55 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Stat Summary Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs font-mono text-slate-400 uppercase tracking-wider font-bold">Total Projects</p>
            <h4 className="text-xl font-bold font-sans text-slate-800 mt-0.5">{totalProjects}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs font-mono text-slate-400 uppercase tracking-wider font-bold">In Progress</p>
            <h4 className="text-xl font-bold font-sans text-slate-800 mt-0.5">{activeCount}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-650 rounded-lg shrink-0">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs font-mono text-slate-400 uppercase tracking-wider font-bold font-semibold">Active Workflows</p>
            <h4 className="text-xl font-bold font-sans text-slate-800 mt-0.5">{activeWorkflowCount}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs font-mono text-slate-400 uppercase tracking-wider font-bold font-semibold">Total Files Attached</p>
            <h4 className="text-xl font-bold font-sans text-slate-800 mt-0.5">{totalAttachments}</h4>
          </div>
        </div>

      </div>

      {/* 1.5. Recently Completed Tasks Cards Row */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Recently Completed Tasks</span>
          </div>
          {tasksLoading && <span className="text-[10px] text-slate-400 font-mono animate-pulse">Syncing...</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {completedTasks.slice(0, 3).map((task) => (
            <div 
              key={task.id} 
              className="bg-white border border-slate-150 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition flex items-start gap-2.5"
            >
              <div className="p-1 bg-emerald-50 text-emerald-600 rounded shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-3xs font-semibold text-slate-800 truncate" title={task.title}>
                  {task.title}
                </p>
                <p className="text-[10px] text-slate-450 line-clamp-1 leading-normal">
                  {task.notes || 'System action certified.'}
                </p>
              </div>
            </div>
          ))}
          {completedTasks.length === 0 && (
            <div className="col-span-full py-4 text-center text-3xs text-slate-450 font-mono bg-white rounded-lg border border-slate-150">
              No completed checkpoints logged. Complete a task inside the Google Tasks tab!
            </div>
          )}
        </div>
      </div>

      {downloadError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600" />
          <span className="font-medium">{downloadError}</span>
        </div>
      )}

      {/* 2. Main split interactive workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left column: Projects quick selector and status filter (2/5 size) */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs space-y-4">
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800">Pipeline Registry</p>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Status Tabs Filter list */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 select-none">
              {(['all', 'draft', 'active', 'production', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-full text-4xs font-mono uppercase font-bold border transition cursor-pointer ${
                    filter === tab
                      ? 'bg-slate-900 border-slate-905 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filtered list body */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-slate-200 rounded-lg text-slate-400 space-y-2">
                  <Inbox className="w-7 h-7 mx-auto text-slate-300" />
                  <p className="text-3xs font-sans">No matching telemetry projects found.</p>
                </div>
              ) : (
                filteredProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => setActiveProjectId(proj.id)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                      activeProject?.id === proj.id
                        ? 'bg-indigo-50/45 border-indigo-300 shadow-3xs'
                        : 'bg-white border-slate-150 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-800 truncate">{proj.name}</p>
                      <p className="text-4xs text-slate-450 line-clamp-1 leading-normal">
                        {proj.description || 'No custom description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold border ${getStatusBadgeStyles(proj.status)}`}>
                        {proj.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        {/* Right column: Detailed Project Inspection summary (3/5 size) */}
        <div className="lg:col-span-3">
          {activeProject ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
              
              {/* Header card aspect */}
              <div className="p-6 bg-slate-900 border-b border-slate-800 text-white relative">
                <div className="absolute right-4 top-4">
                  <Sparkles className="w-5 h-5 text-indigo-400/70" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-3xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-550/30 px-2 py-0.5 rounded font-bold uppercase">
                      Workspace active
                    </span>
                    <span className={`text-3xs font-mono border px-2 py-0.5 rounded font-bold uppercase ${getStatusBadgeStyles(activeProject.status)}`}>
                      {activeProject.status}
                    </span>
                  </div>
                  <h3 className="text-md font-sans font-bold text-slate-100 mt-1">{activeProject.name}</h3>
                  <p className="text-3xs text-slate-400 font-sans leading-relaxed max-w-xl">{activeProject.description}</p>
                </div>
              </div>

              {/* Status Action bar (Allows users to mark projects as draft, active, production or complete!) */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600" />
                  <span className="font-semibold text-slate-700">Project Completion State</span>
                </div>

                <button
                  onClick={() => handleToggleCompleted(activeProject)}
                  disabled={isUpdatingStatus === activeProject.id}
                  className={`px-4 py-2 rounded-lg text-3xs font-bold uppercase font-mono tracking-wider transition-all select-none cursor-pointer flex items-center gap-1.5 ${
                    activeProject.status === 'completed'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                >
                  {isUpdatingStatus === activeProject.id ? (
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                  ) : activeProject.status === 'completed' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Mark as Inactive / Pending
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Completed
                    </>
                  )}
                </button>
              </div>

              {/* Grid content segments */}
              <div className="p-6 space-y-6 flex-1 bg-white">
                
                {/* Dashboard statistics widget */}
                <DashboardWidget 
                  pipelineStepsCount={pipelineNodes.length}
                  totalAttachments={activeProject.driveAttachments?.length || 0}
                  lastModifiedDate={activeProject.updatedAt || activeProject.createdAt}
                />
                
                {/* Section A: Google Drive Files quick-lists */}
                <div className="space-y-3">
                  <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-indigo-500" />
                    Associated Google Drive Files ({activeProject.driveAttachments?.length || 0})
                  </h4>

                  {(!activeProject.driveAttachments || activeProject.driveAttachments.length === 0) ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 bg-slate-50/50 rounded-lg text-slate-500 text-3xs">
                      No Google Drive files associated to this pipeline project yet.<br />
                      Navigate to the <span className="font-bold text-indigo-600">Drive Explorer</span> tab above to associate folders or assets.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-150 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
                      {activeProject.driveAttachments.map((file) => (
                        <div key={file.id} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                          <div className="min-w-0 pr-2">
                            <p className="text-3xs font-bold text-slate-750 truncate max-w-[280px]" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[9px] text-slate-400 font-mono truncate max-w-[280px]">
                              id: {file.id} • {file.mimeType}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Download Action button */}
                            <button
                              onClick={() => downloadFile(file)}
                              disabled={isDownloading === file.id}
                              className="p-1 px-2.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition flex items-center gap-1.5 text-4xs font-bold uppercase font-mono tracking-wider cursor-pointer shadow-3xs"
                              title="Download Asset"
                            >
                              {isDownloading === file.id ? (
                                <Clock className="w-3 h-3 animate-spin text-indigo-600" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                              Get
                            </button>
                            
                            {/* Web link Launch */}
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 px-2.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition flex items-center gap-1.5 text-4xs font-bold uppercase font-mono tracking-wider shadow-3xs"
                                title="View in Google Drive"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Drive
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: n8n workflow integration details */}
                <div className="space-y-3">
                  <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-indigo-500" />
                    Associated n8n Webhook Target Workflow
                  </h4>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-3xs">
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                      <p className="font-bold text-slate-750 font-sans">VisionWeaver Payload Destination</p>
                      <p className="text-slate-500 font-mono select-all truncate bg-white p-2 rounded border border-slate-200 shadow-3xs mt-1.5">
                        {activeProject.n8nWebhookUrl || 'https://visionweaver101.app.n8n.cloud/mcp-server/http'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyWebhook(activeProject.n8nWebhookUrl || 'https://visionweaver101.app.n8n.cloud/mcp-server/http', activeProject.id)}
                      className="px-3.5 py-2 hover:bg-slate-200 text-slate-650 bg-white border border-slate-200/90 rounded font-bold uppercase font-mono tracking-wider transition-all select-none cursor-pointer flex items-center gap-1.5 shrink-0 shadow-3xs hover:shadow-2xs self-start md:self-center"
                    >
                      {copiedWebhookId === activeProject.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="p-16 text-center border border-dashed border-slate-200 rounded-xl bg-white text-slate-500 space-y-3">
              <Sparkles className="w-10 h-10 mx-auto text-slate-350" />
              <div>
                <p className="text-xs font-semibold text-slate-600">No telemetry project selected</p>
                <p className="text-3xs text-slate-450 leading-relaxed max-w-xs mx-auto">Select a project registry item or initialize a new one in the left panel block.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
