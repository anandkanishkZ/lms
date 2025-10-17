// API configuration and utilities for admin authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    verified: boolean;
    lastLogin?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  verified: boolean;
  lastLogin?: string;
  createdAt?: string;
}

class AdminApiService {
  private baseUrl = `${API_BASE_URL}/admin`;

  // Helper method for making API requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = this.getAccessToken();
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshToken();
          if (refreshed && token !== this.getAccessToken()) {
            // Retry with new token
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${this.getAccessToken()}`,
            };
            return this.makeRequest(endpoint, { ...options, headers: config.headers });
          }
          // If refresh failed, redirect to login
          this.logout();
          window.location.href = '/admin/login';
          throw new Error('Session expired');
        }
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      // Store tokens and user info
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      this.setUser(response.data.user);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: ApiResponse<{ accessToken: string; user: AdminUser }> = await response.json();
        if (data.success && data.data) {
          this.setAccessToken(data.data.accessToken);
          this.setUser(data.data.user);
          return true;
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }

    return false;
  }

  async getProfile(): Promise<ApiResponse<{ user: AdminUser }>> {
    return this.makeRequest<{ user: AdminUser }>('/auth/profile');
  }

  async updateProfile(data: { name?: string; phone?: string }): Promise<ApiResponse<{ user: AdminUser }>> {
    return this.makeRequest<{ user: AdminUser }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return this.makeRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // User Management methods
  async createStudent(data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    school: string;
    phone?: string;
    email?: string;
  }): Promise<ApiResponse<{
    id: string;
    name: string;
    symbolNo: string;
    email: string | null;
    phone: string | null;
    school: string;
    tempPassword: string;
  }>> {
    return this.makeRequest('/users/student', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createTeacher(data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    department: string;
    phone: string;
    email: string;
    experience?: string;
  }): Promise<ApiResponse<{
    id: string;
    name: string;
    symbolNo: string;
    email: string;
    phone: string;
    department: string;
    experience: string | null;
    tempPassword: string;
  }>> {
    return this.makeRequest('/users/teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers(params?: {
    role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{
    users: Array<{
      id: string;
      name: string;
      firstName: string | null;
      middleName: string | null;
      lastName: string | null;
      email: string | null;
      phone: string | null;
      symbolNo: string | null;
      role: 'STUDENT' | 'TEACHER' | 'ADMIN';
      school: string | null;
      department: string | null;
      experience: string | null;
      verified: boolean;
      isActive: boolean;
      isBlocked: boolean;
      blockReason: string | null;
      blockedAt: string | null;
      blockedBy: string | null;
      lastLogin: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const searchParams = new URLSearchParams();
    
    if (params?.role) searchParams.append('role', params.role);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';

    return this.makeRequest(endpoint);
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminRefreshToken');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', accessToken);
    localStorage.setItem('adminRefreshToken', refreshToken);
  }

  setAccessToken(accessToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', accessToken);
  }

  getUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: AdminUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminUser', JSON.stringify(user));
  }

  // Enhanced User Management methods
  async updateUser(id: string, data: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    school?: string;
    department?: string;
    experience?: string;
  }): Promise<ApiResponse<{ user: AdminUser }>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async blockUser(id: string, data: {
    reason: string;
    notes?: string;
  }): Promise<ApiResponse<{ user: AdminUser }>> {
    return this.makeRequest(`/users/${id}/block`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unblockUser(id: string, notes?: string): Promise<ApiResponse<{ user: AdminUser }>> {
    return this.makeRequest(`/users/${id}/unblock`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async deleteUser(id: string, notes?: string): Promise<ApiResponse> {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ notes }),
    });
  }

  async getUserAuditTrail(id: string, page = 1, limit = 20): Promise<ApiResponse<{
    user: AdminUser;
    auditTrail: Array<{
      id: string;
      action: string;
      entity: string | null;
      details: any;
      notes: string | null;
      timestamp: string;
      performedBy: AdminUser | null;
      ipAddress: string | null;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    return this.makeRequest(`/users/${id}/audit-trail?page=${page}&limit=${limit}`);
  }

  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null && this.getUser() !== null;
  }

  // Auto-initialize token refresh on app start
  initializeAuth(): void {
    if (this.isAuthenticated()) {
      // Set up token refresh timer
      this.scheduleTokenRefresh();
    }
  }

  private scheduleTokenRefresh(): void {
    // Refresh token every 45 minutes (tokens expire in 1 hour)
    setInterval(() => {
      this.refreshToken();
    }, 45 * 60 * 1000);
  }
}

// Create singleton instance
const adminApi = new AdminApiService();

// Initialize on import
if (typeof window !== 'undefined') {
  adminApi.initializeAuth();
}

export default adminApi;