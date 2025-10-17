'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  FileText,
  Award,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  CreditCard,
  Shield,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Cloud,
  HelpCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
  { icon: GraduationCap, label: 'Live Classes', href: '/admin/classes' },
  { icon: Calendar, label: 'Schedule', href: '/admin/schedule' },
  { icon: FileText, label: 'Assignments', href: '/admin/assignments' },
  { icon: Award, label: 'Certificates', href: '/admin/certificates' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
  { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
  { icon: CreditCard, label: 'Billing', href: '/admin/billing' },
  { icon: Shield, label: 'Security', href: '/admin/security' },
  { icon: Database, label: 'Backup', href: '/admin/backup' },
  { icon: Globe, label: 'Integration', href: '/admin/integration' },
  { icon: Smartphone, label: 'Mobile App', href: '/admin/mobile' },
  { icon: Monitor, label: 'System Monitor', href: '/admin/monitor' },
  { icon: Cloud, label: 'Cloud Storage', href: '/admin/storage' },
  { icon: Mail, label: 'Email Templates', href: '/admin/email' },
  { icon: Phone, label: 'Support', href: '/admin/support' },
  { icon: HelpCircle, label: 'Help Center', href: '/admin/help' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Import API service dynamically
      const { default: adminApi } = await import('@/lib/adminApi');
      
      await adminApi.logout();
      showSuccessToast('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      showErrorToast('Error during logout');
      // Still redirect even if logout API fails
      router.push('/admin/login');
    }
  };



  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sticky top-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-lg z-40"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">LMS Admin</h1>
                  <p className="text-sm text-gray-600">Management System</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative flex-1 overflow-hidden">
        <nav className="h-full p-4 space-y-2 overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`block w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-200 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
                )}
                
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-600' : ''}`} />
                
                {!isCollapsed && (
                  <span className="font-medium truncate">
                    {item.label}
                  </span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Scroll indicator gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className={`flex items-center space-x-3 p-3 rounded-xl bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-600 truncate">admin@lms.com</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full mt-3 flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap border border-gray-300">
              Logout
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}