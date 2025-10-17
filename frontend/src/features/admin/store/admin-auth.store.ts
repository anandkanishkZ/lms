/**
 * MIGRATED TO REDUX TOOLKIT
 * This file now exports Redux hooks and actions for backward compatibility
 * Actual Redux store is in: src/store/
 */

import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  setAuthenticated,
  setUser,
  setTokens,
  setLoading,
  clearAuth,
  initializeAuth,
} from '@/src/store/slices/adminAuthSlice';
import type { AdminUser } from '../types';

/**
 * Custom hook that mimics Zustand API but uses Redux under the hood
 * This ensures backward compatibility with existing code
 */
export const useAdminAuthStore = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.adminAuth);

  return {
    // State
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isLoading: state.isLoading,

    // Actions (wrapped to match Zustand API)
    setAuthenticated: (value: boolean) => dispatch(setAuthenticated(value)),
    setUser: (user: AdminUser | null) => dispatch(setUser(user)),
    setTokens: (accessToken: string, refreshToken: string) => 
      dispatch(setTokens({ accessToken, refreshToken })),
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    clearAuth: () => dispatch(clearAuth()),
    initializeAuth: () => dispatch(initializeAuth()),

    // Add getState method for compatibility with direct store access
    getState: () => state,
  };
};

// For code that accesses store directly (e.g., useAdminAuthStore.getState())
// We need to provide a compatible interface
useAdminAuthStore.getState = () => {
  // This is a workaround - in actual usage, components should use the hook
  if (typeof window !== 'undefined') {
    // Access the Redux store
    const { store } = require('@/src/store/index');
    const state = store.getState().adminAuth;
    
    return {
      ...state,
      setAuthenticated: (value: boolean) => store.dispatch(setAuthenticated(value)),
      setUser: (user: AdminUser | null) => store.dispatch(setUser(user)),
      setTokens: (accessToken: string, refreshToken: string) => 
        store.dispatch(setTokens({ accessToken, refreshToken })),
      setLoading: (loading: boolean) => store.dispatch(setLoading(loading)),
      clearAuth: () => store.dispatch(clearAuth()),
      initializeAuth: () => store.dispatch(initializeAuth()),
    };
  }
  
  // Fallback for SSR
  return {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    setAuthenticated: () => {},
    setUser: () => {},
    setTokens: () => {},
    setLoading: () => {},
    clearAuth: () => {},
    initializeAuth: () => {},
  };
};
