import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/src/config/api.config';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface RequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      withCredentials: API_CONFIG.withCredentials,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and refresh token
    this.client.interceptors.response.use(
      (response) => {
        // Return the data directly for successful responses
        return response.data;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestConfig;

        // Handle 401 Unauthorized - Try to refresh token
        // BUT SKIP for login/register endpoints (no tokens exist yet)
        if (
          error.response?.status === 401 && 
          originalRequest && 
          !originalRequest._retry &&
          !this.isAuthEndpoint(originalRequest.url || '')
        ) {
          originalRequest._retry = true;

          try {
            const newToken = await this.handleTokenRefresh();
            
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Token refresh failed - redirect to login
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  // Check if the endpoint is an authentication endpoint (login/register)
  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = ['/auth/login', '/admin/auth/login', '/auth/register', '/admin/auth/register'];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  private async handleTokenRefresh(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          console.warn('⚠️ No refresh token available - user needs to login again');
          this.clearAuth();
          throw new Error('No refresh token available');
        }

        console.log('🔄 Attempting to refresh access token...');

        const response = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${API_CONFIG.baseURL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        if (response.data.success && response.data.data?.accessToken) {
          const newToken = response.data.data.accessToken;
          this.setAccessToken(newToken);
          console.log('✅ Access token refreshed successfully');
          return newToken;
        }

        throw new Error('Token refresh failed');
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        this.clearAuth();
        throw error;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  private handleAuthFailure() {
    this.clearAuth();
    
    if (typeof window !== 'undefined') {
      // Don't redirect if already on login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
  }

  private normalizeError(error: AxiosError): Error {
    if (error.response?.data) {
      const data = error.response.data as ApiResponse;
      return new Error(data.message || data.error || 'An error occurred');
    }
    
    if (error.message) {
      return new Error(error.message);
    }

    return new Error('An unexpected error occurred');
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.delete(url, config);
  }

  // Token Management
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminRefreshToken');
  }

  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', token);
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
  }

  // Public method for external use
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
