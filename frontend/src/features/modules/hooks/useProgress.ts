/**
 * React Query hooks for Progress tracking operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moduleApi } from '@/services/module-api.service';
import type { LessonProgress, ModuleProgress } from '../types';
import { toast } from 'react-hot-toast';

// Query keys
export const progressKeys = {
  all: ['progress'] as const,
  modules: () => [...progressKeys.all, 'module'] as const,
  module: (moduleId: string) => [...progressKeys.modules(), moduleId] as const,
  lessons: () => [...progressKeys.all, 'lesson'] as const,
  lesson: (lessonId: string) => [...progressKeys.lessons(), lessonId] as const,
  stats: (type: 'module' | 'student', id: string) => [...progressKeys.all, 'stats', type, id] as const,
  studentModule: (studentId: string, moduleId: string) => 
    [...progressKeys.all, 'student', studentId, 'module', moduleId] as const,
};

// ==================== QUERIES ====================

/**
 * Get module progress (STUDENT)
 */
export function useModuleProgress(moduleId: string) {
  return useQuery({
    queryKey: progressKeys.module(moduleId),
    queryFn: () => moduleApi.getModuleProgress(moduleId),
    enabled: !!moduleId,
    staleTime: 1 * 60 * 1000, // 1 minute (frequently updated)
  });
}

/**
 * Get lesson progress (STUDENT)
 */
export function useLessonProgress(lessonId: string) {
  return useQuery({
    queryKey: progressKeys.lesson(lessonId),
    queryFn: () => moduleApi.getLessonProgress(lessonId),
    enabled: !!lessonId,
    staleTime: 30 * 1000, // 30 seconds (very frequently updated)
  });
}

/**
 * Get module progress stats (TEACHER/ADMIN)
 */
export function useModuleProgressStats(moduleId: string) {
  return useQuery({
    queryKey: progressKeys.stats('module', moduleId),
    queryFn: () => moduleApi.getModuleProgressStats(moduleId),
    enabled: !!moduleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get student progress stats (TEACHER/ADMIN)
 */
export function useStudentProgressStats(studentId: string) {
  return useQuery({
    queryKey: progressKeys.stats('student', studentId),
    queryFn: () => moduleApi.getStudentProgressStats(studentId),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get student module progress (STUDENT/TEACHER/ADMIN)
 */
export function useStudentModuleProgress(studentId: string, moduleId: string) {
  return useQuery({
    queryKey: progressKeys.studentModule(studentId, moduleId),
    queryFn: () => moduleApi.getStudentModuleProgress(studentId, moduleId),
    enabled: !!(studentId && moduleId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ==================== MUTATIONS ====================

/**
 * Start lesson (STUDENT)
 */
export function useStartLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => moduleApi.startLesson(lessonId),
    onSuccess: (data, lessonId) => {
      // Silently update progress (no toast)
      queryClient.setQueryData(progressKeys.lesson(lessonId), data);
      
      // Invalidate module progress to reflect new started lesson
      if (data.lesson?.topic?.moduleId) {
        queryClient.invalidateQueries({ 
          queryKey: progressKeys.module(data.lesson.topic.moduleId) 
        });
      }
    },
    onError: (err) => {
      console.error('Failed to start lesson:', err);
    },
  });
}

/**
 * Complete lesson (STUDENT)
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => moduleApi.completeLesson(lessonId),
    onSuccess: (data, lessonId) => {
      toast.success('🎉 Lesson completed!');
      queryClient.setQueryData(progressKeys.lesson(lessonId), data);
      
      // Invalidate module progress to reflect completion
      if (data.lesson?.topic?.moduleId) {
        queryClient.invalidateQueries({ 
          queryKey: progressKeys.module(data.lesson.topic.moduleId) 
        });
      }
    },
    onError: (err) => {
      toast.error('Failed to complete lesson');
      console.error('Complete lesson error:', err);
    },
  });
}

/**
 * Update video progress (STUDENT)
 */
export function useUpdateVideoProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      lessonId, 
      lastPosition, 
      timeSpent 
    }: { 
      lessonId: string; 
      lastPosition: number; 
      timeSpent: number; 
    }) => moduleApi.updateVideoProgress(lessonId, lastPosition, timeSpent),
    onMutate: async ({ lessonId, lastPosition, timeSpent }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: progressKeys.lesson(lessonId) });

      // Snapshot previous value
      const previousProgress = queryClient.getQueryData(progressKeys.lesson(lessonId));

      // Optimistically update
      queryClient.setQueryData(progressKeys.lesson(lessonId), (old: LessonProgress | undefined) => {
        if (!old) return old;
        return {
          ...old,
          lastPosition,
          timeSpent: (old.timeSpent || 0) + timeSpent,
        };
      });

      return { previousProgress };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value
      if (context?.previousProgress) {
        queryClient.setQueryData(progressKeys.lesson(variables.lessonId), context.previousProgress);
      }
      console.error('Update video progress error:', err);
      // Don't show toast - this happens frequently
    },
    onSuccess: (data, { lessonId }) => {
      // Update with server data
      queryClient.setQueryData(progressKeys.lesson(lessonId), data);
    },
  });
}

