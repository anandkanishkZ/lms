'use client';

import { useState, useEffect } from 'react';
import { Play, AlertCircle, Loader2 } from 'lucide-react';
import { liveClassApiService } from '@/src/services/live-class-api.service';

interface YouTubePreviewProps {
  url: string;
  className?: string;
  showThumbnail?: boolean;
  autoplay?: boolean;
}

export function YouTubePreview({
  url,
  className = '',
  showThumbnail = false,
  autoplay = false,
}: YouTubePreviewProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!url) {
      setVideoId(null);
      setError('');
      return;
    }

    const id = liveClassApiService.extractYouTubeId(url);
    if (id) {
      setVideoId(id);
      setError('');
    } else {
      setVideoId(null);
      setError('Invalid YouTube URL');
    }
  }, [url]);

  if (!url) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center p-12 ${className}`}>
        <div className="text-center">
          <Play className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Enter a YouTube URL to see preview</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center p-12 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <p className="text-xs text-red-500 mt-1">Please check the URL format</p>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center p-12 ${className}`}>
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  const embedUrl = liveClassApiService.getYouTubeEmbedUrl(videoId);
  const thumbnailUrl = liveClassApiService.getYouTubeThumbnail(videoId);

  if (showThumbnail && !isPlaying) {
    return (
      <div className={`relative rounded-lg overflow-hidden cursor-pointer group ${className}`}>
        <img
          src={thumbnailUrl}
          alt="YouTube Thumbnail"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default thumbnail if maxresdefault doesn't exist
            const target = e.target as HTMLImageElement;
            target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(true)}
            className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden bg-black ${className}`}>
      <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
        <iframe
          src={`${embedUrl}${autoplay || isPlaying ? '?autoplay=1' : ''}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
}

// Compact preview for list items
export function YouTubeCompactPreview({ url }: { url: string }) {
  const videoId = url ? liveClassApiService.extractYouTubeId(url) : null;
  const thumbnailUrl = videoId ? liveClassApiService.getYouTubeThumbnail(videoId) : null;

  if (!thumbnailUrl) {
    return (
      <div className="w-32 h-18 bg-gray-100 rounded flex items-center justify-center">
        <Play className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-32 h-18 rounded overflow-hidden group">
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }}
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <Play className="w-6 h-6 text-white" fill="white" />
      </div>
    </div>
  );
}
