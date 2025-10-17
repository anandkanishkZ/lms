import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * YoutubeLiveService - Manages YouTube Live sessions for lessons
 * 
 * Features:
 * - Schedule live sessions
 * - Update live status (isLive)
 * - Store recording URLs after session
 * - Track viewer count
 * - Send notifications when live starts
 * - Session analytics
 */
class YoutubeLiveService {
  /**
   * Create/Schedule a YouTube Live session for a lesson
   */
  async createLiveSession(data: {
    lessonId: string;
    youtubeUrl: string;
    youtubeLiveId?: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    description?: string;
    createdBy: string;
  }) {
    // Verify lesson exists and is YOUTUBE_LIVE type
    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
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
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (lesson.type !== 'YOUTUBE_LIVE') {
      throw new Error('Lesson must be of type YOUTUBE_LIVE');
    }

    // Check if session already exists
    const existing = await prisma.youtubeLiveSession.findUnique({
      where: { lessonId: data.lessonId },
    });

    if (existing) {
      throw new Error('Live session already exists for this lesson');
    }

    // Create live session
    const liveSession = await prisma.$transaction(async (tx) => {
      const session = await tx.youtubeLiveSession.create({
        data: {
          lessonId: data.lessonId,
          youtubeUrl: data.youtubeUrl,
          youtubeLiveId: data.youtubeLiveId,
          scheduledStartTime: data.scheduledStartTime,
          scheduledEndTime: data.scheduledEndTime,
          isLive: false,
          currentViewers: 0,
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: data.createdBy,
          moduleId: lesson.topic.moduleId,
          topicId: lesson.topicId,
          lessonId: data.lessonId,
          activityType: 'LESSON_VIEWED',
          title: `Scheduled live session: ${lesson.title}`,
          description: `Live session scheduled for ${data.scheduledStartTime.toLocaleString()}`,
          metadata: {
            action: 'live_session_scheduled',
            youtubeLiveId: data.youtubeLiveId,
            scheduledStartTime: data.scheduledStartTime,
          },
        },
      });

      return session;
    });

    return {
      success: true,
      message: 'Live session scheduled successfully',
      data: liveSession,
    };
  }

