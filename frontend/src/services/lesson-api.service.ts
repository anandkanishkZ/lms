import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export type LessonType = 'VIDEO' | 'YOUTUBE_LIVE' | 'PDF' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'EXTERNAL_LINK';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  topicId: string;
  type: LessonType;
  orderIndex: number;
  duration?: number;
  videoUrl?: string;
  youtubeVideoId?: string;
  content?: string;
  isFree: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  topic?: {
    id: string;
    title: string;
  };
  attachments?: any[];
  _count?: {
    progress: number;
  };
}

export interface CreateLessonDto {
  title: string;
  description?: string;
  topicId: string;
  type: LessonType;
  orderIndex?: number;
  duration?: number;
  videoUrl?: string;
  youtubeVideoId?: string;
  content?: string;
  isFree?: boolean;
  isPublished?: boolean;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  orderIndex?: number;
  duration?: number;
  videoUrl?: string;
  youtubeVideoId?: string;
  content?: string;
  isFree?: boolean;
  isPublished?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class LessonApiService {
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
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('teacher_token');
    }
    return null;
  }

  /**
   * Get all lessons for a topic
   */
  async getLessonsByTopic(topicId: string, includeUnpublished: boolean = true): Promise<ApiResponse<Lesson[]>> {
    const response = await this.axiosInstance.get(`/lessons/topics/${topicId}/lessons?includeUnpublished=${includeUnpublished}`);
    return response.data;
  }

  /**
   * Get single lesson by ID
   */
  async getLessonById(lessonId: string): Promise<ApiResponse<Lesson>> {
    const response = await this.axiosInstance.get(`/lessons/${lessonId}`);
    return response.data;
  }

  /**
   * Create a new lesson
   */
  async createLesson(data: CreateLessonDto): Promise<ApiResponse<Lesson>> {
    const response = await this.axiosInstance.post('/lessons', data);
    return response.data;
  }

  /**
   * Update an existing lesson
   */
  async updateLesson(lessonId: string, data: UpdateLessonDto): Promise<ApiResponse<Lesson>> {
    const response = await this.axiosInstance.put(`/lessons/${lessonId}`, data);
    return response.data;
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(lessonId: string): Promise<ApiResponse<void>> {
    const response = await this.axiosInstance.delete(`/lessons/${lessonId}`);
    return response.data;
  }

  /**
   * Duplicate a lesson
   */
  async duplicateLesson(lessonId: string, newTopicId?: string): Promise<ApiResponse<Lesson>> {
    const response = await this.axiosInstance.post(`/lessons/${lessonId}/duplicate`, { newTopicId });
    return response.data;
  }

  /**
   * Reorder lessons within a topic
   */
  async reorderLessons(
    topicId: string,
    lessons: Array<{ id: string; orderIndex: number }>
  ): Promise<ApiResponse<Lesson[]>> {
    const response = await this.axiosInstance.patch(`/lessons/topics/${topicId}/reorder`, { lessons });
    return response.data;
  }

  /**
   * Toggle publish status of a lesson
   */
  async togglePublishStatus(lessonId: string): Promise<ApiResponse<Lesson>> {
    const response = await this.axiosInstance.patch(`/lessons/${lessonId}/publish`);
    return response.data;
  }

  /**
   * Bulk create lessons in a topic
   */
  async bulkCreateLessons(topicId: string, lessons: CreateLessonDto[]): Promise<ApiResponse<Lesson[]>> {
    const response = await this.axiosInstance.post(`/lessons/topics/${topicId}/bulk`, { lessons });
    return response.data;
  }

  /**
   * Track lesson view
   */
  async trackView(lessonId: string): Promise<ApiResponse<void>> {
    const response = await this.axiosInstance.post(`/lessons/${lessonId}/view`);
    return response.data;
  }
}

export const lessonApiService = new LessonApiService();
