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
  tokenKey: 'adminToken',
  refreshTokenKey: 'adminRefreshToken',
  userKey: 'adminUser',
  tokenRefreshInterval: 45 * 60 * 1000,
} as const;
