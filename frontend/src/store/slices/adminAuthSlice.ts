import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser } from '@/src/features/admin/types';

interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  _persist?: { version: number; rehydrated: boolean };
}

const initialState: AdminAuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<AdminUser | null>) => {
      state.user = action.payload;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    initializeAuth: (state) => {
      if (state.accessToken && state.user) {
        state.isAuthenticated = true;
        state.isLoading = false;
      } else {
        state.isAuthenticated = false;
        state.isLoading = false;
      }
    },
  },
});

export const {
  setAuthenticated,
  setUser,
  setTokens,
  setLoading,
  clearAuth,
  initializeAuth,
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
