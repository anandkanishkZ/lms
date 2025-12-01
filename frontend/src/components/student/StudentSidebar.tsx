'use client';

import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { 
  BookOpen, 
  GraduationCap,
  Settings,
  HelpCircle,
  LogOut,
  ClipboardList,
  BarChart3,
  BookText,
  ClipboardCheck,
  Bell,
} from 'lucide-react';
import { StudentProfile, studentApiService } from '@/src/services/student-api.service';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

interface StudentSidebarProps {
  student: StudentProfile;
  stats: {
    enrolled: number;
    completed: number;
    avgProgress: number;
  };
  onLogout: () => void;
  isOpen: boolean;
}

interface NavItem {
  id: string;
  icon: any;
  label: string;
  badge?: number | null;
  path: string;
}

export default function StudentSidebar({ student, stats, onLogout, isOpen }: StudentSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);

  const getAvatarUrl = () => {
    return studentApiService.getAvatarUrl(student?.profileImage || null);
  };

  const getInitials = () => {
    if (!student) return 'S';
    const firstName = student.firstName || '';
    const lastName = student.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || student.name.charAt(0).toUpperCase();
  };

  const navItems: NavItem[] = [
    { id: 'learnings', icon: BookOpen, label: 'My Courses', badge: stats.enrolled, path: '/student/dashboard' },
    { id: 'notifications', icon: Bell, label: 'Notices', badge: null, path: '/student/notifications' },
    { id: 'exams', icon: ClipboardCheck, label: 'Exams', badge: null, path: '/student/exams' },
    { id: 'assignments', icon: ClipboardList, label: 'Assignments', badge: null, path: '/student/assignments' },
    { id: 'results', icon: BarChart3, label: 'Progress & Results', badge: null, path: '/student/results' },
    { id: 'resources', icon: BookText, label: 'Resources', badge: null, path: '/student/resources' },
  ];

  const isActive = (path: string) => pathname === path;

  if (!isOpen) return null;

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm h-screen sticky top-0">

      {/* Logo & Brand */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Student Portal</h1>
            <p className="text-xs text-gray-500">Learning Dashboard</p>
          </div>
        </div>
      </div>

      {/* Student Profile Section - Clean & Simple */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {getAvatarUrl() ? (
            <img
              src={getAvatarUrl()}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
              onError={(e) => {
                console.error('❌ Image failed to load:', getAvatarUrl());
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl"
            style={{ display: getAvatarUrl() ? 'none' : 'flex' }}
          >
            {getInitials()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {student.name}
            </h2>
            <p className="text-xs text-gray-500 truncate">
              ID: {student.symbolNo}
            </p>
            
            {/* Email with Tooltip */}
            <div className="relative mt-0.5">
              <p 
                className="text-xs text-gray-400 truncate cursor-help"
                onMouseEnter={() => setShowEmailTooltip(true)}
                onMouseLeave={() => setShowEmailTooltip(false)}
              >
                {student.email}
              </p>
              
              {/* Tooltip */}
              <AnimatePresence>
                {showEmailTooltip && student.email && student.email.length > 20 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-1 z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap"
                  >
                    {student.email}
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-600">{stats.enrolled}</p>
            <p className="text-xs text-gray-600">Courses</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-600">Done</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <p className="text-lg font-bold text-purple-600">{stats.avgProgress}%</p>
            <p className="text-xs text-gray-600">Progress</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Simple & Clear */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${
              isActive(item.path)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${
                isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-gray-200 space-y-2">
        <button 
          onClick={() => router.push('/student/profile')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button 
          onClick={() => router.push('/student/help')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help & Support</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
