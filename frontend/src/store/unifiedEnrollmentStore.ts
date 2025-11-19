import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================
// UNIFIED ENROLLMENT STORE (OPTION 2 - HYBRID)
// Simplified state management following photo model
// ============================================

// Types based on the new unified enrollment model
export interface SubjectEnrollment {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  batchId: string;
  enrolledBy: string;
  enrolledAt: string;
  completedAt?: string;
  
  // Academic tracking
  isActive: boolean;
  isCompleted: boolean;
  isPassed?: boolean;
  
  // Performance metrics
  grade?: 'A_PLUS' | 'A' | 'B_PLUS' | 'B' | 'C_PLUS' | 'C' | 'D' | 'F';
  finalMarks?: number;
  totalMarks?: number;
  percentage?: number;
  attendance?: number;
  
  // Progress tracking
  lastAccessed?: string;
  totalClasses?: number;
  attendedClasses?: number;
  
  // Additional data
  remarks?: string;
  
  // Relations
  student: {
    id: string;
    name: string;
    email?: string;
    symbolNo?: string;
  };
  subject: {
    id: string;
    name: string;
    code?: string;
    color?: string;
  };
  class: {
    id: string;
    name: string;
    section?: string;
  };
  batch: {
    id: string;
    name: string;
    startYear: number;
    endYear: number;
    status: string;
  };
  enrolledByUser: {
    id: string;
    name: string;
  };
}

export interface EnrollmentFilters {
  studentId?: string;
  subjectId?: string;
  classId?: string;
  batchId?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  search?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface EnrollmentStatistics {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  passedEnrollments: number;
  uniqueStudents: number;
  uniqueSubjects: number;
  averageAttendance: number;
  completionRate: number;
  passRate: number;
  gradeDistribution: Record<string, number>;
}

interface UnifiedEnrollmentState {
  // Data state
  enrollments: SubjectEnrollment[];
  selectedEnrollment: SubjectEnrollment | null;
  statistics: EnrollmentStatistics | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  filters: EnrollmentFilters;
  pagination: PaginationInfo;
  
  // Actions - Core Operations
  enrollStudentInSubject: (data: {
    studentId: string;
    subjectId: string;
    classId: string;
    batchId: string;
  }) => Promise<boolean>;
  
  bulkEnrollStudentsInSubject: (data: {
    studentIds: string[];
    subjectId: string;
    classId: string;
    batchId: string;
  }) => Promise<boolean>;
  
  enrollBatchInClass: (batchId: string, classId: string) => Promise<boolean>;
  
  // Actions - Query & Retrieval
  fetchEnrollments: (filters?: EnrollmentFilters, page?: number, limit?: number) => Promise<void>;
  fetchStudentEnrollments: (studentId: string, filters?: EnrollmentFilters) => Promise<void>;
  fetchEnrollmentStatistics: (filters?: EnrollmentFilters) => Promise<void>;
  
  // Actions - Management
  updateEnrollment: (enrollmentId: string, data: Partial<SubjectEnrollment>) => Promise<boolean>;
  deactivateEnrollment: (enrollmentId: string) => Promise<boolean>;
  
