/**
 * Centralized API service for frontend-backend communication
 * Provides consistent error handling, authentication, and request management
 */

import { withRetry } from './retry';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = this.getBaseUrl();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'x-company-id': 'seed-company', // TODO: Get from auth context
    };
  }

  private getBaseUrl(): string {
    if (typeof window === 'undefined') {
      // Server-side
      return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787';
    }
    // Client-side
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787';
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      // Check content type before parsing
      const contentType = response.headers.get('content-type') || '';
      
      // Read response as text first (can only read once)
      const text = await response.text();
      
      let data: any;
      
      // Try to parse as JSON if content-type suggests it or if text looks like JSON
      if (contentType.includes('application/json') || (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          // If parsing fails, return text as error
          return {
            success: false,
            error: text || `HTTP ${response.status} ${response.statusText}`,
          };
        }
      } else {
        // Not JSON, return text as error message
        return {
          success: false,
          error: text || `HTTP ${response.status} ${response.statusText}`,
        };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status} ${response.statusText}`,
          data: data,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Response parsing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse response',
      };
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl.replace(/\/$/, '')}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      return await withRetry(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        return await this.handleResponse<T>(response);
      }, {
        maxAttempts: 3,
        baseDelay: 1000,
        retryCondition: (error) => {
          // Retry on network errors, timeouts, and 5xx server errors
          if (error.name === 'AbortError' || error.message?.includes('timeout')) {
            return true;
          }
          if (error.status >= 500) {
            return true;
          }
          return false;
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  // Analytics API
  async getAnalyticsOverview(params: Record<string, string> = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/analytics/overview${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getKPIs(companyId?: string): Promise<ApiResponse> {
    const headers = companyId ? { 'x-company-id': companyId } : {};
    return this.request('/kpis', { headers });
  }

  // Document Analysis API
  async analyzeDocument(
    file: File,
    documentType: string,
    businessContext?: string,
    userId?: string
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (businessContext) {
      formData.append('businessContext', businessContext);
    }

    // Create a custom request for FormData to avoid Content-Type header issues
    const url = `${this.baseUrl.replace(/\/$/, '')}/document/analyze`;
    
    try {
      return await withRetry(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout for file uploads

        // IMPORTANT: Do NOT set Content-Type header when sending FormData
        // The browser will automatically set it with the correct boundary
        const headers: Record<string, string> = {
          'x-company-id': 'seed-company',
        };
        
        // Add user ID if provided
        if (userId) {
          headers['x-user-id'] = userId;
        }

        console.log('Sending upload request:', {
          url,
          method: 'POST',
          hasFile: !!file,
          fileName: file?.name,
          fileSize: file?.size,
          documentType,
          userId: userId || 'not provided',
          headers,
        });

        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers, // Only custom headers, no Content-Type
          signal: controller.signal,
        });

        clearTimeout(timeout);

        console.log('Upload response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        });

        return await this.handleResponse(response);
      }, {
        maxAttempts: 1, // Don't retry - if it fails, show error immediately
        baseDelay: 0,
        retryCondition: () => false, // Never retry
      });
    } catch (error) {
      console.error('Upload fetch error:', error);
      
      if (error instanceof Error) {
        // Handle network errors
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Upload timeout - the request took too long. Please try again with a smaller file.',
          };
        }
        
        // Handle fetch errors (network issues, CORS, etc.)
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return {
            success: false,
            error: `Cannot connect to backend server. Please ensure the backend is running on ${this.baseUrl}`,
          };
        }
        
        return {
          success: false,
          error: error.message || 'Upload failed',
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred during upload',
      };
    }
  }

  async getDocumentHealth(): Promise<ApiResponse> {
    return this.request('/document/health');
  }

  // Chat API
  async askQuestion(question: string, userId?: string, companyId?: string): Promise<ApiResponse> {
    const headers: Record<string, string> = {};
    if (userId) {
      headers['x-user-id'] = userId;
    }
    if (companyId) {
      headers['x-company-id'] = companyId;
    }
    // Ensure at least one ID is provided
    if (!userId && !companyId) {
      headers['x-company-id'] = 'seed-company';
    }
    return this.request('/chat/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
      headers,
    });
  }

  async getChatHistory(userId?: string): Promise<ApiResponse> {
    const headers: Record<string, string> = {};
    if (userId) {
      headers['x-user-id'] = userId;
    } else {
      // Return error if no userId provided since backend requires it
      return Promise.resolve({
        success: false,
        error: 'User ID is required to fetch chat history'
      });
    }
    return this.request('/chat/history', { headers });
  }

  async search(query: string, userId?: string): Promise<ApiResponse> {
    const headers: Record<string, string> = {};
    if (userId) {
      headers['x-user-id'] = userId;
    } else {
      return Promise.resolve({
        success: false,
        error: 'User ID is required for search'
      });
    }
    return this.request(`/search?q=${encodeURIComponent(query)}`, { headers });
  }

  async uploadDocument(
    file: File,
    companyId?: string
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl.replace(/\/$/, '')}/chat/upload`;
    
    try {
      return await withRetry(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: {
            'x-company-id': companyId || 'seed-company',
            // Don't set Content-Type - let the browser set it with boundary
          },
          signal: controller.signal,
        });

        clearTimeout(timeout);
        return await this.handleResponse(response);
      }, {
        maxAttempts: 2,
        baseDelay: 2000,
        retryCondition: (error) => {
          if (error.name === 'AbortError' || error.message?.includes('timeout')) {
            return true;
          }
          if (error.status >= 500) {
            return true;
          }
          return false;
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Upload timeout - file may be too large',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred during upload',
      };
    }
  }

  // Dataset API
  async getDatasets(companyId?: string): Promise<ApiResponse> {
    const headers = companyId ? { 'x-company-id': companyId } : {};
    return this.request('/datasets', { headers });
  }

  async createDataset(
    name: string,
    description: string,
    companyId?: string
  ): Promise<ApiResponse> {
    const headers = companyId ? { 'x-company-id': companyId } : {};
    return this.request('/datasets', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
      headers,
    });
  }

  // Dashboard API - Real Data Integration
  async getDashboardOverview(userId?: string): Promise<ApiResponse> {
    const headers = userId ? { 'x-user-id': userId } : { 'x-user-id': 'cmgtv2kjt0000sfzqb6d91ez0' };
    return this.request('/dashboard/overview', { headers });
  }

  async getCompanyMetrics(userId?: string): Promise<ApiResponse> {
    const headers = userId ? { 'x-user-id': userId } : { 'x-user-id': 'cmgtv2kjt0000sfzqb6d91ez0' };
    return this.request('/dashboard/metrics', { headers });
  }

  async getSMBMetrics(userId?: string): Promise<ApiResponse> {
    const headers = userId ? { 'x-user-id': userId } : { 'x-user-id': 'cmgtv2kjt0000sfzqb6d91ez0' };
    return this.request('/dashboard/smb-metrics', { headers });
  }

  async getExecutiveDashboard(userId?: string): Promise<ApiResponse> {
    const headers = userId ? { 'x-user-id': userId } : { 'x-user-id': 'cmgtv2kjt0000sfzqb6d91ez0' };
    return this.request('/dashboard/executive', { headers });
  }

  async getCompanyTrends(userId?: string): Promise<ApiResponse> {
    const headers = userId ? { 'x-user-id': userId } : { 'x-user-id': 'cmgtv2kjt0000sfzqb6d91ez0' };
    return this.request('/dashboard/trends', { headers });
  }

  // Health Check
  async getHealth(): Promise<ApiResponse> {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual methods for convenience
export const {
  getAnalyticsOverview,
  getKPIs,
  analyzeDocument,
  getDocumentHealth,
  askQuestion,
  getChatHistory,
  uploadDocument,
  getDatasets,
  createDataset,
  getDashboardOverview,
  getCompanyMetrics,
  getSMBMetrics,
  getExecutiveDashboard,
  getCompanyTrends,
  getHealth,
} = apiService;
