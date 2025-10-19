import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Topic {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  orderIndex: number;
  duration?: number;
  totalLessons: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  module?: {
    id: string;
    title: string;
  };
  lessons?: any[];
  _count?: {
    lessons: number;
  };
}

export interface CreateTopicDto {
  title: string;
  description?: string;
  moduleId: string;
  orderIndex?: number;
  duration?: number;
  isActive?: boolean;
}

export interface UpdateTopicDto {
  title?: string;
  description?: string;
  orderIndex?: number;
  duration?: number;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class TopicApiService {
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
   * Get all topics for a module
   */
  async getTopicsByModule(moduleId: string, includeLessons: boolean = false): Promise<ApiResponse<Topic[]>> {
    const response = await this.axiosInstance.get(`/topics/modules/${moduleId}/topics?includeLessons=${includeLessons}`);
    return response.data;
  }

  /**
   * Get single topic by ID
   */
  async getTopicById(topicId: string, includeLessons: boolean = true): Promise<ApiResponse<Topic>> {
    const response = await this.axiosInstance.get(`/topics/${topicId}?includeLessons=${includeLessons}`);
    return response.data;
  }

  /**
   * Create a new topic
   */
  async createTopic(data: CreateTopicDto): Promise<ApiResponse<Topic>> {
    const response = await this.axiosInstance.post('/topics', data);
    return response.data;
  }

  /**
   * Update an existing topic
   */
  async updateTopic(topicId: string, data: UpdateTopicDto): Promise<ApiResponse<Topic>> {
    const response = await this.axiosInstance.put(`/topics/${topicId}`, data);
    return response.data;
  }

  /**
   * Delete a topic
   */
  async deleteTopic(topicId: string): Promise<ApiResponse<void>> {
    const response = await this.axiosInstance.delete(`/topics/${topicId}`);
    return response.data;
  }

  /**
   * Duplicate a topic (copy with all lessons)
   */
  async duplicateTopic(topicId: string): Promise<ApiResponse<Topic>> {
    const response = await this.axiosInstance.post(`/topics/${topicId}/duplicate`, {});
    return response.data;
  }

  /**
   * Reorder topics within a module
   */
  async reorderTopics(
    moduleId: string,
    topics: Array<{ id: string; orderIndex: number }>
  ): Promise<ApiResponse<Topic[]>> {
    const response = await this.axiosInstance.patch(`/topics/modules/${moduleId}/reorder`, { topics });
    return response.data;
  }
}

export const topicApiService = new TopicApiService();
