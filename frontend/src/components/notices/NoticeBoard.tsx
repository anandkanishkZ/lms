'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import NoticeCard from './NoticeCard';
import NoticeDetailModal from './NoticeDetailModal';
import { noticeApi, Notice, NoticeCategory, NoticePriority, NoticeFilters } from '@/services/notice-api.service';
import { getCurrentUserRole } from '@/utils/auth';
import { Filter, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface NoticeBoardProps {
  classId?: string;
  batchId?: string;
  moduleId?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  limit?: number;
  title?: string;
  showActions?: boolean; // Show Edit/Delete buttons
}

export default function NoticeBoard({
  classId,
  batchId,
  moduleId,
  showCreateButton = false,
  onCreateClick,
  limit,
  title = 'Notices & Announcements',
  showActions = false,
}: NoticeBoardProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'TEACHER' | 'STUDENT' | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [unreadOnlyFilter, setUnreadOnlyFilter] = useState(false);
  const [pinnedOnlyFilter, setPinnedOnlyFilter] = useState(false);

  useEffect(() => {
    // Only fetch on client side when window is available
    if (typeof window !== 'undefined') {
      // Determine current user role using the centralized utility
      const role = getCurrentUserRole();
      setCurrentUserRole(role);
      
      fetchNotices();
    }
  }, [classId, batchId, moduleId, unreadOnlyFilter, pinnedOnlyFilter]);

  useEffect(() => {
    applyFilters();
  }, [notices, searchQuery, categoryFilter, priorityFilter]);

  const fetchNotices = async () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const filters: NoticeFilters = {
        classId,
        batchId,
        moduleId,
        unreadOnly: unreadOnlyFilter,
        isPinned: pinnedOnlyFilter || undefined,
      };

      const data = await noticeApi.getAllNotices(filters);
      setNotices(data);
    } catch (error: any) {
      // Don't show error toast for authentication issues if user just loaded the page
      if (error.message === 'Please log in to view notices') {
        console.log('User not authenticated for notices');
      } else {
        toast.error(error.message || 'Failed to fetch notices');
      }
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notices];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (notice) =>
          notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notice.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((notice) => notice.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((notice) => notice.priority === priorityFilter);
    }

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredNotices(filtered);
  };

  const handleMarkAsRead = async (noticeId: string) => {
    try {
      await noticeApi.markAsRead(noticeId);
      setNotices((prev) =>
        prev.map((notice) => (notice.id === noticeId ? { ...notice, isRead: true } : notice))
      );
      toast.success('Notice marked as read');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as read');
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    // Remove notice from state immediately for optimistic UI
    setNotices((prev) => prev.filter((notice) => notice.id !== noticeId));
    // Close modal if this notice is currently displayed
    if (selectedNotice?.id === noticeId) {
      setSelectedNotice(null);
    }
  };

  const handleViewNotice = (notice: Notice) => {
    setSelectedNotice(notice);
  };

  const handleCloseModal = () => {
    setSelectedNotice(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setUnreadOnlyFilter(false);
    setPinnedOnlyFilter(false);
  };

  const activeFiltersCount =
    (categoryFilter !== 'all' ? 1 : 0) +
    (priorityFilter !== 'all' ? 1 : 0) +
    (unreadOnlyFilter ? 1 : 0) +
    (pinnedOnlyFilter ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const unreadCount = notices.filter((n) => !n.isRead).length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>{title}</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 rounded-full" variant="secondary">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              {showCreateButton && onCreateClick && (
                <Button size="sm" onClick={onCreateClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Notice
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search notices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Selects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="EXAM">📝 Exam</SelectItem>
                    <SelectItem value="EVENT">🎉 Event</SelectItem>
                    <SelectItem value="HOLIDAY">🏖️ Holiday</SelectItem>
                    <SelectItem value="GENERAL">📢 General</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                    <SelectItem value="HIGH">🟠 High</SelectItem>
                    <SelectItem value="MEDIUM">🔵 Medium</SelectItem>
                    <SelectItem value="LOW">⚪ Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={unreadOnlyFilter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUnreadOnlyFilter(!unreadOnlyFilter)}
                    className="flex-1"
                  >
                    Unread Only
                  </Button>
                  <Button
                    variant={pinnedOnlyFilter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPinnedOnlyFilter(!pinnedOnlyFilter)}
                    className="flex-1"
                  >
                    Pinned Only
                  </Button>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notices Found</h3>
              <p className="text-gray-500">
                {activeFiltersCount > 0
                  ? 'Try adjusting your filters'
                  : 'There are no notices to display at this time'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onView={handleViewNotice}
                  onMarkAsRead={handleMarkAsRead}
                  showActions={showActions}
                  currentUserRole={currentUserRole}
                  onDelete={handleDeleteNotice}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          open={!!selectedNotice}
          onClose={handleCloseModal}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </>
  );
}
