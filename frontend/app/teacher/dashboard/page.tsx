'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Video, 
  Award,
  TrendingUp,
  Calendar,
  FileText,
  Clock,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { teacherApiService } from '@/src/services/teacher-api.service';

interface DashboardStats {
  totalModules: number;
  totalStudents: number;
  activeClasses: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'submission' | 'enrollment' | 'class' | 'message';
  title: string;
  description: string;
  timestamp: string;
  icon: typeof FileText;
  color: string;
}

interface UpcomingClass {
  id: string;
  title: string;
  module: string;
  time: string;
  date: string;
  students: number;
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalModules: 0,
    totalStudents: 0,
    activeClasses: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = teacherApiService.getCurrentUser();
      setTeacher(userData);

      // Mock data - Replace with actual API calls
      setStats({
        totalModules: 12,
        totalStudents: 245,
        activeClasses: 8,
        completionRate: 87,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data - Replace with actual API data
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'submission',
      title: 'New Assignment Submission',
      description: 'John Doe submitted "Introduction to React" assignment',
      timestamp: '5 minutes ago',
      icon: FileText,
      color: 'blue',
    },
    {
      id: '2',
      type: 'enrollment',
      title: 'New Student Enrollment',
      description: 'Sarah Smith enrolled in "Advanced JavaScript"',
      timestamp: '1 hour ago',
      icon: Users,
      color: 'green',
    },
    {
      id: '3',
      type: 'class',
      title: 'Class Completed',
      description: 'Live session for "React Hooks" completed successfully',
      timestamp: '2 hours ago',
      icon: Video,
      color: 'purple',
    },
    {
      id: '4',
      type: 'message',
      title: 'New Message',
      description: 'Mike Johnson sent you a message about exam schedule',
      timestamp: '3 hours ago',
      icon: MessageSquare,
      color: 'orange',
    },
  ];

  const upcomingClasses: UpcomingClass[] = [
    {
      id: '1',
      title: 'Introduction to TypeScript',
      module: 'Web Development',
      time: '10:00 AM',
      date: 'Today',
      students: 32,
    },
    {
      id: '2',
      title: 'React State Management',
      module: 'Frontend Development',
      time: '2:00 PM',
      date: 'Today',
      students: 28,
    },
    {
      id: '3',
      title: 'Node.js Fundamentals',
      module: 'Backend Development',
      time: '11:00 AM',
      date: 'Tomorrow',
      students: 25,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {teacher?.name || 'Teacher'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your classes today
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/teacher/classes/schedule"
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>Schedule Class</span>
          </Link>
          <Link
            href="/teacher/modules"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2563eb] to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            <span>View My Modules</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">My Modules</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalModules}</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>+2 this month</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#2563eb]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>+18 this month</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Classes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeClasses}</p>
              <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>3 today</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completionRate}%</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>+5% from last month</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#2563eb]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Classes</h2>
                  <p className="text-sm text-gray-600">Your scheduled sessions</p>
                </div>
              </div>
              <Link
                href="/teacher/classes"
                className="text-[#2563eb] hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {upcomingClasses.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{cls.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{cls.module}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {cls.time}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {cls.date}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {cls.students} students
                    </span>
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Start Class
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-md border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-600">Latest updates</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
              }[activity.color];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/teacher/modules"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
          >
            <BookOpen className="w-8 h-8 text-[#2563eb] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">View Modules</span>
          </Link>
          <Link
            href="/teacher/students"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
          >
            <Users className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Manage Students</span>
          </Link>
          <Link
            href="/teacher/assignments"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
          >
            <FileText className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Assignments</span>
          </Link>
          <Link
            href="/teacher/analytics"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors group"
          >
            <TrendingUp className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">View Analytics</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
