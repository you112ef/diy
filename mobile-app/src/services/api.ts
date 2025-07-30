import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AuthResponse, 
  LoginCredentials, 
  Project, 
  Conversation, 
  ChatMessage, 
  AIResponse,
  FileNode,
  BuildResult 
} from '../types';

const API_BASE_URL = 'https://bolt.diy'; // Replace with actual API URL

class APIClient {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem('auth_token', token);
      this.token = token;
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    await this.saveToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    this.token = null;
  }

  // AI Chat
  async sendMessage(message: string, conversationId?: string): Promise<AIResponse> {
    return this.request<AIResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        conversationId,
        platform: 'mobile' 
      }),
    });
  }

  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/chat/conversations');
  }

  async getConversation(id: string): Promise<Conversation> {
    return this.request<Conversation>(`/chat/conversations/${id}`);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(config: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // File Operations
  async getFileTree(projectId: string): Promise<FileNode[]> {
    return this.request<FileNode[]>(`/projects/${projectId}/files`);
  }

  async getFileContent(projectId: string, path: string): Promise<string> {
    const response = await this.request<{ content: string }>(
      `/projects/${projectId}/files/content?path=${encodeURIComponent(path)}`
    );
    return response.content;
  }

  async updateFile(projectId: string, path: string, content: string): Promise<void> {
    await this.request(`/projects/${projectId}/files`, {
      method: 'PUT',
      body: JSON.stringify({ path, content }),
    });
  }

  // Build & Deploy
  async triggerBuild(projectId: string): Promise<BuildResult> {
    return this.request<BuildResult>(`/projects/${projectId}/build`, {
      method: 'POST',
    });
  }

  async getBuildStatus(buildId: string): Promise<BuildResult> {
    return this.request<BuildResult>(`/builds/${buildId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiClient = new APIClient();
export default apiClient;