'use client';

import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
} from 'lucide-react';

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

export default function AdminDashboard() {
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
          <StatsCard
            title="Total Students"
            value={1234}
            change={{ value: 12.5, type: 'increase' }}
            icon={Users}
            color="blue"
            description="Active learners this month"
          />
          <StatsCard
            title="Total Teachers"
            value={89}
            change={{ value: 8.2, type: 'increase' }}
            icon={GraduationCap}
            color="green"
            description="Certified instructors"
          />
          <StatsCard
            title="Active Courses"
            value={56}
            change={{ value: 15.3, type: 'increase' }}
            icon={BookOpen}
            color="purple"
            description="Published courses"
          />
          <StatsCard
            title="Live Classes"
            value={12}
            change={{ value: 3.1, type: 'decrease' }}
            icon={Calendar}
            color="orange"
            description="Scheduled for today"
          />
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