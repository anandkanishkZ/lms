import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiService } from '../services/admin-api.service';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  setAuthenticated,
  setUser,
  setLoading,
  clearAuth,
  initializeAuth,
} from '@/src/store/slices/adminAuthSlice';

export function useAdminAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const { isAuthenticated, user } = useAppSelector((state) => state.adminAuth);

  useEffect(() => {
    // Initialize auth on mount
    dispatch(initializeAuth());
    checkAuth();
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!adminApiService.isAuthenticated()) {
        setAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      // Verify token with server
      const response = await adminApiService.getProfile();
      
      if (response.success && response.data) {
        dispatch(setUser(response.data.user));
        dispatch(setAuthenticated(true));
        setIsLoading(false);
        return true;
      } else {
        dispatch(clearAuth());
        dispatch(setAuthenticated(false));
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch(clearAuth());
      dispatch(setAuthenticated(false));
      setIsLoading(false);
      return false;
    }
  }, [dispatch]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false) => {
      try {
        setIsLoading(true);
        
        const response = await adminApiService.login({
          email,
          password,
          rememberMe,
        });

        if (response.success && response.data) {
          dispatch(setAuthenticated(true));
          toast.success('Login successful!');
          return true;
        } else {
          toast.error(response.message || 'Login failed');
          return false;
        }
      } catch (error: any) {
        console.error('Login error:', error);
        toast.error(error.message || 'Login failed');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await adminApiService.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(clearAuth());
      router.push('/admin/login');
    }
  }, [dispatch, router]);

  const updateProfile = useCallback(
    async (data: { name?: string; phone?: string }) => {
      try {
        const response = await adminApiService.updateProfile(data);
        
        if (response.success && response.data) {
          dispatch(setUser(response.data.user));
          toast.success('Profile updated successfully');
          return true;
        } else {
          toast.error(response.message || 'Update failed');
          return false;
        }
      } catch (error: any) {
        console.error('Update profile error:', error);
        toast.error(error.message || 'Update failed');
        return false;
      }
    },
    [dispatch]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        const response = await adminApiService.changePassword({
          currentPassword,
          newPassword,
        });

        if (response.success) {
          toast.success('Password changed successfully');
          return true;
        } else {
          toast.error(response.message || 'Password change failed');
          return false;
        }
      } catch (error: any) {
        console.error('Change password error:', error);
        toast.error(error.message || 'Password change failed');
        return false;
      }
    },
    []
  );

  return {
    isAuthenticated,
    user,
    isLoading,
    checkAuth,
    login,
    logout,
    updateProfile,
    changePassword,
  };
}
