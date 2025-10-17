import { PrismaClient, Topic } from '@prisma/client';
import { moduleService } from './module.service';

const prisma = new PrismaClient();

/**
 * TopicService - Handles Topic/Section business logic
 * 
 * Features:
 * - Create, update, delete topics
 * - Manage topic ordering
 * - Auto-update module lesson counts
 * - Cascade operations
 */
class TopicService {
  /**
   * Create a new topic within a module
   */
  async createTopic(data: {
    title: string;
    description?: string;
    moduleId: string;
    orderIndex?: number;
    duration?: number;
  }, userId: string) {
    // Verify module exists and user has access
    const module = await prisma.module.findUnique({
      where: { id: data.moduleId },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    // Check authorization (teacher who created module or admin)
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { id: module.teacherId },
          { role: 'ADMIN' },
        ],
      },
    });

    if (!user) {
      throw new Error('Unauthorized to add topics to this module');
    }

    // Get next order index if not provided
    let orderIndex = data.orderIndex;
    if (orderIndex === undefined) {
      const lastTopic = await prisma.topic.findFirst({
        where: { moduleId: data.moduleId },
        orderBy: { orderIndex: 'desc' },
      });
      orderIndex = lastTopic ? lastTopic.orderIndex + 1 : 0;
    }

    // Create topic with transaction
    const topic = await prisma.$transaction(async (tx) => {
      const newTopic = await tx.topic.create({
        data: {
          title: data.title,
          description: data.description,
          moduleId: data.moduleId,
          orderIndex,
          duration: data.duration,
        },
        include: {
          module: {
            select: { id: true, title: true },
          },
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: data.moduleId,
          topicId: newTopic.id,
          activityType: 'MODULE_ENROLLED', // Using as "TOPIC_CREATED"
          title: `Created topic: ${newTopic.title}`,
          description: `Created new topic in module ${module.title}`,
          metadata: {
            action: 'topic_created',
            topicId: newTopic.id,
            topicTitle: newTopic.title,
            moduleName: module.title,
          },
        },
      });

      return newTopic;
    });

    // Update module counts
    await moduleService.updateCounts(data.moduleId);

    return {
      success: true,
      message: 'Topic created successfully',
      data: topic,
    };
  }

  /**
   * Get topic by ID with lessons
   */
  async getTopicById(topicId: string, includeLessons = true) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            teacherId: true,
          },
        },
        lessons: includeLessons ? {
          include: {
            attachments: true,
            liveSession: true,
            _count: {
              select: {
                progress: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        } : false,
        _count: {
          select: {
            lessons: true,
            progress: true,
          },
        },
      },
    });

    if (!topic) {
      throw new Error('Topic not found');
    }

    return {
      success: true,
      data: topic,
    };
  }

  /**
   * Get all topics for a module
   */
  async getTopicsByModule(moduleId: string, includeLessons = false) {
    const topics = await prisma.topic.findMany({
      where: { moduleId },
      include: {
        lessons: includeLessons ? {
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
            isPublished: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' },
        } : false,
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return {
      success: true,
      data: topics,
    };
  }

  /**
   * Update topic
   */
  async updateTopic(
    topicId: string,
    data: Partial<{
      title: string;
      description: string;
      orderIndex: number;
      duration: number;
      isActive: boolean;
    }>,
    userId: string
  ) {
    // Get topic with module info
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
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
      throw new Error('Unauthorized to update this topic');
    }

    // Handle order index change
    if (data.orderIndex !== undefined && data.orderIndex !== topic.orderIndex) {
      await this.reorderTopics(topic.moduleId, topicId, data.orderIndex);
    }

    // Update topic
    const updatedTopic = await prisma.$transaction(async (tx) => {
      const updated = await tx.topic.update({
        where: { id: topicId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          module: {
            select: { id: true, title: true },
          },
          _count: {
            select: { lessons: true },
          },
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: topic.moduleId,
          topicId: updated.id,
          activityType: 'MODULE_ENROLLED', // Using as "TOPIC_UPDATED"
          title: `Updated topic: ${updated.title}`,
          description: `Updated topic in module`,
          metadata: {
            action: 'topic_updated',
            topicId: updated.id,
            topicTitle: updated.title,
            changes: Object.keys(data),
          },
        },
      });

      return updated;
    });

    return {
      success: true,
      message: 'Topic updated successfully',
      data: updatedTopic,
    };
  }

  /**
   * Delete topic (will cascade delete lessons)
   */
  async deleteTopic(topicId: string, userId: string) {
    // Get topic with module and lesson count
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        module: true,
        _count: {
          select: { lessons: true, progress: true },
        },
      },
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
      throw new Error('Unauthorized to delete this topic');
    }

    // Warning if topic has progress
    if (topic._count.progress > 0) {
      throw new Error(
        `Cannot delete topic with student progress. It has ${topic._count.progress} progress entries.`
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete topic (will cascade to lessons due to schema)
      await tx.topic.delete({
        where: { id: topicId },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: topic.moduleId,
          topicId,
          activityType: 'MODULE_ENROLLED', // Using as "TOPIC_DELETED"
          title: `Deleted topic: ${topic.title}`,
          description: `Deleted topic with ${topic._count.lessons} lessons`,
          metadata: {
            action: 'topic_deleted',
            topicTitle: topic.title,
            lessonCount: topic._count.lessons,
          },
        },
      });
    });

    // Update module counts
    await moduleService.updateCounts(topic.moduleId);

    return {
      success: true,
      message: 'Topic and its lessons deleted successfully',
    };
  }

  /**
   * Reorder topics within a module
   */
  private async reorderTopics(moduleId: string, topicId: string, newIndex: number) {
    // Get all topics in module
    const topics = await prisma.topic.findMany({
      where: { moduleId },
      orderBy: { orderIndex: 'asc' },
    });

    // Find current topic
    const currentTopic = topics.find((t) => t.id === topicId);
    if (!currentTopic) {
      throw new Error('Topic not found in module');
    }

    const oldIndex = currentTopic.orderIndex;

    // Reorder logic
    if (newIndex === oldIndex) return;

    await prisma.$transaction(async (tx) => {
      if (newIndex > oldIndex) {
        // Moving down: shift topics between old and new index up
        await tx.topic.updateMany({
          where: {
            moduleId,
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
        // Moving up: shift topics between new and old index down
        await tx.topic.updateMany({
          where: {
            moduleId,
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

      // Update the moved topic
      await tx.topic.update({
        where: { id: topicId },
        data: { orderIndex: newIndex },
      });
    });
  }

  /**
   * Update lesson count for a topic
   */
  async updateLessonCount(topicId: string) {
    const lessonCount = await prisma.lesson.count({
      where: { topicId },
    });

    await prisma.topic.update({
      where: { id: topicId },
      data: { totalLessons: lessonCount },
    });
  }

  /**
   * Duplicate a topic (copy with all lessons)
   */
  async duplicateTopic(topicId: string, userId: string) {
    // Get topic with all lessons
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        module: true,
        lessons: {
          include: {
            attachments: true,
          },
        },
      },
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
      throw new Error('Unauthorized to duplicate this topic');
    }

    // Get next order index
    const lastTopic = await prisma.topic.findFirst({
      where: { moduleId: topic.moduleId },
      orderBy: { orderIndex: 'desc' },
    });
    const newOrderIndex = lastTopic ? lastTopic.orderIndex + 1 : 0;

    // Duplicate topic and lessons
    const duplicated = await prisma.$transaction(async (tx) => {
      // Create new topic
      const newTopic = await tx.topic.create({
        data: {
          title: `${topic.title} (Copy)`,
          description: topic.description,
          moduleId: topic.moduleId,
          orderIndex: newOrderIndex,
          duration: topic.duration,
        },
      });

      // Duplicate all lessons
      for (const lesson of topic.lessons) {
        const newLesson = await tx.lesson.create({
          data: {
            title: lesson.title,
            description: lesson.description,
            topicId: newTopic.id,
            type: lesson.type,
            orderIndex: lesson.orderIndex,
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
      }

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: topic.moduleId,
          topicId: newTopic.id,
          activityType: 'MODULE_ENROLLED', // Using as "TOPIC_DUPLICATED"
          title: `Duplicated topic: ${topic.title}`,
          description: `Created copy of topic with all lessons`,
          metadata: {
            action: 'topic_duplicated',
            originalTopicId: topic.id,
            newTopicId: newTopic.id,
            topicTitle: newTopic.title,
          },
        },
      });

      return newTopic;
    });

    // Update module counts
    await moduleService.updateCounts(topic.moduleId);

    return {
      success: true,
      message: 'Topic duplicated successfully',
      data: duplicated,
    };
  }
}

export const topicService = new TopicService();
