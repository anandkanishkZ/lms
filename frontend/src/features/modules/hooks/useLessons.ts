/**
 * React Query hooks for Lesson operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moduleApi } from '@/services/module-api.service';
import type {
  Lesson,
  CreateLessonData,
  UpdateLessonData,
  LessonAttachment,
  LessonSearchFilters,
} from '../types';
import { toast } from 'react-hot-toast';
import { topicKeys } from './useTopics';

// Query keys
export const lessonKeys = {
  all: ['lessons'] as const,
  lists: () => [...lessonKeys.all, 'list'] as const,
  list: (topicId: string) => [...lessonKeys.lists(), topicId] as const,
  details: () => [...lessonKeys.all, 'detail'] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
  attachments: (lessonId: string) => [...lessonKeys.all, 'attachments', lessonId] as const,
  views: (lessonId: string) => [...lessonKeys.all, 'views', lessonId] as const,
  search: (filters: LessonSearchFilters) => [...lessonKeys.all, 'search', filters] as const,
  byType: (type: string) => [...lessonKeys.all, 'type', type] as const,
};

// ==================== QUERIES ====================

/**
 * Get lessons for a topic
 */
export function useLessonsByTopic(topicId: string) {
  return useQuery({
    queryKey: lessonKeys.list(topicId),
    queryFn: () => moduleApi.getLessonsByTopic(topicId),
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get lesson by ID
 */
export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: lessonKeys.detail(lessonId),
    queryFn: () => moduleApi.getLessonById(lessonId),
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get lesson attachments
 */
export function useLessonAttachments(lessonId: string) {
  return useQuery({
    queryKey: lessonKeys.attachments(lessonId),
    queryFn: () => moduleApi.getLessonAttachments(lessonId),
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get lesson views count
 */
export function useLessonViews(lessonId: string) {
  return useQuery({
    queryKey: lessonKeys.views(lessonId),
    queryFn: () => moduleApi.getLessonViews(lessonId),
    enabled: !!lessonId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Search lessons
 */
export function useSearchLessons(filters: LessonSearchFilters) {
  return useQuery({
    queryKey: lessonKeys.search(filters),
    queryFn: () => moduleApi.searchLessons(filters),
    enabled: !!(filters.query || filters.type || filters.topicId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get lessons by type
 */
export function useLessonsByType(type: string) {
  return useQuery({
    queryKey: lessonKeys.byType(type),
    queryFn: () => moduleApi.getLessonsByType(type),
    enabled: !!type,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== MUTATIONS ====================

/**
 * Create lesson (TEACHER/ADMIN)
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLessonData) => moduleApi.createLesson(data),
    onSuccess: (data) => {
      toast.success('Lesson created successfully!');
      // Invalidate the topic's lesson list
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(data.topicId) });
      // Invalidate topic detail to update lesson count
      queryClient.invalidateQueries({ queryKey: topicKeys.detail(data.topicId) });
    },
    onError: (err) => {
      toast.error('Failed to create lesson');
      console.error('Create lesson error:', err);
    },
  });
}

/**
 * Update lesson (TEACHER/ADMIN)
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: UpdateLessonData }) =>
      moduleApi.updateLesson(lessonId, data),
    onMutate: async ({ lessonId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: lessonKeys.detail(lessonId) });

      // Snapshot previous value
      const previousLesson = queryClient.getQueryData(lessonKeys.detail(lessonId));

      // Optimistically update
      queryClient.setQueryData(lessonKeys.detail(lessonId), (old: Lesson | undefined) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date() };
      });

      return { previousLesson };
    },
    onError: (err, { lessonId }, context) => {
      // Rollback to previous value
      if (context?.previousLesson) {
        queryClient.setQueryData(lessonKeys.detail(lessonId), context.previousLesson);
      }
      toast.error('Failed to update lesson');
      console.error('Update lesson error:', err);
    },
    onSuccess: (data, { lessonId }) => {
      toast.success('Lesson updated successfully!');
      // Update the detail query with fresh data
      queryClient.setQueryData(lessonKeys.detail(lessonId), data);
      // Invalidate topic's lesson list
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(data.topicId) });
    },
    onSettled: (data, error, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
    },
  });
}

/**
 * Delete lesson (TEACHER/ADMIN)
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => moduleApi.deleteLesson(lessonId),
    onMutate: async (lessonId) => {
      // Get lesson to know which topic it belongs to
      const lesson = queryClient.getQueryData(lessonKeys.detail(lessonId)) as Lesson | undefined;

      // Cancel any outgoing refetches
      if (lesson) {
        await queryClient.cancelQueries({ queryKey: lessonKeys.list(lesson.topicId) });
      }

      // Snapshot previous value
      const previousLessons = lesson ? queryClient.getQueryData(lessonKeys.list(lesson.topicId)) : undefined;

      // Optimistically remove from lists
      if (lesson) {
        queryClient.setQueryData(lessonKeys.list(lesson.topicId), (old: Lesson[] | undefined) => {
          if (!old) return old;
          return old.filter((l) => l.id !== lessonId);
        });
      }

      return { previousLessons, topicId: lesson?.topicId };
    },
    onError: (err, lessonId, context) => {
      // Rollback to previous value
      if (context?.previousLessons && context?.topicId) {
        queryClient.setQueryData(lessonKeys.list(context.topicId), context.previousLessons);
      }
      toast.error('Failed to delete lesson');
      console.error('Delete lesson error:', err);
    },
    onSuccess: (data, lessonId, context) => {
      toast.success(data.message || 'Lesson deleted successfully!');
      // Invalidate topic detail to update lesson count
      if (context?.topicId) {
        queryClient.invalidateQueries({ queryKey: topicKeys.detail(context.topicId) });
      }
    },
    onSettled: (data, error, lessonId, context) => {
      if (context?.topicId) {
        queryClient.invalidateQueries({ queryKey: lessonKeys.list(context.topicId) });
      }
    },
  });
}

/**
 * Add attachment to lesson (TEACHER/ADMIN)
 */
export function useAddLessonAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, formData }: { lessonId: string; formData: FormData }) =>
      moduleApi.addLessonAttachment(lessonId, formData),
    onSuccess: (data, { lessonId }) => {
      toast.success('Attachment uploaded successfully!');
      // Invalidate attachments list
      queryClient.invalidateQueries({ queryKey: lessonKeys.attachments(lessonId) });
      // Invalidate lesson detail
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
    },
    onError: (err) => {
      toast.error('Failed to upload attachment');
      console.error('Upload attachment error:', err);
    },
  });
}

/**
 * Delete lesson attachment (TEACHER/ADMIN)
 */
export function useDeleteLessonAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, attachmentId }: { lessonId: string; attachmentId: string }) =>
      moduleApi.deleteLessonAttachment(lessonId, attachmentId),
    onMutate: async ({ lessonId, attachmentId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: lessonKeys.attachments(lessonId) });

      // Snapshot previous value
      const previousAttachments = queryClient.getQueryData(lessonKeys.attachments(lessonId));

      // Optimistically remove
      queryClient.setQueryData(
        lessonKeys.attachments(lessonId),
        (old: LessonAttachment[] | undefined) => {
          if (!old) return old;
          return old.filter((a) => a.id !== attachmentId);
        }
      );

      return { previousAttachments };
    },
    onError: (err, { lessonId }, context) => {
      // Rollback to previous value
      if (context?.previousAttachments) {
        queryClient.setQueryData(lessonKeys.attachments(lessonId), context.previousAttachments);
      }
      toast.error('Failed to delete attachment');
      console.error('Delete attachment error:', err);
    },
    onSuccess: (data, { lessonId }) => {
      toast.success(data.message || 'Attachment deleted successfully!');
    },
    onSettled: (data, error, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.attachments(lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
    },
  });
}

/**
 * Duplicate lesson (TEACHER/ADMIN)
 */
export function useDuplicateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => moduleApi.duplicateLesson(lessonId),
    onSuccess: (data) => {
      toast.success('Lesson duplicated successfully!');
      // Invalidate the topic's lesson list
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(data.topicId) });
      // Invalidate topic detail to update lesson count
      queryClient.invalidateQueries({ queryKey: topicKeys.detail(data.topicId) });
    },
    onError: (err) => {
      toast.error('Failed to duplicate lesson');
      console.error('Duplicate lesson error:', err);
    },
  });
}

/**
 * Update lesson order (TEACHER/ADMIN)
 */
export function useUpdateLessonOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, newOrder }: { lessonId: string; newOrder: number }) =>
      moduleApi.updateLessonOrder(lessonId, newOrder),
    onMutate: async ({ lessonId, newOrder }) => {
      // Get lesson to know which topic it belongs to
      const lesson = queryClient.getQueryData(lessonKeys.detail(lessonId)) as Lesson | undefined;

      if (lesson) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: lessonKeys.list(lesson.topicId) });

        // Snapshot previous value
        const previousLessons = queryClient.getQueryData(lessonKeys.list(lesson.topicId));

        // Optimistically update order
        queryClient.setQueryData(lessonKeys.list(lesson.topicId), (old: Lesson[] | undefined) => {
          if (!old) return old;

          // Create a copy and sort by new order
          const updated = old.map((l) => {
            if (l.id === lessonId) {
              return { ...l, order: newOrder };
            }
            return l;
          });

          return updated.sort((a, b) => a.order - b.order);
        });

        return { previousLessons, topicId: lesson.topicId };
      }

      return {};
    },
    onError: (err, variables, context) => {
      // Rollback to previous value
      if (context?.previousLessons && context?.topicId) {
        queryClient.setQueryData(lessonKeys.list(context.topicId), context.previousLessons);
      }
      toast.error('Failed to update lesson order');
      console.error('Update lesson order error:', err);
    },
    onSuccess: (data, variables, context) => {
      // Don't show toast for order changes (too noisy)
    },
    onSettled: (data, error, variables, context) => {
      if (context?.topicId) {
        queryClient.invalidateQueries({ queryKey: lessonKeys.list(context.topicId) });
      }
    },
  });
}

/**
 * Record lesson view
 */
export function useRecordLessonView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => moduleApi.recordLessonView(lessonId),
    onSuccess: (data, lessonId) => {
      // Silently update views count
      queryClient.invalidateQueries({ queryKey: lessonKeys.views(lessonId) });
    },
    // Don't show error toast for view tracking
    onError: (err) => {
      console.warn('Failed to record lesson view:', err);
    },
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Prefetch lesson detail
 */
export function usePrefetchLesson() {
  const queryClient = useQueryClient();

  return (lessonId: string) => {
    queryClient.prefetchQuery({
      queryKey: lessonKeys.detail(lessonId),
      queryFn: () => moduleApi.getLessonById(lessonId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Get cached lesson without fetching
 */
export function useCachedLesson(lessonId: string): Lesson | undefined {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(lessonKeys.detail(lessonId));
}
