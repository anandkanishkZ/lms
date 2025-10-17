import { API_CONFIG, AUTH_CONFIG } from '@/src/config/api.config';
import { ROUTES } from '@/src/config/routes.config';
import type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  AdminUser,
  CreateStudentData,
  CreateTeacherData,
  GetUsersParams,
  UsersListResponse,
  UpdateUserData,
  BlockUserData,
  AuditTrailResponse,
} from '@/src/features/admin/types';

class AdminApiService {
  private baseUrl = `${API_CONFIG.baseURL}/admin`;

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

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
        if (response.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed && token !== this.getAccessToken()) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${this.getAccessToken()}`,
            };
            return this.makeRequest(endpoint, { ...options, headers: config.headers });
          }
          this.logout();
          if (typeof window !== 'undefined') {
            window.location.href = ROUTES.auth.login;
          }
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

  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    console.log('🌐 API: Sending login request...');
    
    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('🌐 API: Login response received:', { success: response.success, hasData: !!response.data });

    if (response.success && response.data) {
      console.log('🌐 API: Storing tokens and user data...');
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      this.setUser(response.data.user);
      console.log('✅ API: Tokens and user data stored successfully');
      
      // Also update Redux store
      if (typeof window !== 'undefined') {
        try {
          const { store } = await import('@/src/store');
          const { setTokens, setUser } = await import('@/src/store/slices/adminAuthSlice');
          store.dispatch(setTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }));
          store.dispatch(setUser(response.data.user));
          console.log('✅ API: Redux store updated');
        } catch (error) {
          console.warn('⚠️ API: Failed to update Redux store:', error);
        }
      }
    } else {
      console.error('❌ API: Login failed:', response.message);
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

  async createStudent(data: CreateStudentData): Promise<ApiResponse<any>> {
    return this.makeRequest('/users/student', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createTeacher(data: CreateTeacherData): Promise<ApiResponse<any>> {
    return this.makeRequest('/users/teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers(params?: GetUsersParams): Promise<ApiResponse<UsersListResponse>> {
    const searchParams = new URLSearchParams();

    if (params?.role) searchParams.append('role', params.role);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';

    return this.makeRequest(endpoint);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<{ user: AdminUser }>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async blockUser(id: string, data: BlockUserData): Promise<ApiResponse<{ user: AdminUser }>> {
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

  async getUserAuditTrail(id: string, page = 1, limit = 20): Promise<ApiResponse<AuditTrailResponse>> {
    return this.makeRequest(`/users/${id}/audit-trail?page=${page}&limit=${limit}`);
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_CONFIG.tokenKey);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_CONFIG.refreshTokenKey);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    console.log('💾 Storing tokens in localStorage:', AUTH_CONFIG.tokenKey);
    localStorage.setItem(AUTH_CONFIG.tokenKey, accessToken);
    localStorage.setItem(AUTH_CONFIG.refreshTokenKey, refreshToken);
    console.log('✅ Tokens stored successfully');
  }

  setAccessToken(accessToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_CONFIG.tokenKey, accessToken);
  }

  getUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(AUTH_CONFIG.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: AdminUser): void {
    if (typeof window === 'undefined') return;
    console.log('💾 Storing user in localStorage:', AUTH_CONFIG.userKey);
    localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
    console.log('✅ User stored successfully');
  }

  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
    localStorage.removeItem(AUTH_CONFIG.userKey);
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null && this.getUser() !== null;
  }

  initializeAuth(): void {
    if (this.isAuthenticated()) {
      this.scheduleTokenRefresh();
    }
  }

  private scheduleTokenRefresh(): void {
    setInterval(() => {
      this.refreshToken();
    }, AUTH_CONFIG.tokenRefreshInterval);
  }
}

const adminApiService = new AdminApiService();

if (typeof window !== 'undefined') {
  adminApiService.initializeAuth();
}

export default adminApiService;
