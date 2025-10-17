import { apiClient } from '@/src/lib/api-client';
import { store } from '@/src/store';
import { setTokens, setUser, clearAuth } from '@/src/store/slices/adminAuthSlice';
import type {
  LoginCredentials,
  LoginResponse,
  ApiResponse,
  GetUsersParams,
  UsersListResponse,
  CreateStudentData,
  CreateTeacherData,
  UpdateUserData,
  BlockUserData,
  AuditTrailResponse,
  AdminUser,
} from '../types';

class AdminApiService {
  private baseUrl = '/admin';

  // ==================== AUTH ====================

  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    console.log('🌐 AdminApiService: Calling login API...');
    
    const response = await apiClient.post<LoginResponse>(
      `${this.baseUrl}/auth/login`,
      credentials
    );

    console.log('🌐 AdminApiService: Login response received:', { 
      success: response.success, 
      hasData: !!response.data 
    });

    if (response.success && response.data) {
      console.log('🌐 AdminApiService: Login successful, storing tokens...');
      
      // CRITICAL: Store tokens in localStorage first
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminToken', response.data.accessToken);
        localStorage.setItem('adminRefreshToken', response.data.refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        console.log('✅ Tokens stored in localStorage');
      }
      
      // Then dispatch Redux actions
      store.dispatch(setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }));
      store.dispatch(setUser(response.data.user));
      console.log('✅ Redux store updated');
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/auth/logout`);
    } finally {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
      }
      
      // Dispatch Redux action
      store.dispatch(clearAuth());
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; user: AdminUser }>> {
    return apiClient.post(`${this.baseUrl}/auth/refresh`, { refreshToken });
  }

  async getProfile(): Promise<ApiResponse<{ user: AdminUser }>> {
    return apiClient.get(`${this.baseUrl}/auth/profile`);
  }

  async updateProfile(data: { name?: string; phone?: string }): Promise<ApiResponse<{ user: AdminUser }>> {
    return apiClient.put(`${this.baseUrl}/auth/profile`, data);
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return apiClient.put(`${this.baseUrl}/auth/change-password`, data);
  }

  // ==================== USERS ====================

  async getUsers(params?: GetUsersParams): Promise<ApiResponse<UsersListResponse>> {
    return apiClient.get(`${this.baseUrl}/users`, { params });
  }

  async getUserById(id: string): Promise<ApiResponse<{ user: AdminUser }>> {
    return apiClient.get(`${this.baseUrl}/users/${id}`);
  }

  async createStudent(data: CreateStudentData): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/users/student`, data);
  }

  async createTeacher(data: CreateTeacherData): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/users/teacher`, data);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<{ user: AdminUser }>> {
    return apiClient.put(`${this.baseUrl}/users/${id}`, data);
  }

  async blockUser(id: string, data: BlockUserData): Promise<ApiResponse<{ user: AdminUser }>> {
    return apiClient.post(`${this.baseUrl}/users/${id}/block`, data);
  }

  async unblockUser(id: string, notes?: string): Promise<ApiResponse<{ user: AdminUser }>> {
    return apiClient.post(`${this.baseUrl}/users/${id}/unblock`, { notes });
  }

  async deleteUser(id: string, notes?: string): Promise<ApiResponse> {
    return apiClient.delete(`${this.baseUrl}/users/${id}`, { data: { notes } });
  }

  async getUserAuditTrail(
    id: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<AuditTrailResponse>> {
    return apiClient.get(`${this.baseUrl}/users/${id}/audit-trail`, {
      params: { page, limit },
    });
  }

  // ==================== STATS ====================

  async getStats(): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseUrl}/stats`);
  }

  // ==================== HELPERS ====================

  isAuthenticated(): boolean {
    const state = store.getState().adminAuth;
    return !!state.accessToken && apiClient.isAuthenticated();
  }

  getCurrentUser(): AdminUser | null {
    const state = store.getState().adminAuth;
    return state.user;
  }
}

// Export singleton instance
export const adminApiService = new AdminApiService();