  // Actions - UI State
  setFilters: (filters: Partial<EnrollmentFilters>) => void;
  setSelectedEnrollment: (enrollment: SubjectEnrollment | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const API_BASE = '/api/v1/admin/enrollments-v2';

export const useUnifiedEnrollmentStore = create<UnifiedEnrollmentState>()(
  devtools(
    (set, get) => ({
      // Initial state
      enrollments: [],
      selectedEnrollment: null,
      statistics: null,
      loading: false,
      error: null,
      filters: {},
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      },
      
      // ============================================
      // CORE ENROLLMENT OPERATIONS
      // ============================================
      
      enrollStudentInSubject: async (data) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE}/subject`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
            body: JSON.stringify(data),
          });
          
          const result = await response.json();
          
          if (result.success) {
            // Refresh enrollments to show the new enrollment
            await get().fetchEnrollments(get().filters);
            set({ loading: false });
            return true;
          } else {
            set({ error: result.message, loading: false });
            return false;
          }
        } catch (error) {
          console.error('Error enrolling student:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to enroll student',
            loading: false 
          });
          return false;
        }
      },
      
      bulkEnrollStudentsInSubject: async (data) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE}/subject/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
            body: JSON.stringify(data),
          });
          
          const result = await response.json();
          
          if (result.success) {
            await get().fetchEnrollments(get().filters);
            set({ loading: false });
            return true;
          } else {
            set({ error: result.message, loading: false });
            return false;
          }
        } catch (error) {
          console.error('Error bulk enrolling students:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to bulk enroll students',
            loading: false 
          });
          return false;
        }
      },
      
      enrollBatchInClass: async (batchId, classId) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE}/batch/${batchId}/class/${classId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
          });
          
          const result = await response.json();
          
          if (result.success) {
            await get().fetchEnrollments(get().filters);
            set({ loading: false });
            return true;
          } else {
            set({ error: result.message, loading: false });
            return false;
          }
        } catch (error) {
          console.error('Error enrolling batch in class:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to enroll batch in class',
            loading: false 
          });
          return false;
        }
      },
      
      // ============================================
      // QUERY & RETRIEVAL OPERATIONS
      // ============================================
      
      fetchEnrollments: async (filters = {}, page = 1, limit = 50) => {
        set({ loading: true, error: null });
        
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...Object.entries(filters).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = value.toString();
              }
              return acc;
            }, {} as Record<string, string>),
          });
          
          const response = await fetch(`${API_BASE}/subject?${params}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
          });
          
          const result = await response.json();
          
          if (result.success) {
            set({
              enrollments: result.data.enrollments,
              pagination: result.data.pagination,
              filters,
              loading: false,
            });
          } else {
            set({ error: result.message, loading: false });
          }
        } catch (error) {
          console.error('Error fetching enrollments:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch enrollments',
            loading: false 
          });
        }
      },
      
      fetchStudentEnrollments: async (studentId, filters = {}) => {
        set({ loading: true, error: null });
        
        try {
          const params = new URLSearchParams({
            ...Object.entries(filters).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = value.toString();
              }
              return acc;
            }, {} as Record<string, string>),
          });
          
          const response = await fetch(`${API_BASE}/student/${studentId}?${params}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
          });
          
          const result = await response.json();
          
          if (result.success) {
            set({
              enrollments: result.data,
              filters: { ...filters, studentId },
              loading: false,
            });
          } else {
            set({ error: result.message, loading: false });
          }
        } catch (error) {
          console.error('Error fetching student enrollments:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch student enrollments',
            loading: false 
          });
        }
      },
      
      fetchEnrollmentStatistics: async (filters = {}) => {
        set({ loading: true, error: null });
        
        try {
          const params = new URLSearchParams(
            Object.entries(filters).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = value.toString();
              }
              return acc;
            }, {} as Record<string, string>)
          );
          
          const response = await fetch(`${API_BASE}/subject/statistics?${params}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
          });
          
          const result = await response.json();
          
          if (result.success) {
            set({
              statistics: result.data,
              loading: false,
            });
          } else {
            set({ error: result.message, loading: false });
          }
        } catch (error) {
          console.error('Error fetching enrollment statistics:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch statistics',
            loading: false 
          });
        }
      },
      
      // ============================================
      // MANAGEMENT OPERATIONS
      // ============================================
      
      updateEnrollment: async (enrollmentId, data) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE}/subject/${enrollmentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
            body: JSON.stringify(data),
          });
          
          const result = await response.json();
          
          if (result.success) {
            // Update the enrollment in the current list
            set(state => ({
              enrollments: state.enrollments.map(enrollment =>
                enrollment.id === enrollmentId
                  ? { ...enrollment, ...result.data }
                  : enrollment
              ),
              selectedEnrollment: state.selectedEnrollment?.id === enrollmentId
                ? { ...state.selectedEnrollment, ...result.data }
                : state.selectedEnrollment,
              loading: false,
            }));
            return true;
          } else {
            set({ error: result.message, loading: false });
            return false;
          }
        } catch (error) {
          console.error('Error updating enrollment:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update enrollment',
            loading: false 
          });
          return false;
        }
      },
      
      deactivateEnrollment: async (enrollmentId) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE}/subject/${enrollmentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
          });
          
          const result = await response.json();
          
          if (result.success) {
            // Remove or mark as inactive in the current list
            set(state => ({
              enrollments: state.enrollments.filter(enrollment => 
                enrollment.id !== enrollmentId
              ),
              selectedEnrollment: state.selectedEnrollment?.id === enrollmentId
                ? null
                : state.selectedEnrollment,
              loading: false,
            }));
            return true;
          } else {
            set({ error: result.message, loading: false });
            return false;
          }
        } catch (error) {
          console.error('Error deactivating enrollment:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to deactivate enrollment',
            loading: false 
          });
          return false;
        }
      },
      
      // ============================================
      // UI STATE MANAGEMENT
      // ============================================
      
      setFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },
      
      setSelectedEnrollment: (enrollment) => {
        set({ selectedEnrollment: enrollment });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      resetState: () => {
        set({
          enrollments: [],
          selectedEnrollment: null,
          statistics: null,
          loading: false,
          error: null,
          filters: {},
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            pages: 0,
          },
        });
      },
    }),
    {
      name: 'unified-enrollment-store',
    }
  )
);