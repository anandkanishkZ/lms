/**
 * API Client Configuration
 * Axios instance with authentication interceptors and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { API_CONFIG, AUTH_CONFIG, getCurrentUserType } from '@/src/config/api.config';

// ==================== TYPES ====================

export interface ApiClientConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export interface TokenRefreshResponse {
  success: boolean;
  data?: {
    accessToken: string;
  };
}

// ==================== TOKEN MANAGEMENT ====================

class TokenManager {
  private getUserConfig() {
    const userType = getCurrentUserType();
    return AUTH_CONFIG[userType];
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    const config = this.getUserConfig();
    return localStorage.getItem(config.tokenKey);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    const config = this.getUserConfig();
    return localStorage.getItem(config.refreshTokenKey);
  }

  setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      const config = this.getUserConfig();
      localStorage.setItem(config.tokenKey, token);
    }
  }

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      const config = this.getUserConfig();
      localStorage.setItem(config.refreshTokenKey, token);
    }
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      const config = this.getUserConfig();
      localStorage.removeItem(config.tokenKey);
      localStorage.removeItem(config.refreshTokenKey);
      localStorage.removeItem(config.userKey);
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch {
      return true;
    }
  }
}

// ==================== API CLIENT ====================

class ApiClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.tokenManager = new TokenManager();
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      withCredentials: API_CONFIG.withCredentials,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // ==================== INTERCEPTORS ====================

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => this.handleRequest(config),
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleError(error)
    );
  }

  private async handleRequest(config: ApiClientConfig): Promise<any> {
    // Skip auth for certain requests
    if (config.skipAuth) {
      return config;
    }

    // Add auth token
    const token = this.tokenManager.getAccessToken();
    if (token) {
      // Check if token is about to expire (within 5 minutes)
      if (!config.skipRefresh && this.shouldRefreshToken(token)) {
        try {
          const newToken = await this.refreshAccessToken();
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    return response;
  }

  private async handleError(error: AxiosError): Promise<any> {
    const originalRequest = error.config as ApiClientConfig;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest.skipRefresh) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;

          // Retry all queued requests with new token
          this.refreshSubscribers.forEach((callback) => callback(newToken));
          this.refreshSubscribers = [];

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return this.axiosInstance(originalRequest);
        } catch (refreshError) {
          this.isRefreshing = false;
          this.refreshSubscribers = [];
          this.handleAuthenticationFailure();
          return Promise.reject(refreshError);
        }
      }

      // Queue request while refreshing
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(this.axiosInstance(originalRequest));
        });
      });
    }

    // Handle other errors
    return Promise.reject(this.formatError(error));
  }

  // ==================== TOKEN REFRESH ====================

  private shouldRefreshToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const timeUntilExpiry = expiryTime - Date.now();
      // Refresh if token expires in less than 5 minutes
      return timeUntilExpiry < 5 * 60 * 1000;
    } catch {
      return false;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const userType = getCurrentUserType();
    const refreshEndpoint = `/${userType}/auth/refresh`;

    try {
      const response = await this.axiosInstance.post<TokenRefreshResponse>(
        refreshEndpoint,
        { refreshToken },
        { skipRefresh: true } as ApiClientConfig
      );

      if (response.data.success && response.data.data?.accessToken) {
        const newToken = response.data.data.accessToken;
        this.tokenManager.setAccessToken(newToken);
        return newToken;
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      this.tokenManager.clearTokens();
      throw error;
    }
  }

  private handleAuthenticationFailure(): void {
    this.tokenManager.clearTokens();
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isAdminPath = currentPath.startsWith('/admin');
      const isStudentPath = currentPath.startsWith('/student');
      const isTeacherPath = currentPath.startsWith('/teacher');

      if (isAdminPath) {
        window.location.href = '/admin/login';
      } else if (isTeacherPath) {
        window.location.href = '/teacher/login';
      } else if (isStudentPath) {
        window.location.href = '/student/login';
      } else {
        window.location.href = '/';
      }
    }
  }

  // ==================== ERROR FORMATTING ====================

  private formatError(error: AxiosError): any {
    if (error.response) {
      // Server responded with error
      return {
        message: (error.response.data as any)?.message || error.message,
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check your connection.',
        status: 0,
      };
    } else {
      // Error setting up request
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
      };
    }
  }

  // ==================== HTTP METHODS ====================

  async get<T = any>(url: string, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: ApiClientConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: ApiClientConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  // ==================== FILE UPLOAD ====================

  async upload<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  // ==================== UTILITY METHODS ====================

  setAuthToken(token: string): void {
    this.tokenManager.setAccessToken(token);
  }

  setRefreshToken(token: string): void {
    this.tokenManager.setRefreshToken(token);
  }

  clearAuth(): void {
    this.tokenManager.clearTokens();
  }

  getAuthToken(): string | null {
    return this.tokenManager.getAccessToken();
  }
}

// ==================== EXPORT ====================

export const apiClient = new ApiClient();
export default apiClient;
