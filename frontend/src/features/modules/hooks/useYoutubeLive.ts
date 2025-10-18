/**
 * React Query hooks for YouTube Live session operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moduleApi } from '@/services/module-api.service';
import type {
  YoutubeLiveSession,
  CreateYoutubeLiveData,
  UpdateYoutubeLiveData,
  YoutubeLiveStats,
} from '../types';
import { toast } from 'react-hot-toast';

// Query keys
export const youtubeLiveKeys = {
  all: ['youtube-live'] as const,
  lists: () => [...youtubeLiveKeys.all, 'list'] as const,
  upcoming: () => [...youtubeLiveKeys.all, 'upcoming'] as const,
  current: () => [...youtubeLiveKeys.all, 'current'] as const,
  past: () => [...youtubeLiveKeys.all, 'past'] as const,
  module: (moduleId: string) => [...youtubeLiveKeys.all, 'module', moduleId] as const,
  detail: (id: string) => [...youtubeLiveKeys.all, 'detail', id] as const,
  viewers: (sessionId: string) => [...youtubeLiveKeys.all, 'viewers', sessionId] as const,
  stats: (sessionId: string) => [...youtubeLiveKeys.all, 'stats', sessionId] as const,
};

// ==================== QUERIES ====================

/**
 * Get upcoming YouTube Live sessions
 */
export function useUpcomingSessions() {
  return useQuery({
    queryKey: youtubeLiveKeys.upcoming(),
    queryFn: () => moduleApi.getUpcomingSessions(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

/**
 * Get current/live YouTube Live sessions
 */
export function useCurrentSessions() {
  return useQuery({
    queryKey: youtubeLiveKeys.current(),
    queryFn: () => moduleApi.getCurrentSessions(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Get past YouTube Live sessions
 */
export function usePastSessions() {
  return useQuery({
    queryKey: youtubeLiveKeys.past(),
    queryFn: () => moduleApi.getPastSessions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get module YouTube Live sessions
 */
export function useModuleYoutubeSessions(moduleId: string) {
  return useQuery({
    queryKey: youtubeLiveKeys.module(moduleId),
    queryFn: () => moduleApi.getModuleYoutubeSessions(moduleId),
    enabled: !!moduleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get YouTube Live session by ID
 */
export function useYoutubeLiveSession(sessionId: string) {
  return useQuery({
    queryKey: youtubeLiveKeys.detail(sessionId),
    queryFn: () => moduleApi.getYoutubeLiveSession(sessionId),
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: (query) => {
      // Refetch more frequently if session is live
      if (query.state.data?.status === 'live') return 30 * 1000; // 30 seconds
      if (query.state.data?.status === 'scheduled') return 2 * 60 * 1000; // 2 minutes
      return false; // Don't refetch for ended sessions
    },
  });
}

/**
 * Get YouTube Live session viewers
 */
export function useYoutubeLiveViewers(sessionId: string) {
  return useQuery({
    queryKey: youtubeLiveKeys.viewers(sessionId),
    queryFn: () => moduleApi.getYoutubeLiveViewers(sessionId),
    enabled: !!sessionId,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for live updates
  });
}

/**
 * Get YouTube Live session stats (TEACHER/ADMIN)
 */
export function useYoutubeLiveStats(sessionId: string) {
  return useQuery({
    queryKey: youtubeLiveKeys.stats(sessionId),
    queryFn: () => moduleApi.getYoutubeLiveStats(sessionId),
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ==================== MUTATIONS ====================

/**
 * Create YouTube Live session (TEACHER/ADMIN)
 */
export function useCreateYoutubeLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateYoutubeLiveData) => moduleApi.createYoutubeLiveSession(data),
    onSuccess: (data) => {
      toast.success('YouTube Live session created successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.upcoming() });
      if (data.moduleId) {
        queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.module(data.moduleId) });
      }
    },
    onError: (err) => {
      toast.error('Failed to create YouTube Live session');
      console.error('Create YouTube Live session error:', err);
    },
  });
}

/**
 * Update YouTube Live session (TEACHER/ADMIN)
 */
export function useUpdateYoutubeLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: UpdateYoutubeLiveData }) =>
      moduleApi.updateYoutubeLiveSession(sessionId, data),
    onMutate: async ({ sessionId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: youtubeLiveKeys.detail(sessionId) });

      // Snapshot previous value
      const previousSession = queryClient.getQueryData(youtubeLiveKeys.detail(sessionId));

      // Optimistically update
      queryClient.setQueryData(
        youtubeLiveKeys.detail(sessionId),
        (old: YoutubeLiveSession | undefined) => {
          if (!old) return old;
          return { ...old, ...data };
        }
      );

      return { previousSession };
    },
    onError: (err, { sessionId }, context) => {
      // Rollback to previous value
      if (context?.previousSession) {
        queryClient.setQueryData(youtubeLiveKeys.detail(sessionId), context.previousSession);
      }
      toast.error('Failed to update YouTube Live session');
      console.error('Update YouTube Live session error:', err);
    },
    onSuccess: (data, { sessionId }) => {
      toast.success('YouTube Live session updated successfully!');
      // Update the detail query with fresh data
      queryClient.setQueryData(youtubeLiveKeys.detail(sessionId), data);
    },
    onSettled: (data) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.current() });
      if (data?.moduleId) {
        queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.module(data.moduleId) });
      }
    },
  });
}

/**
 * Delete YouTube Live session (TEACHER/ADMIN)
 */
export function useDeleteYoutubeLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => moduleApi.deleteYoutubeLiveSession(sessionId),
    onMutate: async (sessionId) => {
      // Get session to know which module it belongs to
      const session = queryClient.getQueryData(
        youtubeLiveKeys.detail(sessionId)
      ) as YoutubeLiveSession | undefined;

      return { session };
    },
    onSuccess: (data, sessionId, context) => {
      toast.success(data.message || 'YouTube Live session deleted successfully!');
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.current() });
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.past() });
      if (context?.session?.moduleId) {
        queryClient.invalidateQueries({ 
          queryKey: youtubeLiveKeys.module(context.session.moduleId) 
        });
      }
    },
    onError: (err) => {
      toast.error('Failed to delete YouTube Live session');
      console.error('Delete YouTube Live session error:', err);
    },
  });
}

