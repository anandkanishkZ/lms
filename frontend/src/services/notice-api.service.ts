import axios from 'axios';
import { getAuthHeaders } from '@/utils/auth';

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

      const headers = getAuthHeaders();
      console.log('🔑 Auth headers:', { hasAuth: !!headers.Authorization });

      const response = await axios.get(`${API_BASE_URL}/notices`, {
        headers,
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
      const response = await axios.get(`${API_BASE_URL}/notices/${id}`, {
        headers: getAuthHeaders(),
      });

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
      const response = await axios.post(`${API_BASE_URL}/notices`, data, {
        headers: getAuthHeaders(),
      });

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
      const response = await axios.put(`${API_BASE_URL}/notices/${id}`, data, {
        headers: getAuthHeaders(),
      });

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
      await axios.delete(`${API_BASE_URL}/notices/${id}`, {
        headers: getAuthHeaders(),
      });
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
      await axios.post(
        `${API_BASE_URL}/notices/${id}/read`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
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
      const response = await axios.get(`${API_BASE_URL}/notices/unread/count`, {
        headers: getAuthHeaders(),
      });

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
      const response = await axios.get(`${API_BASE_URL}/notices/teacher/classes`, {
        headers: getAuthHeaders(),
      });

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
      const response = await axios.get(`${API_BASE_URL}/notices/teacher/modules`, {
        headers: getAuthHeaders(),
      });

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
      const response = await axios.post(
        `${API_BASE_URL}/notices/bulk/mark-read`,
        { noticeIds },
        {
          headers: getAuthHeaders(),
        }
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
      const response = await axios.post(
        `${API_BASE_URL}/notices/bulk/mark-all-read`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

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
      const response = await axios.get(`${API_BASE_URL}/notices/preferences`, {
        headers: getAuthHeaders(),
      });

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
      const response = await axios.put(
        `${API_BASE_URL}/notices/preferences`,
        preferences,
        {
          headers: getAuthHeaders(),
        }
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
      const response = await axios.get(`${API_BASE_URL}/notices/stats`, {
        headers: getAuthHeaders(),
      });

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
      const response = await axios.post(
        `${API_BASE_URL}/notices/bulk/delete`,
        { noticeIds },
        {
          headers: getAuthHeaders(),
        }
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
      const response = await axios.get(`${API_BASE_URL}/notices/batches`, {
        headers: getAuthHeaders(),
      });

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
      const response = await axios.get(`${API_BASE_URL}/notices/admin/classes`, {
        headers: getAuthHeaders(),
      });

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
      const response = await axios.get(`${API_BASE_URL}/notices/admin/modules`, {
        headers: getAuthHeaders(),
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch modules');
    }
  }
}

export const noticeApi = new NoticeApiService();
export default noticeApi;