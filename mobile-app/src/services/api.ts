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

// Use the actual bolt.diy API endpoints
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://bolt.diy' 
  : 'http://localhost:5173';

class APIClient {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      const tokenData = await AsyncStorage.multiGet(['auth_token', 'refresh_token']);
      this.token = tokenData[0][1];
      this.refreshToken = tokenData[1][1];
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  private async saveToken(token: string, refreshToken?: string) {
    try {
      const items = [['auth_token', token]];
      if (refreshToken) {
        items.push(['refresh_token', refreshToken]);
        this.refreshToken = refreshToken;
      }
      await AsyncStorage.multiSet(items);
      this.token = token;
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'bolt.diy-mobile/1.0.0',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle token refresh if needed
      if (response.status === 401 && this.refreshToken) {
        const newToken = await this.handleTokenRefresh();
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<string | null> {
    if (!this.refreshToken) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.saveToken(data.token, data.refreshToken);
        return data.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
    }
    return null;
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    await this.saveToken(response.token, response.refreshToken);
    return response;
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.request('/api/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      this.token = null;
      this.refreshToken = null;
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    await this.saveToken(response.token, response.refreshToken);
    return response;
  }

  // AI Chat - Real implementation using bolt.diy's chat API
  async sendMessage(message: string, conversationId?: string): Promise<AIResponse> {
    return this.request<AIResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        conversationId,
        platform: 'mobile',
        timestamp: new Date().toISOString()
      }),
    });
  }

  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/api/chat/conversations');
  }

  async getConversation(id: string): Promise<Conversation> {
    return this.request<Conversation>(`/api/chat/conversations/${id}`);
  }

  async deleteConversation(id: string): Promise<void> {
    return this.request(`/api/chat/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects - Real implementation using bolt.diy's project API
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  async createProject(config: {
    name: string;
    description?: string;
    framework: string;
    template?: string;
  }): Promise<Project> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        ...config,
        platform: 'mobile',
        createdAt: new Date().toISOString(),
      }),
    });
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // File Operations - Real implementation using bolt.diy's file API
  async getFileTree(projectId: string): Promise<FileNode[]> {
    return this.request<FileNode[]>(`/api/projects/${projectId}/files`);
  }

  async getFileContent(projectId: string, path: string): Promise<string> {
    const response = await this.request<{ content: string }>(
      `/api/projects/${projectId}/files/content?path=${encodeURIComponent(path)}`
    );
    return response.content;
  }

  async updateFile(projectId: string, path: string, content: string): Promise<void> {
    await this.request(`/api/projects/${projectId}/files`, {
      method: 'PUT',
      body: JSON.stringify({ 
        path, 
        content,
        timestamp: new Date().toISOString(),
        platform: 'mobile'
      }),
    });
  }

  async createFile(projectId: string, path: string, content: string): Promise<void> {
    await this.request(`/api/projects/${projectId}/files`, {
      method: 'POST',
      body: JSON.stringify({ path, content }),
    });
  }

  async deleteFile(projectId: string, path: string): Promise<void> {
    await this.request(`/api/projects/${projectId}/files?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });
  }

  // Build & Deploy - Real implementation using bolt.diy's build API
  async triggerBuild(projectId: string): Promise<BuildResult> {
    return this.request<BuildResult>(`/api/projects/${projectId}/build`, {
      method: 'POST',
      body: JSON.stringify({
        platform: 'mobile',
        timestamp: new Date().toISOString(),
      }),
    });
  }

  async getBuildStatus(buildId: string): Promise<BuildResult> {
    return this.request<BuildResult>(`/api/builds/${buildId}`);
  }

  async getBuildLogs(buildId: string): Promise<{ logs: string[] }> {
    return this.request<{ logs: string[] }>(`/api/builds/${buildId}/logs`);
  }

  // Deploy operations
  async deployProject(projectId: string, environment: 'preview' | 'production' = 'preview'): Promise<{ deploymentUrl: string }> {
    return this.request<{ deploymentUrl: string }>(`/api/projects/${projectId}/deploy`, {
      method: 'POST',
      body: JSON.stringify({ environment }),
    });
  }

  // User profile
  async getUserProfile(): Promise<{ user: any }> {
    return this.request<{ user: any }>('/api/user/profile');
  }

  async updateUserProfile(updates: any): Promise<{ user: any }> {
    return this.request<{ user: any }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }
}

export const apiClient = new APIClient();
export default apiClient;