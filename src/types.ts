export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'production' | 'completed';
  n8nWebhookUrl: string;
  driveAttachments: DriveFileAttachment[];
  selectedChatSpaceId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriveFileAttachment {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
}

export interface PipelineNode {
  id: string;
  type: 'drive_input' | 'process_enhance' | 'process_crop' | 'model_weaver' | 'n8n_dispatch';
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  config: Record<string, any>;
}

export interface Pipeline {
  id: string;
  projectId: string;
  name: string;
  nodes: PipelineNode[];
  userId: string;
  createdAt: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
}

export interface GoogleChatSpace {
  name: string; // resource name, e.g. "spaces/AAAAMMM"
  displayName?: string;
  type?: string;
}

export interface NotificationLog {
  id: string;
  projectId: string;
  projectName: string;
  message: string;
  spaceId: string;
  spaceName: string;
  status: 'success' | 'failed';
  createdAt: string;
  userId: string;
}
