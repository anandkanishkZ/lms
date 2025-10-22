'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import StudentSidebar from './StudentSidebar';
import StudentTopbar from './StudentTopbar';
import { studentApiService, StudentProfile } from '@/src/services/student-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

interface StudentLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function StudentLayout({ children, title, subtitle }: StudentLayoutProps) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    avgProgress: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

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
      } else {
        router.push('/student/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/student/login');
    } finally {
      setLoading(false);
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <StudentSidebar 
            student={student} 
            stats={stats}
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <StudentTopbar
          student={student}
          title={title}
          subtitle={subtitle}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
