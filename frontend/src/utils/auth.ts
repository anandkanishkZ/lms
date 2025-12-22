/**
 * Authentication Utility Functions
 * Handles token management and role detection for multi-role system
 */

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

/**
 * Token keys used in localStorage for different user roles
 */
export const TOKEN_KEYS = {
  ADMIN: 'adminToken',
  TEACHER: 'teacher_token',
  STUDENT: 'student_token',
  FALLBACK: 'token',
} as const;

/**
 * Get the current user's role based on available tokens in localStorage
 * Checks in order of privilege: Admin > Teacher > Student
 * 
 * @returns The current user role or null if no token found
 */
export const getCurrentUserRole = (): UserRole | null => {
  if (typeof window === 'undefined') {
    return null; // SSR safety
  }

  if (localStorage.getItem(TOKEN_KEYS.ADMIN)) return 'ADMIN';
  if (localStorage.getItem(TOKEN_KEYS.TEACHER)) return 'TEACHER';
  if (localStorage.getItem(TOKEN_KEYS.STUDENT)) return 'STUDENT';

  return null;
};

/**
 * Get the current authentication token
 * Returns the highest privilege token available
 * 
 * @returns JWT token string or null if no token found
 */
export const getCurrentToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null; // SSR safety
  }

  return (
    localStorage.getItem(TOKEN_KEYS.ADMIN) ||
    localStorage.getItem(TOKEN_KEYS.TEACHER) ||
    localStorage.getItem(TOKEN_KEYS.STUDENT) ||
    localStorage.getItem(TOKEN_KEYS.FALLBACK)
  );
};

/**
 * Check if user is authenticated (has any valid, non-expired token)
 * 
 * @returns true if any valid authentication token exists
 */
export const isAuthenticated = (): boolean => {
  const token = getCurrentToken();
  if (!token) return false;
  
  // Check if token is expired
  return !isTokenExpired(token);
};

/**
 * Check if current user has admin privileges
 * 
 * @returns true if user is an admin
 */
export const isAdmin = (): boolean => {
  return getCurrentUserRole() === 'ADMIN';
};

/**
 * Check if current user has teacher privileges
 * 
 * @returns true if user is a teacher
 */
export const isTeacher = (): boolean => {
  return getCurrentUserRole() === 'TEACHER';
};

/**
 * Check if current user has student role
 * 
 * @returns true if user is a student
 */
export const isStudent = (): boolean => {
  return getCurrentUserRole() === 'STUDENT';
};

/**
 * Set authentication token for a specific role
 * Clears tokens from other roles to prevent conflicts
 * 
 * @param role - The user role
 * @param token - The JWT token string
 */
export const setAuthToken = (role: UserRole, token: string): void => {
  if (typeof window === 'undefined') return;

  // Clear all other role tokens to prevent conflicts
  clearOtherRoleTokens(role);

  // Set the token for the specified role
  const tokenKey = getTokenKeyForRole(role);
  localStorage.setItem(tokenKey, token);
};

/**
 * Clear authentication token for a specific role
 * 
 * @param role - The user role
 */
export const clearAuthToken = (role: UserRole): void => {
  if (typeof window === 'undefined') return;

  const tokenKey = getTokenKeyForRole(role);
  localStorage.removeItem(tokenKey);
};

/**
 * Clear all authentication tokens from localStorage
 * Use this on logout or when switching accounts
 */
export const clearAllTokens = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEYS.ADMIN);
  localStorage.removeItem(TOKEN_KEYS.TEACHER);
  localStorage.removeItem(TOKEN_KEYS.STUDENT);
  localStorage.removeItem(TOKEN_KEYS.FALLBACK);
};

/**
 * Clear tokens from roles other than the specified one
 * Prevents token conflicts when switching between roles
 * 
 * @param keepRole - The role whose token should be kept
 */
export const clearOtherRoleTokens = (keepRole: UserRole): void => {
  if (typeof window === 'undefined') return;

  const allRoles: UserRole[] = ['ADMIN', 'TEACHER', 'STUDENT'];
  
  allRoles.forEach(role => {
    if (role !== keepRole) {
      clearAuthToken(role);
    }
  });
};

/**
 * Get the localStorage key for a specific role
 * 
 * @param role - The user role
 * @returns The localStorage key for that role
 */
const getTokenKeyForRole = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN':
      return TOKEN_KEYS.ADMIN;
    case 'TEACHER':
      return TOKEN_KEYS.TEACHER;
    case 'STUDENT':
      return TOKEN_KEYS.STUDENT;
    default:
      return TOKEN_KEYS.FALLBACK;
  }
};

/**
 * Decode JWT token to extract payload
 * Does NOT verify signature - use for client-side display only
 * 
 * @param token - The JWT token string
 * @returns Decoded token payload or null if invalid
 */
export const decodeJWT = (token: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * 
 * @param token - The JWT token string
 * @returns true if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
};

/**
 * Get user information from current token
 * 
 * @returns User info object or null if no valid token
 */
export const getCurrentUser = (): { userId: string; role: UserRole; email?: string } | null => {
  const token = getCurrentToken();
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return {
    userId: decoded.userId || decoded.id,
    role: decoded.role,
    email: decoded.email,
  };
};

/**
 * Get authorization header object for API requests
 * Automatically uses the highest privilege token available
 * 
 * @returns Headers object with Authorization and Content-Type
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getCurrentToken();
  
  if (typeof window !== 'undefined') {
    console.log('🔐 Getting auth headers:', {
      hasToken: !!token,
      tokenLength: token?.length,
      role: getCurrentUserRole(),
      adminToken: !!localStorage.getItem(TOKEN_KEYS.ADMIN),
      teacherToken: !!localStorage.getItem(TOKEN_KEYS.TEACHER),
      studentToken: !!localStorage.getItem(TOKEN_KEYS.STUDENT),
    });
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Only include Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('⚠️ No token available for auth headers');
  }
  
  return headers;
};

/**
 * Get authorization header object for multipart/form-data requests
 * 
 * @returns Headers object with Authorization only (no Content-Type)
 */
export const getAuthHeadersMultipart = (): Record<string, string> => {
  const token = getCurrentToken();
  
  const headers: Record<string, string> = {};
  
  // Only include Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Check if user has permission for a specific action
 * 
 * @param requiredRole - The minimum role required
 * @returns true if user has sufficient permissions
 */
export const hasPermission = (requiredRole: UserRole): boolean => {
  const currentRole = getCurrentUserRole();
  if (!currentRole) return false;

  const roleHierarchy: Record<UserRole, number> = {
    ADMIN: 3,
    TEACHER: 2,
    STUDENT: 1,
  };

  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
};

/**
 * Clean up expired or invalid tokens
 * Call this on app initialization or periodically
 */
export const cleanupInvalidTokens = (): void => {
  if (typeof window === 'undefined') return;

  const allTokenKeys = [
    TOKEN_KEYS.ADMIN,
    TOKEN_KEYS.TEACHER,
    TOKEN_KEYS.STUDENT,
    TOKEN_KEYS.FALLBACK,
  ];

  allTokenKeys.forEach(key => {
    const token = localStorage.getItem(key);
    if (token && isTokenExpired(token)) {
      localStorage.removeItem(key);
      console.log(`Removed expired token: ${key}`);
    }
  });
};
