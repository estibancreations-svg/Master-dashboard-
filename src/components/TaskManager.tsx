import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  RefreshCw, 
  Calendar, 
  FileText, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { fetchTaskLists, fetchTasks, createTask } from '../workspaceApi';
import { GoogleTaskList, GoogleTask, Project } from '../types';

interface TaskManagerProps {
  accessToken: string;
  activeProject: Project | null;
}

export default function TaskManager({ accessToken, activeProject }: TaskManagerProps) {
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields for new Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  
  // Confirmation state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Load Tasklists
  const loadLists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const lists = await fetchTaskLists(accessToken);
      setTaskLists(lists);
      if (lists.length > 0) {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sync Google Tasklists.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load tasks inside selected Tasklist
  const loadTasks = async (listId: string) => {
    if (!listId) return;
    setIsTasksLoading(true);
    try {
      const items = await fetchTasks(accessToken, listId);
      setTasks(items);
    } catch (err: any) {
      console.warn('Failed to load tasks for list:', listId);
    } finally {
      setIsTasksLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, [accessToken]);

  useEffect(() => {
    if (selectedListId) {
      loadTasks(selectedListId);
    }
  }, [selectedListId]);

  // Autofill task template if project shifts
  useEffect(() => {
    if (activeProject) {
      setNewTaskTitle(`Execute VisionWeaver: ${activeProject.name}`);
      setNewTaskNotes(`Review production pipeline attachments (${activeProject.driveAttachments.length} files associated).\nn8n webhook target: ${activeProject.n8nWebhookUrl}`);
    }
  }, [activeProject]);

  const handleCreateTaskInit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    
    // Explicit mandatory authorization dialog
    setShowConfirmModal(true);
  };

  const handleConfirmCreateTask = async () => {
    setIsCreating(true);
    try {
      const payload: { title: string; notes?: string; due?: string } = {
        title: newTaskTitle,
      };
      if (newTaskNotes) payload.notes = newTaskNotes;
      if (newTaskDue) {
        // Formate date to RFC 3339 timestamp as required by Tasks API
        const date = new Date(newTaskDue);
        payload.due = date.toISOString();
      }

      await createTask(accessToken, selectedListId, payload);
      
      // Reset form & close modal
      setNewTaskTitle(activeProject ? `Execute VisionWeaver: ${activeProject.name}` : '');
      setNewTaskNotes(activeProject ? `Review production attachments (${activeProject.driveAttachments.length} items).\nWebhook: ${activeProject.n8nWebhookUrl}` : '');
      setNewTaskDue('');
      setShowConfirmModal(false);
      
      // Reload task lists
      loadTasks(selectedListId);
    } catch (err: any) {
      alert(`Error creating Google Task: ${err?.message || 'Unknown network error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleTask = (task: GoogleTask) => {
    if (selectedListId === 'simulated-default') {
      try {
        const saved = localStorage.getItem('simulated_google_tasks');
        if (saved) {
          const items = JSON.parse(saved) as GoogleTask[];
          const updated = items.map(item => {
            if (item.id === task.id) {
              return {
                ...item,
                status: item.status === 'completed' ? 'needsAction' : 'completed'
              };
            }
            return item;
          });
          localStorage.setItem('simulated_google_tasks', JSON.stringify(updated));
          setTasks(updated);
        }
      } catch (e) {}
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            Google Tasks Production Checkpoints
          </h2>
          <p className="text-slate-550 text-xs">
            Manage your project actions directly in Google Tasks. Create, track, and sync action cards seamlessly.
          </p>
        </div>

        <button
          onClick={loadLists}
          className="p-2 border border-slate-200 text-slate-650 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer self-start md:self-auto shadow-2xs"
          title="Refresh task list"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-5 text-center text-xs space-y-3">
          {error.includes('tasks.googleapis.com') || error.includes('disabled') || error.includes('403') ? (
            <div className="space-y-3">
              <p className="font-mono font-bold text-rose-800">Google Tasks API Needs Activation</p>
              <p className="text-slate-550 text-xs leading-relaxed max-w-xl mx-auto">
                The Google Tasks API is currently disabled or hasn't been activated for your Cloud project (<span className="font-mono font-bold">588476006256</span>). Please open the link below to enable it in your browser:
              </p>
              <div className="p-3.5 bg-white border border-rose-100 rounded-xl max-w-xl mx-auto shadow-2xs">
                <a 
                  href="https://console.developers.google.com/apis/api/tasks.googleapis.com/overview?project=588476006256"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 font-bold underline break-all text-[11px] flex items-center justify-center gap-1"
                >
                  🔗 Click here to enable Google Tasks API for Project 588476006256
                </a>
              </div>
              <p className="text-slate-400 text-3xs italic">
                After enabling the API, wait 60 seconds and click "Retry Sync" below to load your checkpoint lists.
              </p>
            </div>
          ) : (
            <>
              <p className="font-mono font-bold text-rose-800">Sync Error: {error}</p>
              <p className="text-slate-550 text-2xs">Tasklist capabilities require valid Workspace authentication. Ensure your token is fresh.</p>
            </>
          )}
          <div className="pt-2">
            <button
              onClick={loadLists}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-sans text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              Retry Sync
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col justify-center items-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-550 text-xs font-mono">Syncing with Google Tasks folder...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create Tasks Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Create Production Task</h3>
            
            <form onSubmit={handleCreateTaskInit} className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200 font-sans">
              <div>
                <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Target Tasklist</label>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full bg-white text-slate-800 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {taskLists.map(list => (
                    <option key={list.id} value={list.id}>{list.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="Review VisionWeaver pipelines..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  className="w-full bg-white text-slate-800 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Task Notes</label>
                <textarea
                  rows={3}
                  placeholder="Associated drive attachments, parameters, pipeline checklist..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full bg-white text-slate-800 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans resize-none"
                />
              </div>

              <div>
                <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="w-full bg-white text-slate-800 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Register Task Checkpoint
              </button>
            </form>
          </div>

          {/* Active Tasks list (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-indigo-600" />
                Active Checkpoint Cards ({tasks.length})
              </h3>
            </div>

            {selectedListId === 'simulated-default' && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-2 text-slate-650 text-3xs leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Simulated Sandbox Active:</span> The Google Tasks API hasn't been activated yet for Cloud project <span className="font-mono font-bold">588476006256</span>. We've automatically launched a local sandbox so you can track action checklists here!
                  <a
                    href="https://console.developers.google.com/apis/api/tasks.googleapis.com/overview?project=588476006256"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-bold underline ml-1.5 inline-block"
                  >
                    🔗 Enable API in Google Console
                  </a>
                </div>
              </div>
            )}

            {isTasksLoading ? (
              <div className="bg-slate-50 border border-slate-200 h-[320px] rounded-xl flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl space-y-2 bg-slate-50/50 h-[320px] flex flex-col justify-center">
                <p className="text-slate-500 text-xs font-sans">No checkpoints registered inside this list.</p>
                <p className="text-slate-400 text-2xs">Your tasks created here will sync back to your primary Google account.</p>
              </div>
            ) : (
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 overflow-y-auto max-h-[320px] space-y-3 shadow-xs">
                {tasks.map(task => (
                  <div key={task.id} className="p-3 rounded-lg bg-white border border-slate-200 flex items-start gap-3 hover:bg-slate-50 transition">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTask(task)}
                      className="mt-0.5 rounded border-slate-250 text-indigo-600 bg-white cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <p className={`text-xs font-bold leading-relaxed ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </p>
                      {task.notes && (
                        <p className="text-4xs font-sans text-slate-500 whitespace-pre-wrap leading-relaxed max-w-md">
                          {task.notes}
                        </p>
                      )}
                      
                      {task.due && (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-600 pt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {new Date(task.due).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3 text-indigo-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="text-md font-bold font-sans text-slate-900">Confirm Google Task Registration</h4>
            </div>

            <div className="space-y-3 font-sans text-xs text-slate-600">
              <p>
                Are you sure you want to write this work task directly to your Google Workspace account?
              </p>
              
              <div className="bg-slate-50 p-3 rounded-lg space-y-2 border border-slate-200">
                <p className="font-bold text-slate-800 truncate">Title: {newTaskTitle}</p>
                {newTaskNotes && <p className="text-slate-500 text-2xs line-clamp-2">Details: {newTaskNotes}</p>}
                {newTaskDue && <p className="text-slate-550 text-2xs">Due: {new Date(newTaskDue).toLocaleDateString()}</p>}
              </div>

              <p className="text-3xs text-slate-400 leading-normal">
                Executing this call will register a task in your checked task list.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 font-sans font-semibold">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreateTask}
                disabled={isCreating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-70 shadow-xs"
              >
                {isCreating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Registry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
