import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface LoginCredentials {
  identifier: string; // email or phone
  password: string;
}

interface TeacherProfile {
  id: string;
  name: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  profileImage: string | null;
  role: 'TEACHER';
  verified: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  // Teacher specific fields
  subjects?: Array<{
    id: string;
    name: string;
  }>;
  totalModules?: number;
  totalStudents?: number;
}

interface UpdateProfileData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class TeacherApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/teacher/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('teacher_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('teacher_token', token);
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('teacher_token');
      localStorage.removeItem('teacher_refresh_token');
      localStorage.removeItem('teacher_user');
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    try {
      const response = await this.axiosInstance.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Verify user is a teacher
        if (user.role !== 'TEACHER') {
          throw new Error('Access denied. This portal is for teachers only.');
        }
        
        // Store token and user info
        this.setToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('teacher_user', JSON.stringify(user));
        }
        
        return {
          success: true,
          data: { user, token },
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Login failed',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      if (error.message === 'Access denied. This portal is for teachers only.') {
        throw error;
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please check your credentials.'
      );
    }
  }

  async logout() {
    try {
      await this.axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async getProfile(): Promise<TeacherProfile> {
    try {
      const response = await this.axiosInstance.get('/auth/profile');
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch profile'
      );
    }
  }

  async updateProfile(data: UpdateProfileData) {
    try {
      const response = await this.axiosInstance.put('/auth/profile', data);
      
      if (response.data.success) {
        // Update stored user info
        if (typeof window !== 'undefined') {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            localStorage.setItem('teacher_user', JSON.stringify({
              ...currentUser,
              ...response.data.data,
            }));
          }
        }
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to update profile'
      );
    }
  }

  async changePassword(data: ChangePasswordData) {
    try {
      const response = await this.axiosInstance.post('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to change password'
      );
    }
  }

  async uploadAvatar(file: File) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await this.axiosInstance.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to upload avatar'
      );
    }
  }

  async deleteAvatar() {
    try {
      const response = await this.axiosInstance.delete('/auth/avatar');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to delete avatar'
      );
    }
  }

  // Helper methods
  getCurrentUser(): TeacherProfile | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('teacher_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const teacherApiService = new TeacherApiService();