/**
 * Start YouTube Live session (TEACHER/ADMIN)
 */
export function useStartYoutubeLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => moduleApi.startYoutubeLiveSession(sessionId),
    onSuccess: (data, sessionId) => {
      toast.success('🎥 YouTube Live session started!');
      // Update session detail
      queryClient.setQueryData(youtubeLiveKeys.detail(sessionId), data);
      // Move from upcoming to current
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.current() });
      if (data.moduleId) {
        queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.module(data.moduleId) });
      }
    },
    onError: (err) => {
      toast.error('Failed to start YouTube Live session');
      console.error('Start YouTube Live session error:', err);
    },
  });
}

/**
 * End YouTube Live session (TEACHER/ADMIN)
 */
export function useEndYoutubeLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => moduleApi.endYoutubeLiveSession(sessionId),
    onSuccess: (data, sessionId) => {
      toast.success('YouTube Live session ended');
      // Update session detail
      queryClient.setQueryData(youtubeLiveKeys.detail(sessionId), data);
      // Move from current to past
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.current() });
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.past() });
      if (data.moduleId) {
        queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.module(data.moduleId) });
      }
    },
    onError: (err) => {
      toast.error('Failed to end YouTube Live session');
      console.error('End YouTube Live session error:', err);
    },
  });
}

/**
 * Join YouTube Live session (STUDENT)
 */
export function useJoinYoutubeLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => moduleApi.joinYoutubeLiveSession(sessionId),
    onSuccess: (data, sessionId) => {
      // Silently join - no toast
      // Invalidate viewers to show new participant
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.viewers(sessionId) });
      queryClient.invalidateQueries({ queryKey: youtubeLiveKeys.stats(sessionId) });
    },
    onError: (err) => {
      console.error('Failed to join YouTube Live session:', err);
      // Don't show error toast - might be transient network issue
    },
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Check if session is live
 */
export function useIsSessionLive(sessionId: string): boolean {
  const { data: session } = useYoutubeLiveSession(sessionId);
  return session?.status === 'live';
}

/**
 * Check if session is upcoming
 */
export function useIsSessionUpcoming(sessionId: string): boolean {
  const { data: session } = useYoutubeLiveSession(sessionId);
  return session?.status === 'scheduled';
}

/**
 * Get time until session starts (in milliseconds)
 */
export function useTimeUntilSessionStarts(sessionId: string): number | null {
  const { data: session } = useYoutubeLiveSession(sessionId);
  
  if (!session || session.status !== 'scheduled' || !session.scheduledAt) {
    return null;
  }
  
  const now = new Date().getTime();
  const startTime = new Date(session.scheduledAt).getTime();
  
  return Math.max(0, startTime - now);
}

/**
 * Prefetch YouTube Live session
 */
export function usePrefetchYoutubeLiveSession() {
  const queryClient = useQueryClient();

  return (sessionId: string) => {
    queryClient.prefetchQuery({
      queryKey: youtubeLiveKeys.detail(sessionId),
      queryFn: () => moduleApi.getYoutubeLiveSession(sessionId),
      staleTime: 1 * 60 * 1000,
    });
  };
}
