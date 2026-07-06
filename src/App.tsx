import React, { useState, useEffect } from 'react';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  db, 
  auth, 
  setAccessToken 
} from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { 
  Network, 
  HardDrive, 
  Activity, 
  FileCode, 
  CheckSquare, 
  MessageSquare, 
  LogOut, 
  Plus, 
  FolderOpen,
  Briefcase,
  AlertCircle,
  Database,
  RefreshCw,
  LayoutDashboard,
  Search,
  Award,
  Cpu,
  Kanban,
  Video,
  ThumbsUp,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  ShieldAlert,
  Sliders,
  Globe,
  Lock
} from 'lucide-react';

// Models & Subcomponents
import { Project, PipelineNode, DriveFileAttachment, Pipeline } from './types';
import LoginScreen from './components/LoginScreen';
import ProjectDashboard from './components/ProjectDashboard';
import DriveExplorer from './components/DriveExplorer';
import PipelineWeaver from './components/PipelineWeaver';
import N8nPayloadBuilder from './components/N8nPayloadBuilder';
import TaskManager from './components/TaskManager';
import ChatNotifications from './components/ChatNotifications';

// Operational 14 Tabs Imports
import DashboardTab from './components/DashboardTab';
import AIMasteryTab from './components/AIMasteryTab';
import AgentHubTab from './components/AgentHubTab';
import LeadsPipelineTab from './components/LeadsPipelineTab';
import ContentEngineTab from './components/ContentEngineTab';
import SocialMediaTab from './components/SocialMediaTab';
import TrendsTab from './components/TrendsTab';
import CommunicationsTab from './components/CommunicationsTab';
import CRMTab from './components/CRMTab';
import FinanceTab from './components/FinanceTab';
import ProductsTab from './components/ProductsTab';
import SystemAuditTab from './components/SystemAuditTab';
import CertificatesTab from './components/CertificatesTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Workspace Projects & Pipelines
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [pipelineNodes, setPipelineNodes] = useState<PipelineNode[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState('');
  
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Active workspace tab (14 distinct tabs)
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'ai-mastery'
    | 'agent-hub'
    | 'leads'
    | 'content-engine'
    | 'social-media'
    | 'trends'
    | 'communications'
    | 'crm'
    | 'finance'
    | 'products'
    | 'system-audit'
    | 'certificates'
    | 'settings'
  >('dashboard');

  // Initialize auth listener
  useEffect(() => {
    const unsub = initAuth(
      (currentUser, cachedToken) => {
        setUser(currentUser);
        setToken(cachedToken);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, []);

  // Handle OAuth Sign In
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(undefined);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err?.message || 'Access denied or canceled during Google Sign-In.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
    setProjects([]);
    setActiveProjectId('');
    setPipelineNodes([]);
  };

  // Sync projects from Firestore once user is logged in
  useEffect(() => {
    if (!user) return;

    setIsSidebarLoading(true);
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', user.uid));

    // Realtime changes hook
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Project[] = [];
      snapshot.forEach((snapshotDoc) => {
        items.push({ id: snapshotDoc.id, ...snapshotDoc.data() } as Project);
      });
      
      setProjects(items);
      
      // Auto-select first project if nothing selected or matches
      if (items.length > 0) {
        if (!activeProjectId || !items.some(p => p.id === activeProjectId)) {
          setActiveProjectId(items[0].id);
        }
      }
      setIsSidebarLoading(false);
    }, (error) => {
      console.error("Firestore projects listing failing: ", error);
      setIsSidebarLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync Pipeline Nodes from Firestore when selected project shifts
  useEffect(() => {
    if (!user || !activeProjectId) return;

    const pipelineRef = collection(db, 'pipelines');
    const q = query(
      pipelineRef, 
      where('projectId', '==', activeProjectId),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const pipelineDoc = snapshot.docs[0];
        const data = pipelineDoc.data() as Pipeline;
        setPipelineNodes(data.nodes || []);
      } else {
        // Create an initial empty default nodes set for this project
        setPipelineNodes([]);
      }
    });

    return () => unsubscribe();
  }, [activeProjectId, user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !user) return;

    try {
      const projectsRef = collection(db, 'projects');
      const docPayload = {
        name: newProjectName,
        description: newProjectDesc || 'No custom description provided.',
        status: 'draft',
        n8nWebhookUrl: 'https://visionweaver101.app.n8n.cloud/mcp-server/http',
        driveAttachments: [],
        selectedChatSpaceId: '',
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(projectsRef, docPayload);
      setActiveProjectId(docRef.id);
      
      // Create corresponding default nodes pipeline
      const pipelineRef = collection(db, 'pipelines');
      await addDoc(pipelineRef, {
        projectId: docRef.id,
        name: 'Default Pipeline Topology',
        nodes: [
          {
            id: 'n_input',
            type: 'drive_input',
            name: 'Drive Asset Intake-Default',
            status: 'pending',
            config: { label: 'Estibancreations Bucket', format: 'image/all' }
          },
          {
            id: 'n_dispatch',
            type: 'n8n_dispatch',
            name: 'n8n Outbound Webhook-Default',
            status: 'pending',
            config: { webhook: 'https://visionweaver101.app.n8n.cloud/mcp-server/http' }
          }
        ],
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProjectForm(false);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  // Modify attachments inside selected project
  const handleModifyAttachments = async (files: DriveFileAttachment[]) => {
    if (!activeProjectId || !user) return;
    try {
      const docRef = doc(db, 'projects', activeProjectId);
      await updateDoc(docRef, {
        driveAttachments: files,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error syncing attachments:', err);
    }
  };

  // Modify pipeline nodes topology in Firestore
  const handleModifyNodes = async (nodesList: PipelineNode[]) => {
    if (!user || !activeProjectId) return;
    try {
      const pipelineRef = collection(db, 'pipelines');
      const q = query(
        pipelineRef, 
        where('projectId', '==', activeProjectId),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const pipelineDocRef = doc(db, 'pipelines', snapshot.docs[0].id);
        await updateDoc(pipelineDocRef, {
          nodes: nodesList
        });
      } else {
        // If no pipeline config exists, create one
        await addDoc(pipelineRef, {
          projectId: activeProjectId,
          name: 'Project Topology',
          nodes: nodesList,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error saving pipeline nodes:', err);
    }
  };

  // Update specific target webhook properties
  const handleUpdateWebhookUrl = async (url: string) => {
    if (!activeProjectId || !user) return;
    try {
      const docRef = doc(db, 'projects', activeProjectId);
      await updateDoc(docRef, {
        n8nWebhookUrl: url,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating webhook url:', err);
    }
  };

  const handleTriggerWebhookDispatchMock = (payload: Record<string, any>) => {
    console.log("n8n Attachment Dispatch simulated with parameters:", payload);
  };

  // Render Login state if not authenticated
  if (needsAuth) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        isLoggingIn={isLoggingIn} 
        error={authError} 
      />
    );
  }

  return (
    <div className={`min-h-screen md:h-screen md:overflow-hidden font-sans flex flex-col antialiased transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F5F5F5] text-slate-900'}`}>
      
      {/* Visual background lines */}
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(40rem_25rem_at_top,rgba(79,70,229,0.03),transparent)] pointer-events-none" />

      {/* Primary Header */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white animate-pulse">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white flex items-center gap-2">
              EstibanCreations <span className="text-indigo-400 font-bold">Workspace Console</span>
              <span className="text-4xs bg-green-500/20 text-green-400 border border-green-500/35 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Level 13 System
              </span>
            </h1>
            <p className="text-slate-400 text-3xs font-mono">
              operator: {user?.email}
            </p>
          </div>
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-4">
          {/* Dark / Light Mode Toggle Button */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors text-slate-300 hover:text-white text-xs font-bold font-mono"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? '☀️ LIGHT' : '🌙 DARK'}
          </button>

          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs bg-slate-800 border border-slate-700">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Profile'} 
                className="w-5.5 h-5.5 rounded-full border border-indigo-500/30" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-5.5 h-5.5 rounded-full bg-slate-705 flex items-center justify-center text-3xs font-bold text-indigo-300 uppercase">
                {user?.displayName ? user.displayName[0] : 'U'}
              </div>
            )}
            <div className="text-left">
              <p className="text-3xs font-bold text-slate-200 leading-none">{user?.displayName || 'Active Member'}</p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">OAuth Access: active</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-750 hover:bg-slate-800 text-slate-350 text-xs transition duration-150 cursor-pointer text-sans"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden xs:inline">Disconnect</span>
          </button>
        </div>
      </header>

      {/* Main Panel grid layout */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Left Sidebar (Operational Tabs & Projects Navigator) - 320px */}
        <aside className="w-full md:w-80 shrink-0 bg-white border-r border-slate-200 p-5 flex flex-col gap-5 select-none text-slate-850 shadow-sm max-h-[calc(100vh-64px)] overflow-y-auto" id="left-sidebar">
          
          {/* Brand block header */}
          <div className="border-b pb-3 border-slate-100">
            <h3 className="text-2xs font-mono font-extrabold uppercase tracking-widest text-slate-400">Systems Core Console</h3>
          </div>

          {/* 14 Distinct Operational Sidebar Tabs list */}
          <div className="space-y-1 flex-1">
            {[
              { id: 'dashboard', name: 'Strategic Notepad Dashboard', icon: LayoutDashboard },
              { id: 'ai-mastery', name: "Ben Angel's AI Academy", icon: Award },
              { id: 'agent-hub', name: 'Autonomous Agent Swarm', icon: Cpu },
              { id: 'leads', name: 'AABOS Leads Pipeline', icon: Kanban },
              { id: 'content-engine', name: 'VisionWeaver / Video Project', icon: Video },
              { id: 'social-media', name: 'Social Media Inbox', icon: ThumbsUp },
              { id: 'trends', name: 'Market Intel & Trends', icon: TrendingUp },
              { id: 'communications', name: 'Client Communications', icon: MessageSquare },
              { id: 'crm', name: 'CRM Portfolio & CLV', icon: Users },
              { id: 'finance', name: 'Finance & Stripe Margin', icon: DollarSign },
              { id: 'products', name: 'Monetization SKUs', icon: ShoppingCart },
              { id: 'system-audit', name: 'System Audit Safeguards', icon: ShieldAlert },
              { id: 'certificates', name: 'LMS Certifications', icon: Award },
              { id: 'settings', name: 'Global Security & Settings', icon: Sliders }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs' 
                      : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  id={`sidebar-tab-${tab.id}`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Collapsible AABOS Project selector block */}
          <div className="border-t pt-4 border-slate-150 space-y-3 font-sans">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-black uppercase text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                Selected Workspace:
              </span>
              <button
                onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors cursor-pointer"
                title="Initialize new workspace"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Selected Active Project detail capsule */}
            {activeProject ? (
              <div className="bg-indigo-50/45 border border-indigo-150 p-2.5 rounded-xl text-[10px] space-y-1">
                <p className="font-bold text-indigo-900 truncate">✓ {activeProject.name}</p>
                <p className="text-slate-500 font-medium leading-normal line-clamp-1">{activeProject.description}</p>
              </div>
            ) : (
              <p className="text-[10px] text-slate-450 italic text-center">No workspace active. Initialize one below.</p>
            )}

            {/* Sidebar Search input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                id="sidebar-project-search"
                type="text"
                placeholder="Search workspaces..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Quick Create Project form */}
            {showNewProjectForm && (
              <form onSubmit={handleCreateProject} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <p className="text-4xs font-mono font-black text-slate-400 uppercase">Initialize Pipeline Workspace</p>
                
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Project Name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-slate-700 rounded px-2.5 py-1 text-3xs focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Workflow Description..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-slate-700 rounded px-2.5 py-1 text-3xs focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectForm(false)}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-650 rounded text-4xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-4xs transition cursor-pointer"
                  >
                    Initialize
                  </button>
                </div>
              </form>
            )}

            {/* Workspaces Scroll list */}
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-0.5">
              {projects
                .filter((p) => p.name.toLowerCase().includes(sidebarSearch.toLowerCase()))
                .map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setActiveProjectId(project.id)}
                    className={`p-2 rounded-lg border text-4xs transition-all cursor-pointer font-sans flex items-center justify-between ${
                      activeProjectId === project.id 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                        : 'bg-white hover:bg-slate-50 border-slate-150 text-slate-600'
                    }`}
                  >
                    <span className="truncate pr-2">{project.name}</span>
                    <span className="shrink-0 font-mono text-slate-400 uppercase font-bold">[{project.status}]</span>
                  </div>
                ))}
            </div>
          </div>

        </aside>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-6 flex flex-col min-w-0 md:h-[calc(100vh-64px)] md:overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300" id="workspace-main-panel">
          
          {/* Active Workspaces viewport container */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-6" id="workspace-viewport">
            
            {activeTab === 'dashboard' && (
              <DashboardTab 
                projectsCount={projects.length}
                attachmentsCount={activeProject?.driveAttachments?.length || 0}
              />
            )}

            {activeTab === 'ai-mastery' && (
              <AIMasteryTab />
            )}

            {activeTab === 'agent-hub' && (
              <AgentHubTab />
            )}

            {activeTab === 'leads' && (
              <LeadsPipelineTab />
            )}

            {activeTab === 'content-engine' && (
              <ContentEngineTab 
                accessToken={token}
                activeProject={activeProject}
                onModifyAttachments={handleModifyAttachments}
                pipelineNodes={pipelineNodes}
                onModifyNodes={handleModifyNodes}
                onDispatchTrigger={handleTriggerWebhookDispatchMock}
                onUpdateProjectWebhook={handleUpdateWebhookUrl}
              />
            )}

            {activeTab === 'social-media' && (
              <SocialMediaTab />
            )}

            {activeTab === 'trends' && (
              <TrendsTab />
            )}

            {activeTab === 'communications' && (
              <div className="space-y-6">
                <CommunicationsTab />
                
                {/* Embedded Tasks Checkpoints and Google Chat notifications features */}
                {token && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TaskManager 
                      accessToken={token} 
                      activeProject={activeProject}
                    />
                    {user && (
                      <ChatNotifications 
                        accessToken={token} 
                        activeProject={activeProject}
                        userId={user.uid}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'crm' && (
              <CRMTab />
            )}

            {activeTab === 'finance' && (
              <FinanceTab />
            )}

            {activeTab === 'products' && (
              <ProductsTab />
            )}

            {activeTab === 'system-audit' && (
              <SystemAuditTab />
            )}

            {activeTab === 'certificates' && (
              <CertificatesTab />
            )}

            {activeTab === 'settings' && (
              <SettingsTab />
            )}

          </div>

        </main>
      </div>

    </div>
  );
}
