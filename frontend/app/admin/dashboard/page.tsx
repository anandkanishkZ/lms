'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

// Components from Admin Feature Module
import {
  AdminLayout,
  StatsCard,
  EnrollmentChart,
  CourseDistributionChart,
  ActivityChart,
  ActivityFeed,
  QuickActions,
} from '@/src/features/admin';

// API Service
import { dashboardApiService, DashboardStats } from '@/src/services/dashboard-api.service';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout 
      title="Admin Dashboard"
      description="Welcome back! Here's what's happening in your LMS today."
    >
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {loading ? (
            // Loading skeletons
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </>
          ) : stats ? (
            <>
              <StatsCard
                title="Total Students"
                value={stats.totalStudents}
                change={stats.changes.students}
                icon={Users}
                color="blue"
                description="Active learners this month"
              />
              <StatsCard
                title="Total Teachers"
                value={stats.totalTeachers}
                change={stats.changes.teachers}
                icon={GraduationCap}
                color="green"
                description="Certified instructors"
              />
              <StatsCard
                title="Active Modules"
                value={stats.activeModules}
                change={stats.changes.modules}
                icon={BookOpen}
                color="purple"
                description="Published modules"
              />
              <StatsCard
                title="Live Classes"
                value={stats.liveClassesToday}
                change={stats.changes.liveClasses}
                icon={Calendar}
                color="orange"
                description="Scheduled for today"
              />
            </>
          ) : null}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EnrollmentChart />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CourseDistributionChart />
          </motion.div>
        </div>

        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ActivityChart />
        </motion.div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <QuickActions />
          </motion.div>

          {/* Activity Feed - Takes 1 column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ActivityFeed />
          </motion.div>
        </div>

        {/* Footer Space */}
        <div className="h-6"></div>
      </div>
    </AdminLayout>
  );
}