import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = {
  admin: ['/admin/dashboard', '/admin/users', '/admin/courses', '/admin/classes', '/admin/schedule'],
  teacher: ['/teacher/dashboard', '/teacher/modules', '/teacher/students', '/teacher/classes', '/teacher/schedule'],
  student: ['/student/dashboard', '/student/profile', '/student/courses'],
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/admin/login',
  '/teacher/login',
  '/student/login',
  '/teacher/register',
  '/student/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  let requiredRole: 'admin' | 'teacher' | 'student' | null = null;
  let loginUrl = '/';

  // Determine the role required based on the path
  if (pathname.startsWith('/admin')) {
    requiredRole = 'admin';
    loginUrl = '/admin/login';
  } else if (pathname.startsWith('/teacher')) {
    requiredRole = 'teacher';
    loginUrl = '/teacher/login';
  } else if (pathname.startsWith('/student')) {
    requiredRole = 'student';
    loginUrl = '/student/login';
  }

  // If it's a protected route, check authentication
  if (requiredRole) {
    const tokenKey = `${requiredRole}_token`;
    
    // In middleware, we can't access localStorage directly
    // Instead, we check cookies or use a different approach
    // For now, we'll let the layout components handle auth
    // This middleware will serve as a backup layer
    
    // You could implement cookie-based auth here if needed
    // const token = request.cookies.get(tokenKey);
    
    // if (!token) {
    //   const url = request.nextUrl.clone();
    //   url.pathname = loginUrl;
    //   return NextResponse.redirect(url);
    // }
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
