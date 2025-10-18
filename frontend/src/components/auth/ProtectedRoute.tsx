import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'student';
  checkAuth: () => boolean;
  loginPath: string;
}

/**
 * Higher-Order Component for protecting routes
 * Checks authentication and redirects to login if not authenticated
 */
export function ProtectedRoute({ 
  children, 
  role, 
  checkAuth, 
  loginPath 
}: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = checkAuth();
    
    if (!isAuthenticated) {
      router.push(loginPath);
    }
  }, [checkAuth, loginPath, router]);

  return <>{children}</>;
}

/**
 * Hook to check if user is authenticated for a specific role
 */
export function useAuth(role: 'admin' | 'teacher' | 'student') {
  const router = useRouter();

  const checkAuth = () => {
    const tokenKey = `${role}_token`;
    const token = localStorage.getItem(tokenKey);
    return !!token;
  };

  const redirectToLogin = () => {
    const loginPaths = {
      admin: '/admin/login',
      teacher: '/teacher/login',
      student: '/student/login',
    };
    router.push(loginPaths[role]);
  };

  return { checkAuth, redirectToLogin };
}
