import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Module Review Service
 * Handles rating and review functionality for modules
 */
export class ModuleReviewService {

  /**
   * Submit or update a module review
   */
  async submitReview(moduleId: string, studentId: string, data: {
    rating: number;
    comment?: string | null;
  }) {
    try {
      // Verify student is enrolled in the module
      const enrollment = await prisma.moduleEnrollment.findFirst({
        where: {
          moduleId,
          studentId
        }
      });

      if (!enrollment) {
        throw new Error('You must be enrolled in this module to leave a review');
      }

      // Check if review already exists
      const existingReview = await prisma.moduleReview.findUnique({
        where: {
          moduleId_studentId: {
            moduleId,
            studentId
          }
        }
      });

      let review;
      let isNew = false;

      if (existingReview) {
        // Update existing review
        review = await prisma.moduleReview.update({
          where: {
            id: existingReview.id
          },
          data: {
            rating: data.rating,
            comment: data.comment,
            updatedAt: new Date()
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          }
        });
      } else {
        // Create new review
        review = await prisma.moduleReview.create({
          data: {
            moduleId,
            studentId,
            rating: data.rating,
            comment: data.comment
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          }
        });
        isNew = true;
      }

      // Recalculate module average rating
      await this.updateModuleRating(moduleId);

      return { review, isNew };

    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  /**
   * Get student's review for a module
   */
  async getStudentReview(moduleId: string, studentId: string) {
    try {
      const review = await prisma.moduleReview.findUnique({
        where: {
          moduleId_studentId: {
            moduleId,
            studentId
          }
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          }
        }
      });

      return review;

    } catch (error) {
      console.error('Error getting student review:', error);
      throw error;
    }
  }

  /**
   * Get all reviews for a module with pagination
   */
  async getModuleReviews(moduleId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [reviews, totalCount] = await Promise.all([
        prisma.moduleReview.findMany({
          where: {
            moduleId,
            isPublished: true
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.moduleReview.count({
          where: {
            moduleId,
            isPublished: true
          }
        })
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
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

    } catch (error) {
      console.error('Error getting module reviews:', error);
      throw error;
    }
  }

  /**
   * Get module rating statistics
   */
  async getModuleRatingStats(moduleId: string) {
    try {
      const stats = await prisma.moduleReview.groupBy({
        by: ['rating'],
        where: {
          moduleId,
          isPublished: true
        },
        _count: {
          rating: true
        }
      });

      const module = await prisma.module.findUnique({
        where: { id: moduleId },
        select: {
          avgRating: true,
          _count: {
            select: {
              reviews: {
                where: {
                  isPublished: true
                }
              }
            }
          }
        }
      });

      // Convert to rating distribution
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
        const found = stats.find(stat => stat.rating === rating);
        return {
          rating,
          count: found?._count.rating || 0
        };
      });

      return {
        averageRating: module?.avgRating || 0,
        totalReviews: module?._count.reviews || 0,
        ratingDistribution
      };

    } catch (error) {
      console.error('Error getting rating stats:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(moduleId: string, studentId: string) {
    try {
      const review = await prisma.moduleReview.findUnique({
        where: {
          moduleId_studentId: {
            moduleId,
            studentId
          }
        }
      });

      if (!review) {
        throw new Error('Review not found');
      }

      await prisma.moduleReview.delete({
        where: {
          id: review.id
        }
      });

      // Recalculate module average rating
      await this.updateModuleRating(moduleId);

    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Update module average rating
   * Called after review create/update/delete operations
   */
  private async updateModuleRating(moduleId: string) {
    try {
      const result = await prisma.moduleReview.aggregate({
        where: {
          moduleId,
          isPublished: true
        },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      });

      const avgRating = result._avg.rating || 0;

      await prisma.module.update({
        where: { id: moduleId },
        data: {
          avgRating: Math.round(avgRating * 10) / 10 // Round to 1 decimal place
        }
      });

    } catch (error) {
      console.error('Error updating module rating:', error);
      // Don't throw error here as this is a background operation
    }
  }

  /**
   * Check if student can review module (enrolled and not already reviewed)
   */
  async canStudentReview(moduleId: string, studentId: string) {
    try {
      const [enrollment, existingReview] = await Promise.all([
        prisma.moduleEnrollment.findFirst({
          where: {
            moduleId,
            studentId
          }
        }),
        prisma.moduleReview.findUnique({
          where: {
            moduleId_studentId: {
              moduleId,
              studentId
            }
          }
        })
      ]);

      return {
        canReview: !!enrollment,
        hasReviewed: !!existingReview,
        enrollment,
        existingReview
      };

    } catch (error) {
      console.error('Error checking review eligibility:', error);
      throw error;
    }
  }

  /**
   * Toggle review visibility (Teacher/Admin only)
   */
  async toggleReviewVisibility(moduleId: string, reviewId: string, isPublished: boolean, teacherId: string) {
    try {
      // Verify teacher owns this module
      const module = await prisma.module.findFirst({
        where: {
          id: moduleId,
          teacherId: teacherId
        }
      });

      if (!module) {
        throw new Error('You do not have permission to manage reviews for this module');
      }

      // Verify review exists and belongs to this module
      const review = await prisma.moduleReview.findFirst({
        where: {
          id: reviewId,
          moduleId: moduleId
        }
      });

      if (!review) {
        throw new Error('Review not found');
      }

      // Update review visibility
      const updatedReview = await prisma.moduleReview.update({
        where: {
          id: reviewId
        },
        data: {
          isPublished: isPublished,
          updatedAt: new Date()
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          }
        }
      });

      // Recalculate module rating (only published reviews)
      await this.updateModuleRating(moduleId);

      return updatedReview;

    } catch (error) {
      console.error('Error toggling review visibility:', error);
      throw error;
    }
  }
}

export const moduleReviewService = new ModuleReviewService();