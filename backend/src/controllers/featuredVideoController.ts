import { Request, Response } from 'express';
import { featuredVideoService } from '../services/featuredVideoService';
import { z } from 'zod';

// Validation schemas
const updateFeaturedVideoSchema = z.object({
  featuredVideoUrl: z.string().url().nullable().optional(),
  featuredVideoTitle: z.string().min(1).max(200).nullable().optional(),
  featuredVideoDescription: z.string().max(500).nullable().optional(),
});

/**
 * Controller for managing featured videos in modules
 */
export class FeaturedVideoController {

  /**
   * Get the current featured video for a module
   * GET /api/v1/modules/:moduleId/featured-video
   */
  async getModuleFeaturedVideo(req: Request, res: Response): Promise<any> {
    try {
      const { moduleId } = req.params;

      if (!moduleId) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required',
        });
      }

      const result = await featuredVideoService.getModuleFeaturedVideo(moduleId);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);

    } catch (error) {
      console.error('Error in getModuleFeaturedVideo:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update the featured video for a module (Teacher only)
   * PUT /api/v1/modules/:moduleId/featured-video
   */
  async updateModuleFeaturedVideo(req: Request, res: Response): Promise<any> {
    try {
      const { moduleId } = req.params;
      
      if (!moduleId) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required',
        });
      }

      // Validate request body
      const validationResult = updateFeaturedVideoSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.issues,
        });
      }

      const result = await featuredVideoService.updateModuleFeaturedVideo(
        moduleId,
        validationResult.data
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);

    } catch (error) {
      console.error('Error in updateModuleFeaturedVideo:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all active live classes affecting featured videos
   * GET /api/v1/featured-videos/active-live-classes
   */
  async getActiveLiveClasses(req: Request, res: Response): Promise<any> {
    try {
      const result = await featuredVideoService.getActiveLiveClasses();
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);

    } catch (error) {
      console.error('Error in getActiveLiveClasses:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get YouTube embed URL for a given YouTube URL
   * POST /api/v1/featured-videos/youtube-embed
   */
  async getYouTubeEmbedUrl(req: Request, res: Response): Promise<any> {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'YouTube URL is required',
        });
      }

      const embedUrl = featuredVideoService.getYouTubeEmbedUrl(url);
      const videoId = featuredVideoService.extractYouTubeVideoId(url);

      if (!embedUrl || !videoId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL',
        });
      }

      res.json({
        success: true,
        message: 'YouTube embed URL generated',
        data: {
          originalUrl: url,
          embedUrl,
          videoId,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        },
      });

    } catch (error) {
      console.error('Error in getYouTubeEmbedUrl:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const featuredVideoController = new FeaturedVideoController();