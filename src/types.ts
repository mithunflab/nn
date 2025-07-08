
// Basic types for N8n interactions

export interface N8nConnection {
  id: string;
  instance_name: string;
  base_url: string;
  api_key?: string;
  is_active: boolean;
  workflow_count?: number;
  version?: string;
  created_at: string;
  updated_at: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  nodes?: any[];
  connections?: any;
  staticData?: any;
  settings?: any;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowData: any;
  status: 'success' | 'error' | 'running' | 'waiting';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SpeechToTextHook {
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: boolean;
  transcript: string;
  error?: string;
}
