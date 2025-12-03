'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import StudentSidebar from '@/src/components/student/StudentSidebar';
import StudentTopbar from '@/src/components/student/StudentTopbar';
import { studentApiService, StudentProfile } from '@/src/services/student-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    avgProgress: 0
  });

  // Don't apply layout to login page
  const isLoginPage = pathname === '/student/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    checkAuth();
  }, [isLoginPage]);

  const checkAuth = async () => {
    try {
      if (!studentApiService.isAuthenticated()) {
        router.push('/student/login');
        return;
      }

      const currentStudent = await studentApiService.getCurrentUser();
      if (currentStudent) {
        setStudent(currentStudent);
        await fetchStats();
        setLoading(false);
      } else {
        router.push('/student/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/student/login');
    }
  };

  const fetchStats = async () => {
    try {
      const enrollments = await studentApiService.getMyEnrollments();
      const enrolled = enrollments.length;
      const completed = enrollments.filter(e => e.completedAt).length;
      const avgProgress = enrolled > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrolled)
        : 0;
      
      setStats({ enrolled, completed, avgProgress });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await studentApiService.logout();
      showSuccessToast('Logged out successfully');
      router.push('/student/login');
    } catch (error) {
      console.error('Logout error:', error);
      showErrorToast('Logout failed');
    }
  };

  // Return login page without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  // Get page title and subtitle based on pathname
  const getPageInfo = () => {
    if (pathname === '/student/dashboard') {
      return { title: 'My Learning', subtitle: 'Continue your courses and track progress' };
    } else if (pathname === '/student/notifications') {
      return { title: 'Notices', subtitle: 'Stay updated with latest announcements' };
    } else if (pathname === '/student/exams') {
      return { title: 'Exams', subtitle: 'View and attempt your exams' };
    } else if (pathname === '/student/profile') {
      return { title: 'Profile Settings', subtitle: 'Manage your account and preferences' };
    }
    return { title: 'Student Portal', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Fixed */}
      {isSidebarOpen && (
        <StudentSidebar 
          student={student} 
          stats={stats}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - Fixed */}
        <StudentTopbar
          student={student}
          title={title}
          subtitle={subtitle}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
        />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
