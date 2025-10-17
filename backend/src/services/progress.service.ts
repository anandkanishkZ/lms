import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ProgressService - Handles all progress tracking and calculation
 * 
 * Features:
 * - Auto-track lesson completion
 * - Calculate topic progress (percentage)
 * - Calculate module progress (percentage)
 * - Track video watch time and last position
 * - Track quiz attempts and scores
 * - Mark modules as completed
 * - Real-time progress updates
 * - Progress reports and analytics
 */
class ProgressService {
  /**
   * Start or update lesson progress (when student views/starts a lesson)
   */
  async startLesson(data: {
    lessonId: string;
    studentId: string;
    enrollmentId: string;
  }) {
    // Verify enrollment exists and is active
    const enrollment = await prisma.moduleEnrollment.findFirst({
      where: {
        id: data.enrollmentId,
        studentId: data.studentId,
        isActive: true,
      },
    });

    if (!enrollment) {
      throw new Error('Active enrollment not found');
    }

    // Check if progress already exists
    const existing = await prisma.lessonProgress.findFirst({
      where: {
        lessonId: data.lessonId,
        enrollmentId: data.enrollmentId,
      },
    });

    if (existing) {
      // Update last accessed
      await prisma.lessonProgress.update({
        where: { id: existing.id },
        data: { updatedAt: new Date() },
      });

      return {
        success: true,
        message: 'Lesson progress updated',
        data: existing,
      };
    }

    // Create new progress entry
    const progress = await prisma.$transaction(async (tx) => {
      const newProgress = await tx.lessonProgress.create({
        data: {
          lessonId: data.lessonId,
          studentId: data.studentId,
          enrollmentId: data.enrollmentId,
        },
      });

      // Get lesson and module info for activity log
      const lesson = await tx.lesson.findUnique({
        where: { id: data.lessonId },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              moduleId: true,
            },
          },
        },
      });

      if (lesson) {
        // Log activity
        await tx.activityHistory.create({
          data: {
            userId: data.studentId,
            moduleId: lesson.topic.moduleId,
            topicId: lesson.topicId,
            lessonId: data.lessonId,
            activityType: 'LESSON_VIEWED',
            title: `Started lesson: ${lesson.title}`,
            description: `Began ${lesson.type} lesson in topic ${lesson.topic.title}`,
            metadata: {
              action: 'lesson_started',
              lessonType: lesson.type,
            },
          },
        });
      }

