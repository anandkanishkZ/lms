'use client';

import { motion } from 'framer-motion';
import { Search, Bell, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

interface AdminHeaderProps {
  title?: string;
  description?: string;
}

export default function AdminHeader({ 
  title = "Admin Dashboard", 
  description = "Welcome back! Here's what's happening in your LMS today."
}: AdminHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200 p-6 sticky top-0 z-30"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toast.success('Page refreshed!')}
            className="p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
