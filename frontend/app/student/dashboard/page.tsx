'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  BookOpen, 
  Calendar, 
  Award, 
  Bell,
  LogOut,
  Settings,
  GraduationCap,
  Clock,
  Video,
  FileText,
  TrendingUp,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  Download,
  ArrowRight,
  PlayCircle,
  BarChart
} from 'lucide-react';
import { studentApiService, StudentProfile, ModuleEnrollment } from '@/src/services/student-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [enrolledModules, setEnrolledModules] = useState<ModuleEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        fetchEnrollments();
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

  const fetchEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const enrollments = await studentApiService.getMyEnrollments();
      setEnrolledModules(enrollments);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      showErrorToast('Failed to load enrolled courses');
    } finally {
      setLoadingEnrollments(false);
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

  const handleProfileMenuClick = (action: string) => {
    setIsDropdownOpen(false);
    switch (action) {
      case 'profile':
        router.push('/student/profile');
        break;
      case 'settings':
        router.push('/student/settings');
        break;
      case 'help':
        // Navigate to help page
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  const getAvatarUrl = () => {
    if (student?.profileImage) {
      return studentApiService.getAvatarUrl(student.profileImage);
    }
    return '';
  };

  const getInitials = () => {
    if (!student) return 'S';
    const firstName = student.firstName || '';
    const lastName = student.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || student.name.charAt(0).toUpperCase();
  };

  // Calculate real stats from enrollments
  const stats = [
    {
      icon: BookOpen,
      label: 'Enrolled Courses',
      value: enrolledModules.length.toString(),
      color: 'bg-[#2563eb]',
      iconColor: 'text-[#2563eb]',
      bgLight: 'bg-[#2563eb]/10'
    },
    {
      icon: TrendingUp,
      label: 'In Progress',
      value: enrolledModules.filter(e => e.progress > 0 && e.progress < 100).length.toString(),
      color: 'bg-[#2563eb]',
      iconColor: 'text-[#2563eb]',
      bgLight: 'bg-[#2563eb]/10'
    },
    {
      icon: Award,
      label: 'Completed',
      value: enrolledModules.filter(e => e.completedAt).length.toString(),
      color: 'bg-green-500',
      iconColor: 'text-green-600',
      bgLight: 'bg-green-50'
    },
    {
      icon: BarChart,
      label: 'Avg. Progress',
      value: enrolledModules.length > 0 
        ? `${Math.round(enrolledModules.reduce((acc, e) => acc + e.progress, 0) / enrolledModules.length)}%`
        : '0%',
      color: 'bg-orange-500',
      iconColor: 'text-orange-600',
      bgLight: 'bg-orange-50'
    }
  ];

  const quickActions = [
    {
      icon: BookOpen,
      label: 'My Courses',
      color: 'bg-[#2563eb]',
      action: () => {
        const coursesSection = document.getElementById('enrolled-courses');
        coursesSection?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      icon: Calendar,
      label: 'Schedule',
      color: 'bg-[#2563eb]',
      action: () => router.push('/student/schedule')
    },
    {
      icon: FileText,
      label: 'Assignments',
      color: 'bg-[#2563eb]',
      action: () => router.push('/student/assignments')
    },
    {
      icon: Award,
      label: 'Certificates',
      color: 'bg-[#2563eb]',
      action: () => router.push('/student/certificates')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LMS</span>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-[#2563eb] hover:bg-[#2563eb]/10 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt={student.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#2563eb]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-semibold text-sm border-2 border-[#2563eb]">
                      {getInitials()}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.symbolNo}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email || student.symbolNo}</p>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => handleProfileMenuClick('profile')}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2563eb]/10 hover:text-[#2563eb] transition-all"
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </button>
                        <button
                          onClick={() => handleProfileMenuClick('settings')}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2563eb]/10 hover:text-[#2563eb] transition-all"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={() => handleProfileMenuClick('help')}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2563eb]/10 hover:text-[#2563eb] transition-all"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </button>
                      </div>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => handleProfileMenuClick('logout')}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2563eb] rounded-2xl p-8 mb-8 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {student.firstName || student.name}! 👋
              </h1>
              <p className="text-white/90">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgLight} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#2563eb] group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 bg-[#2563eb]/10 rounded-lg flex items-center justify-center group-hover:bg-[#2563eb] transition-all">
                    <action.icon className="w-7 h-7 text-[#2563eb] group-hover:text-white transition-all" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{action.label}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Enrolled Courses */}
        <motion.div
          id="enrolled-courses"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Enrolled Courses</h2>
            {enrolledModules.length > 0 && (
              <button className="text-[#2563eb] hover:text-[#1d4ed8] font-medium flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {loadingEnrollments ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
            </div>
          ) : enrolledModules.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-[#2563eb]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-[#2563eb]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't enrolled in any courses yet. Contact your administrator to get enrolled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledModules.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group cursor-pointer"
                  onClick={() => router.push(`/modules/${enrollment.module.slug}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] overflow-hidden">
                    {enrollment.module.thumbnail ? (
                      <img
                        src={enrollment.module.thumbnail}
                        alt={enrollment.module.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    {enrollment.completedAt && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#2563eb] transition-colors">
                        {enrollment.module.title}
                      </h3>
                      {enrollment.module.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {enrollment.module.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-[#2563eb]">{Math.round(enrollment.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${enrollment.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="bg-[#2563eb] h-full rounded-full"
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {enrollment.module.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{enrollment.module.duration} hrs</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>{enrollment.module.topicsCount || 0} topics</span>
                        </div>
                      </div>
                      <button className="flex items-center space-x-1 text-[#2563eb] hover:text-[#1d4ed8] font-medium text-sm group-hover:space-x-2 transition-all">
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Student Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Student ID</p>
              <p className="font-semibold text-gray-900">{student.symbolNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">School/College</p>
              <p className="font-semibold text-gray-900">{student.school || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{student.email || 'Not provided'}</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