      return newProgress;
    });

    return {
      success: true,
      message: 'Lesson progress started',
      data: progress,
    };
  }

  /**
   * Mark lesson as completed
   */
  async completeLesson(data: {
    lessonId: string;
    studentId: string;
    enrollmentId: string;
    score?: number;
    watchTime?: number;
  }) {
    // Get or create lesson progress
    let lessonProgress = await prisma.lessonProgress.findFirst({
      where: {
        lessonId: data.lessonId,
        enrollmentId: data.enrollmentId,
      },
      include: {
        lesson: {
          include: {
            topic: {
              select: {
                id: true,
                title: true,
                moduleId: true,
              },
            },
          },
        },
      },
    });

    if (!lessonProgress) {
      // Create if doesn't exist
      const startResult = await this.startLesson({
        lessonId: data.lessonId,
        studentId: data.studentId,
        enrollmentId: data.enrollmentId,
      });
      
      lessonProgress = await prisma.lessonProgress.findFirst({
        where: {
          lessonId: data.lessonId,
          enrollmentId: data.enrollmentId,
        },
        include: {
          lesson: {
            include: {
              topic: {
                select: {
                  id: true,
                  title: true,
                  moduleId: true,
                },
              },
            },
          },
        },
      });

      if (!lessonProgress) {
        throw new Error('Failed to create lesson progress');
      }
    }

    // Mark as completed
    await prisma.$transaction(async (tx) => {
      await tx.lessonProgress.update({
        where: { id: lessonProgress!.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          score: data.score,
          watchTime: data.watchTime,
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: data.studentId,
          moduleId: lessonProgress!.lesson.topic.moduleId,
          topicId: lessonProgress!.lesson.topicId,
          lessonId: data.lessonId,
          activityType: 'LESSON_COMPLETED',
          title: `Completed lesson: ${lessonProgress!.lesson.title}`,
          description: `Finished ${lessonProgress!.lesson.type} lesson${data.score !== undefined ? ` with score ${data.score}%` : ''}`,
          metadata: {
            action: 'lesson_completed',
            lessonType: lessonProgress!.lesson.type,
            score: data.score,
            watchTime: data.watchTime,
          },
        },
      });
    });

    // Update topic progress
    await this.updateTopicProgress(lessonProgress.lesson.topicId, data.enrollmentId);

    // Update module progress
    await this.updateModuleProgress(lessonProgress.lesson.topic.moduleId, data.enrollmentId);

    return {
      success: true,
      message: 'Lesson marked as completed',
    };
  }

  /**
   * Update video watch time and position
   */
  async updateVideoProgress(data: {
    lessonId: string;
    enrollmentId: string;
    watchTime: number;
    lastPosition: number;
  }) {
    // Get or create lesson progress
    let lessonProgress = await prisma.lessonProgress.findFirst({
      where: {
        lessonId: data.lessonId,
        enrollmentId: data.enrollmentId,
      },
    });

    if (!lessonProgress) {
      // Get enrollment info
      const enrollment = await prisma.moduleEnrollment.findUnique({
        where: { id: data.enrollmentId },
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const startResult = await this.startLesson({
        lessonId: data.lessonId,
        studentId: enrollment.studentId,
        enrollmentId: data.enrollmentId,
      });

      lessonProgress = startResult.data;
    }

    // Update watch time and position
    await prisma.lessonProgress.update({
      where: { id: lessonProgress.id },
      data: {
        watchTime: data.watchTime,
        lastPosition: data.lastPosition,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Video progress updated',
    };
  }

  /**
   * Update quiz/assignment attempt
   */
  async updateQuizProgress(data: {
    lessonId: string;
    studentId: string;
    enrollmentId: string;
    score: number;
    passed?: boolean;
  }) {
    // Get or create lesson progress
    let lessonProgress = await prisma.lessonProgress.findFirst({
      where: {
        lessonId: data.lessonId,
        enrollmentId: data.enrollmentId,
      },
    });

    if (!lessonProgress) {
      await this.startLesson({
        lessonId: data.lessonId,
        studentId: data.studentId,
        enrollmentId: data.enrollmentId,
      });

      lessonProgress = await prisma.lessonProgress.findFirst({
        where: {
          lessonId: data.lessonId,
          enrollmentId: data.enrollmentId,
        },
      });

      if (!lessonProgress) {
        throw new Error('Failed to create lesson progress');
      }
    }

    // Update attempt count and score
    await prisma.$transaction(async (tx) => {
      await tx.lessonProgress.update({
        where: { id: lessonProgress!.id },
        data: {
          attemptsCount: { increment: 1 },
          score: data.score,
          isCompleted: data.passed !== undefined ? data.passed : data.score >= 60,
          completedAt: data.passed || data.score >= 60 ? new Date() : null,
        },
      });

      // Log activity
      const lesson = await tx.lesson.findUnique({
        where: { id: data.lessonId },
        include: {
          topic: {
            select: {
              id: true,
              moduleId: true,
            },
          },
        },
      });

      if (lesson) {
        await tx.activityHistory.create({
          data: {
            userId: data.studentId,
            moduleId: lesson.topic.moduleId,
            topicId: lesson.topicId,
            lessonId: data.lessonId,
            activityType: 'QUIZ_ATTEMPTED',
            title: `Quiz attempt: ${lesson.title}`,
            description: `Scored ${data.score}% on ${lesson.type}`,
            metadata: {
              action: 'quiz_attempted',
              score: data.score,
              passed: data.passed !== undefined ? data.passed : data.score >= 60,
            },
          },
        });
      }
    });

    // If passed, update topic and module progress
    if (data.passed || data.score >= 60) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: data.lessonId },
        include: {
          topic: {
            select: {
              id: true,
              moduleId: true,
            },
          },
        },
      });

      if (lesson) {
        await this.updateTopicProgress(lesson.topicId, data.enrollmentId);
        await this.updateModuleProgress(lesson.topic.moduleId, data.enrollmentId);
      }
    }

    return {
      success: true,
      message: 'Quiz progress updated',
      data: {
        score: data.score,
        passed: data.passed !== undefined ? data.passed : data.score >= 60,
      },
    };
  }

  /**
   * Calculate and update topic progress
   */
  async updateTopicProgress(topicId: string, enrollmentId: string) {
    // Get all lessons in topic
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        lessons: {
          select: { id: true },
        },
      },
    });

    if (!topic) {
      throw new Error('Topic not found');
    }

    const totalLessons = topic.lessons.length;

    if (totalLessons === 0) {
      return;
    }

    // Count completed lessons
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        lessonId: { in: topic.lessons.map((l) => l.id) },
        enrollmentId,
        isCompleted: true,
      },
    });

    // Calculate progress percentage
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
    const isCompleted = progressPercentage === 100;

    // Get enrollment info
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Update or create topic progress
    const existingProgress = await prisma.topicProgress.findUnique({
      where: {
        enrollmentId_topicId: {
          enrollmentId,
          topicId,
        },
      },
    });

    if (existingProgress) {
      await prisma.topicProgress.update({
        where: { id: existingProgress.id },
        data: {
          completedLessons,
          totalLessons,
          progress: progressPercentage,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });
    } else {
      await prisma.topicProgress.create({
        data: {
          enrollmentId,
          topicId,
          studentId: enrollment.studentId,
          completedLessons,
          totalLessons,
          progress: progressPercentage,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });
    }

    // Log activity if topic completed
    if (isCompleted && !existingProgress?.isCompleted) {
      await prisma.activityHistory.create({
        data: {
          userId: enrollment.studentId,
          moduleId: topic.moduleId,
          topicId,
          activityType: 'LESSON_COMPLETED', // Using as "TOPIC_COMPLETED"
          title: `Completed topic: ${topic.title}`,
          description: `Finished all ${totalLessons} lessons in topic`,
          metadata: {
            action: 'topic_completed',
            totalLessons,
          },
        },
      });
    }
  }

  /**
   * Calculate and update module progress
   */
  async updateModuleProgress(moduleId: string, enrollmentId: string) {
    // Get all lessons in module (through topics)
    const topics = await prisma.topic.findMany({
      where: { moduleId },
      include: {
        lessons: {
          select: { id: true },
        },
      },
    });

    const allLessonIds = topics.flatMap((topic) => topic.lessons.map((l) => l.id));
    const totalLessons = allLessonIds.length;

    if (totalLessons === 0) {
      return;
    }

    // Count completed lessons
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        lessonId: { in: allLessonIds },
        enrollmentId,
        isCompleted: true,
      },
    });

    // Calculate progress percentage
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
    const isCompleted = progressPercentage === 100;

    // Get enrollment info
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Update enrollment progress
    await prisma.moduleEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: progressPercentage,
        completedAt: isCompleted ? new Date() : null,
        lastAccessedAt: new Date(),
      },
    });

    // Log activity if module completed
    if (isCompleted && !enrollment.completedAt) {
      await prisma.activityHistory.create({
        data: {
          userId: enrollment.studentId,
          moduleId,
          activityType: 'MODULE_COMPLETED',
          title: `Completed module: ${enrollment.module.title}`,
          description: `Finished all ${totalLessons} lessons in module`,
          metadata: {
            action: 'module_completed',
            totalLessons,
            totalTopics: topics.length,
          },
        },
      });
    }
  }

  /**
   * Get student's progress for a specific module
   */
  async getModuleProgress(moduleId: string, studentId: string) {
    // Get enrollment
    const enrollment = await prisma.moduleEnrollment.findFirst({
      where: {
        moduleId,
        studentId,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            totalTopics: true,
            totalLessons: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Get topic progress
    const topicProgress = await prisma.topicProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
            totalLessons: true,
          },
        },
      },
      orderBy: {
        topic: {
          orderIndex: 'asc',
        },
      },
    });

    // Get all lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
            topicId: true,
            orderIndex: true,
          },
        },
      },
    });

    // Get recent activity
    const recentActivity = await prisma.activityHistory.findMany({
      where: {
        userId: studentId,
        moduleId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 10,
    });

    return {
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          progress: enrollment.progress,
          isActive: enrollment.isActive,
          lastAccessedAt: enrollment.lastAccessedAt,
        },
        module: enrollment.module,
        topicProgress,
        lessonProgress: lessonProgress.map((lp) => ({
          lessonId: lp.lesson.id,
          lessonTitle: lp.lesson.title,
          lessonType: lp.lesson.type,
          topicId: lp.lesson.topicId,
          isCompleted: lp.isCompleted,
          completedAt: lp.completedAt,
          watchTime: lp.watchTime,
          lastPosition: lp.lastPosition,
          score: lp.score,
          attemptsCount: lp.attemptsCount,
        })),
        recentActivity,
        stats: {
          totalLessons: enrollment.module.totalLessons,
          completedLessons: lessonProgress.filter((lp) => lp.isCompleted).length,
          totalTopics: enrollment.module.totalTopics,
          completedTopics: topicProgress.filter((tp) => tp.isCompleted).length,
          overallProgress: enrollment.progress,
        },
      },
    };
  }

  /**
   * Get student's overall progress across all modules
   */
  async getStudentOverallProgress(studentId: string) {
    const enrollments = await prisma.moduleEnrollment.findMany({
      where: {
        studentId,
        isActive: true,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            totalLessons: true,
            totalTopics: true,
          },
        },
        _count: {
          select: {
            lessonProgress: true,
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    // Calculate completed lessons for each enrollment
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const completedLessons = await prisma.lessonProgress.count({
          where: {
            enrollmentId: enrollment.id,
            isCompleted: true,
          },
        });

        return {
          enrollmentId: enrollment.id,
          moduleId: enrollment.module.id,
          moduleTitle: enrollment.module.title,
          moduleThumbnail: enrollment.module.thumbnailUrl,
          enrolledAt: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt,
          completedAt: enrollment.completedAt,
          progress: enrollment.progress,
          totalLessons: enrollment.module.totalLessons,
          completedLessons,
          totalTopics: enrollment.module.totalTopics,
        };
      })
    );

    // Calculate overall stats
    const totalModules = enrollmentsWithDetails.length;
    const completedModules = enrollmentsWithDetails.filter((e) => e.completedAt).length;
    const inProgressModules = enrollmentsWithDetails.filter(
      (e) => !e.completedAt && e.progress > 0
    ).length;
    const notStartedModules = enrollmentsWithDetails.filter((e) => e.progress === 0).length;

    const totalLessons = enrollmentsWithDetails.reduce((sum, e) => sum + e.totalLessons, 0);
    const totalCompletedLessons = enrollmentsWithDetails.reduce(
      (sum, e) => sum + e.completedLessons,
      0
    );

    const overallProgress =
      totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;

    return {
      success: true,
      data: {
        enrollments: enrollmentsWithDetails,
        stats: {
          totalModules,
          completedModules,
          inProgressModules,
          notStartedModules,
          totalLessons,
          completedLessons: totalCompletedLessons,
          overallProgress,
        },
      },
    };
  }

  /**
   * Get lesson progress details
   */
  async getLessonProgress(lessonId: string, enrollmentId: string) {
    const progress = await prisma.lessonProgress.findFirst({
      where: {
        lessonId,
        enrollmentId,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
          },
        },
      },
    });

    return {
      success: true,
      data: progress,
    };
  }

  /**
   * Reset lesson progress (for retaking quizzes, etc.)
   */
  async resetLessonProgress(lessonId: string, enrollmentId: string, adminId: string) {
    // Verify admin role
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      throw new Error('Only admins can reset progress');
    }

    const progress = await prisma.lessonProgress.findFirst({
      where: {
        lessonId,
        enrollmentId,
      },
    });

    if (!progress) {
      throw new Error('Progress not found');
    }

    await prisma.lessonProgress.update({
      where: { id: progress.id },
      data: {
        isCompleted: false,
        completedAt: null,
        watchTime: 0,
        lastPosition: 0,
        score: null,
        attemptsCount: 0,
      },
    });

    // Recalculate topic and module progress
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        topic: {
          select: {
            id: true,
            moduleId: true,
          },
        },
      },
    });

    if (lesson) {
      await this.updateTopicProgress(lesson.topicId, enrollmentId);
      await this.updateModuleProgress(lesson.topic.moduleId, enrollmentId);
    }

    return {
      success: true,
      message: 'Lesson progress reset successfully',
    };
  }

  /**
   * Get progress statistics for a module (teacher/admin view)
   */
  async getModuleProgressStats(moduleId: string) {
    // Get all enrollments
    const enrollments = await prisma.moduleEnrollment.findMany({
      where: { moduleId },
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

    // Calculate stats for each student
    const studentStats = await Promise.all(
      enrollments.map(async (enrollment) => {
        const completedLessons = await prisma.lessonProgress.count({
          where: {
            enrollmentId: enrollment.id,
            isCompleted: true,
          },
        });

        const totalLessons = await prisma.lesson.count({
          where: {
            topic: {
              moduleId,
            },
          },
        });

        return {
          studentId: enrollment.student.id,
          studentName: enrollment.student.name,
          studentEmail: enrollment.student.email,
          enrolledAt: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt,
          completedAt: enrollment.completedAt,
          progress: enrollment.progress,
          completedLessons,
          totalLessons,
          isActive: enrollment.isActive,
        };
      })
    );

    // Overall stats
    const totalStudents = studentStats.length;
    const activeStudents = studentStats.filter((s) => s.isActive).length;
    const completedStudents = studentStats.filter((s) => s.completedAt).length;
    const avgProgress =
      totalStudents > 0
        ? Math.round(studentStats.reduce((sum, s) => sum + s.progress, 0) / totalStudents)
        : 0;

    return {
      success: true,
      data: {
        students: studentStats,
        summary: {
          totalStudents,
          activeStudents,
          completedStudents,
          avgProgress,
          completionRate:
            totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0,
        },
      },
    };
  }
}

export const progressService = new ProgressService();
