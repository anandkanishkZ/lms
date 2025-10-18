import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface LoginCredentials {
  identifier: string; // symbolNo or email
  password: string;
}

interface StudentProfile {
  id: string;
  name: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  symbolNo: string;
  school: string | null;
  profileImage: string | null;
  role: 'STUDENT';
  verified: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  school?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ModuleEnrollment {
  id: string;
  studentId: string;
  moduleId: string;
  enrolledAt: string;
  progress: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  module: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    level: string;
    duration: number | null;
    isActive: boolean;
    topicsCount?: number;
  };
}

interface EnrollmentProgress {
  enrollmentId: string;
  progress: number;
  completedTopics: number;
  totalTopics: number;
  lastAccessedAt: string | null;
}

class StudentApiService {
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
          window.location.href = '/student/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('student_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('student_token', token);
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('student_token');
      localStorage.removeItem('student_refresh_token');
      localStorage.removeItem('student_user');
    }
  }

  // Authentication APIs
  async login(credentials: LoginCredentials) {
    try {
      const response = await this.axiosInstance.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        // Store tokens
        this.setToken(response.data.data.token);
        if (response.data.data.refreshToken) {
          localStorage.setItem('student_refresh_token', response.data.data.refreshToken);
        }
        
        // Store user data
        localStorage.setItem('student_user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Login failed' };
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

  async getCurrentUser(): Promise<StudentProfile | null> {
    try {
      const response = await this.axiosInstance.get('/auth/me');
      if (response.data.success && response.data.data) {
        // Update stored user data
        localStorage.setItem('student_user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Profile Management
  async getProfile(): Promise<StudentProfile | null> {
    try {
      const response = await this.axiosInstance.get('/auth/profile');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  async updateProfile(data: UpdateProfileData) {
    try {
      const response = await this.axiosInstance.put('/auth/profile', data);
      
      if (response.data.success && response.data.data) {
        // Update stored user data
        localStorage.setItem('student_user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Update failed' };
    }
  }

  async changePassword(data: ChangePasswordData) {
    try {
      const response = await this.axiosInstance.post('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Password change failed' };
    }
  }

  // Avatar Management
  async uploadAvatar(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await this.axiosInstance.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data?.user) {
        // Update stored user data
        localStorage.setItem('student_user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Avatar upload failed' };
    }
  }

  async deleteAvatar(): Promise<any> {
    try {
      const response = await this.axiosInstance.delete('/auth/avatar');

      if (response.data.success && response.data.data?.user) {
        // Update stored user data
        localStorage.setItem('student_user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Avatar deletion failed' };
    }
  }

  // Helper method to get avatar URL using API endpoint
  getAvatarUrl(profileImage: string | null): string {
    if (!profileImage) {
      return ''; // Return empty string for default avatar
    }
    // If profileImage already starts with http, return as is
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    // Extract filename from path (e.g., "avatars/filename.jpg" -> "filename.jpg")
    const filename = profileImage.includes('/') ? profileImage.split('/').pop() : profileImage;
    // Use API endpoint for serving avatars with proper CORS headers
    return `${this.axiosInstance.defaults.baseURL}/auth/avatars/${filename}`;
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get stored user data
  getStoredUser(): StudentProfile | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('student_user');
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Enrollment Management
  async getMyEnrollments(): Promise<ModuleEnrollment[]> {
    try {
      const user = this.getStoredUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await this.axiosInstance.get(`/enrollments/students/${user.id}/enrollments`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Get enrollments error:', error);
      throw error.response?.data || { success: false, message: 'Failed to fetch enrollments' };
    }
  }

  async getEnrollmentProgress(enrollmentId: string): Promise<EnrollmentProgress | null> {
    try {
      const response = await this.axiosInstance.get(`/enrollments/${enrollmentId}/progress`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error('Get enrollment progress error:', error);
      return null;
    }
  }
}

export const studentApiService = new StudentApiService();
export type { StudentProfile, LoginCredentials, UpdateProfileData, ChangePasswordData, ModuleEnrollment, EnrollmentProgress };
