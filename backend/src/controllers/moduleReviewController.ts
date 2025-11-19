import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { moduleReviewService } from '../services/moduleReviewService';

const prisma = new PrismaClient();

/**
 * Submit or update a module review/rating
 * POST /api/v1/modules/:moduleId/reviews
 */
export const submitReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id: moduleId } = req.params;
    const { rating, comment } = req.body;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const result = await moduleReviewService.submitReview(moduleId, studentId, {
      rating: parseInt(rating),
      comment: comment || null
    });

    return res.status(200).json({
      success: true,
      message: result.isNew ? 'Review submitted successfully' : 'Review updated successfully',
      data: result.review
    });

  } catch (error: any) {
    console.error('Error submitting review:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit review'
    });
  }
};

/**
 * Get current user's review for a module
 * GET /api/v1/modules/:moduleId/reviews/my
 */
export const getMyReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id: moduleId } = req.params;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const review = await moduleReviewService.getStudentReview(moduleId, studentId);

    return res.status(200).json({
      success: true,
      data: review
    });

  } catch (error: any) {
    console.error('Error getting user review:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get review'
    });
  }
};

/**
 * Get all reviews for a module with pagination
 * GET /api/v1/modules/:moduleId/reviews
 */
export const getModuleReviews = async (req: Request, res: Response) => {
  try {
    const { id: moduleId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await moduleReviewService.getModuleReviews(moduleId, page, limit);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Error getting module reviews:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get reviews'
    });
  }
};

/**
 * Get module rating statistics
 * GET /api/v1/modules/:moduleId/reviews/stats
 */
export const getModuleRatingStats = async (req: Request, res: Response) => {
  try {
    const { id: moduleId } = req.params;

    const stats = await moduleReviewService.getModuleRatingStats(moduleId);

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Error getting rating stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rating statistics'
    });
  }
};

/**
 * Delete current user's review
 * DELETE /api/v1/modules/:moduleId/reviews/my
 */
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id: moduleId } = req.params;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    await moduleReviewService.deleteReview(moduleId, studentId);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete review'
    });
  }
};

export const toggleReviewVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const { id: moduleId, reviewId } = req.params;
    const { isPublished } = req.body;
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const updatedReview = await moduleReviewService.toggleReviewVisibility(moduleId, reviewId, isPublished, teacherId);

    return res.status(200).json({
      success: true,
      message: `Review ${isPublished ? 'published' : 'hidden'} successfully`,
      data: updatedReview
    });

  } catch (error: any) {
    console.error('Error toggling review visibility:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update review visibility'
    });
  }
};

/**
 * Get module reviews for teacher (includes hidden reviews)
 */
export const getTeacherModuleReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: moduleId } = req.params;
    const teacherId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string; // 'visible', 'hidden', or 'all'
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'newest';

    // Verify teacher owns this module
    const teacherModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        teacherId: teacherId
      }
    });

    if (!teacherModule) {
      res.status(403).json({
        success: false,
        message: 'You can only view reviews for your own modules'
      });
      return;
    }

    // Build where clause based on filters
    const whereClause: any = {
      moduleId
    };

    // Filter by status
    if (status === 'visible') {
      whereClause.isPublished = true;
    } else if (status === 'hidden') {
      whereClause.isPublished = false;
    }

    // Filter by search term
    if (search) {
      whereClause.OR = [
        {
          comment: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          student: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Build order clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      default: // newest
        orderBy = { createdAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      prisma.moduleReview.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.moduleReview.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const result = {
      reviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error getting teacher module reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get module reviews'
    });
  }
};