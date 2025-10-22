import { apiClient } from './api-client';

export interface LiveClass {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  moduleId?: string;
  youtubeUrl?: string;
  meetingLink?: string;
  startTime: string;
  endTime?: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  isRecorded: boolean;
  recordingUrl?: string;
  maxStudents?: number;
  createdAt: string;
  updatedAt: string;
  subject?: { name: string; color?: string };
  teacher?: { name: string };
  class?: { name: string; section?: string };
  module?: { id: string; title: string };
  _count?: { attendances: number };
}

export interface CreateLiveClassDto {
  title: string;
  description?: string;
  subjectId: string;
  classId: string;
  moduleId?: string;
  youtubeUrl?: string;
  meetingLink?: string;
  startTime: string;
  endTime?: string;
  maxStudents?: number;
}

export interface UpdateLiveClassDto {
  title?: string;
  description?: string;
  youtubeUrl?: string;
  meetingLink?: string;
  startTime?: string;
  endTime?: string;
  status?: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  maxStudents?: number;
}

export interface LiveClassFilters {
  page?: number;
  limit?: number;
  status?: string;
  classId?: string;
  subjectId?: string;
  moduleId?: string;
  date?: string;
  upcoming?: boolean;
}

export const liveClassApiService = {
  /**
   * Get all live classes with optional filters
   */
  async getLiveClasses(filters: LiveClassFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.classId) params.append('classId', filters.classId);
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.moduleId) params.append('moduleId', filters.moduleId);
    if (filters.date) params.append('date', filters.date);
    if (filters.upcoming !== undefined) params.append('upcoming', filters.upcoming.toString());

    const queryString = params.toString();
    const url = `/live-classes${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<{
      success: boolean;
      message: string;
      data: {
        liveClasses: LiveClass[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      };
    }>(url);
  },

  /**
   * Get live classes for a specific module
   */
  async getModuleLiveClasses(moduleId: string) {
    return this.getLiveClasses({ moduleId, limit: 100 });
  },

  /**
   * Get a single live class by ID
   */
  async getLiveClassById(id: string) {
    return apiClient.get<{
      success: boolean;
      message: string;
      data: { liveClass: LiveClass };
    }>(`/live-classes/${id}`);
  },

  /**
   * Create a new live class
   */
  async createLiveClass(data: CreateLiveClassDto) {
    return apiClient.post<{
      success: boolean;
      message: string;
      data: { liveClass: LiveClass };
    }>('/live-classes', data);
  },

  /**
   * Update an existing live class
   */
  async updateLiveClass(id: string, data: UpdateLiveClassDto) {
    return apiClient.put<{
      success: boolean;
      message: string;
      data: { liveClass: LiveClass };
    }>(`/live-classes/${id}`, data);
  },

  /**
   * Delete a live class
   */
  async deleteLiveClass(id: string) {
    return apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/live-classes/${id}`);
  },

  /**
   * Join a live class (for students)
   */
  async joinLiveClass(id: string) {
    return apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/live-classes/${id}/join`, {});
  },

  /**
   * Leave a live class (for students)
   */
  async leaveLiveClass(id: string) {
    return apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/live-classes/${id}/leave`, {});
  },

  /**
   * Extract YouTube video ID from various YouTube URL formats
   */
  extractYouTubeId(url: string): string | null {
    if (!url) return null;
    
    // Regular YouTube URLs
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return match[2];
    }
    
    // YouTube live URLs
    const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
    if (liveMatch && liveMatch[1]) {
      return liveMatch[1];
    }
    
    return null;
  },

  /**
   * Generate YouTube embed URL from video ID
   */
  getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  },

  /**
   * Generate YouTube thumbnail URL from video ID
   */
  getYouTubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  },

  /**
   * Validate YouTube URL
   */
  isValidYouTubeUrl(url: string): boolean {
    return this.extractYouTubeId(url) !== null;
  },
};
