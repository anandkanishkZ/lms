/**
 * React Query hooks for Topic operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moduleApi } from '@/services/module-api.service';
import type { Topic, CreateTopicData, UpdateTopicData } from '../types';
import { toast } from 'react-hot-toast';
import { moduleKeys } from './useModules';

// Query keys
export const topicKeys = {
  all: ['topics'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  list: (moduleId: string) => [...topicKeys.lists(), moduleId] as const,
  details: () => [...topicKeys.all, 'detail'] as const,
  detail: (id: string) => [...topicKeys.details(), id] as const,
};

// ==================== QUERIES ====================

/**
 * Get topics for a module
 */
export function useTopicsByModule(moduleId: string) {
  return useQuery({
    queryKey: topicKeys.list(moduleId),
    queryFn: () => moduleApi.getTopicsByModule(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get topic by ID
 */
export function useTopic(topicId: string) {
  return useQuery({
    queryKey: topicKeys.detail(topicId),
    queryFn: () => moduleApi.getTopicById(topicId),
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== MUTATIONS ====================

/**
 * Create topic (TEACHER/ADMIN)
 */
export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicData) => moduleApi.createTopic(data),
    onSuccess: (data) => {
      toast.success('Topic created successfully!');
      // Invalidate the module's topic list
      queryClient.invalidateQueries({ queryKey: topicKeys.list(data.moduleId) });
      // Invalidate module detail to update topic count
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(data.moduleId) });
    },
    onError: (err) => {
      toast.error('Failed to create topic');
      console.error('Create topic error:', err);
    },
  });
}

/**
 * Update topic (TEACHER/ADMIN)
 */
export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, data }: { topicId: string; data: UpdateTopicData }) =>
      moduleApi.updateTopic(topicId, data),
    onMutate: async ({ topicId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: topicKeys.detail(topicId) });

      // Snapshot previous value
      const previousTopic = queryClient.getQueryData(topicKeys.detail(topicId));

      // Optimistically update
      queryClient.setQueryData(topicKeys.detail(topicId), (old: Topic | undefined) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date() };
      });

      return { previousTopic };
    },
    onError: (err, { topicId }, context) => {
      // Rollback to previous value
      if (context?.previousTopic) {
        queryClient.setQueryData(topicKeys.detail(topicId), context.previousTopic);
      }
      toast.error('Failed to update topic');
      console.error('Update topic error:', err);
    },
    onSuccess: (data, { topicId }) => {
      toast.success('Topic updated successfully!');
      // Update the detail query with fresh data
      queryClient.setQueryData(topicKeys.detail(topicId), data);
      // Invalidate module's topic list
      queryClient.invalidateQueries({ queryKey: topicKeys.list(data.moduleId) });
    },
    onSettled: (data, error, { topicId }) => {
      queryClient.invalidateQueries({ queryKey: topicKeys.detail(topicId) });
    },
  });
}

/**
 * Delete topic (TEACHER/ADMIN)
 */
export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topicId: string) => moduleApi.deleteTopic(topicId),
    onMutate: async (topicId) => {
      // Get topic to know which module it belongs to
      const topic = queryClient.getQueryData(topicKeys.detail(topicId)) as Topic | undefined;

      // Cancel any outgoing refetches
      if (topic) {
        await queryClient.cancelQueries({ queryKey: topicKeys.list(topic.moduleId) });
      }

      // Snapshot previous value
      const previousTopics = topic ? queryClient.getQueryData(topicKeys.list(topic.moduleId)) : undefined;

      // Optimistically remove from lists
      if (topic) {
        queryClient.setQueryData(topicKeys.list(topic.moduleId), (old: Topic[] | undefined) => {
          if (!old) return old;
          return old.filter((t) => t.id !== topicId);
        });
      }

      return { previousTopics, moduleId: topic?.moduleId };
    },
    onError: (err, topicId, context) => {
      // Rollback to previous value
      if (context?.previousTopics && context?.moduleId) {
        queryClient.setQueryData(topicKeys.list(context.moduleId), context.previousTopics);
      }
      toast.error('Failed to delete topic');
      console.error('Delete topic error:', err);
    },
    onSuccess: (data, topicId, context) => {
      toast.success(data.message || 'Topic deleted successfully!');
      // Invalidate module detail to update topic count
      if (context?.moduleId) {
        queryClient.invalidateQueries({ queryKey: moduleKeys.detail(context.moduleId) });
      }
    },
    onSettled: (data, error, topicId, context) => {
      if (context?.moduleId) {
        queryClient.invalidateQueries({ queryKey: topicKeys.list(context.moduleId) });
      }
    },
  });
}

/**
 * Duplicate topic (TEACHER/ADMIN)
 */
export function useDuplicateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topicId: string) => moduleApi.duplicateTopic(topicId),
    onSuccess: (data) => {
      toast.success('Topic duplicated successfully!');
      // Invalidate the module's topic list
      queryClient.invalidateQueries({ queryKey: topicKeys.list(data.moduleId) });
      // Invalidate module detail to update topic count
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(data.moduleId) });
    },
    onError: (err) => {
      toast.error('Failed to duplicate topic');
      console.error('Duplicate topic error:', err);
    },
  });
}

/**
 * Update topic order (TEACHER/ADMIN)
 */
export function useUpdateTopicOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, newOrder }: { topicId: string; newOrder: number }) =>
      moduleApi.updateTopicOrder(topicId, newOrder),
    onMutate: async ({ topicId, newOrder }) => {
      // Get topic to know which module it belongs to
      const topic = queryClient.getQueryData(topicKeys.detail(topicId)) as Topic | undefined;

      if (topic) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: topicKeys.list(topic.moduleId) });

        // Snapshot previous value
        const previousTopics = queryClient.getQueryData(topicKeys.list(topic.moduleId));

        // Optimistically update order
        queryClient.setQueryData(topicKeys.list(topic.moduleId), (old: Topic[] | undefined) => {
          if (!old) return old;

          // Create a copy and sort by new order
          const updated = old.map((t) => {
            if (t.id === topicId) {
              return { ...t, order: newOrder };
            }
            return t;
          });

          return updated.sort((a, b) => a.order - b.order);
        });

        return { previousTopics, moduleId: topic.moduleId };
      }

      return {};
    },
    onError: (err, variables, context) => {
      // Rollback to previous value
      if (context?.previousTopics && context?.moduleId) {
        queryClient.setQueryData(topicKeys.list(context.moduleId), context.previousTopics);
      }
      toast.error('Failed to update topic order');
      console.error('Update topic order error:', err);
    },
    onSuccess: (data, variables, context) => {
      // Don't show toast for order changes (too noisy)
    },
    onSettled: (data, error, variables, context) => {
      if (context?.moduleId) {
        queryClient.invalidateQueries({ queryKey: topicKeys.list(context.moduleId) });
      }
    },
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Prefetch topic detail
 */
export function usePrefetchTopic() {
  const queryClient = useQueryClient();

  return (topicId: string) => {
    queryClient.prefetchQuery({
      queryKey: topicKeys.detail(topicId),
      queryFn: () => moduleApi.getTopicById(topicId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Get cached topic without fetching
 */
export function useCachedTopic(topicId: string): Topic | undefined {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(topicKeys.detail(topicId));
}
