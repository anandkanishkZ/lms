'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Notice } from '@/services/notice-api.service';
import { Calendar, Clock, Download, Eye, Pin, User } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';

interface NoticeDetailModalProps {
  notice: Notice;
  open: boolean;
  onClose: () => void;
  onMarkAsRead?: (noticeId: string) => void;
}

const categoryIcons = {
  EXAM: '📝',
  EVENT: '🎉',
  HOLIDAY: '🏖️',
  GENERAL: '📢',
};

const priorityColors = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

export default function NoticeDetailModal({
  notice,
  open,
  onClose,
  onMarkAsRead,
}: NoticeDetailModalProps) {
  const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date();

  const handleDownloadAttachment = () => {
    if (notice.attachmentUrl) {
      window.open(notice.attachmentUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Header with category and priority */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{categoryIcons[notice.category]}</span>
            <Badge variant="outline">{notice.category}</Badge>
            <Badge className={`${priorityColors[notice.priority]} text-white`}>
              {notice.priority}
            </Badge>
            {notice.isPinned && <Pin className="w-4 h-4 text-yellow-600 fill-yellow-400" />}
            {!notice.isRead && (
              <Badge variant="destructive" className="ml-auto">
                New
              </Badge>
            )}
          </div>

          <DialogTitle className="text-2xl">{notice.title}</DialogTitle>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={notice.publishedByUser.profileImage} />
                <AvatarFallback>
                  {notice.publishedByUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{notice.publishedByUser.name}</span>
              <Badge variant="secondary" className="text-xs">
                {notice.publishedByUser.role}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {notice.publishedAt
                  ? format(new Date(notice.publishedAt), 'MMM dd, yyyy • hh:mm a')
                  : 'Draft'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{notice.viewCount} views</span>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="mt-6 space-y-6">
          {/* Targeting Information */}
          {(notice.class || notice.batch || notice.module || notice.targetRole) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Targeted To:</h4>
              <div className="flex flex-wrap gap-2">
                {notice.class && (
                  <Badge variant="secondary">📚 Class: {notice.class.name}</Badge>
                )}
                {notice.batch && (
                  <Badge variant="secondary">🎓 Batch: {notice.batch.name}</Badge>
                )}
                {notice.module && (
                  <Badge variant="secondary">📖 Module: {notice.module.title}</Badge>
                )}
                {notice.targetRole && (
                  <Badge variant="secondary">👥 Role: {notice.targetRole}</Badge>
                )}
                {!notice.class && !notice.batch && !notice.module && !notice.targetRole && (
                  <Badge variant="secondary">🌍 All Users (Global)</Badge>
                )}
              </div>
            </div>
          )}

          {/* Expiration */}
          {notice.expiresAt && (
            <div
              className={`p-4 rounded-lg border flex items-center gap-2 ${
                isExpired
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-orange-50 border-orange-200 text-orange-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isExpired
                  ? `Expired on ${format(new Date(notice.expiresAt), 'MMM dd, yyyy')}`
                  : `Expires on ${format(new Date(notice.expiresAt), 'MMM dd, yyyy')}`}
              </span>
            </div>
          )}

          {/* Notice Content */}
          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {notice.content}
            </div>
          </div>

          {/* Attachment */}
          {notice.attachmentUrl && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Attachment</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAttachment}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Attachment
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t">
          {!notice.isRead && onMarkAsRead ? (
            <Button
              variant="outline"
              onClick={() => {
                onMarkAsRead(notice.id);
                onClose();
              }}
            >
              Mark as Read
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
