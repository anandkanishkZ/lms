import { PrismaClient, LessonType } from '@prisma/client';
import { topicService } from './topic.service';
import { moduleService } from './module.service';

const prisma = new PrismaClient();

/**
 * LessonService - Handles all Lesson business logic
 * 
 * Features:
 * - Support all lesson types: VIDEO, YOUTUBE_LIVE, PDF, TEXT, QUIZ, ASSIGNMENT, EXTERNAL_LINK
 * - Manage lesson attachments
 * - YouTube Live session integration
 * - View count tracking
 * - Lesson ordering
 * - Progress integration
 */
class LessonService {
  /**
   * Create a new lesson within a topic
   */
  async createLesson(data: {
    title: string;
    description?: string;
    topicId: string;
    type: LessonType;
    orderIndex?: number;
    duration?: number;
    videoUrl?: string;
    youtubeVideoId?: string;
    content?: string;
    isFree?: boolean;
    isPublished?: boolean;
  }, userId: string) {
    // Verify topic exists and get module info
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
      include: { module: true },
    });

    if (!topic) {
      throw new Error('Topic not found');
    }

    // Check authorization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { id: topic.module.teacherId },
          { role: 'ADMIN' },
        ],
      },
    });

    if (!user) {
      throw new Error('Unauthorized to add lessons to this topic');
    }

    // Validate lesson type specific fields
    this.validateLessonData(data);

    // Get next order index if not provided
    let orderIndex = data.orderIndex;
    if (orderIndex === undefined) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { topicId: data.topicId },
        orderBy: { orderIndex: 'desc' },
      });
      orderIndex = lastLesson ? lastLesson.orderIndex + 1 : 0;
    }

    // Create lesson with transaction
    const lesson = await prisma.$transaction(async (tx) => {
      const newLesson = await tx.lesson.create({
        data: {
          title: data.title,
          description: data.description,
          topicId: data.topicId,
          type: data.type,
          orderIndex,
          duration: data.duration,
          videoUrl: data.videoUrl,
          youtubeVideoId: data.youtubeVideoId,
          content: data.content,
          isFree: data.isFree || false,
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
        },
        include: {
          topic: {
            select: { id: true, title: true, moduleId: true },
          },
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: topic.module.id,
          topicId: data.topicId,
          lessonId: newLesson.id,
          activityType: 'LESSON_VIEWED', // Using as "LESSON_CREATED"
          title: `Created lesson: ${newLesson.title}`,
          description: `Created ${data.type} lesson in topic ${topic.title}`,
          metadata: {
            action: 'lesson_created',
            lessonType: data.type,
            topicTitle: topic.title,
          },
        },
      });

      return newLesson;
    });

    // Update topic and module counts
    await topicService.updateLessonCount(data.topicId);
    await moduleService.updateCounts(topic.module.id);

    return {
      success: true,
      message: 'Lesson created successfully',
      data: lesson,
    };
  }

  /**
   * Get lesson by ID with full details
   */
  async getLessonById(lessonId: string, userId?: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                title: true,
                teacherId: true,
              },
            },
          },
        },
        attachments: {
          orderBy: { createdAt: 'asc' },
        },
        liveSession: true,
        _count: {
          select: {
            progress: true,
            notes: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // If user is provided, get their progress
    let userProgress = null;
    if (userId) {
      userProgress = await prisma.lessonProgress.findFirst({
        where: {
          lessonId,
          enrollment: {
            studentId: userId,
          },
        },
      });
    }

    return {
      success: true,
      data: {
        ...lesson,
        userProgress,
      },
    };
  }

  /**
   * Get all lessons for a topic
   */
  async getLessonsByTopic(topicId: string, includeUnpublished = false) {
    const where: any = { topicId };
    
    if (!includeUnpublished) {
      where.isPublished = true;
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        attachments: {
          select: {
            id: true,
            title: true,
            fileType: true,
            fileSize: true,
          },
        },
        liveSession: {
          select: {
            id: true,
            isLive: true,
            scheduledStartTime: true,
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return {
      success: true,
      data: lessons,
    };
  }

  /**
   * Update lesson
   */
  async updateLesson(
    lessonId: string,
    data: Partial<{
      title: string;
      description: string;
      orderIndex: number;
      duration: number;
      videoUrl: string;
      youtubeVideoId: string;
      content: string;
      isFree: boolean;
      isPublished: boolean;
    }>,
    userId: string
  ) {
    // Get lesson with topic and module info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        topic: {
          include: { module: true },
        },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check authorization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { id: lesson.topic.module.teacherId },
          { role: 'ADMIN' },
        ],
      },
    });

    if (!user) {
      throw new Error('Unauthorized to update this lesson');
    }

    // Handle order index change
    if (data.orderIndex !== undefined && data.orderIndex !== lesson.orderIndex) {
      await this.reorderLessons(lesson.topicId, lessonId, data.orderIndex);
    }

    // Update lesson
    const updatedLesson = await prisma.$transaction(async (tx) => {
      const updated = await tx.lesson.update({
        where: { id: lessonId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          topic: {
            select: { id: true, title: true },
          },
          attachments: true,
          liveSession: true,
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: lesson.topic.module.id,
          topicId: lesson.topicId,
          lessonId: updated.id,
          activityType: 'LESSON_VIEWED', // Using as "LESSON_UPDATED"
          title: `Updated lesson: ${updated.title}`,
          description: `Updated lesson in topic ${lesson.topic.title}`,
          metadata: {
            action: 'lesson_updated',
            changes: Object.keys(data),
          },
        },
      });

      return updated;
    });

    return {
      success: true,
      message: 'Lesson updated successfully',
      data: updatedLesson,
    };
  }

  /**
   * Delete lesson
   */
  async deleteLesson(lessonId: string, userId: string) {
    // Get lesson with topic and module info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        topic: {
          include: { module: true },
        },
        _count: {
          select: { progress: true },
        },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check authorization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { id: lesson.topic.module.teacherId },
          { role: 'ADMIN' },
        ],
      },
    });

    if (!user) {
      throw new Error('Unauthorized to delete this lesson');
    }

    // Warning if lesson has progress
    if (lesson._count.progress > 0) {
      throw new Error(
        `Cannot delete lesson with student progress. It has ${lesson._count.progress} progress entries.`
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete lesson (will cascade to attachments and live session)
      await tx.lesson.delete({
        where: { id: lessonId },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: lesson.topic.module.id,
          topicId: lesson.topicId,
          activityType: 'LESSON_VIEWED', // Using as "LESSON_DELETED"
          title: `Deleted lesson: ${lesson.title}`,
          description: `Deleted ${lesson.type} lesson from topic ${lesson.topic.title}`,
          metadata: {
            action: 'lesson_deleted',
            lessonType: lesson.type,
          },
        },
      });
    });

    // Update topic and module counts
    await topicService.updateLessonCount(lesson.topicId);
    await moduleService.updateCounts(lesson.topic.module.id);

    return {
      success: true,
      message: 'Lesson deleted successfully',
    };
  }

  /**
   * Add attachment to lesson
   */
  async addAttachment(data: {
    lessonId: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    fileType?: string;
  }, userId: string) {
    // Verify lesson exists and get module info
    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
      include: {
        topic: {
          include: { module: true },
        },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check authorization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { id: lesson.topic.module.teacherId },
          { role: 'ADMIN' },
        ],
      },
    });

    if (!user) {
      throw new Error('Unauthorized to add attachments to this lesson');
    }

    const attachment = await prisma.$transaction(async (tx) => {
      const newAttachment = await tx.lessonAttachment.create({
        data: {
          lessonId: data.lessonId,
          title: data.title,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          fileType: data.fileType,
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: lesson.topic.module.id,
          topicId: lesson.topicId,
          lessonId: data.lessonId,
          activityType: 'LESSON_VIEWED', // Using as "ATTACHMENT_ADDED"
          title: `Added attachment: ${data.title}`,
          description: `Added attachment to lesson ${lesson.title}`,
          metadata: {
            action: 'attachment_added',
            fileName: data.fileName,
            fileType: data.fileType,
          },
        },
      });

      return newAttachment;
    });

    return {
      success: true,
      message: 'Attachment added successfully',
      data: attachment,
    };
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(attachmentId: string, userId: string) {
    // Get attachment with lesson and module info
    const attachment = await prisma.lessonAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        lesson: {
          include: {
            topic: {
              include: { module: true },
            },
          },
        },
      },
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Check authorization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { id: attachment.lesson.topic.module.teacherId },
          { role: 'ADMIN' },
        ],
      },
    });

    if (!user) {
      throw new Error('Unauthorized to delete this attachment');
    }

    await prisma.$transaction(async (tx) => {
      await tx.lessonAttachment.delete({
        where: { id: attachmentId },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: attachment.lesson.topic.module.id,
          topicId: attachment.lesson.topicId,
          lessonId: attachment.lessonId,
          activityType: 'LESSON_VIEWED', // Using as "ATTACHMENT_DELETED"
          title: `Deleted attachment: ${attachment.title}`,
          description: `Deleted attachment from lesson ${attachment.lesson.title}`,
          metadata: {
            action: 'attachment_deleted',
            fileName: attachment.fileName,
          },
        },
      });
    });

    return {
      success: true,
      message: 'Attachment deleted successfully',
    };
  }

  /**
   * Track attachment download
   */
  async trackDownload(attachmentId: string) {
    await prisma.lessonAttachment.update({
      where: { id: attachmentId },
      data: { downloadCount: { increment: 1 } },
    });
  }

  /**
   * Increment lesson view count
   */
  async incrementViewCount(lessonId: string, userId?: string) {
    await prisma.$transaction(async (tx) => {
      // Increment view count
      await tx.lesson.update({
        where: { id: lessonId },
        data: { viewCount: { increment: 1 } },
      });

      // If user is logged in, log the view
      if (userId) {
        const lesson = await tx.lesson.findUnique({
          where: { id: lessonId },
          include: {
            topic: {
              select: { moduleId: true },
            },
          },
        });

        if (lesson) {
          await tx.activityHistory.create({
            data: {
              userId,
              moduleId: lesson.topic.moduleId,
              topicId: lesson.topicId,
              lessonId,
              activityType: 'LESSON_VIEWED',
              title: `Viewed lesson: ${lesson.title}`,
              description: `Viewed ${lesson.type} lesson`,
              metadata: {
                action: 'lesson_viewed',
                lessonType: lesson.type,
              },
            },
          });
        }
      }
    });
  }

  /**
   * Reorder lessons within a topic
   */
  private async reorderLessons(topicId: string, lessonId: string, newIndex: number) {
    // Get all lessons in topic
    const lessons = await prisma.lesson.findMany({
      where: { topicId },
      orderBy: { orderIndex: 'asc' },
    });

    // Find current lesson
    const currentLesson = lessons.find((l) => l.id === lessonId);
    if (!currentLesson) {
      throw new Error('Lesson not found in topic');
    }

    const oldIndex = currentLesson.orderIndex;

    // Reorder logic
    if (newIndex === oldIndex) return;

    await prisma.$transaction(async (tx) => {
      if (newIndex > oldIndex) {
        // Moving down: shift lessons between old and new index up
        await tx.lesson.updateMany({
          where: {
            topicId,
            orderIndex: {
              gt: oldIndex,
              lte: newIndex,
            },
          },
          data: {
            orderIndex: { decrement: 1 },
          },
        });
      } else {
        // Moving up: shift lessons between new and old index down
        await tx.lesson.updateMany({
          where: {
            topicId,
            orderIndex: {
              gte: newIndex,
              lt: oldIndex,
            },
          },
          data: {
            orderIndex: { increment: 1 },
          },
        });
      }

      // Update the moved lesson
      await tx.lesson.update({
        where: { id: lessonId },
        data: { orderIndex: newIndex },
      });
    });
  }

  /**
   * Validate lesson data based on type
   */
  private validateLessonData(data: {
    type: LessonType;
    videoUrl?: string;
    youtubeVideoId?: string;
    content?: string;
  }) {
    switch (data.type) {
      case 'VIDEO':
        if (!data.videoUrl) {
          throw new Error('Video URL is required for VIDEO type lessons');
        }
        break;
      case 'YOUTUBE_LIVE':
        // YouTube Live sessions will be created separately
        // But we can accept youtubeVideoId for reference
        break;
      case 'PDF':
      case 'EXTERNAL_LINK':
        // These will typically use attachments
        break;
      case 'TEXT':
        if (!data.content) {
          throw new Error('Content is required for TEXT type lessons');
        }
        break;
      case 'QUIZ':
      case 'ASSIGNMENT':
        // These might have special handling in the future
        break;
    }
  }

  /**
   * Get lessons by type
   */
  async getLessonsByType(moduleId: string, type: LessonType) {
    const lessons = await prisma.lesson.findMany({
      where: {
        topic: {
          moduleId,
        },
        type,
        isPublished: true,
      },
      include: {
        topic: {
          select: { id: true, title: true },
        },
        attachments: true,
        liveSession: type === 'YOUTUBE_LIVE' ? true : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: lessons,
    };
  }

  /**
   * Search lessons across all modules
   */
  async searchLessons(query: string, filters?: {
    type?: LessonType;
    moduleId?: string;
    isFree?: boolean;
  }) {
    const where: any = {
      isPublished: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.moduleId) {
      where.topic = { moduleId: filters.moduleId };
    }

    if (filters?.isFree !== undefined) {
      where.isFree = filters.isFree;
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: { progress: true },
        },
      },
      take: 20,
      orderBy: { viewCount: 'desc' },
    });

    return {
      success: true,
      data: lessons,
    };
  }

  /**
   * Duplicate a lesson
   */
  async duplicateLesson(lessonId: string, userId: string, targetTopicId?: string) {
    // Get lesson with all details
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        topic: {
          include: { module: true },
        },
        attachments: true,
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check authorization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { id: lesson.topic.module.teacherId },
          { role: 'ADMIN' },
        ],
      },
    });

    if (!user) {
      throw new Error('Unauthorized to duplicate this lesson');
    }

    const topicId = targetTopicId || lesson.topicId;

    // Get next order index in target topic
    const lastLesson = await prisma.lesson.findFirst({
      where: { topicId },
      orderBy: { orderIndex: 'desc' },
    });
    const newOrderIndex = lastLesson ? lastLesson.orderIndex + 1 : 0;

    // Duplicate lesson
    const duplicated = await prisma.$transaction(async (tx) => {
      const newLesson = await tx.lesson.create({
        data: {
          title: `${lesson.title} (Copy)`,
          description: lesson.description,
          topicId,
          type: lesson.type,
          orderIndex: newOrderIndex,
          duration: lesson.duration,
          videoUrl: lesson.videoUrl,
          youtubeVideoId: lesson.youtubeVideoId,
          content: lesson.content,
          isFree: lesson.isFree,
          isPublished: false, // New copies start as unpublished
        },
      });

      // Duplicate attachments
      for (const attachment of lesson.attachments) {
        await tx.lessonAttachment.create({
          data: {
            lessonId: newLesson.id,
            title: attachment.title,
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileSize: attachment.fileSize,
            fileType: attachment.fileType,
          },
        });
      }

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: lesson.topic.module.id,
          topicId,
          lessonId: newLesson.id,
          activityType: 'LESSON_VIEWED', // Using as "LESSON_DUPLICATED"
          title: `Duplicated lesson: ${lesson.title}`,
          description: `Created copy of lesson`,
          metadata: {
            action: 'lesson_duplicated',
            originalLessonId: lesson.id,
          },
        },
      });

      return newLesson;
    });

    // Update counts
    await topicService.updateLessonCount(topicId);
    if (targetTopicId && targetTopicId !== lesson.topicId) {
      const targetTopic = await prisma.topic.findUnique({
        where: { id: targetTopicId },
        select: { moduleId: true },
      });
      if (targetTopic) {
        await moduleService.updateCounts(targetTopic.moduleId);
      }
    } else {
      await moduleService.updateCounts(lesson.topic.module.id);
    }

    return {
      success: true,
      message: 'Lesson duplicated successfully',
      data: duplicated,
    };
  }
}

export const lessonService = new LessonService();
