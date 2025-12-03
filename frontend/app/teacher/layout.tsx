'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User,
  Home,
  BookOpen,
  Bell,
  ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';
import { teacherApiService } from '@/src/services/teacher-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

interface TeacherMenuItem {
  icon: typeof Home;
  label: string;
  href: string;
}

const TEACHER_MENU_ITEMS: TeacherMenuItem[] = [
  { icon: Home, label: 'Dashboard', href: '/teacher/dashboard' },
  { icon: BookOpen, label: 'My Modules', href: '/teacher/modules' },
  { icon: ClipboardCheck, label: 'Exams', href: '/teacher/exams' },
  { icon: Bell, label: 'Notifications', href: '/teacher/notifications' },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teacher, setTeacher] = useState<any>(null);

  // Don't apply layout to login page
  const isLoginPage = pathname === '/teacher/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        if (!teacherApiService.isAuthenticated()) {
          router.push('/teacher/login');
          return;
        }

        const userData = teacherApiService.getCurrentUser();
        if (userData) {
          setTeacher(userData);
          setIsLoading(false);
        } else {
          router.push('/teacher/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/teacher/login');
      }
    };

    checkAuth();
  }, [router, isLoginPage, pathname]);

  const handleLogout = async () => {
    try {
      await teacherApiService.logout();
      showSuccessToast('Logged out successfully');
      router.push('/teacher/login');
    } catch (error) {
      console.error('Logout error:', error);
      showErrorToast('Error during logout');
      router.push('/teacher/login');
    }
  };

  // Return login page without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-[#2563eb] to-blue-700 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="sticky top-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-lg z-40"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-[#2563eb] to-blue-700 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Teacher Portal</h1>
                    <p className="text-sm text-gray-600">LMS Platform</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="relative flex-1 overflow-hidden">
          <nav className="h-full p-4 space-y-2 overflow-y-auto scrollbar-thin">
            {TEACHER_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-[#2563eb] border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2563eb] to-blue-700 rounded-r-full" />
                  )}
                  
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-[#2563eb]' : ''}`} />
                  
                  {!isCollapsed && (
                    <span className="font-medium truncate">
                      {item.label}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Scroll indicator gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className={`flex items-center space-x-3 p-3 rounded-xl bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-[#2563eb] to-blue-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{teacher?.name || 'Teacher'}</p>
                  <p className="text-xs text-gray-600 truncate">{teacher?.email || 'teacher@lms.com'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full mt-3 flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap border border-gray-300">
                Logout
              </div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
