export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  withCredentials: true,
} as const;

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;

export const AUTH_CONFIG = {
  admin: {
    tokenKey: 'adminToken',
    refreshTokenKey: 'adminRefreshToken',
    userKey: 'adminUser',
  },
  teacher: {
    tokenKey: 'teacher_token',
    refreshTokenKey: 'teacher_refresh_token',
    userKey: 'teacher_user',
  },
  student: {
    tokenKey: 'student_token',
    refreshTokenKey: 'student_refresh_token',
    userKey: 'student_user',
  },
  tokenRefreshInterval: 45 * 60 * 1000,
} as const;

// Helper to get current user type based on URL
export const getCurrentUserType = (): 'admin' | 'teacher' | 'student' => {
  if (typeof window === 'undefined') return 'admin';
  const path = window.location.pathname;
  if (path.startsWith('/teacher')) return 'teacher';
  if (path.startsWith('/student')) return 'student';
  return 'admin';
};
