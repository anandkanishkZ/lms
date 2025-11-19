import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service to handle featured video functionality for modules
 * Manages switching between teacher-set featured videos and live class streams
 */
export class FeaturedVideoService {

  /**
   * Get the current featured video for a module
   * Returns live class video if there's an active live class, otherwise returns the module's featured video
   */
  async getModuleFeaturedVideo(moduleId: string) {
    try {
      // Get the module with its featured video info
      const module = await prisma.module.findUnique({
        where: { id: moduleId },
        select: {
          id: true,
          title: true,
          featuredVideoUrl: true,
          featuredVideoTitle: true,
          featuredVideoDescription: true,
        },
      });

      if (!module) {
        return {
          success: false,
          message: 'Module not found',
          data: null,
        };
      }

      // Check for active live classes for this module
      const activeLiveClass = await prisma.liveClass.findFirst({
        where: {
          moduleId: moduleId,
          status: 'LIVE',
        },
        select: {
          id: true,
          title: true,
          description: true,
          youtubeUrl: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      });

      // If there's an active live class with YouTube URL, prioritize it
      if (activeLiveClass && activeLiveClass.youtubeUrl) {
        return {
          success: true,
          message: 'Live class video retrieved',
          data: {
            type: 'live',
            isLive: true,
            videoUrl: activeLiveClass.youtubeUrl,
            title: `🔴 LIVE: ${activeLiveClass.title}`,
            description: activeLiveClass.description || 'Live class is currently in progress',
            liveClassId: activeLiveClass.id,
            startTime: activeLiveClass.startTime,
            endTime: activeLiveClass.endTime,
          },
        };
      }

      // If no active live class, return the module's featured video
      if (module.featuredVideoUrl) {
        return {
          success: true,
          message: 'Module featured video retrieved',
          data: {
            type: 'featured',
            isLive: false,
            videoUrl: module.featuredVideoUrl,
            title: module.featuredVideoTitle || module.title,
            description: module.featuredVideoDescription || 'Featured video for this module',
            moduleId: module.id,
            liveClassId: null,
          },
        };
      }

      // No featured video or live class
      return {
        success: true,
        message: 'No featured video available',
        data: {
          type: 'none',
          isLive: false,
          videoUrl: null,
          title: module.title,
          description: 'No featured video set for this module',
          moduleId: module.id,
          liveClassId: null,
        },
      };

    } catch (error) {
      console.error('Error in getModuleFeaturedVideo:', error);
      return {
        success: false,
        message: 'Failed to get featured video',
        data: null,
      };
    }
  }

  /**
   * Update the featured video for a module (teacher only)
   */
  async updateModuleFeaturedVideo(
    moduleId: string,
    videoData: {
      featuredVideoUrl?: string | null;
      featuredVideoTitle?: string | null;
      featuredVideoDescription?: string | null;
    }
  ) {
    try {
      // Validate YouTube URL if provided
      if (videoData.featuredVideoUrl) {
        const isValidYouTubeUrl = this.validateYouTubeUrl(videoData.featuredVideoUrl);
        if (!isValidYouTubeUrl) {
          return {
            success: false,
            message: 'Invalid YouTube URL format',
            data: null,
          };
        }
      }

      const updatedModule = await prisma.module.update({
        where: { id: moduleId },
        data: {
          featuredVideoUrl: videoData.featuredVideoUrl,
          featuredVideoTitle: videoData.featuredVideoTitle,
          featuredVideoDescription: videoData.featuredVideoDescription,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          featuredVideoUrl: true,
          featuredVideoTitle: true,
          featuredVideoDescription: true,
        },
      });

      return {
        success: true,
        message: 'Featured video updated successfully',
        data: updatedModule,
      };

    } catch (error) {
      console.error('Error in updateModuleFeaturedVideo:', error);
      return {
        success: false,
        message: 'Failed to update featured video',
        data: null,
      };
    }
  }

  /**
   * Get all active live classes that affect featured videos
   */
  async getActiveLiveClasses() {
    try {
      const activeLiveClasses = await prisma.liveClass.findMany({
        where: {
          status: 'LIVE',
          youtubeUrl: { not: null },
        },
        select: {
          id: true,
          title: true,
          youtubeUrl: true,
          moduleId: true,
          startTime: true,
          endTime: true,
          module: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Active live classes retrieved',
        data: activeLiveClasses,
      };

    } catch (error) {
      console.error('Error in getActiveLiveClasses:', error);
      return {
        success: false,
        message: 'Failed to get active live classes',
        data: null,
      };
    }
  }

  /**
   * Validate YouTube URL format
   */
  private validateYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+(&[\w=]*)?$/;
    return youtubeRegex.test(url);
  }

  /**
   * Extract YouTube video ID from URL
   */
  extractYouTubeVideoId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }

  /**
   * Convert YouTube URL to embeddable format
   */
  getYouTubeEmbedUrl(url: string): string | null {
    const videoId = this.extractYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` : null;
  }
}

export const featuredVideoService = new FeaturedVideoService();