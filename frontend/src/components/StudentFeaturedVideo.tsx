'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Play,
} from 'lucide-react';
import { featuredVideoService, FeaturedVideo } from '@/src/services/featured-video.service';
import { showErrorToast } from '@/src/utils/toast.util';

interface StudentFeaturedVideoProps {
  moduleId: string;
}

export function StudentFeaturedVideo({ moduleId }: StudentFeaturedVideoProps) {
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    loadFeaturedVideo();
    
    // Set up auto-refresh to check for live class changes every 30 seconds
    const interval = setInterval(() => {
      loadFeaturedVideo();
    }, 30000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [moduleId]);

  const loadFeaturedVideo = async () => {
    try {
      if (!loading) setLoading(true);
      
      const response = await featuredVideoService.getModuleFeaturedVideo(moduleId);
      
      if (response.data.success) {
        setFeaturedVideo(response.data.data);
      } else {
        setFeaturedVideo(null);
      }
    } catch (error) {
      console.error('Failed to load featured video:', error);
      showErrorToast('Failed to load featured video');
      setFeaturedVideo(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVideo = () => {
    setShowPlayer(true);
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
  };

  const getYouTubeThumbnail = (url: string): string | null => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden shadow-sm border-2 border-red-500">
        <div className="aspect-video bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
        </div>
      </div>
    );
  }

  if (!featuredVideo || featuredVideo.type === 'none' || !featuredVideo.videoUrl) {
    return (
      <div className="rounded-xl overflow-hidden shadow-sm border-2 border-red-500">
        <div className="aspect-video bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Featured Video</p>
            <p className="text-sm opacity-75">No video set for this module</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border-2 border-red-500">
      <div className="aspect-video bg-gray-900 relative">
        {showPlayer ? (
          <iframe
            src={getYouTubeEmbedUrl(featuredVideo.videoUrl) || ''}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
            title={featuredVideo.title}
          />
        ) : (
          <>
            <img
              src={getYouTubeThumbnail(featuredVideo.videoUrl) || '/placeholder-video.jpg'}
              alt={featuredVideo.title}
              className="w-full h-full object-cover"
            />
            
            <div 
              className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer group"
              onClick={handlePlayVideo}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
              >
                <Play className="w-8 h-8 text-[#2563eb] ml-1" fill="currentColor" />
              </motion.div>
            </div>
            
            {featuredVideo.isLive && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StudentFeaturedVideo;