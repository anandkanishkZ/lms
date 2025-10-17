import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiService } from '../services/admin-api.service';
import type {
  GetUsersParams,
  CreateStudentData,
  CreateTeacherData,
  UpdateUserData,
  BlockUserData,
} from '../types';
import { toast } from 'react-hot-toast';

// Query Keys
export const USERS_QUERY_KEY = 'admin-users';
export const USER_DETAIL_QUERY_KEY = 'admin-user-detail';
export const USER_AUDIT_QUERY_KEY = 'admin-user-audit';

/**
 * Hook to fetch and manage users list
 */
export function useUsers(params?: GetUsersParams) {
  const queryClient = useQueryClient();

  // Fetch users query
  const usersQuery = useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await adminApiService.getUsers(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: (data: CreateStudentData) => adminApiService.createStudent(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(response.message || 'Student created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create student');
    },
  });

  // Create teacher mutation
  const createTeacherMutation = useMutation({
    mutationFn: (data: CreateTeacherData) => adminApiService.createTeacher(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(response.message || 'Teacher created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create teacher');
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      adminApiService.updateUser(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USER_DETAIL_QUERY_KEY] });
      toast.success(response.message || 'User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlockUserData }) =>
      adminApiService.blockUser(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USER_DETAIL_QUERY_KEY] });
      toast.success(response.message || 'User blocked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to block user');
    },
  });

  // Unblock user mutation
  const unblockUserMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      adminApiService.unblockUser(id, notes),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USER_DETAIL_QUERY_KEY] });
      toast.success(response.message || 'User unblocked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unblock user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      adminApiService.deleteUser(id, notes),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(response.message || 'User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  return {
    // Query data
    users: usersQuery.data?.users || [],
    pagination: usersQuery.data?.pagination,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,

    // Mutations
    createStudent: createStudentMutation.mutate,
    createStudentAsync: createStudentMutation.mutateAsync,
    isCreatingStudent: createStudentMutation.isPending,

    createTeacher: createTeacherMutation.mutate,
    createTeacherAsync: createTeacherMutation.mutateAsync,
    isCreatingTeacher: createTeacherMutation.isPending,

    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,

    blockUser: blockUserMutation.mutate,
    blockUserAsync: blockUserMutation.mutateAsync,
    isBlockingUser: blockUserMutation.isPending,

    unblockUser: unblockUserMutation.mutate,
    unblockUserAsync: unblockUserMutation.mutateAsync,
    isUnblockingUser: unblockUserMutation.isPending,

    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    isDeletingUser: deleteUserMutation.isPending,
  };
}

/**
 * Hook to fetch single user details
 */
export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: [USER_DETAIL_QUERY_KEY, userId],
    queryFn: async () => {
      const response = await adminApiService.getUserById(userId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user details');
      }
      return response.data?.user;
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch user audit trail
 */
export function useUserAuditTrail(userId: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [USER_AUDIT_QUERY_KEY, userId, page, limit],
    queryFn: async () => {
      const response = await adminApiService.getUserAuditTrail(userId, page, limit);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch audit trail');
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}
