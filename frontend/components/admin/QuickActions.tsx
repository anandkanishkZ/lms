'use client';

import { motion } from 'framer-motion';
import {
  UserPlus,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
  Bell,
  Award,
  Upload,
  Download,
  Mail,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  action: () => void;
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Add New User',
    description: 'Create student or teacher account',
    icon: UserPlus,
    color: 'blue',
    action: () => toast.success('Opening user creation form...'),
  },
  {
    id: '2',
    title: 'Create Course',
    description: 'Design a new course curriculum',
    icon: BookOpen,
    color: 'green',
    action: () => toast.success('Opening course builder...'),
  },
  {
    id: '3',
    title: 'Schedule Class',
    description: 'Set up a live class session',
    icon: Calendar,
    color: 'purple',
    action: () => toast.success('Opening class scheduler...'),
  },
  {
    id: '4',
    title: 'Send Notice',
    description: 'Broadcast announcement to users',
    icon: Bell,
    color: 'orange',
    action: () => toast.success('Opening notice composer...'),
  },
  {
    id: '5',
    title: 'View Analytics',
    description: 'Check platform performance',
    icon: BarChart3,
    color: 'indigo',
    action: () => toast.success('Opening analytics dashboard...'),
  },
  {
    id: '6',
    title: 'Messages',
    description: 'Check user messages',
    icon: MessageSquare,
    color: 'red',
    action: () => toast.success('Opening message center...'),
  },
];

const colorVariants = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    hover: 'hover:border-blue-300 hover:bg-blue-100',
  },
  green: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    hover: 'hover:border-green-300 hover:bg-green-100',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    hover: 'hover:border-purple-300 hover:bg-purple-100',
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    hover: 'hover:border-orange-300 hover:bg-orange-100',
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    hover: 'hover:border-red-300 hover:bg-red-100',
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    hover: 'hover:border-indigo-300 hover:bg-indigo-100',
  },
};

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
          Customize
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const colors = colorVariants[action.color];
          
          return (
            <motion.button
              key={action.id}
              onClick={action.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-200 text-left group`}
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${colors.gradient} mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              <h4 className="text-gray-900 font-medium mb-1 group-hover:text-gray-800">
                {action.title}
              </h4>
              
              <p className="text-gray-600 text-sm group-hover:text-gray-700">
                {action.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Additional Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-gray-900 font-medium mb-4">More Actions</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Upload, label: 'Import Data', color: 'blue' },
            { icon: Download, label: 'Export Report', color: 'green' },
            { icon: Mail, label: 'Email Blast', color: 'purple' },
            { icon: Settings, label: 'Settings', color: 'orange' },
          ].map((item, index) => {
            const Icon = item.icon;
            const colors = colorVariants[item.color as keyof typeof colorVariants];
            
            return (
              <motion.button
                key={index}
                onClick={() => toast.success(`Opening ${item.label}...`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-lg border ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-200 flex flex-col items-center space-y-2 group`}
              >
                <Icon className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                <span className="text-xs text-gray-600 group-hover:text-gray-800">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}