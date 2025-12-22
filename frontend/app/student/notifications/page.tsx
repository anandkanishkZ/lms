'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Filter, Search } from 'lucide-react';
import StudentNoticeCard from '@/src/components/notices/StudentNoticeCard';
import noticeApi, { Notice } from '@/src/services/notice-api.service';
import { toast } from 'sonner';

export default function StudentNotificationsPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      
      // Debug: Check if token exists
      const token = localStorage.getItem('student_token');
      if (!token) {
        console.error('❌ No student token found in localStorage');
        toast.error('Please log in again');
        // Redirect to login if no token
        window.location.href = '/student/login';
        return;
      }
      
      console.log('✅ Student token exists, fetching notices...');
      const data = await noticeApi.getAllNotices({ unreadOnly: false });
      console.log('✅ Notices fetched successfully:', data.length);
      setNotices(data);
    } catch (error: any) {
      console.error('❌ Failed to fetch notices:', error);
      
      // If unauthorized, redirect to login
      if (error.message?.includes('log in')) {
        toast.error('Your session has expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/student/login';
        }, 2000);
      } else {
        toast.error('Failed to load notices');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (noticeId: string) => {
    try {
      await noticeApi.markAsRead(noticeId);
      setNotices((prev) =>
        prev.map((n) => (n.id === noticeId ? { ...n, isRead: true } : n))
      );
      toast.success('Marked as read');
    } catch (error: any) {
      toast.error('Failed to mark as read');
    }
  };

  // Filter notices
  const filteredNotices = notices.filter((notice) => {
    const matchesFilter = filter === 'all' || !notice.isRead;
    const matchesSearch =
      searchTerm === '' ||
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || notice.category === categoryFilter;
    
    return matchesFilter && matchesSearch && matchesCategory;
  });

  const unreadCount = notices.filter((n) => !n.isRead).length;

  return (
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Bell className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">News & Announcements</h2>
              <p className="text-gray-600">Stay updated with the latest information</p>
            </div>
          </div>

          {/* Stats */}
          {unreadCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                You have <span className="font-bold text-blue-600">{unreadCount}</span> unread{' '}
                {unreadCount === 1 ? 'notification' : 'notifications'}
              </p>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({notices.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Unread ({unreadCount})
            </button>

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            {/* Category Filters */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="EXAM">Exam</option>
              <option value="EVENT">Event</option>
              <option value="HOLIDAY">Holiday</option>
            </select>
          </div>
        </div>

        {/* Notice Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading announcements...</p>
            </div>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : 'Check back later for new announcements'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <StudentNoticeCard notice={notice} onMarkAsRead={handleMarkAsRead} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
  );
}
