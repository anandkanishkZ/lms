/**
 * Module API Service
 * Complete API integration for Module/Subject system (68 endpoints)
 */

import { apiClient } from './api-client';
import type {
  ApiResponse,
  Module,
  CreateModuleData,
  UpdateModuleData,
  ModuleFilters,
  ModuleListResponse,
  Topic,
  CreateTopicData,
  UpdateTopicData,
  Lesson,
  CreateLessonData,
  UpdateLessonData,
  LessonAttachment,
  LessonSearchFilters,
  ModuleEnrollment,
  CreateEnrollmentData,
  BulkEnrollmentData,
  ClassEnrollmentData,
  EnrollmentFilters,
  EnrollmentStats,
  ModuleProgress,
  LessonProgress,
  UpdateProgressData,
  ActivityHistory,
  ActivityFilters,
  ActivityTimelineItem,
  YoutubeLiveSession,
  CreateYoutubeLiveData,
  UpdateYoutubeLiveData,
  YoutubeLiveFilters,
  YoutubeLiveStats,
  ModuleReview,
  CreateReviewData,
  LessonNote,
  CreateLessonNoteData,
} from '../features/modules/types';

// ==================== MODULE SERVICE ====================

class ModuleApiService {
  private baseUrl = '/modules';

  // ==================== MODULE ENDPOINTS (11) ====================

  /**
   * Get featured modules (PUBLIC)
   */
  async getFeaturedModules(): Promise<Module[]> {
    const response = await apiClient.get<ApiResponse<Module[]>>(`${this.baseUrl}/featured`);
    return response.data.data || [];
  }

