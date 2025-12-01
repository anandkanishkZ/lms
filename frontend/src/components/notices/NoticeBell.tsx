'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { noticeApi, Notice } from '@/services/notice-api.service';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';

interface NoticeBellProps {
  onViewAll?: () => void;
  noticesPagePath?: string;
}

const categoryIcons = {
  EXAM: '📝',
  EVENT: '🎉',
  HOLIDAY: '🏖️',
  GENERAL: '📢',
};

export default function NoticeBell({ onViewAll, noticesPagePath }: NoticeBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Delay initial check to ensure auth is loaded
    const checkAuth = () => {
      setIsAuthChecked(true);
      if (isAuthenticated()) {
        fetchUnreadCount();
      }
    };
    
    // Check auth after component mounts
    const timeout = setTimeout(checkAuth, 100);
    
    // Poll every 2 minutes for new notices
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        fetchUnreadCount();
      }
    }, 2 * 60 * 1000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const fetchUnreadCount = async () => {
    // Skip if not authenticated
    if (!isAuthenticated()) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const data = await noticeApi.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (error: any) {
      // Handle token expiration or auth errors silently
      if (error.response?.status === 401) {
        setUnreadCount(0);
        console.log('Authentication required for notices');
      } else {
        console.error('Error fetching unread count:', error);
      }
    }
  };

  const fetchRecentNotices = async () => {
    // Skip if not authenticated
    if (!isAuthenticated()) {
      toast.error('Please log in to view notices');
      return;
    }
    
    try {
      setLoading(true);
      const notices = await noticeApi.getAllNotices({ unreadOnly: true });
      setRecentNotices(notices.slice(0, 5)); // Show only 5 most recent
    } catch (error: any) {
      // Handle 401 errors gracefully
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.message || 'Failed to fetch notices');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await noticeApi.markAsRead(noticeId);
      setRecentNotices((prev) => prev.filter((n) => n.id !== noticeId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Notice marked as read');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as read');
    }
  };

  const handleViewNotice = async (notice: Notice) => {
    try {
      await noticeApi.markAsRead(notice.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      // Open notice in modal or navigate to notices page
      if (noticesPagePath) {
        router.push(`${noticesPagePath}?notice=${notice.id}`);
      }
    } catch (error: any) {
      console.error('Error marking notice as read:', error);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else if (noticesPagePath) {
      router.push(noticesPagePath);
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchRecentNotices()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
        ) : recentNotices.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-sm text-gray-500">No new notifications</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {recentNotices.map((notice) => (
              <DropdownMenuItem
                key={notice.id}
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleViewNotice(notice)}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-lg">{categoryIcons[notice.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate flex-1">
                        {notice.title}
                      </p>
                      {!notice.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">{notice.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {notice.publishedAt
                          ? format(new Date(notice.publishedAt), 'MMM dd, hh:mm a')
                          : 'Draft'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => handleMarkAsRead(notice.id, e)}
                      >
                        Mark read
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewAll} className="justify-center font-medium">
          View All Notices
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
