/**
 * Class API Service
 * Handles all API calls related to class management
 */

import { AUTH_CONFIG, getCurrentUserType } from '@/src/config/api.config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Types
export interface CreateClassData {
  name: string;
  section?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateClassData {
  name?: string;
  section?: string;
  description?: string;
  isActive?: boolean;
}

export interface ClassFilters {
  search?: string;
  isActive?: boolean;
  grade?: string;
  section?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssignTeacherData {
  teacherId: string;
  subjectId: string;
}

export interface Class {
  id: string;
  name: string;
  section: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
    teachers: number;
    modules: number;
    classBatches: number;
  };
}

export interface ClassDetails extends Class {
  teachers?: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    subject: {
      id: string;
      name: string;
    };
  }>;
  students?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  classBatches?: Array<{
    id: string;
    sequence: number;
    batch: {
      id: string;
      name: string;
      academicYear: string;
      status: string;
    };
  }>;
  modules?: Array<{
    id: string;
    title: string;
  }>;
}

export interface ClassStatistics {
  totalStudents: number;
  totalTeachers: number;
  totalModules: number;
  totalLiveClasses: number;
  upcomingLiveClasses: number;
  totalExams: number;
  completedExams: number;
  totalNotices: number;
  totalBatches: number;
  activeBatches: number;
  totalEnrollments: number;
  activeEnrollments: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Get authentication token from localStorage based on user type
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const userType = getCurrentUserType();
  const config = AUTH_CONFIG[userType];
  return localStorage.getItem(config.tokenKey);
};

/**
 * Build query string from filters
 */
const buildQueryString = (filters: ClassFilters): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
};

/**
 * Create a new class
 */
export const createClass = async (data: CreateClassData): Promise<ApiResponse<Class>> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}/admin/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to create class');
  }

  return result;
};

/**
 * Get all classes with optional filters and pagination
 * For teachers, this returns only classes they teach
 * For admins, this returns all classes
 */
export const getAllClasses = async (filters: ClassFilters = {}): Promise<ApiResponse<Class[]>> => {
  const token = getAuthToken();
  const userType = getCurrentUserType();
  
  // For teachers, use the teacher-specific endpoint
  if (userType === 'teacher') {
    const response = await fetch(`${API_URL}/notices/teacher/classes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch classes');
    }

    return result;
  }
  
  // For admins, use the admin endpoint with filters
  const queryString = buildQueryString(filters);
  const response = await fetch(`${API_URL}/admin/classes?${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch classes');
  }

  return result;
};

/**
 * Get class by ID with full details
 */
export const getClassById = async (classId: string): Promise<ApiResponse<ClassDetails>> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}/admin/classes/${classId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch class details');
  }

  return result;
};

/**
 * Update class information
 */
export const updateClass = async (
  classId: string,
  data: UpdateClassData
): Promise<ApiResponse<Class>> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}/admin/classes/${classId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to update class');
  }

  return result;
};

/**
 * Delete class (soft delete by default, hard delete optional)
 */
export const deleteClass = async (
  classId: string,
  hardDelete: boolean = false
): Promise<ApiResponse<void>> => {
  const token = getAuthToken();
  const queryString = hardDelete ? '?hardDelete=true' : '';
  
  const response = await fetch(`${API_URL}/admin/classes/${classId}${queryString}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete class');
  }

  return result;
};

/**
 * Assign teacher to class with subject
 */
export const assignTeacherToClass = async (
  classId: string,
  data: AssignTeacherData
): Promise<ApiResponse<any>> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}/admin/classes/${classId}/teachers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to assign teacher');
  }

  return result;
};

/**
 * Remove teacher from class
 */
export const removeTeacherFromClass = async (
  classId: string,
  teacherId: string,
  subjectId: string
): Promise<ApiResponse<void>> => {
  const token = getAuthToken();
  
  const response = await fetch(
    `${API_URL}/admin/classes/${classId}/teachers/${teacherId}/subjects/${subjectId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to remove teacher');
  }

  return result;
};

/**
 * Get class statistics
 */
export const getClassStatistics = async (
  classId: string
): Promise<ApiResponse<ClassStatistics>> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}/admin/classes/${classId}/statistics`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch class statistics');
  }

  return result;
};

/**
 * Toggle class active status
 */
export const toggleClassStatus = async (classId: string): Promise<ApiResponse<Class>> => {
  const classDetails = await getClassById(classId);
  
  return updateClass(classId, {
    isActive: !classDetails.data?.isActive,
  });
};

// Export all functions as default object
export default {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  assignTeacherToClass,
  removeTeacherFromClass,
  getClassStatistics,
  toggleClassStatus,
};
