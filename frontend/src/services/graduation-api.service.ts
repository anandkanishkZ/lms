import { API_CONFIG } from '@/src/config/api.config';
import type { ApiResponse } from '@/src/features/admin/types';

export interface Graduation {
  id: string;
  studentId: string;
  batchId: string;
  graduationDate: string;
  certificateNumber?: string;
  certificateUrl?: string;
  gpa?: number;
  honors?: string;
  remarks?: string;
  issuedById: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    symbolNo: string;
    email?: string;
  };
  batch?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  issuedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface GraduateStudentData {
  studentId: string;
  batchId: string;
  graduationDate: string;
  remarks?: string;
  issuedById: string;
}

export interface GraduateBatchData {
  graduationDate: string;
  remarks?: string;
}

export interface UpdateGraduationData {
  graduationDate?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  gpa?: number;
  honors?: string;
  remarks?: string;
}

export interface AttachCertificateData {
  certificateUrl: string;
}

export interface GraduationFilters {
  search?: string;
  studentId?: string;
  batchId?: string;
  issuedById?: string;
  startDate?: string;
  endDate?: string;
  hasHonors?: boolean;
  page?: number;
  limit?: number;
}

export interface GraduationStatistics {
  totalGraduations: number;
  graduationsByBatch: Array<{
    batchId: string;
    batchName: string;
    graduationCount: number;
  }>;
  averageGpa: number;
  honorsDistribution: {
    distinction: number;
    firstClass: number;
    secondClass: number;
    none: number;
  };
  graduationsByYear: Array<{
    year: number;
    count: number;
  }>;
}

export interface PaginatedGraduationResponse {
  graduations: Graduation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class GraduationApiService {
  private baseUrl = `${API_CONFIG.baseURL}/admin/graduations`;

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
      console.error('Graduation API Request Error:', error);
      throw error;
    }
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }

  /**
   * Graduate a single student
   */
  async graduateStudent(data: GraduateStudentData): Promise<ApiResponse<Graduation>> {
    return this.makeRequest<Graduation>('/student', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Graduate entire batch
   */
  async graduateBatch(batchId: string, data: GraduateBatchData): Promise<ApiResponse<Graduation[]>> {
    return this.makeRequest<Graduation[]>(`/batch/${batchId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all graduations with optional filters
   */
  async getGraduations(filters?: GraduationFilters): Promise<ApiResponse<PaginatedGraduationResponse>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.studentId) queryParams.append('studentId', filters.studentId);
    if (filters?.batchId) queryParams.append('batchId', filters.batchId);
    if (filters?.issuedById) queryParams.append('issuedById', filters.issuedById);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.hasHonors !== undefined) queryParams.append('hasHonors', filters.hasHonors.toString());
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.makeRequest<PaginatedGraduationResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get graduation statistics
   */
  async getGraduationStatistics(): Promise<ApiResponse<GraduationStatistics>> {
    return this.makeRequest<GraduationStatistics>('/statistics', {
      method: 'GET',
    });
  }

  /**
   * Get graduation by ID
   */
  async getGraduationById(id: string): Promise<ApiResponse<Graduation>> {
    return this.makeRequest<Graduation>(`/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Get all graduations for a batch
   */
  async getBatchGraduations(batchId: string): Promise<ApiResponse<Graduation[]>> {
    return this.makeRequest<Graduation[]>(`/batch/${batchId}`, {
      method: 'GET',
    });
  }

  /**
   * Get student graduation record
   */
  async getStudentGraduation(studentId: string): Promise<ApiResponse<Graduation | null>> {
    return this.makeRequest<Graduation | null>(`/student/${studentId}`, {
      method: 'GET',
    });
  }

  /**
   * Update graduation details
   */
  async updateGraduation(id: string, data: UpdateGraduationData): Promise<ApiResponse<Graduation>> {
    return this.makeRequest<Graduation>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Attach certificate to graduation
   */
  async attachCertificate(id: string, data: AttachCertificateData): Promise<ApiResponse<Graduation>> {
    return this.makeRequest<Graduation>(`/${id}/certificate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Revoke graduation
   */
  async revokeGraduation(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const graduationApiService = new GraduationApiService();
export default graduationApiService;