/**
 * Submit quiz (STUDENT)
 */
export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, quizScore }: { lessonId: string; quizScore: number }) =>
      moduleApi.submitQuiz(lessonId, quizScore),
    onSuccess: (data, { lessonId, quizScore }) => {
      const percentage = Math.round(quizScore);
      
      if (percentage >= 80) {
        toast.success(`🎉 Great job! You scored ${percentage}%`);
      } else if (percentage >= 60) {
        toast.success(`Good effort! You scored ${percentage}%`);
      } else {
        toast('Keep practicing! You scored ' + percentage + '%', { icon: '📚' });
      }

      queryClient.setQueryData(progressKeys.lesson(lessonId), data);
      
      // Invalidate module progress
      if (data.lesson?.topic?.moduleId) {
        queryClient.invalidateQueries({ 
          queryKey: progressKeys.module(data.lesson.topic.moduleId) 
        });
      }
    },
    onError: (err) => {
      toast.error('Failed to submit quiz');
      console.error('Submit quiz error:', err);
    },
  });
}

/**
 * Reset lesson progress (ADMIN ONLY)
 */
export function useResetLessonProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => moduleApi.resetLessonProgress(lessonId),
    onSuccess: (data, lessonId) => {
      toast.success(data.message || 'Progress reset successfully');
      // Invalidate all progress queries for this lesson
      queryClient.invalidateQueries({ queryKey: progressKeys.lesson(lessonId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.modules() });
    },
    onError: (err) => {
      toast.error('Failed to reset progress');
      console.error('Reset progress error:', err);
    },
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Check if lesson is completed
 */
export function useIsLessonCompleted(lessonId: string): boolean {
  const { data: progress } = useLessonProgress(lessonId);
  return !!progress?.completedAt;
}

/**
 * Get lesson completion percentage
 */
export function useLessonCompletionPercentage(lessonId: string): number {
  const { data: progress } = useLessonProgress(lessonId);
  
  if (!progress) return 0;
  if (progress.completedAt) return 100;
  
  // For video lessons, calculate based on watch time
  if (progress.lesson?.type === 'VIDEO' && progress.lesson.duration) {
    return Math.min(100, Math.round((progress.timeSpent / progress.lesson.duration) * 100));
  }
  
  // For other types, it's either 0 or 100
  return 0;
}

/**
 * Get module completion percentage
 */
export function useModuleCompletionPercentage(moduleId: string): number {
  const { data: progress } = useModuleProgress(moduleId);
  
  if (!progress) return 0;
  
  const totalLessons = progress.totalLessons || 0;
  const completedLessons = progress.completedLessons || 0;
  
  if (totalLessons === 0) return 0;
  
  return Math.round((completedLessons / totalLessons) * 100);
}
