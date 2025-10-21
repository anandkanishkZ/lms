import { API_CONFIG } from '@/src/config/api.config';
import type { ApiResponse } from '@/src/features/admin/types';

export type BatchStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'GRADUATED' | 'ARCHIVED';

export interface Batch {
  id: string;
  name: string;
  description?: string;
  startYear: number;
  endYear: number;
  startDate: string;
  endDate?: string;
  status: BatchStatus;
  maxStudents?: number;
  currentStudents: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  graduatedAt?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    students: number;
    classEnrollments: number;
    graduations: number;
    classBatches: number;
  };
}

export interface BatchClass {
  id: string;
  sequence: number;
  isActive: boolean;
  class: {
    id: string;
    name: string;
    description?: string;
    section?: string;
  };
}

export interface BatchWithDetails extends Batch {
  classBatches: Array<BatchClass>;
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    symbolNo: string;
    email?: string;
  }>;
}

export interface CreateBatchData {
  name: string;
  description?: string;
  startYear: number;
  endYear: number;
  startDate: string;
  endDate?: string;
  maxStudents?: number;
}

export interface UpdateBatchData {
  name?: string;
  description?: string;
  startYear?: number;
  endYear?: number;
  startDate?: string;
  endDate?: string;
  status?: BatchStatus;
  maxStudents?: number;
}

export interface BatchFilters {
  search?: string;
  status?: BatchStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AttachClassData {
  classId: string;
  sequence: number;
}

export interface UpdateStatusData {
  status: BatchStatus;
}

export interface BatchStatistics {
  totalStudents: number;
  totalEnrollments: number;
  completedEnrollments: number;
  activeEnrollments: number;
  totalGraduations: number;
  averageAttendance: number;
  completionRate: number;
  passRate: number;
  classesBySequence: Array<{
    sequence: number;
    className: string;
    enrollmentCount: number;
    completedCount: number;
  }>;
}

export interface PaginatedBatchResponse {
  batches: Batch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class BatchApiService {
  private baseUrl = `${API_CONFIG.baseURL}/admin/batches`;

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
      console.error('Batch API Request Error:', error);
      throw error;
    }
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }

  /**
   * Create a new batch
   */
  async createBatch(data: CreateBatchData): Promise<ApiResponse<Batch>> {
    return this.makeRequest<Batch>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all batches with optional filters
   */
  async getBatches(filters?: BatchFilters): Promise<ApiResponse<PaginatedBatchResponse>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.makeRequest<PaginatedBatchResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get batch by ID with full details
   */
  async getBatchById(id: string): Promise<ApiResponse<BatchWithDetails>> {
    return this.makeRequest<BatchWithDetails>(`/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Update batch information
   */
  async updateBatch(id: string, data: UpdateBatchData): Promise<ApiResponse<Batch>> {
    return this.makeRequest<Batch>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete batch
   */
  async deleteBatch(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Attach class to batch
   */
  async attachClassToBatch(batchId: string, data: AttachClassData): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/${batchId}/classes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Detach class from batch
   */
  async detachClassFromBatch(batchId: string, classId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${batchId}/classes/${classId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all classes in batch
   */
  async getBatchClasses(batchId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/${batchId}/classes`, {
      method: 'GET',
    });
  }

  /**
   * Update batch status
   */
  async updateBatchStatus(batchId: string, data: UpdateStatusData): Promise<ApiResponse<Batch>> {
    return this.makeRequest<Batch>(`/${batchId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get batch statistics
   */
  async getBatchStatistics(batchId: string): Promise<ApiResponse<BatchStatistics>> {
    return this.makeRequest<BatchStatistics>(`/${batchId}/statistics`, {
      method: 'GET',
    });
  }

  /**
   * Get all students in batch
   */
  async getBatchStudents(batchId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/${batchId}/students`, {
      method: 'GET',
    });
  }
}

export const batchApiService = new BatchApiService();
export default batchApiService;
