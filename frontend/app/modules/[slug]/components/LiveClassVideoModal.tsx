'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Users, Calendar, Clock, User, Loader2 } from 'lucide-react';
import { LiveClass } from '@/src/services/live-class-api.service';
import { liveClassApiService } from '@/src/services/live-class-api.service';

interface LiveClassVideoModalProps {
  liveClass: LiveClass | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LiveClassVideoModal({ liveClass, isOpen, onClose }: LiveClassVideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
      
      // Handle ESC key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!liveClass || !liveClass.youtubeUrl) return null;

  const videoId = liveClassApiService.extractYouTubeId(liveClass.youtubeUrl);
  if (!videoId) return null;

  const embedUrl = liveClassApiService.getYouTubeEmbedUrl(videoId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-7xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700/50">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status Badge */}
                  {liveClass.status === 'LIVE' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full mb-3">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Live Now
                      </span>
                    </div>
                  )}
                  
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
                    {liveClass.title}
                  </h2>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                    {liveClass.teacher && (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-700/50 rounded-lg">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{liveClass.teacher.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-700/50 rounded-lg">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span>{formatDate(liveClass.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-700/50 rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span>{formatTime(liveClass.startTime)}</span>
                    </div>

                    {liveClass._count && (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-700/50 rounded-lg">
                          <Users className="w-4 h-4" />
                        </div>
                        <span>{liveClass._count.attendances} attendees</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={liveClass.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-2.5 hover:bg-gray-700/50 rounded-xl transition-all text-gray-400 hover:text-white"
                    title="Open in YouTube"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={onClose}
                    className="group p-2.5 hover:bg-red-600/20 rounded-xl transition-all text-gray-400 hover:text-red-400"
                    title="Close (ESC)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Player Container */}
            <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Loading video...</p>
                  </div>
                </div>
              )}

              {/* YouTube Iframe */}
              <iframe
                src={`${embedUrl}&autoplay=1`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={liveClass.title}
                onLoad={() => setIsLoading(false)}
              />
            </div>

            {/* Description Section */}
            {liveClass.description && (
              <div className="px-8 py-6 bg-gray-800/50 border-t border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                  About This Class
                </h4>
                <p className="text-gray-400 text-base leading-relaxed">
                  {liveClass.description}
                </p>
              </div>
            )}

            {/* Footer Hint */}
            <div className="px-8 py-4 bg-gray-900/80 border-t border-gray-700/50">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono">
                  ESC
                </kbd>
                <span>to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
