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

// Helper to get current user type based on URL and stored tokens
export const getCurrentUserType = (): 'admin' | 'teacher' | 'student' => {
  if (typeof window === 'undefined') return 'admin';
  
  const path = window.location.pathname;
  
  // Direct URL-based detection
  if (path.startsWith('/teacher')) return 'teacher';
  if (path.startsWith('/student')) return 'student';
  if (path.startsWith('/admin')) return 'admin';
  
  // For shared routes like /modules/[slug], check which token exists
  const studentToken = localStorage.getItem('student_token');
  const teacherToken = localStorage.getItem('teacher_token');
  const adminToken = localStorage.getItem('adminToken');
  
  // If accessing modules and student is logged in, assume student
  if (path.startsWith('/modules') && studentToken) return 'student';
  
  // Priority: student > teacher > admin (most specific to least)
  if (studentToken) return 'student';
  if (teacherToken) return 'teacher';
  if (adminToken) return 'admin';
  
  // Default fallback
  return 'admin';
};
