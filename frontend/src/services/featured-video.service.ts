import { apiClient } from './api-client';

export interface FeaturedVideo {
  type: 'live' | 'featured' | 'none';
  isLive: boolean;
  videoUrl: string | null;
  title: string;
  description: string;
  moduleId?: string;
  liveClassId?: string | null;
  startTime?: string;
  endTime?: string;
}

export interface UpdateFeaturedVideoData {
  featuredVideoUrl?: string | null;
  featuredVideoTitle?: string | null;
  featuredVideoDescription?: string | null;
}

export interface YouTubeEmbedData {
  originalUrl: string;
  embedUrl: string;
  videoId: string;
  thumbnailUrl: string;
}

export const featuredVideoService = {
  /**
   * Get the current featured video for a module
   * This will return live class video if active, otherwise module's featured video
   */
  async getModuleFeaturedVideo(moduleId: string) {
    return apiClient.get<{
      success: boolean;
      message: string;
      data: FeaturedVideo;
    }>(`/modules/${moduleId}/featured-video`);
  },

  /**
   * Update the featured video for a module (Teacher only)
   */
  async updateModuleFeaturedVideo(moduleId: string, data: UpdateFeaturedVideoData) {
    return apiClient.put<{
      success: boolean;
      message: string;
      data: {
        id: string;
        title: string;
        featuredVideoUrl: string | null;
        featuredVideoTitle: string | null;
        featuredVideoDescription: string | null;
      };
    }>(`/modules/${moduleId}/featured-video`, data);
  },

  /**
   * Get all active live classes that affect featured videos
   */
  async getActiveLiveClasses() {
    return apiClient.get<{
      success: boolean;
      message: string;
      data: Array<{
        id: string;
        title: string;
        youtubeUrl: string;
        moduleId: string;
        startTime: string;
        endTime: string;
        module: {
          id: string;
          title: string;
        };
      }>;
    }>('/featured-videos/active-live-classes');
  },

  /**
   * Get YouTube embed URL for a given YouTube URL
   */
  async getYouTubeEmbedUrl(url: string) {
    return apiClient.post<{
      success: boolean;
      message: string;
      data: YouTubeEmbedData;
    }>('/featured-videos/youtube-embed', { url });
  },

  /**
   * Utility function to validate YouTube URL format (client-side)
   */
  validateYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+(&[\w=]*)?$/;
    return youtubeRegex.test(url);
  },

  /**
   * Extract YouTube video ID from URL (client-side)
   */
  extractYouTubeVideoId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  },

  /**
   * Get YouTube thumbnail URL
   */
  getYouTubeThumbnailUrl(url: string): string | null {
    const videoId = this.extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  },
};