'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  MoreVertical,
  ExternalLink,
  Video,
  CheckCircle,
  XCircle,
  Radio,
} from 'lucide-react';
import { LiveClass } from '@/src/services/live-class-api.service';
import { YouTubeCompactPreview } from './YouTubePreview';

interface LiveClassCardProps {
  liveClass: LiveClass;
  onEdit: (liveClass: LiveClass) => void;
  onDelete: (id: string) => void;
  onView?: (liveClass: LiveClass) => void;
}

export function LiveClassCard({ liveClass, onEdit, onDelete, onView }: LiveClassCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          icon: <Calendar className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Scheduled',
        };
      case 'LIVE':
        return {
          icon: <Radio className="w-4 h-4 animate-pulse" />,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Live Now',
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Completed',
        };
      case 'CANCELLED':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Cancelled',
        };
      default:
        return {
          icon: <Calendar className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status,
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = () => {
    if (!liveClass.endTime) {
      return null; // No duration if endTime is not set
    }
    
    const start = new Date(liveClass.startTime);
    const end = new Date(liveClass.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} mins`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const isUpcoming = () => {
    const now = new Date();
    const startTime = new Date(liveClass.startTime);
    return startTime > now && (liveClass.status === 'SCHEDULED' || liveClass.status === 'LIVE');
  };

  const isLive = () => {
    const now = new Date();
    const startTime = new Date(liveClass.startTime);
    const endTime = liveClass.endTime ? new Date(liveClass.endTime) : null;
    
    if (!endTime) {
      return now >= startTime && (liveClass.status === 'LIVE' || liveClass.status === 'SCHEDULED');
    }
    
    return now >= startTime && now <= endTime && (liveClass.status === 'LIVE' || liveClass.status === 'SCHEDULED');
  };

  const isCompleted = () => {
    const now = new Date();
    const endTime = liveClass.endTime ? new Date(liveClass.endTime) : null;
    
    if (endTime && now > endTime) {
      return true;
    }
    
    return liveClass.status === 'COMPLETED';
  };

  const getActualStatus = () => {
    if (isCompleted()) return 'COMPLETED';
    if (isLive()) return 'LIVE';
    if (isUpcoming()) return 'SCHEDULED';
    return liveClass.status;
  };

  const statusInfo = getStatusInfo(getActualStatus());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
        liveClass.status === 'LIVE' 
          ? 'border-red-300 shadow-md' 
          : 'border-gray-200 hover:border-[#2563eb]'
      }`}
    >
      <div className="p-5">
        <div className="flex gap-4">
          {/* YouTube Thumbnail */}
          {liveClass.youtubeUrl && (
            <div className="flex-shrink-0">
              <YouTubeCompactPreview url={liveClass.youtubeUrl} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {liveClass.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                  {isUpcoming() && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                    >
                      {liveClass.youtubeUrl && (
                        <a
                          href={liveClass.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                          onClick={() => setShowMenu(false)}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open YouTube
                        </a>
                      )}
                      <button
                        onClick={() => {
                          onEdit(liveClass);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this live class?')) {
                            onDelete(liveClass.id);
                          }
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {liveClass.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {liveClass.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(liveClass.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>
                  {formatTime(liveClass.startTime)}
                  {liveClass.endTime && (
                    <>
                      {' '}- {formatTime(liveClass.endTime)}
                      <span className="text-xs text-gray-500 ml-1">({getDuration()})</span>
                    </>
                  )}
                </span>
              </div>
              {liveClass._count && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{liveClass._count.attendances} attendees</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Indicator */}
        {liveClass.status === 'LIVE' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-red-800">
                  Live class is in progress
                </span>
              </div>
              {liveClass.youtubeUrl && (
                <a
                  href={liveClass.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Join Now
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
