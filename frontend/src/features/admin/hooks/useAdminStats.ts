import { useQuery } from '@tanstack/react-query';
import { adminApiService } from '../services/admin-api.service';

export const ADMIN_STATS_QUERY_KEY = 'admin-stats';

/**
 * Hook to fetch admin dashboard statistics
 */
export function useAdminStats() {
  return useQuery({
    queryKey: [ADMIN_STATS_QUERY_KEY],
    queryFn: async () => {
      const response = await adminApiService.getStats();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch stats');
      }
      return response.data;
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}
