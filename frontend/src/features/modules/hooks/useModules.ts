/**
 * React Query hooks for Module operations
 * Handles queries, mutations, caching, and optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moduleApi } from '@/services/module-api.service';
import type {
  Module,
  CreateModuleData,
  UpdateModuleData,
  ModuleFilters,
  ModuleListResponse,
} from '../types';
import { toast } from 'react-hot-toast';

// Query keys
export const moduleKeys = {
  all: ['modules'] as const,
  lists: () => [...moduleKeys.all, 'list'] as const,
  list: (filters?: ModuleFilters) => [...moduleKeys.lists(), filters] as const,
  details: () => [...moduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...moduleKeys.details(), id] as const,
  featured: () => [...moduleKeys.all, 'featured'] as const,
  search: (query: string) => [...moduleKeys.all, 'search', query] as const,
};

// ==================== QUERIES ====================

/**
 * Get featured modules (PUBLIC)
 */
export function useFeaturedModules() {
  return useQuery({
    queryKey: moduleKeys.featured(),
    queryFn: () => moduleApi.getFeaturedModules(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get all modules with filters
 */
export function useModules(filters?: ModuleFilters) {
  return useQuery({
    queryKey: moduleKeys.list(filters),
    queryFn: () => moduleApi.getModules(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Get module by ID
 */
export function useModule(moduleId: string, includeTopics = false) {
  return useQuery({
    queryKey: moduleKeys.detail(moduleId),
    queryFn: () => moduleApi.getModuleById(moduleId, includeTopics),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Search modules
 */
export function useModuleSearch(query: string, filters?: Partial<ModuleFilters>) {
  return useQuery({
    queryKey: moduleKeys.search(query),
    queryFn: () => moduleApi.searchModules(query, filters),
    enabled: query.length >= 2, // Only search when query is at least 2 characters
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ==================== MUTATIONS ====================

/**
 * Create new module (TEACHER/ADMIN)
 */
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModuleData) => moduleApi.createModule(data),
    onMutate: async (newModule) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: moduleKeys.lists() });

      // Snapshot previous value
      const previousModules = queryClient.getQueryData(moduleKeys.lists());

      // Return context with snapshot
      return { previousModules };
    },
    onError: (err, newModule, context) => {
      // Rollback to previous value
      if (context?.previousModules) {
        queryClient.setQueryData(moduleKeys.lists(), context.previousModules);
      }
      toast.error('Failed to create module');
      console.error('Create module error:', err);
    },
    onSuccess: (data) => {
      toast.success('Module created successfully!');
    },
    onSettled: () => {
      // Refetch queries after mutation
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
    },
  });
}

/**
 * Update module (TEACHER/ADMIN)
 */
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: UpdateModuleData }) =>
      moduleApi.updateModule(moduleId, data),
    onMutate: async ({ moduleId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: moduleKeys.detail(moduleId) });

      // Snapshot previous value
      const previousModule = queryClient.getQueryData(moduleKeys.detail(moduleId));

      // Optimistically update
      queryClient.setQueryData(moduleKeys.detail(moduleId), (old: Module | undefined) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date() };
      });

      return { previousModule };
    },
    onError: (err, { moduleId }, context) => {
      // Rollback to previous value
      if (context?.previousModule) {
        queryClient.setQueryData(moduleKeys.detail(moduleId), context.previousModule);
      }
      toast.error('Failed to update module');
      console.error('Update module error:', err);
    },
    onSuccess: (data, { moduleId }) => {
      toast.success('Module updated successfully!');
      // Update the detail query with fresh data
      queryClient.setQueryData(moduleKeys.detail(moduleId), data);
    },
    onSettled: (data, error, { moduleId }) => {
      // Refetch queries after mutation
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
    },
  });
}

/**
 * Delete/Archive module (TEACHER/ADMIN)
 */
export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => moduleApi.deleteModule(moduleId),
    onMutate: async (moduleId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: moduleKeys.lists() });

      // Snapshot previous value
      const previousModules = queryClient.getQueryData(moduleKeys.lists());

      // Optimistically remove from lists
      queryClient.setQueriesData(
        { queryKey: moduleKeys.lists() },
        (old: ModuleListResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            modules: old.modules.filter((m) => m.id !== moduleId),
            pagination: { ...old.pagination, total: old.pagination.total - 1 },
          };
        }
      );

      return { previousModules };
    },
    onError: (err, moduleId, context) => {
      // Rollback to previous value
      if (context?.previousModules) {
        queryClient.setQueryData(moduleKeys.lists(), context.previousModules);
      }
      toast.error('Failed to delete module');
      console.error('Delete module error:', err);
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Module deleted successfully!');
    },
    onSettled: () => {
      // Refetch queries after mutation
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
    },
  });
}

/**
 * Submit module for approval (TEACHER)
 */
export function useSubmitModuleForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => moduleApi.submitModuleForApproval(moduleId),
    onSuccess: (data, moduleId) => {
      toast.success(data.message || 'Module submitted for approval!');
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
    },
    onError: (err) => {
      toast.error('Failed to submit module for approval');
      console.error('Submit module error:', err);
    },
  });
}

/**
 * Approve module (ADMIN ONLY)
 */
export function useApproveModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => moduleApi.approveModule(moduleId),
    onSuccess: (data, moduleId) => {
      toast.success(data.message || 'Module approved successfully!');
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
    },
    onError: (err) => {
      toast.error('Failed to approve module');
      console.error('Approve module error:', err);
    },
  });
}

/**
 * Publish module (ADMIN ONLY)
 */
export function usePublishModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => moduleApi.publishModule(moduleId),
    onSuccess: (data, moduleId) => {
      toast.success(data.message || 'Module published successfully!');
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moduleKeys.featured() });
    },
    onError: (err) => {
      toast.error('Failed to publish module');
      console.error('Publish module error:', err);
    },
  });
}

/**
 * Reject module (ADMIN ONLY)
 */
export function useRejectModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, reason }: { moduleId: string; reason: string }) =>
      moduleApi.rejectModule(moduleId, reason),
    onSuccess: (data, { moduleId }) => {
      toast.success(data.message || 'Module rejected');
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
    },
    onError: (err) => {
      toast.error('Failed to reject module');
      console.error('Reject module error:', err);
    },
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Prefetch module detail
 */
export function usePrefetchModule() {
  const queryClient = useQueryClient();

  return (moduleId: string) => {
    queryClient.prefetchQuery({
      queryKey: moduleKeys.detail(moduleId),
      queryFn: () => moduleApi.getModuleById(moduleId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Get cached module without fetching
 */
export function useCachedModule(moduleId: string): Module | undefined {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(moduleKeys.detail(moduleId));
}