  /**
   * Update live session details
   */
  async updateLiveSession(data: {
    sessionId: string;
    youtubeUrl?: string;
    youtubeLiveId?: string;
    scheduledStartTime?: Date;
    scheduledEndTime?: Date;
    updatedBy: string;
  }) {
    const session = await prisma.youtubeLiveSession.findUnique({
      where: { id: data.sessionId },
      include: {
        lesson: {
          include: {
            topic: {
              select: {
                moduleId: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new Error('Live session not found');
    }

    // Update session
    const updated = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.youtubeLiveSession.update({
        where: { id: data.sessionId },
        data: {
          youtubeUrl: data.youtubeUrl,
          youtubeLiveId: data.youtubeLiveId,
          scheduledStartTime: data.scheduledStartTime,
          scheduledEndTime: data.scheduledEndTime,
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: data.updatedBy,
          moduleId: session.lesson.topic.moduleId,
          topicId: session.lesson.topicId,
          lessonId: session.lessonId,
          activityType: 'LESSON_VIEWED',
          title: `Updated live session: ${session.lesson.title}`,
          description: 'Live session details updated',
          metadata: {
            action: 'live_session_updated',
            changes: {
              youtubeUrl: data.youtubeUrl,
              youtubeLiveId: data.youtubeLiveId,
              scheduledStartTime: data.scheduledStartTime,
            },
          },
        },
      });

      return updatedSession;
    });

    return {
      success: true,
      message: 'Live session updated successfully',
      data: updated,
    };
  }

  /**
   * Start live session (mark as live)
   */
  async startLiveSession(data: {
    sessionId: string;
    startedBy: string;
  }) {
    const session = await prisma.youtubeLiveSession.findUnique({
      where: { id: data.sessionId },
      include: {
        lesson: {
          include: {
            topic: {
              select: {
                id: true,
                moduleId: true,
                module: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new Error('Live session not found');
    }

    if (session.isLive) {
      throw new Error('Session is already live');
    }

    // Mark as live
    const updated = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.youtubeLiveSession.update({
        where: { id: data.sessionId },
        data: {
          isLive: true,
          actualStartTime: new Date(),
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: data.startedBy,
          moduleId: session.lesson.topic.moduleId,
          topicId: session.lesson.topicId,
          lessonId: session.lessonId,
          activityType: 'LESSON_VIEWED',
          title: `Live session started: ${session.lesson.title}`,
          description: `YouTube Live session is now broadcasting`,
          metadata: {
            action: 'live_session_started',
            youtubeLiveId: session.youtubeLiveId,
          },
        },
      });

      return updatedSession;
    });

    // TODO: Send notifications to enrolled students
    // This would integrate with your notification system
    await this.notifyEnrolledStudents(session.lesson.topic.moduleId, session.lessonId);

    return {
      success: true,
      message: 'Live session started',
      data: updated,
    };
  }

  /**
   * End live session
   */
  async endLiveSession(data: {
    sessionId: string;
    recordingUrl?: string;
    endedBy: string;
  }) {
    const session = await prisma.youtubeLiveSession.findUnique({
      where: { id: data.sessionId },
      include: {
        lesson: {
          include: {
            topic: {
              select: {
                moduleId: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new Error('Live session not found');
    }

    if (!session.isLive) {
      throw new Error('Session is not live');
    }

    // Mark as ended
    const updated = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.youtubeLiveSession.update({
        where: { id: data.sessionId },
        data: {
          isLive: false,
          actualEndTime: new Date(),
          recordingUrl: data.recordingUrl,
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: data.endedBy,
          moduleId: session.lesson.topic.moduleId,
          topicId: session.lesson.topicId,
          lessonId: session.lessonId,
          activityType: 'LESSON_COMPLETED',
          title: `Live session ended: ${session.lesson.title}`,
          description: 'YouTube Live session has ended',
          metadata: {
            action: 'live_session_ended',
            recordingUrl: data.recordingUrl,
            duration: session.actualStartTime
              ? new Date().getTime() - session.actualStartTime.getTime()
              : null,
          },
        },
      });

      return updatedSession;
    });

    return {
      success: true,
      message: 'Live session ended',
      data: updated,
    };
  }

  /**
   * Update viewer count during live session
   */
  async updateViewerCount(data: {
    sessionId: string;
    currentViewers: number;
  }) {
    const session = await prisma.youtubeLiveSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session) {
      throw new Error('Live session not found');
    }

    await prisma.youtubeLiveSession.update({
      where: { id: data.sessionId },
      data: {
        currentViewers: data.currentViewers,
        maxViewers: Math.max(session.maxViewers || 0, data.currentViewers),
      },
    });

    return {
      success: true,
      message: 'Viewer count updated',
    };
  }

  /**
   * Get live session details
   */
  async getLiveSession(sessionId: string) {
    const session = await prisma.youtubeLiveSession.findUnique({
      where: { id: sessionId },
      include: {
        lesson: {
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
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new Error('Live session not found');
    }

    return {
      success: true,
      data: session,
    };
  }

  /**
   * Get live session by lesson ID
   */
  async getLiveSessionByLesson(lessonId: string) {
    const session = await prisma.youtubeLiveSession.findUnique({
      where: { lessonId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            description: true,
            topicId: true,
          },
        },
      },
    });

    return {
      success: true,
      data: session,
    };
  }

  /**
   * Get all upcoming live sessions
   */
  async getUpcomingLiveSessions(data: {
    moduleId?: string;
    limit?: number;
  }) {
    const limit = data.limit || 10;

    const where: any = {
      scheduledStartTime: {
        gte: new Date(),
      },
      isLive: false,
      actualEndTime: null,
    };

    if (data.moduleId) {
      where.lesson = {
        topic: {
          moduleId: data.moduleId,
        },
      };
    }

    const sessions = await prisma.youtubeLiveSession.findMany({
      where,
      include: {
        lesson: {
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
                    thumbnailUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        scheduledStartTime: 'asc',
      },
      take: limit,
    });

    return {
      success: true,
      data: sessions,
    };
  }

  /**
   * Get currently live sessions
   */
  async getCurrentlyLiveSessions(data: {
    moduleId?: string;
  }) {
    const where: any = {
      isLive: true,
    };

    if (data.moduleId) {
      where.lesson = {
        topic: {
          moduleId: data.moduleId,
        },
      };
    }

    const sessions = await prisma.youtubeLiveSession.findMany({
      where,
      include: {
        lesson: {
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
                    thumbnailUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        actualStartTime: 'desc',
      },
    });

    return {
      success: true,
      data: sessions,
    };
  }

  /**
   * Get past live sessions (with recordings)
   */
  async getPastLiveSessions(data: {
    moduleId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      actualEndTime: {
        not: null,
      },
    };

    if (data.moduleId) {
      where.lesson = {
        topic: {
          moduleId: data.moduleId,
        },
      };
    }

    const [sessions, total] = await Promise.all([
      prisma.youtubeLiveSession.findMany({
        where,
        include: {
          lesson: {
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
                      thumbnailUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          actualEndTime: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.youtubeLiveSession.count({ where }),
    ]);

    return {
      success: true,
      data: {
        sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Delete live session
   */
  async deleteLiveSession(data: {
    sessionId: string;
    deletedBy: string;
  }) {
    const session = await prisma.youtubeLiveSession.findUnique({
      where: { id: data.sessionId },
      include: {
        lesson: {
          include: {
            topic: {
              select: {
                moduleId: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new Error('Live session not found');
    }

    if (session.isLive) {
      throw new Error('Cannot delete a live session that is currently broadcasting');
    }

    await prisma.$transaction(async (tx) => {
      await tx.youtubeLiveSession.delete({
        where: { id: data.sessionId },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: data.deletedBy,
          moduleId: session.lesson.topic.moduleId,
          topicId: session.lesson.topicId,
          lessonId: session.lessonId,
          activityType: 'LESSON_VIEWED',
          title: `Deleted live session: ${session.lesson.title}`,
          description: 'Live session removed',
          metadata: {
            action: 'live_session_deleted',
            sessionId: data.sessionId,
          },
        },
      });
    });

    return {
      success: true,
      message: 'Live session deleted successfully',
    };
  }

  /**
   * Get live session statistics
   */
  async getLiveSessionStats(moduleId?: string) {
    const where: any = {};

    if (moduleId) {
      where.lesson = {
        topic: {
          moduleId,
        },
      };
    }

    const [
      totalSessions,
      upcomingSessions,
      completedSessions,
      currentlyLive,
    ] = await Promise.all([
      prisma.youtubeLiveSession.count({ where }),
      prisma.youtubeLiveSession.count({
        where: {
          ...where,
          scheduledStartTime: { gte: new Date() },
          isLive: false,
          actualEndTime: null,
        },
      }),
      prisma.youtubeLiveSession.count({
        where: {
          ...where,
          actualEndTime: { not: null },
        },
      }),
      prisma.youtubeLiveSession.count({
        where: {
          ...where,
          isLive: true,
        },
      }),
    ]);

    // Get average viewer stats
    const sessionsWithViewers = await prisma.youtubeLiveSession.findMany({
      where: {
        ...where,
        maxViewers: { not: null },
      },
      select: {
        maxViewers: true,
      },
    });

    const avgMaxViewers =
      sessionsWithViewers.length > 0
        ? Math.round(
            sessionsWithViewers.reduce((sum, s) => sum + (s.maxViewers || 0), 0) /
              sessionsWithViewers.length
          )
        : 0;

    return {
      success: true,
      data: {
        totalSessions,
        upcomingSessions,
        completedSessions,
        currentlyLive,
        avgMaxViewers,
      },
    };
  }

  /**
   * Notify enrolled students about live session (placeholder for notification integration)
   */
  private async notifyEnrolledStudents(moduleId: string, lessonId: string) {
    // Get all enrolled students
    const enrollments = await prisma.moduleEnrollment.findMany({
      where: {
        moduleId,
        isActive: true,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Integrate with your notification system
    // For now, just log the notification intent
    console.log(`Would notify ${enrollments.length} students about live session ${lessonId}`);

    // Example: Send email/push notification to each student
    // await emailService.sendLiveSessionNotification(...)
    // await pushNotificationService.send(...)

    return enrollments.length;
  }
}

export const youtubeLiveService = new YoutubeLiveService();
