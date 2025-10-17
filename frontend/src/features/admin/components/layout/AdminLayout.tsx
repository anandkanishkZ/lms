'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
}

export default function AdminLayout({ 
  children, 
  title = "Admin Dashboard", 
  description = "Welcome back! Here's what's happening in your LMS today.",
  showHeader = true 
}: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Import API service from feature module
        const { adminApiService } = await import('@/src/features/admin');
        
        // Check if user is authenticated (has valid token)
        if (!adminApiService.isAuthenticated()) {
          router.push('/admin/login');
          return;
        }

        // User is authenticated, allow access
        setIsLoading(false);
        
        // Optionally verify token with server in background (don't block UI)
        try {
          await adminApiService.getProfile();
        } catch (error) {
          console.error('Background profile check failed:', error);
          // Don't redirect here - user already has valid token
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        {showHeader && (
          <AdminHeader 
            title={title}
            description={description}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
