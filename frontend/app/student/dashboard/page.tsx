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
  Download
} from 'lucide-react';
import { studentApiService, StudentProfile } from '@/src/services/student-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

      const userData = await studentApiService.getCurrentUser();
      if (userData) {
        setStudent(userData);
      } else {
        router.push('/student/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/student/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await studentApiService.logout();
      showSuccessToast('Logged out successfully');
      router.push('/student/login');
    } catch (error) {
      showErrorToast('Logout failed');
    }
  };

  const getAvatarUrl = () => {
    if (student?.profileImage) {
      return studentApiService.getAvatarUrl(student.profileImage);
    }
    return null;
  };

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      href: '/student/profile',
      description: 'View and edit your profile'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/student/settings',
      description: 'Account settings'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/student/help',
      description: 'Get help and support'
    },
    {
      icon: MessageSquare,
      label: 'Feedback',
      href: '/student/feedback',
      description: 'Share your feedback'
    },
    {
      icon: Download,
      label: 'Downloads',
      href: '/student/downloads',
      description: 'Download materials'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const stats = [
    {
      label: 'Active Courses',
      value: '6',
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Upcoming Classes',
      value: '3',
      icon: Video,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Assignments',
      value: '8',
      icon: FileText,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      label: 'Avg. Grade',
      value: '85%',
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Student Portal</h1>
                <p className="text-xs text-gray-500">Free Education In Nepal</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">ID: {student.symbolNo}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                    {getAvatarUrl() ? (
                      <img
                        src={getAvatarUrl()!}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                      {/* User Info Header */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                            {getAvatarUrl() ? (
                              <img
                                src={getAvatarUrl()!}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                            <p className="text-xs text-gray-400">Symbol No: {student.symbolNo}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {menuItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              router.push(item.href);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <item.icon className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200">
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-red-50 transition-colors text-red-600"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-medium">Logout</span>
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
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {student.firstName || student.name}! 👋</h2>
              <p className="text-blue-100">Ready to continue your learning journey?</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-blue-100 mb-1">Today's Date</p>
                <p className="text-xl font-semibold">{new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</p>
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
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/student/profile')}
                  className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <User className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Profile</span>
                </button>
                
                <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group">
                  <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Courses</span>
                </button>
                
                <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group">
                  <Calendar className="w-8 h-8 text-gray-400 group-hover:text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">Schedule</span>
                </button>
                
                <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                  <Award className="w-8 h-8 text-gray-400 group-hover:text-orange-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">Grades</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New course material uploaded</p>
                    <p className="text-xs text-gray-500">Mathematics - Chapter 5</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Live class scheduled</p>
                    <p className="text-xs text-gray-500">Physics - Tomorrow 10:00 AM</p>
                    <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Grade updated</p>
                    <p className="text-xs text-gray-500">English - Assignment 3: 92/100</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Student Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{student.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Symbol Number</p>
                  <p className="text-sm font-medium text-gray-900">{student.symbolNo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">School</p>
                  <p className="text-sm font-medium text-gray-900">{student.school || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{student.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{student.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => router.push('/student/profile')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage Profile</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h3>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                  <p className="text-sm font-medium text-gray-900">Mathematics</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Today, 2:00 PM</span>
                  </div>
                </div>

                <div className="p-3 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                  <p className="text-sm font-medium text-gray-900">Physics</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Tomorrow, 10:00 AM</span>
                  </div>
                </div>

                <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                  <p className="text-sm font-medium text-gray-900">Chemistry</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Tomorrow, 3:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
