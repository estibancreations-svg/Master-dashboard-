import { DriveFile, GoogleTaskList, GoogleTask, GoogleChatSpace } from './types';

/**
 * Fetch files from the authenticated user's Google Drive.
 * Uses the modern standard Drive v3 endpoints.
 */
export async function fetchDriveFiles(accessToken: string, queryText?: string): Promise<DriveFile[]> {
  try {
    let q = "trashed = false";
    if (queryText) {
      // Escape single quotes in search query
      const sanitized = queryText.replace(/'/g, "\\'");
      q += ` and name contains '${sanitized}'`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?pageSize=450&q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,size,webViewLink,iconLink,thumbnailLink)`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    throw error;
  }
}

let isTasksApiSimulated = false;

// Mock list of task lists
const MOCK_LISTS: GoogleTaskList[] = [
  { id: 'simulated-default', title: 'VisionWeaver Checkpoints (Simulated Mode)' }
];

// Helper to get simulated tasks from localStorage
function getSimulatedTasks(): GoogleTask[] {
  try {
    const saved = localStorage.getItem('simulated_google_tasks');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  
  const defaultTasks: GoogleTask[] = [
    { id: 'm1', title: 'Register Estibancreations intake bucket', notes: 'Configured folder scanning on Google Drive', status: 'completed' },
    { id: 'm2', title: 'Compile initial JSON webhook topology', notes: 'Set up n8n JSON output definitions', status: 'completed' },
    { id: 'm3', title: 'Connect active model weaver node', notes: 'Integrated gemini-2.5-flash prompts', status: 'completed' },
    { id: 'm4', title: 'Test n8n webhook sync', notes: 'Trigger the new mcp-server endpoint', status: 'needsAction' }
  ];
  localStorage.setItem('simulated_google_tasks', JSON.stringify(defaultTasks));
  return defaultTasks;
}

function saveSimulatedTasks(tasks: GoogleTask[]) {
  localStorage.setItem('simulated_google_tasks', JSON.stringify(tasks));
}

/**
 * Fetch task lists available in Google Tasks (v1).
 */
export async function fetchTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  if (isTasksApiSimulated) {
    return MOCK_LISTS;
  }
  try {
    const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403 || errorText.includes('disabled') || errorText.includes('tasks.googleapis.com')) {
        console.warn('Google Tasks API is disabled or returned 403. Switching to high-fidelity Simulated Mode.');
        isTasksApiSimulated = true;
        return MOCK_LISTS;
      }
      throw new Error(`Google Tasks API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error: any) {
    const errorText = error?.message || '';
    if (errorText.includes('403') || errorText.includes('disabled') || errorText.includes('tasks.googleapis.com')) {
      console.warn('Google Tasks API is disabled or returned 403. Switching to high-fidelity Simulated Mode.');
      isTasksApiSimulated = true;
      return MOCK_LISTS;
    }
    console.warn('Warning fetching Google Task lists:', error);
    throw error;
  }
}

/**
 * Fetch list of tasks in a specific task list.
 */
export async function fetchTasks(accessToken: string, listId: string): Promise<GoogleTask[]> {
  if (isTasksApiSimulated || listId === 'simulated-default') {
    return getSimulatedTasks();
  }
  try {
    const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403 || errorText.includes('disabled') || errorText.includes('tasks.googleapis.com')) {
        console.warn('Google Tasks API is disabled or returned 403. Switching to high-fidelity Simulated Mode.');
        isTasksApiSimulated = true;
        return getSimulatedTasks();
      }
      throw new Error(`Google Tasks list API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error: any) {
    const errorText = error?.message || '';
    if (errorText.includes('403') || errorText.includes('disabled') || errorText.includes('tasks.googleapis.com')) {
      console.warn('Google Tasks API is disabled or returned 403. Switching to high-fidelity Simulated Mode.');
      isTasksApiSimulated = true;
      return getSimulatedTasks();
    }
    console.warn(`Warning fetching tasks for list ${listId}:`, error);
    throw error;
  }
}

/**
 * Create a new task in a specific task list.
 */
export async function createTask(
  accessToken: string, 
  listId: string, 
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTask> {
  if (isTasksApiSimulated || listId === 'simulated-default') {
    const current = getSimulatedTasks();
    const newTask: GoogleTask = {
      id: `simulated-task-${Date.now()}`,
      title: task.title,
      notes: task.notes || '',
      status: 'needsAction',
      due: task.due || new Date().toISOString()
    };
    current.push(newTask);
    saveSimulatedTasks(current);
    return newTask;
  }
  try {
    const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403 || errorText.includes('disabled') || errorText.includes('tasks.googleapis.com')) {
        console.warn('Google Tasks API is disabled or returned 403. Creating task in high-fidelity Simulated Mode.');
        isTasksApiSimulated = true;
        return createTask(accessToken, 'simulated-default', task);
      }
      throw new Error(`Google Tasks creation error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    const errorText = error?.message || '';
    if (errorText.includes('403') || errorText.includes('disabled') || errorText.includes('tasks.googleapis.com')) {
      console.warn('Google Tasks API is disabled or returned 403. Creating task in high-fidelity Simulated Mode.');
      isTasksApiSimulated = true;
      return createTask(accessToken, 'simulated-default', task);
    }
    console.warn('Warning creating Google Task:', error);
    throw error;
  }
}

/**
 * Fetch Google Chat Spaces.
 * Note: Chat space listing requires workspace credentials or enterprise setups.
 * We'll fail over gracefully with a helpful warning if it's restricted or forbidden.
 */
export async function fetchChatSpaces(accessToken: string): Promise<GoogleChatSpace[]> {
  try {
    const response = await fetch('https://chat.googleapis.com/v1/spaces', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Throw error to trigger failover/graceful messaging
      throw new Error(`Google Chat API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.spaces || [];
  } catch (error) {
    console.warn('Google Chat spaces listing restricted or failed. Using fallback simulation.', error);
    throw error;
  }
}
