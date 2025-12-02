'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  PartyPopper, 
  Megaphone, 
  Palmtree,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { Notice } from '@/src/services/notice-api.service';

interface StudentNoticeCardProps {
  notice: Notice;
  onMarkAsRead: (id: string) => void;
}

// Category icons and colors
const categoryConfig = {
  EXAM: { icon: FileText, color: 'bg-orange-100 text-orange-600', label: 'Exam' },
  EVENT: { icon: PartyPopper, color: 'bg-purple-100 text-purple-600', label: 'Event' },
  HOLIDAY: { icon: Palmtree, color: 'bg-green-100 text-green-600', label: 'Holiday' },
  GENERAL: { icon: Megaphone, color: 'bg-blue-100 text-blue-600', label: 'General' },
};

// Priority colors
const priorityColors = {
  LOW: 'border-gray-200 bg-white',
  MEDIUM: 'border-blue-200 bg-blue-50',
  HIGH: 'border-orange-200 bg-orange-50',
  URGENT: 'border-red-300 bg-red-50',
};

export default function StudentNoticeCard({ notice, onMarkAsRead }: StudentNoticeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const config = categoryConfig[notice.category as keyof typeof categoryConfig] || categoryConfig.GENERAL;
  const Icon = config.icon;
  const priorityColor = priorityColors[notice.priority as keyof typeof priorityColors] || priorityColors.MEDIUM;

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notice.id);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!notice.isRead) {
      onMarkAsRead(notice.id);
    }
  };

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
    if (!notice.isRead) {
      onMarkAsRead(notice.id);
    }
  };

  return (
    <>
      {/* Notice Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border-2 transition-all duration-200 hover:shadow-md ${priorityColor} ${
          !notice.isRead ? 'border-l-4 border-l-blue-600' : ''
        }`}
      >
        {/* Card Header - Always Visible */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Category Icon */}
            <div className={`mt-1 rounded-lg p-2 ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and Badges */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                    {notice.priority === 'URGENT' && (
                      <span className="px-2 py-0.5 bg-red-600 text-white rounded text-xs font-semibold animate-pulse">
                        URGENT
                      </span>
                    )}
                    {notice.priority === 'HIGH' && (
                      <span className="px-2 py-0.5 bg-orange-600 text-white rounded text-xs font-semibold">
                        HIGH
                      </span>
                    )}
                    {!notice.isRead && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-semibold">
                        NEW
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {notice.title}
                  </h3>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{notice.publishedByUser?.name || 'Admin User'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(notice.publishedAt || notice.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {/* Preview Text (only when collapsed) */}
              {!isExpanded && (
                <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                  {notice.content}
                </p>
              )}

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-4 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {notice.content}
                      </p>
                      
                      {notice.attachmentUrl && (
                        <a
                          href={notice.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Attachment
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={toggleExpand}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Read Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Read More
                    </>
                  )}
                </button>

                {!notice.isRead ? (
                  <button
                    onClick={handleMarkAsRead}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Mark as read
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Read
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b ${config.color}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-3 bg-white ${config.color.replace('bg-', 'text-')}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-white rounded text-xs font-semibold">
                          {config.label}
                        </span>
                        {notice.priority === 'URGENT' && (
                          <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold">
                            URGENT
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {notice.title}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Meta Info */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{notice.publishedByUser?.name || 'Admin User'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(notice.publishedAt || notice.createdAt), 'MMMM dd, yyyy')}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                {/* Attachment */}
                {notice.attachmentUrl && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a
                      href={notice.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Attachment
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
                {!notice.isRead ? (
                  <button
                    onClick={handleMarkAsRead}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Mark as read
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Already Read
                  </span>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="ml-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
