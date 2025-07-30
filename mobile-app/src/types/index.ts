// Core types for the mobile app
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'building';
  framework: string;
  files?: FileNode[];
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  size?: number;
  lastModified?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  projectId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  projectId?: string;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface BuildResult {
  id: string;
  status: 'pending' | 'building' | 'success' | 'failed';
  url?: string;
  logs?: string[];
  error?: string;
}

export interface NotificationData {
  type: 'build' | 'collaboration' | 'system';
  title: string;
  body: string;
  data?: any;
}