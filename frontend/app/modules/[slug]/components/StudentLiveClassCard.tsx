'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Video,
  CheckCircle,
  XCircle,
  Radio,
  User,
  PlayCircle,
  AlertCircle,
  Maximize2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { LiveClass } from '@/src/services/live-class-api.service';
import { liveClassApiService } from '@/src/services/live-class-api.service';

interface StudentLiveClassCardProps {
  liveClass: LiveClass;
  moduleName?: string;
  onWatch?: (liveClass: LiveClass) => void;
}

export function StudentLiveClassCard({ liveClass, moduleName, onWatch }: StudentLiveClassCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const videoId = liveClass.youtubeUrl 
    ? liveClassApiService.extractYouTubeId(liveClass.youtubeUrl)
    : null;
  
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : '/placeholder-video.jpg';

  const embedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : null;

  // Countdown timer effect
  useEffect(() => {
    if (!isUpcoming()) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const startTime = new Date(liveClass.startTime).getTime();
      const distance = startTime - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [liveClass.startTime]);
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          icon: <Calendar className="w-3.5 h-3.5" />,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Scheduled',
          dotColor: 'bg-blue-500',
        };
      case 'LIVE':
        return {
          icon: <Radio className="w-3.5 h-3.5" />,
          color: 'bg-red-50 text-red-700 border-red-200',
          label: 'Live Now',
          dotColor: 'bg-red-500',
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          color: 'bg-green-50 text-green-700 border-green-200',
          label: 'Completed',
          dotColor: 'bg-green-500',
        };
      case 'CANCELLED':
        return {
          icon: <XCircle className="w-3.5 h-3.5" />,
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          label: 'Cancelled',
          dotColor: 'bg-gray-500',
        };
      default:
        return {
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          label: status,
          dotColor: 'bg-gray-500',
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

  const isUpcoming = () => {
    const now = new Date();
    const startTime = new Date(liveClass.startTime);
    return startTime > now && (liveClass.status === 'SCHEDULED' || liveClass.status === 'LIVE');
  };

  const isLive = () => {
    const now = new Date();
    const startTime = new Date(liveClass.startTime);
    const endTime = liveClass.endTime ? new Date(liveClass.endTime) : null;
    
    // If no end time, check if we're past start time and status is LIVE or SCHEDULED
    if (!endTime) {
      return now >= startTime && (liveClass.status === 'LIVE' || liveClass.status === 'SCHEDULED');
    }
    
    // If end time exists, check if we're between start and end time
    return now >= startTime && now <= endTime && (liveClass.status === 'LIVE' || liveClass.status === 'SCHEDULED');
  };

  const isCompleted = () => {
    const now = new Date();
    const endTime = liveClass.endTime ? new Date(liveClass.endTime) : null;
    
    // If end time exists and we're past it, it's completed
    if (endTime && now > endTime) {
      return true;
    }
    
    return liveClass.status === 'COMPLETED';
  };

  // Dynamically determine actual status based on time
  const getActualStatus = () => {
    if (isCompleted()) return 'COMPLETED';
    if (isLive()) return 'LIVE';
    if (isUpcoming()) return 'SCHEDULED';
    return liveClass.status;
  };

  const statusInfo = getStatusInfo(getActualStatus());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group bg-white rounded-xl border-2 transition-all overflow-hidden ${
        liveClass.status === 'LIVE' 
          ? 'border-red-200 shadow-lg shadow-red-100/50 ring-2 ring-red-100' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
      }`}
    >
      {/* Live Top Banner */}
      {isLive() && (
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-white">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-sm font-bold uppercase tracking-wide">
              Class is Live Now
            </span>
          </div>
        </div>
      )}

      <div className="p-5">
        {/* YouTube Layout: Video Left, Details Right */}
        <div className="flex gap-4">
          {/* Video Player - Left Side */}
          {liveClass.youtubeUrl && (
            <div className="flex-shrink-0 w-[320px]">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                {isPlaying && embedUrl ? (
                  // Embedded YouTube Player
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={liveClass.title}
                  />
                ) : (
                  // Thumbnail with Play Button
                  <>
                    <img
                      src={thumbnailUrl}
                      alt={liveClass.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay with Play Button */}
                    <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-all flex items-center justify-center group/play">
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all transform scale-100 group-hover/play:scale-110"
                      >
                        <PlayCircle className="w-8 h-8 text-white fill-white" />
                      </button>
                    </div>

                    {/* LIVE Badge */}
                    {isLive() && (
                      <div className="absolute bottom-2 right-2">
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          LIVE
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Fullscreen Button - Always visible when playing */}
                {isPlaying && (
                  <>
                    <a
                      href={liveClass.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-lg transition-colors z-10"
                      title="Open in YouTube (Fullscreen)"
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                    </a>
                    
                    {/* Fullscreen Hint */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-[10px] font-medium">
                      Press F for fullscreen
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Details - Right Side */}
          <div className="flex-1 min-w-0">
            {/* Title and Status */}
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors cursor-pointer">
                {liveClass.title}
              </h3>
              
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusInfo.color}`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </span>
                
                {isUpcoming() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    <Clock className="w-3.5 h-3.5" />
                    Upcoming
                  </span>
                )}
              </div>
            </div>

            {/* Metadata and Countdown in single row */}
            <div className="flex items-center justify-between gap-4 mb-3">
              {/* Left: Metadata */}
              <div className="space-y-1.5 flex-shrink min-w-0">
                {moduleName && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium truncate">{moduleName}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="whitespace-nowrap">{formatDate(liveClass.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="whitespace-nowrap">{formatTime(liveClass.startTime)}</span>
                  </div>
                </div>

                {liveClass._count && liveClass._count.attendances > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{liveClass._count.attendances} attendees</span>
                  </div>
                )}
              </div>

              {/* Right: Countdown Timer for Upcoming Classes */}
              {isUpcoming() && (
                <div className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="text-center mb-1.5">
                    <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">
                      Starts In
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {countdown.days > 0 && (
                      <>
                        <div className="flex flex-col items-center min-w-[32px]">
                          <div className="text-lg font-bold text-purple-700 leading-none tabular-nums">{countdown.days}</div>
                          <div className="text-[9px] text-purple-600 uppercase mt-0.5 leading-none">Days</div>
                        </div>
                        <span className="text-purple-400 font-bold pb-3">:</span>
                      </>
                    )}
                    {(countdown.days > 0 || countdown.hours > 0) && (
                      <>
                        <div className="flex flex-col items-center min-w-[32px]">
                          <div className="text-lg font-bold text-purple-700 leading-none tabular-nums">{countdown.hours.toString().padStart(2, '0')}</div>
                          <div className="text-[9px] text-purple-600 uppercase mt-0.5 leading-none">Hours</div>
                        </div>
                        <span className="text-purple-400 font-bold pb-3">:</span>
                      </>
                    )}
                    <div className="flex flex-col items-center min-w-[32px]">
                      <div className="text-lg font-bold text-purple-700 leading-none tabular-nums">{countdown.minutes.toString().padStart(2, '0')}</div>
                      <div className="text-[9px] text-purple-600 uppercase mt-0.5 leading-none">Min</div>
                    </div>
                    <span className="text-purple-400 font-bold pb-3">:</span>
                    <div className="flex flex-col items-center min-w-[32px]">
                      <div className="text-lg font-bold text-purple-700 leading-none tabular-nums">{countdown.seconds.toString().padStart(2, '0')}</div>
                      <div className="text-[9px] text-purple-600 uppercase mt-0.5 leading-none">Sec</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {liveClass.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                {liveClass.description}
              </p>
            )}

            {/* Action Buttons */}
            {liveClass.youtubeUrl && (
              <div className="flex items-center gap-2">
                {!isPlaying && (
                  <>
                    {isLive() && (
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Video className="w-4 h-4" />
                        Watch Live
                      </button>
                    )}

                    {isUpcoming() && (
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Preview
                      </button>
                    )}

                    {isCompleted() && (
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Watch Recording
                      </button>
                    )}
                  </>
                )}
                
                {/* Open in YouTube button - Always available */}
                <a
                  href={liveClass.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                  title="Open in YouTube for fullscreen"
                >
                  <ExternalLink className="w-4 h-4" />
                  {isPlaying ? 'Open in YouTube' : 'YouTube'}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