  /**
   * Get all modules with filters
   */
  async getModules(filters?: ModuleFilters): Promise<ModuleListResponse> {
    const response = await apiClient.get<ApiResponse<ModuleListResponse>>(this.baseUrl, {
      params: filters,
    });
    return response.data.data || { modules: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }

  /**
   * Get module by ID
   */
  async getModuleById(moduleId: string, includeTopics = false): Promise<Module> {
    const response = await apiClient.get<ApiResponse<Module>>(
      `${this.baseUrl}/${moduleId}`,
      { params: { includeTopics } }
    );
    return response.data.data as Module;
  }

  /**
   * Create new module (TEACHER/ADMIN)
   */
  async createModule(data: CreateModuleData): Promise<Module> {
    const response = await apiClient.post<ApiResponse<Module>>(this.baseUrl, data);
    return response.data.data as Module;
  }

  /**
   * Update module (TEACHER/ADMIN)
   */
  async updateModule(moduleId: string, data: UpdateModuleData): Promise<Module> {
    const response = await apiClient.patch<ApiResponse<Module>>(`${this.baseUrl}/${moduleId}`, data);
    return response.data.data as Module;
  }

  /**
   * Delete/Archive module (TEACHER/ADMIN)
   */
  async deleteModule(moduleId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse<any>>(`${this.baseUrl}/${moduleId}`);
    return { success: response.data.success, message: response.data.message || 'Module deleted' };
  }

  /**
   * Submit module for approval (TEACHER)
   */
  async submitModuleForApproval(moduleId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<any>>(`${this.baseUrl}/${moduleId}/submit`);
    return { success: response.data.success, message: response.data.message || 'Module submitted' };
  }

  /**
   * Approve module (ADMIN ONLY)
   */
  async approveModule(moduleId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<any>>(`${this.baseUrl}/${moduleId}/approve`);
    return { success: response.data.success, message: response.data.message || 'Module approved' };
  }

  /**
   * Publish module (ADMIN ONLY)
   */
  async publishModule(moduleId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<any>>(`${this.baseUrl}/${moduleId}/publish`);
    return { success: response.data.success, message: response.data.message || 'Module published' };
  }

  /**
   * Reject module (ADMIN ONLY)
   */
  async rejectModule(moduleId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<any>>(`${this.baseUrl}/${moduleId}/reject`, { reason });
    return { success: response.data.success, message: response.data.message || 'Module rejected' };
  }

  /**
   * Search modules
   */
  async searchModules(query: string, filters?: Partial<ModuleFilters>): Promise<ModuleListResponse> {
    const response = await apiClient.get<ApiResponse<ModuleListResponse>>(`${this.baseUrl}/search`, {
      params: { search: query, ...filters },
    });
    return response.data.data || { modules: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }

  // ==================== TOPIC ENDPOINTS (7) ====================

  /**
   * Get topics for a module
   */
  async getTopicsByModule(moduleId: string): Promise<Topic[]> {
    const response = await apiClient.get<ApiResponse<Topic[]>>(`/topics/modules/${moduleId}/topics`);
    return response.data.data || [];
  }

  /**
   * Create topic (TEACHER/ADMIN)
   */
  async createTopic(data: CreateTopicData): Promise<Topic> {
    const response = await apiClient.post<ApiResponse<Topic>>('/topics', data);
    return response.data.data as Topic;
  }

  /**
   * Get topic by ID
   */
  async getTopicById(topicId: string): Promise<Topic> {
    const response = await apiClient.get<ApiResponse<Topic>>(`/topics/${topicId}`);
    return response.data.data as Topic;
  }

  /**
   * Update topic (TEACHER/ADMIN)
   */
  async updateTopic(topicId: string, data: UpdateTopicData): Promise<Topic> {
    const response = await apiClient.patch<ApiResponse<Topic>>(`/topics/${topicId}`, data);
    return response.data.data as Topic;
  }

  /**
   * Delete topic (TEACHER/ADMIN)
   */
  async deleteTopic(topicId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse<any>>(`/topics/${topicId}`);
    return { success: response.data.success, message: response.data.message || 'Topic deleted' };
  }

  /**
   * Duplicate topic (TEACHER/ADMIN)
   */
  async duplicateTopic(topicId: string): Promise<Topic> {
    const response = await apiClient.post<ApiResponse<Topic>>(`/topics/${topicId}/duplicate`);
    return response.data.data as Topic;
  }

  /**
   * Update topic order (TEACHER/ADMIN)
   */
  async updateTopicOrder(topicId: string, newOrder: number): Promise<Topic> {
    const response = await apiClient.patch<ApiResponse<Topic>>(`/topics/${topicId}/order`, { order: newOrder });
    return response.data.data as Topic;
  }

  // ==================== LESSON ENDPOINTS (14) ====================

  /**
   * Get lessons for a topic
   */
  async getLessonsByTopic(topicId: string): Promise<Lesson[]> {
    const response = await apiClient.get<ApiResponse<Lesson[]>>(`/lessons/topics/${topicId}/lessons`);
    return response.data.data || [];
  }

  /**
   * Create lesson (TEACHER/ADMIN)
   */
  async createLesson(data: CreateLessonData): Promise<Lesson> {
    const response = await apiClient.post<ApiResponse<Lesson>>('/lessons', data);
    return response.data.data as Lesson;
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(lessonId: string): Promise<Lesson> {
    const response = await apiClient.get<ApiResponse<Lesson>>(`/lessons/${lessonId}`);
    return response.data.data as Lesson;
  }

  /**
   * Update lesson (TEACHER/ADMIN)
   */
  async updateLesson(lessonId: string, data: UpdateLessonData): Promise<Lesson> {
    const response = await apiClient.patch<ApiResponse<Lesson>>(`/lessons/${lessonId}`, data);
    return response.data.data as Lesson;
  }

  /**
   * Delete lesson (TEACHER/ADMIN)
   */
  async deleteLesson(lessonId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse<any>>(`/lessons/${lessonId}`);
    return { success: response.data.success, message: response.data.message || 'Lesson deleted' };
  }

  /**
   * Add attachment to lesson (TEACHER/ADMIN)
   */
  async addLessonAttachment(lessonId: string, formData: FormData): Promise<LessonAttachment> {
    const response = await apiClient.upload<ApiResponse<LessonAttachment>>(
      `/lessons/${lessonId}/attachments`,
      formData
    );
    return response.data.data as LessonAttachment;
  }

  /**
   * Get lesson attachments
   */
  async getLessonAttachments(lessonId: string): Promise<LessonAttachment[]> {
    const response = await apiClient.get<ApiResponse<LessonAttachment[]>>(`/lessons/${lessonId}/attachments`);
    return response.data.data || [];
  }

  /**
   * Delete lesson attachment (TEACHER/ADMIN)
   */
  async deleteLessonAttachment(lessonId: string, attachmentId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/lessons/${lessonId}/attachments/${attachmentId}`
    );
    return { success: response.data.success, message: response.data.message || 'Attachment deleted' };
  }

  /**
   * Search lessons
   */
  async searchLessons(filters: LessonSearchFilters): Promise<Lesson[]> {
    const response = await apiClient.get<ApiResponse<Lesson[]>>('/lessons/search', { params: filters });
    return response.data.data || [];
  }

  /**
   * Duplicate lesson (TEACHER/ADMIN)
   */
  async duplicateLesson(lessonId: string): Promise<Lesson> {
    const response = await apiClient.post<ApiResponse<Lesson>>(`/lessons/${lessonId}/duplicate`);
    return response.data.data as Lesson;
  }

  /**
   * Update lesson order (TEACHER/ADMIN)
   */
  async updateLessonOrder(lessonId: string, newOrder: number): Promise<Lesson> {
    const response = await apiClient.patch<ApiResponse<Lesson>>(`/lessons/${lessonId}/order`, { order: newOrder });
    return response.data.data as Lesson;
  }

  /**
   * Record lesson view
   */
  async recordLessonView(lessonId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<ApiResponse<any>>(`/lessons/${lessonId}/view`);
    return { success: response.data.success };
  }

  /**
   * Get lesson views count
   */
  async getLessonViews(lessonId: string): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ views: number }>>(`/lessons/${lessonId}/views`);
    return response.data.data?.views || 0;
  }

  /**
   * Get lessons by type
   */
  async getLessonsByType(type: string): Promise<Lesson[]> {
    const response = await apiClient.get<ApiResponse<Lesson[]>>(`/lessons/types/${type}`);
    return response.data.data || [];
  }

  // ==================== ENROLLMENT ENDPOINTS (10) ====================

  /**
   * Create enrollment (ADMIN ONLY)
   */
  async createEnrollment(data: CreateEnrollmentData): Promise<ModuleEnrollment> {
    const response = await apiClient.post<ApiResponse<ModuleEnrollment>>('/enrollments', data);
    return response.data.data as ModuleEnrollment;
  }

  /**
   * Bulk enroll students (ADMIN ONLY)
   */
  async bulkEnrollStudents(data: BulkEnrollmentData): Promise<{ success: boolean; enrolled: number }> {
    const response = await apiClient.post<ApiResponse<any>>('/enrollments/bulk', data);
    return response.data.data || { success: true, enrolled: 0 };
  }

  /**
   * Enroll entire class (ADMIN ONLY)
   */
  async enrollClass(data: ClassEnrollmentData): Promise<{ success: boolean; enrolled: number }> {
    const response = await apiClient.post<ApiResponse<any>>('/enrollments/class', data);
    return response.data.data || { success: true, enrolled: 0 };
  }

  /**
   * Get enrollments for a module
   */
  async getModuleEnrollments(moduleId: string, filters?: EnrollmentFilters): Promise<ModuleEnrollment[]> {
    const response = await apiClient.get<ApiResponse<ModuleEnrollment[]>>(
      `/enrollments/modules/${moduleId}`,
      { params: filters }
    );
    return response.data.data || [];
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(enrollmentId: string): Promise<ModuleEnrollment> {
    const response = await apiClient.get<ApiResponse<ModuleEnrollment>>(`/enrollments/${enrollmentId}`);
    return response.data.data as ModuleEnrollment;
  }

  /**
   * Delete enrollment (ADMIN ONLY)
   */
  async deleteEnrollment(enrollmentId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse<any>>(`/enrollments/${enrollmentId}`);
    return { success: response.data.success, message: response.data.message || 'Enrollment deleted' };
  }

  /**
   * Get student enrollments
   */
  async getStudentEnrollments(studentId: string): Promise<ModuleEnrollment[]> {
    const response = await apiClient.get<ApiResponse<ModuleEnrollment[]>>(
      `/enrollments/students/${studentId}/enrollments`
    );
    return response.data.data || [];
  }

  /**
   * Get students enrolled in a module
   */
  async getEnrolledStudents(moduleId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/enrollments/modules/${moduleId}/students`);
    return response.data.data || [];
  }

  /**
   * Get student enrollment stats
   */
  async getStudentEnrollmentStats(studentId: string): Promise<EnrollmentStats> {
    const response = await apiClient.get<ApiResponse<EnrollmentStats>>(
      `/enrollments/students/${studentId}/stats`
    );
    return response.data.data as EnrollmentStats;
  }

  /**
   * Complete enrollment (STUDENT)
   */
  async completeEnrollment(enrollmentId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch<ApiResponse<any>>(`/enrollments/${enrollmentId}/complete`);
    return { success: response.data.success, message: response.data.message || 'Enrollment completed' };
  }

  // ==================== PROGRESS ENDPOINTS (10) ====================

  /**
   * Start lesson (STUDENT)
   */
  async startLesson(lessonId: string): Promise<LessonProgress> {
    const response = await apiClient.post<ApiResponse<LessonProgress>>(`/progress/lessons/${lessonId}/start`);
    return response.data.data as LessonProgress;
  }

  /**
   * Complete lesson (STUDENT)
   */
  async completeLesson(lessonId: string): Promise<LessonProgress> {
    const response = await apiClient.post<ApiResponse<LessonProgress>>(`/progress/lessons/${lessonId}/complete`);
    return response.data.data as LessonProgress;
  }

  /**
   * Update video progress (STUDENT)
   */
  async updateVideoProgress(lessonId: string, lastPosition: number, timeSpent: number): Promise<LessonProgress> {
    const response = await apiClient.post<ApiResponse<LessonProgress>>(
      `/progress/lessons/${lessonId}/video`,
      { lastPosition, timeSpent }
    );
    return response.data.data as LessonProgress;
  }

  /**
   * Submit quiz (STUDENT)
   */
  async submitQuiz(lessonId: string, quizScore: number): Promise<LessonProgress> {
    const response = await apiClient.post<ApiResponse<LessonProgress>>(
      `/progress/lessons/${lessonId}/quiz`,
      { quizScore }
    );
    return response.data.data as LessonProgress;
  }

  /**
   * Get module progress (STUDENT)
   */
  async getModuleProgress(moduleId: string): Promise<ModuleProgress> {
    const response = await apiClient.get<ApiResponse<ModuleProgress>>(`/progress/modules/${moduleId}`);
    return response.data.data as ModuleProgress;
  }

  /**
   * Get lesson progress (STUDENT)
   */
  async getLessonProgress(lessonId: string): Promise<LessonProgress> {
    const response = await apiClient.get<ApiResponse<LessonProgress>>(`/progress/lessons/${lessonId}`);
    return response.data.data as LessonProgress;
  }

  /**
   * Get module progress stats (TEACHER/ADMIN)
   */
  async getModuleProgressStats(moduleId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/progress/modules/${moduleId}/stats`);
    return response.data.data;
  }

  /**
   * Get student progress stats (TEACHER/ADMIN)
   */
  async getStudentProgressStats(studentId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/progress/students/${studentId}/stats`);
    return response.data.data;
  }

  /**
   * Reset lesson progress (ADMIN ONLY)
   */
  async resetLessonProgress(lessonId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse<any>>(`/progress/lessons/${lessonId}/reset`);
    return { success: response.data.success, message: response.data.message || 'Progress reset' };
  }

  /**
   * Get student module progress (STUDENT/TEACHER/ADMIN)
   */
  async getStudentModuleProgress(studentId: string, moduleId: string): Promise<ModuleProgress> {
    const response = await apiClient.get<ApiResponse<ModuleProgress>>(
      `/progress/students/${studentId}/modules/${moduleId}`
    );
    return response.data.data as ModuleProgress;
  }

  // ==================== ACTIVITY ENDPOINTS (10) ====================

  /**
   * Get user activities
   */
  async getUserActivities(userId: string, filters?: ActivityFilters): Promise<ActivityHistory[]> {
    const response = await apiClient.get<ApiResponse<ActivityHistory[]>>(
      `/activities/users/${userId}`,
      { params: filters }
    );
    return response.data.data || [];
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(userId: string): Promise<ActivityTimelineItem[]> {
    const response = await apiClient.get<ApiResponse<ActivityTimelineItem[]>>(
      `/activities/timeline/${userId}`
    );
    return response.data.data || [];
  }

  /**
   * Get module activities (TEACHER/ADMIN)
   */
  async getModuleActivities(moduleId: string): Promise<ActivityHistory[]> {
    const response = await apiClient.get<ApiResponse<ActivityHistory[]>>(
      `/activities/modules/${moduleId}`
    );
    return response.data.data || [];
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId: string): Promise<ActivityHistory> {
    const response = await apiClient.get<ApiResponse<ActivityHistory>>(`/activities/${activityId}`);
    return response.data.data as ActivityHistory;
  }

  /**
   * Search activities
   */
  async searchActivities(filters: ActivityFilters): Promise<ActivityHistory[]> {
    const response = await apiClient.get<ApiResponse<ActivityHistory[]>>(
      '/activities/search',
      { params: filters }
    );
    return response.data.data || [];
  }

  /**
   * Export user activities
   */
  async exportUserActivities(userId: string): Promise<Blob> {
    const response = await apiClient.get(`/activities/users/${userId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get recent activities (ADMIN ONLY)
   */
  async getRecentActivities(limit = 10): Promise<ActivityHistory[]> {
    const response = await apiClient.get<ApiResponse<ActivityHistory[]>>(
      '/activities/recent',
      { params: { limit } }
    );
    return response.data.data || [];
  }

  /**
   * Get activities by type
   */
  async getActivitiesByType(type: string): Promise<ActivityHistory[]> {
    const response = await apiClient.get<ApiResponse<ActivityHistory[]>>(`/activities/types/${type}`);
    return response.data.data || [];
  }

  /**
   * Cleanup old activities (ADMIN ONLY)
   */
  async cleanupActivities(olderThanDays: number): Promise<{ success: boolean; deleted: number }> {
    const response = await apiClient.delete<ApiResponse<any>>(
      '/activities/cleanup',
      { params: { olderThanDays } }
    );
    return response.data.data || { success: true, deleted: 0 };
  }

  /**
   * Get module activity summary (TEACHER/ADMIN)
   */
  async getModuleActivitySummary(moduleId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/activities/modules/${moduleId}/summary`);
    return response.data.data;
  }

  // ==================== YOUTUBE LIVE ENDPOINTS (13) ====================

  /**
   * Create YouTube Live session (TEACHER/ADMIN)
   */
  async createYoutubeLiveSession(data: CreateYoutubeLiveData): Promise<YoutubeLiveSession> {
    const response = await apiClient.post<ApiResponse<YoutubeLiveSession>>('/youtube-live', data);
    return response.data.data as YoutubeLiveSession;
  }

  /**
   * Get upcoming YouTube Live sessions
   */
  async getUpcomingSessions(): Promise<YoutubeLiveSession[]> {
    const response = await apiClient.get<ApiResponse<YoutubeLiveSession[]>>('/youtube-live/upcoming');
    return response.data.data || [];
  }

  /**
   * Get current/live YouTube Live sessions
   */
  async getCurrentSessions(): Promise<YoutubeLiveSession[]> {
    const response = await apiClient.get<ApiResponse<YoutubeLiveSession[]>>('/youtube-live/current');
    return response.data.data || [];
  }

  /**
   * Get YouTube Live session by ID
   */
  async getYoutubeLiveSession(sessionId: string): Promise<YoutubeLiveSession> {
    const response = await apiClient.get<ApiResponse<YoutubeLiveSession>>(`/youtube-live/${sessionId}`);
    return response.data.data as YoutubeLiveSession;
  }

  /**
   * Update YouTube Live session (TEACHER/ADMIN)
   */
  async updateYoutubeLiveSession(sessionId: string, data: UpdateYoutubeLiveData): Promise<YoutubeLiveSession> {
    const response = await apiClient.patch<ApiResponse<YoutubeLiveSession>>(`/youtube-live/${sessionId}`, data);
    return response.data.data as YoutubeLiveSession;
  }

  /**
   * Delete YouTube Live session (TEACHER/ADMIN)
   */
  async deleteYoutubeLiveSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse<any>>(`/youtube-live/${sessionId}`);
    return { success: response.data.success, message: response.data.message || 'Session deleted' };
  }

  /**
   * Start YouTube Live session (TEACHER/ADMIN)
   */
  async startYoutubeLiveSession(sessionId: string): Promise<YoutubeLiveSession> {
    const response = await apiClient.post<ApiResponse<YoutubeLiveSession>>(`/youtube-live/${sessionId}/start`);
    return response.data.data as YoutubeLiveSession;
  }

  /**
   * End YouTube Live session (TEACHER/ADMIN)
   */
  async endYoutubeLiveSession(sessionId: string): Promise<YoutubeLiveSession> {
    const response = await apiClient.post<ApiResponse<YoutubeLiveSession>>(`/youtube-live/${sessionId}/end`);
    return response.data.data as YoutubeLiveSession;
  }

  /**
   * Join YouTube Live session (STUDENT)
   */
  async joinYoutubeLiveSession(sessionId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<ApiResponse<any>>(`/youtube-live/${sessionId}/join`);
    return { success: response.data.success };
  }

  /**
   * Get YouTube Live session viewers
   */
  async getYoutubeLiveViewers(sessionId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/youtube-live/${sessionId}/viewers`);
    return response.data.data || [];
  }

  /**
   * Get module YouTube Live sessions
   */
  async getModuleYoutubeSessions(moduleId: string): Promise<YoutubeLiveSession[]> {
    const response = await apiClient.get<ApiResponse<YoutubeLiveSession[]>>(`/youtube-live/modules/${moduleId}`);
    return response.data.data || [];
  }

  /**
   * Get past YouTube Live sessions
   */
  async getPastSessions(): Promise<YoutubeLiveSession[]> {
    const response = await apiClient.get<ApiResponse<YoutubeLiveSession[]>>('/youtube-live/past');
    return response.data.data || [];
  }

  /**
   * Get YouTube Live session stats (TEACHER/ADMIN)
   */
  async getYoutubeLiveStats(sessionId: string): Promise<YoutubeLiveStats> {
    const response = await apiClient.get<ApiResponse<YoutubeLiveStats>>(`/youtube-live/${sessionId}/stats`);
    return response.data.data as YoutubeLiveStats;
  }

  // ==================== DROPDOWN DATA ENDPOINTS (3) ====================

  /**
   * Get all subjects for dropdowns
   */
  async getSubjects(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/subjects');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  }

  /**
   * Get all classes for dropdowns
   */
  async getClasses(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/classes');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  }

  /**
   * Get all teachers for dropdowns
   */
  async getTeachers(): Promise<Array<{ id: string; name: string; email?: string }>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/users?role=TEACHER&limit=1000');
      const usersData = response.data.data;
      const users = usersData?.users || [];
      
      return users.map((user: any) => ({
        id: user.id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
      }));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  }
}

// ==================== EXPORT ====================

export const moduleApi = new ModuleApiService();
export default moduleApi;
