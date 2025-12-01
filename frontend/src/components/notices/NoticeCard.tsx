'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/ui/card';
import { Notice, NoticeCategory, NoticePriority } from '@/services/notice-api.service';
import { getCurrentUser } from '@/utils/auth';
import { Bell, Calendar, Clock, Eye, Pin, User, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import noticeApi from '@/src/services/notice-api.service';
import { toast } from 'sonner';

interface NoticeCardProps {
  notice: Notice;
  onView: (notice: Notice) => void;
  onMarkAsRead?: (noticeId: string) => void;
  onDelete?: (noticeId: string) => void;
  showActions?: boolean;
  currentUserRole?: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

const categoryIcons = {
  EXAM: '📝',
  EVENT: '🎉',
  HOLIDAY: '🏖️',
  GENERAL: '📢',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800 border-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-800 border-blue-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  URGENT: 'bg-red-100 text-red-800 border-red-300',
};

const priorityBadgeColors = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

export default function NoticeCard({ 
  notice, 
  onView, 
  onMarkAsRead, 
  onDelete,
  showActions = false,
  currentUserRole 
}: NoticeCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date();
  const isExpiringSoon =
    notice.expiresAt &&
    new Date(notice.expiresAt) > new Date() &&
    new Date(notice.expiresAt) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  // Get current user info to check ownership
  const currentUser = getCurrentUser();
  
  // Check if current user can edit/delete
  // Everyone (Admin, Teacher) can only edit/delete their own notices
  const canEdit = showActions && currentUser && (
    notice.publishedBy === currentUser.userId
  );

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onView(notice);
    if (!notice.isRead && onMarkAsRead) {
      onMarkAsRead(notice.id);
    }
  };

  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Determine the correct edit route based on user role
    const editRoute = currentUserRole === 'ADMIN' 
      ? `/admin/notifications/${notice.id}/edit`
      : `/teacher/notifications/${notice.id}/edit`;
    
    router.push(editRoute);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${notice.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await noticeApi.deleteNotice(notice.id);
      toast.success('Notice deleted successfully');
      if (onDelete) {
        onDelete(notice.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete notice');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-lg cursor-pointer relative ${
        notice.isPinned ? 'border-2 border-yellow-500 shadow-md' : ''
      } ${!notice.isRead ? 'bg-blue-50/30' : ''} ${isExpired ? 'opacity-60' : ''}`}
      onClick={handleCardClick}
    >
      {/* Unread Indicator */}
      {!notice.isRead && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        </div>
      )}

      {/* Pin Indicator */}
      {notice.isPinned && (
        <div className="absolute top-3 left-3">
          <Pin className="w-4 h-4 text-yellow-600 fill-yellow-400" />
        </div>
      )}

      <CardHeader className={notice.isPinned || !notice.isRead ? 'pt-8' : 'pt-4'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{categoryIcons[notice.category]}</span>
              <Badge variant="outline" className="text-xs">
                {notice.category}
              </Badge>
              <Badge className={`text-xs ${priorityBadgeColors[notice.priority]} text-white`}>
                {notice.priority}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{notice.title}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Content Preview */}
        <p className="text-sm text-gray-600 line-clamp-3">{notice.content}</p>

        {/* Target Info */}
        {(notice.class || notice.batch || notice.module || notice.targetRole) && (
          <div className="flex flex-wrap gap-2">
            {notice.class && (
              <Badge variant="secondary" className="text-xs">
                📚 {notice.class.name}
              </Badge>
            )}
            {notice.batch && (
              <Badge variant="secondary" className="text-xs">
                🎓 {notice.batch.name}
              </Badge>
            )}
            {notice.module && (
              <Badge variant="secondary" className="text-xs">
                📖 {notice.module.title}
              </Badge>
            )}
            {notice.targetRole && (
              <Badge variant="secondary" className="text-xs">
                👥 {notice.targetRole}
              </Badge>
            )}
          </div>
        )}

        {/* Expiration Warning */}
        {isExpiringSoon && !isExpired && (
          <div className="flex items-center gap-2 text-orange-600 text-xs bg-orange-50 p-2 rounded">
            <Clock className="w-3 h-3" />
            <span>Expiring soon</span>
          </div>
        )}

        {isExpired && (
          <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded">
            <Clock className="w-3 h-3" />
            <span>Expired</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{notice.publishedByUser.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{notice.viewCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{notice.publishedAt ? format(new Date(notice.publishedAt), 'MMM dd') : 'Draft'}</span>
          </div>

          {/* Action Buttons */}
          {canEdit && (
            <div className="flex items-center gap-1 ml-2 border-l pl-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                title="Edit notice"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                title="Delete notice"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
