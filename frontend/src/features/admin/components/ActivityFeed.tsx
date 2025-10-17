'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  BookOpen,
  Calendar,
  Award,
  MessageSquare,
  UserPlus,
  FileText,
  Clock,
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'user_joined' | 'course_created' | 'class_scheduled' | 'certificate_issued' | 'message_sent' | 'assignment_submitted';
  user: string;
  action: string;
  target?: string;
  timestamp: Date;
  avatar?: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'user_joined',
    user: 'Sarah Johnson',
    action: 'joined the platform',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    type: 'course_created',
    user: 'Dr. Michael Chen',
    action: 'created a new course',
    target: 'Advanced React Patterns',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '3',
    type: 'class_scheduled',
    user: 'Emma Wilson',
    action: 'scheduled a live class',
    target: 'JavaScript Fundamentals',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '4',
    type: 'certificate_issued',
    user: 'Alex Rodriguez',
    action: 'earned a certificate for',
    target: 'Web Development Bootcamp',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '5',
    type: 'assignment_submitted',
    user: 'Lisa Thompson',
    action: 'submitted an assignment for',
    target: 'Data Structures & Algorithms',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: '6',
    type: 'message_sent',
    user: 'James Park',
    action: 'sent a message in',
    target: 'General Discussion',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
  },
];

const activityIcons = {
  user_joined: UserPlus,
  course_created: BookOpen,
  class_scheduled: Calendar,
  certificate_issued: Award,
  message_sent: MessageSquare,
  assignment_submitted: FileText,
};

const activityColors = {
  user_joined: 'text-green-600 bg-green-100',
  course_created: 'text-blue-600 bg-blue-100',
  class_scheduled: 'text-purple-600 bg-purple-100',
  certificate_issued: 'text-yellow-600 bg-yellow-100',
  message_sent: 'text-indigo-600 bg-indigo-100',
  assignment_submitted: 'text-orange-600 bg-orange-100',
};

export default function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-900 font-medium">{activity.user}</span>
                </div>
                
                <p className="text-gray-600 text-sm mt-1">
                  {activity.action}
                  {activity.target && (
                    <span className="text-blue-600 ml-1">{activity.target}</span>
                  )}
                </p>
                
                <div className="flex items-center space-x-1 mt-2 text-gray-500 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 p-3 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-xl transition-colors bg-white hover:bg-gray-50"
      >
        Load More Activities
      </motion.button>
    </motion.div>
  );
}