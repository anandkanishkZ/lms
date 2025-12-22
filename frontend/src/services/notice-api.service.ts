import axios, { AxiosInstance } from 'axios';
import { getAuthHeaders, getCurrentToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Types
export enum NoticeCategory {
  EXAM = 'EXAM',
  EVENT = 'EVENT',
  HOLIDAY = 'HOLIDAY',
  GENERAL = 'GENERAL',
}

export enum NoticePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  attachmentUrl?: string;
  isPinned: boolean;
  isPublished: boolean;
  publishedAt?: Date | string;
  expiresAt?: Date | string;
  viewCount: number;
  classId?: string;
  batchId?: string;
  moduleId?: string;
  targetRole?: UserRole;
  publishedBy: string;
  publishedByUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    profileImage?: string;
  };
  class?: {
    id: string;
    name: string;
  };
  batch?: {
    id: string;
    name: string;
  };
  module?: {
    id: string;
    title: string;
  };
  isRead?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NoticeFilters {
  category?: NoticeCategory;
  priority?: NoticePriority;
  isPinned?: boolean;
  classId?: string;
  batchId?: string;
  moduleId?: string;
  includeExpired?: boolean;
  unreadOnly?: boolean;
  includeDrafts?: 'true' | 'all' | 'false'; // 'true' = drafts only, 'all' = both, 'false'/undefined = published only
}

export interface CreateNoticeData {
  title: string;
  content: string;
  category?: NoticeCategory;
  priority?: NoticePriority;
  attachmentUrl?: string;
  isPinned?: boolean;
  expiresAt?: string;
  classId?: string;
  batchId?: string;
  moduleId?: string;
  targetRole?: UserRole;
  isPublished?: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
  totalCount: number;
}

export interface NotificationStats {
  total: number;
  read: number;
  unread: number;
}

export interface NotificationPreferences {
  id?: string;
  userId?: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  examNotifications: boolean;
  eventNotifications: boolean;
  generalNotifications: boolean;
  urgentOnly: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// API Service
class NoticeApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = getCurrentToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Notice API: Token added to request:', {
            url: config.url,
            tokenPreview: token.substring(0, 20) + '...',
            hasToken: true,
          });
        } else {
          console.error('❌ Notice API: No token available for request:', config.url);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for global error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data);
        
        // Don't auto-redirect on 401, let the component handle it
        // This prevents logout loops
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all notices with optional filters
   */
  async getAllNotices(filters?: NoticeFilters): Promise<Notice[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await this.axiosInstance.get('/notices', {
        params,
      });

      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error fetching notices:', error);
      console.error('📋 Response data:', error.response?.data);
      console.error('📊 Response status:', error.response?.status);
      
      // Handle 401 Unauthorized specifically
      if (error.response?.status === 401) {
        throw new Error('Please log in to view notices');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch notices');
    }
  }

  /**
   * Get notice by ID
   */
  async getNoticeById(id: string): Promise<Notice> {
    try {
      const response = await this.axiosInstance.get(`/notices/${id}`);


      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching notice:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notice');
    }
  }

  /**
   * Create a new notice
   */
  async createNotice(data: CreateNoticeData): Promise<Notice> {
    try {
      const response = await this.axiosInstance.post('/notices', data);

      return response.data.data;
    } catch (error: any) {
      console.error('Error creating notice:', error);
      throw new Error(error.response?.data?.message || 'Failed to create notice');
    }
  }

  /**
   * Update notice
   */
  async updateNotice(id: string, data: Partial<CreateNoticeData>): Promise<Notice> {
    try {
      const response = await this.axiosInstance.put(`/notices/${id}`, data);

      return response.data.data;
    } catch (error: any) {
      console.error('Error updating notice:', error);
      throw new Error(error.response?.data?.message || 'Failed to update notice');
    }
  }

  /**
   * Delete notice
   */
  async deleteNotice(id: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/notices/${id}`);
    } catch (error: any) {
      console.error('Error deleting notice:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete notice');
    }
  }

  /**
   * Mark notice as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/notices/${id}/read`);
    } catch (error: any) {
      console.error('Error marking notice as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notice as read');
    }
  }

  /**
   * Get unread notice count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const response = await this.axiosInstance.get('/notices/unread/count');

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }

  /**
   * Get teacher's assigned classes
   */
  async getTeacherClasses(): Promise<Array<{ id: string; name: string; subjectName: string }>> {
    try {
      const response = await this.axiosInstance.get('/notices/teacher/classes');

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching teacher classes:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch teacher classes');
    }
  }

  /**
   * Get teacher's modules
   */
  async getTeacherModules(): Promise<Array<{ id: string; title: string; slug: string; isPublished: boolean }>> {
    try {
      const response = await this.axiosInstance.get('/notices/teacher/modules');

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching teacher modules:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch teacher modules');
    }
  }

  /**
   * Bulk mark notices as read
   */
  async bulkMarkAsRead(noticeIds: string[]): Promise<{ count: number }> {
    try {
      const response = await this.axiosInstance.post(
        '/notices/bulk/mark-read',
        { noticeIds }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error bulk marking as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notices as read');
    }
  }

  /**
   * Mark all notices as read
   */
  async markAllAsRead(): Promise<{ count: number }> {
    try {
      const response = await this.axiosInstance.post('/notices/bulk/mark-all-read', {});

      return response.data.data;
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark all as read');
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await this.axiosInstance.get('/notices/preferences');

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch preferences');
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const response = await this.axiosInstance.put(
        '/notices/preferences',
        preferences
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await this.axiosInstance.get('/notices/stats');

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }

  /**
   * Bulk delete notices
   */
  async bulkDeleteNotices(noticeIds: string[]): Promise<{ count: number }> {
    try {
      const response = await this.axiosInstance.post(
        '/notices/bulk/delete',
        { noticeIds }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error bulk deleting:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete notices');
    }
  }

  /**
   * Get all batches (for targeting)
   */
  async getAllBatches(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await this.axiosInstance.get('/notices/batches');

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching batches:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch batches');
    }
  }

  /**
   * Get all classes (Admin only)
   */
  async getAllClasses(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await this.axiosInstance.get('/notices/admin/classes');

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch classes');
    }
  }

  /**
   * Get all modules (Admin only)
   */
  async getAllModules(): Promise<Array<{ id: string; title: string }>> {
    try {
      const response = await this.axiosInstance.get('/notices/admin/modules');

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch modules');
    }
  }
}

export const noticeApi = new NoticeApiService();
export default noticeApi;