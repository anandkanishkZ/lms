'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Bell, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/src/store/hooks';
import { adminApiService } from '@/src/features/admin';
import Sidebar from './Sidebar';

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
  
  // Get auth state from Redux
  const { isAuthenticated, accessToken, user } = useAppSelector((state) => state.adminAuth);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        console.log('🔒 AdminLayout: Starting auth check...');
        
        // STEP 1: Check localStorage for token (synchronous, immediate)
        const storedToken = localStorage.getItem('adminToken');
        console.log('🔒 Step 1 - Token in localStorage:', storedToken ? 'EXISTS' : 'MISSING');
        
        if (!storedToken) {
          console.log('❌ No token found - redirecting to login');
          if (isMounted) {
            router.push('/admin/login');
          }
          return;
        }

        // STEP 2: Token exists, now verify with server
        console.log('🔒 Step 2 - Verifying token with server...');
        
        try {
          const profileResponse = await adminApiService.getProfile();
          console.log('🔒 Step 3 - Server response:', profileResponse);
          
          if (!isMounted) return;
          
          if (profileResponse.success) {
            console.log('✅ Authentication successful - showing dashboard');
            setIsLoading(false);
          } else {
            console.error('❌ Server rejected token:', profileResponse.message);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRefreshToken');
            router.push('/admin/login');
          }
        } catch (error: any) {
          console.error('❌ Server verification error:', error.message || error);
          if (isMounted) {
            // Don't clear tokens on network error, just redirect
            router.push('/admin/login');
          }
        }
      } catch (error) {
        console.error('❌ Fatal error in auth check:', error);
        if (isMounted) {
          router.push('/admin/login');
        }
      }
    };

    // Run auth check
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [router]); // Only depend on router, not auth state (to prevent loops)

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
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        {showHeader && (
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
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}