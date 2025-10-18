/**
 * React Query hooks for Enrollment operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moduleApi } from '@/services/module-api.service';
import type {
  ModuleEnrollment,
  CreateEnrollmentData,
  BulkEnrollmentData,
  ClassEnrollmentData,
  EnrollmentFilters,
  EnrollmentStats,
} from '../types';
import { toast } from 'react-hot-toast';
import { moduleKeys } from './useModules';

// Query keys
export const enrollmentKeys = {
  all: ['enrollments'] as const,
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (moduleId: string, filters?: EnrollmentFilters) => 
    [...enrollmentKeys.lists(), moduleId, filters] as const,
  details: () => [...enrollmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
  student: (studentId: string) => [...enrollmentKeys.all, 'student', studentId] as const,
  students: (moduleId: string) => [...enrollmentKeys.all, 'students', moduleId] as const,
  stats: (studentId: string) => [...enrollmentKeys.all, 'stats', studentId] as const,
};

// ==================== QUERIES ====================

/**
 * Get enrollments for a module
 */
export function useModuleEnrollments(moduleId: string, filters?: EnrollmentFilters) {
  return useQuery({
    queryKey: enrollmentKeys.list(moduleId, filters),
    queryFn: () => moduleApi.getModuleEnrollments(moduleId, filters),
    enabled: !!moduleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get enrollment by ID
 */
export function useEnrollment(enrollmentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.detail(enrollmentId),
    queryFn: () => moduleApi.getEnrollmentById(enrollmentId),
    enabled: !!enrollmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get student enrollments
 */
export function useStudentEnrollments(studentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.student(studentId),
    queryFn: () => moduleApi.getStudentEnrollments(studentId),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get students enrolled in a module
 */
export function useEnrolledStudents(moduleId: string) {
  return useQuery({
    queryKey: enrollmentKeys.students(moduleId),
    queryFn: () => moduleApi.getEnrolledStudents(moduleId),
    enabled: !!moduleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get student enrollment stats
 */
export function useStudentEnrollmentStats(studentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.stats(studentId),
    queryFn: () => moduleApi.getStudentEnrollmentStats(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== MUTATIONS ====================

/**
 * Create enrollment (ADMIN ONLY)
 */
export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEnrollmentData) => moduleApi.createEnrollment(data),
    onSuccess: (data) => {
      toast.success('Student enrolled successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.list(data.moduleId) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.student(data.studentId) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.students(data.moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(data.moduleId) });
    },
    onError: (err) => {
      toast.error('Failed to enroll student');
      console.error('Create enrollment error:', err);
    },
  });
}

/**
 * Bulk enroll students (ADMIN ONLY)
 */
export function useBulkEnrollStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkEnrollmentData) => moduleApi.bulkEnrollStudents(data),
    onSuccess: (result, data) => {
      toast.success(`Successfully enrolled ${result.enrolled} student(s)!`);
      // Invalidate all enrollment queries for this module
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.list(data.moduleId) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.students(data.moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(data.moduleId) });
      // Invalidate student enrollments for all affected students
      data.studentIds.forEach((studentId) => {
        queryClient.invalidateQueries({ queryKey: enrollmentKeys.student(studentId) });
      });
    },
    onError: (err) => {
      toast.error('Failed to bulk enroll students');
      console.error('Bulk enrollment error:', err);
    },
  });
}

/**
 * Enroll entire class (ADMIN ONLY)
 */
export function useEnrollClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClassEnrollmentData) => moduleApi.enrollClass(data),
    onSuccess: (result, data) => {
      toast.success(`Successfully enrolled ${result.enrolled} student(s) from the class!`);
      // Invalidate all enrollment queries for this module
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.list(data.moduleId) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.students(data.moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(data.moduleId) });
      // Note: Can't invalidate individual students as we don't have their IDs
      // Could consider invalidating all student enrollment queries if needed
    },
    onError: (err) => {
      toast.error('Failed to enroll class');
      console.error('Class enrollment error:', err);
    },
  });
}

/**
 * Delete enrollment (ADMIN ONLY)
 */
export function useDeleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => moduleApi.deleteEnrollment(enrollmentId),
    onMutate: async (enrollmentId) => {
      // Get enrollment to know which module/student it belongs to
      const enrollment = queryClient.getQueryData(
        enrollmentKeys.detail(enrollmentId)
      ) as ModuleEnrollment | undefined;

      // Cancel any outgoing refetches
      if (enrollment) {
        await queryClient.cancelQueries({ 
          queryKey: enrollmentKeys.list(enrollment.moduleId) 
        });
      }

      // Snapshot previous value
      const previousEnrollments = enrollment
        ? queryClient.getQueryData(enrollmentKeys.list(enrollment.moduleId))
        : undefined;

      // Optimistically remove from lists
      if (enrollment) {
        queryClient.setQueryData(
          enrollmentKeys.list(enrollment.moduleId),
          (old: ModuleEnrollment[] | undefined) => {
            if (!old) return old;
            return old.filter((e) => e.id !== enrollmentId);
          }
        );
      }

      return { previousEnrollments, enrollment };
    },
    onError: (err, enrollmentId, context) => {
      // Rollback to previous value
      if (context?.previousEnrollments && context?.enrollment) {
        queryClient.setQueryData(
          enrollmentKeys.list(context.enrollment.moduleId),
          context.previousEnrollments
        );
      }
      toast.error('Failed to delete enrollment');
      console.error('Delete enrollment error:', err);
    },
    onSuccess: (data, enrollmentId, context) => {
      toast.success(data.message || 'Enrollment deleted successfully!');
      // Invalidate related queries
      if (context?.enrollment) {
        queryClient.invalidateQueries({ 
          queryKey: enrollmentKeys.student(context.enrollment.studentId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: enrollmentKeys.students(context.enrollment.moduleId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: moduleKeys.detail(context.enrollment.moduleId) 
        });
      }
    },
    onSettled: (data, error, enrollmentId, context) => {
      if (context?.enrollment) {
        queryClient.invalidateQueries({ 
          queryKey: enrollmentKeys.list(context.enrollment.moduleId) 
        });
      }
    },
  });
}

/**
 * Complete enrollment (STUDENT)
 */
export function useCompleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => moduleApi.completeEnrollment(enrollmentId),
    onSuccess: (data, enrollmentId) => {
      toast.success('🎉 Congratulations! You completed this module!');
      // Invalidate enrollment detail
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(enrollmentId) });
      // Invalidate student enrollments
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
    },
    onError: (err) => {
      toast.error('Failed to complete enrollment');
      console.error('Complete enrollment error:', err);
    },
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Check if student is enrolled in a module
 */
export function useIsStudentEnrolled(studentId: string, moduleId: string): boolean {
  const { data: enrollments } = useStudentEnrollments(studentId);
  return enrollments?.some((e) => e.moduleId === moduleId && e.isActive) || false;
}

/**
 * Get student's enrollment for a module
 */
export function useStudentModuleEnrollment(
  studentId: string,
  moduleId: string
): ModuleEnrollment | undefined {
  const { data: enrollments } = useStudentEnrollments(studentId);
  return enrollments?.find((e) => e.moduleId === moduleId);
}

/**
 * Prefetch module enrollments
 */
export function usePrefetchModuleEnrollments() {
  const queryClient = useQueryClient();

  return (moduleId: string) => {
    queryClient.prefetchQuery({
      queryKey: enrollmentKeys.list(moduleId),
      queryFn: () => moduleApi.getModuleEnrollments(moduleId),
      staleTime: 2 * 60 * 1000,
    });
  };
}
