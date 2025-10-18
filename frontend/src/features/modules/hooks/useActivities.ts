/**
 * React Query hooks for Activity tracking operations
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { moduleApi } from '@/services/module-api.service';
import type { ActivityHistory, ActivityFilters, ActivityTimelineItem } from '../types';

// Query keys
export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  user: (userId: string, filters?: ActivityFilters) => 
    [...activityKeys.all, 'user', userId, filters] as const,
  timeline: (userId: string) => [...activityKeys.all, 'timeline', userId] as const,
  module: (moduleId: string) => [...activityKeys.all, 'module', moduleId] as const,
  moduleSummary: (moduleId: string) => [...activityKeys.all, 'module-summary', moduleId] as const,
  detail: (id: string) => [...activityKeys.all, 'detail', id] as const,
  search: (filters: ActivityFilters) => [...activityKeys.all, 'search', filters] as const,
  recent: (limit: number) => [...activityKeys.all, 'recent', limit] as const,
  byType: (type: string) => [...activityKeys.all, 'type', type] as const,
};

// ==================== QUERIES ====================

/**
 * Get user activities
 */
export function useUserActivities(userId: string, filters?: ActivityFilters) {
  return useQuery({
    queryKey: activityKeys.user(userId, filters),
    queryFn: () => moduleApi.getUserActivities(userId, filters),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get user activity timeline
 */
export function useUserActivityTimeline(userId: string) {
  return useQuery({
    queryKey: activityKeys.timeline(userId),
    queryFn: () => moduleApi.getUserActivityTimeline(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get module activities (TEACHER/ADMIN)
 */
export function useModuleActivities(moduleId: string) {
  return useQuery({
    queryKey: activityKeys.module(moduleId),
    queryFn: () => moduleApi.getModuleActivities(moduleId),
    enabled: !!moduleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get module activity summary (TEACHER/ADMIN)
 */
export function useModuleActivitySummary(moduleId: string) {
  return useQuery({
    queryKey: activityKeys.moduleSummary(moduleId),
    queryFn: () => moduleApi.getModuleActivitySummary(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get activity by ID
 */
export function useActivity(activityId: string) {
  return useQuery({
    queryKey: activityKeys.detail(activityId),
    queryFn: () => moduleApi.getActivityById(activityId),
    enabled: !!activityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Search activities
 */
export function useSearchActivities(filters: ActivityFilters) {
  return useQuery({
    queryKey: activityKeys.search(filters),
    queryFn: () => moduleApi.searchActivities(filters),
    enabled: !!(filters.activityType || filters.userId || filters.moduleId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get recent activities (ADMIN ONLY)
 */
export function useRecentActivities(limit = 10) {
  return useQuery({
    queryKey: activityKeys.recent(limit),
    queryFn: () => moduleApi.getRecentActivities(limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get activities by type
 */
export function useActivitiesByType(type: string) {
  return useQuery({
    queryKey: activityKeys.byType(type),
    queryFn: () => moduleApi.getActivitiesByType(type),
    enabled: !!type,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Prefetch user activities
 */
export function usePrefetchUserActivities() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: activityKeys.user(userId),
      queryFn: () => moduleApi.getUserActivities(userId),
      staleTime: 1 * 60 * 1000,
    });
  };
}

/**
 * Get cached activity without fetching
 */
export function useCachedActivity(activityId: string): ActivityHistory | undefined {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(activityKeys.detail(activityId));
}

/**
 * Export user activities (download)
 */
export async function exportUserActivities(userId: string) {
  try {
    const blob = await moduleApi.exportUserActivities(userId);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activities-${userId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Export activities error:', error);
    return false;
  }
}
