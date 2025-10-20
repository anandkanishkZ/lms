import { API_CONFIG } from '@/src/config/api.config';
import type { ApiResponse } from '@/src/features/admin/types';

export interface ClassEnrollment {
  id: string;
  studentId: string;
  classId: string;
  batchId: string;
  enrolledAt: string;
  completedAt?: string;
  status: string; // ACTIVE, COMPLETED, DROPPED
  finalGrade?: string;
  attendance?: number;
  remarks?: string;
  enrolledById: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    symbolNo: string;
    email?: string;
  };
  class?: {
    id: string;
    name: string;
    description?: string;
  };
  batch?: {
    id: string;
    name: string;
  };
  enrolledBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface EnrollStudentData {
  studentId: string;
  classId: string;
  batchId: string;
  enrolledById: string;
  remarks?: string;
}

export interface BulkEnrollmentData {
  enrollments: EnrollStudentData[];
}

export interface UpdateEnrollmentData {
  status?: string;
  finalGrade?: string;
  attendance?: number;
  remarks?: string;
}

export interface MarkCompletedData {
  completedAt: string;
  finalGrade: string;
  attendance?: number;
}

export interface PromoteStudentData {
  targetClassId: string;
}

export interface EnrollmentFilters {
  search?: string;
  studentId?: string;
  classId?: string;
  batchId?: string;
  status?: string;
  enrolledById?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedEnrollmentResponse {
  enrollments: ClassEnrollment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ClassEnrollmentApiService {
  private baseUrl = `${API_CONFIG.baseURL}/admin/enrollments`;

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
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
          throw new Error('Session expired');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error('Class Enrollment API Request Error:', error);
      throw error;
    }
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminAccessToken');
  }

  /**
   * Enroll a single student to a class
   */
  async enrollStudent(data: EnrollStudentData): Promise<ApiResponse<ClassEnrollment>> {
    return this.makeRequest<ClassEnrollment>('/class', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Enroll multiple students at once
   */
  async bulkEnrollStudents(data: BulkEnrollmentData): Promise<ApiResponse<ClassEnrollment[]>> {
    return this.makeRequest<ClassEnrollment[]>('/class/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Enroll entire batch to a class
   */
  async enrollBatchToClass(batchId: string, classId: string, enrolledById: string): Promise<ApiResponse<ClassEnrollment[]>> {
    return this.makeRequest<ClassEnrollment[]>(`/batch/${batchId}/class/${classId}`, {
      method: 'POST',
      body: JSON.stringify({ enrolledById }),
    });
  }

  /**
   * Get all enrollments with optional filters
   */
  async getEnrollments(filters?: EnrollmentFilters): Promise<ApiResponse<PaginatedEnrollmentResponse>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.studentId) queryParams.append('studentId', filters.studentId);
    if (filters?.classId) queryParams.append('classId', filters.classId);
    if (filters?.batchId) queryParams.append('batchId', filters.batchId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.enrolledById) queryParams.append('enrolledById', filters.enrolledById);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/class${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedEnrollmentResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(id: string): Promise<ApiResponse<ClassEnrollment>> {
    return this.makeRequest<ClassEnrollment>(`/class/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Get all enrollments for a student
   */
  async getStudentEnrollments(studentId: string): Promise<ApiResponse<ClassEnrollment[]>> {
    return this.makeRequest<ClassEnrollment[]>(`/student/${studentId}`, {
      method: 'GET',
    });
  }

  /**
   * Get all students enrolled in a class
   */
  async getClassEnrollments(classId: string): Promise<ApiResponse<ClassEnrollment[]>> {
    return this.makeRequest<ClassEnrollment[]>(`/class-list/${classId}`, {
      method: 'GET',
    });
  }

  /**
   * Update enrollment details
   */
  async updateEnrollment(id: string, data: UpdateEnrollmentData): Promise<ApiResponse<ClassEnrollment>> {
    return this.makeRequest<ClassEnrollment>(`/class/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Mark enrollment as completed
   */
  async markAsCompleted(id: string, data: MarkCompletedData): Promise<ApiResponse<ClassEnrollment>> {
    return this.makeRequest<ClassEnrollment>(`/class/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Promote student to next class
   */
  async promoteStudent(enrollmentId: string, data: PromoteStudentData): Promise<ApiResponse<ClassEnrollment>> {
    return this.makeRequest<ClassEnrollment>(`/class/${enrollmentId}/promote`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Unenroll student from class
   */
  async unenrollStudent(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/class/${id}`, {
      method: 'DELETE',
    });
  }
}

export const classEnrollmentApiService = new ClassEnrollmentApiService();
export default classEnrollmentApiService;
