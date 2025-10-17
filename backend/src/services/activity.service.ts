import { PrismaClient, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ActivityService - Manages activity history and timeline
 * 
 * Features:
 * - Log all user activities (views, completions, enrollments)
 * - Filter by date range, title, type
 * - Timeline view for students/teachers/admins
 * - Export activity history
 * - Activity analytics and reports
 */
class ActivityService {
  /**
   * Create a new activity log entry
   */
  async logActivity(data: {
    userId: string;
    activityType: ActivityType;
    title: string;
    description?: string;
    moduleId?: string;
    topicId?: string;
    lessonId?: string;
    metadata?: any;
  }) {
    const activity = await prisma.activityHistory.create({
      data: {
        userId: data.userId,
        activityType: data.activityType,
        title: data.title,
        description: data.description,
        moduleId: data.moduleId,
        topicId: data.topicId,
        lessonId: data.lessonId,
        metadata: data.metadata || {},
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Activity logged successfully',
      data: activity,
    };
  }

  /**
   * Get activities for a specific user
   */
  async getUserActivities(data: {
    userId: string;
    page?: number;
    limit?: number;
    activityType?: ActivityType;
    moduleId?: string;
    startDate?: Date;
    endDate?: Date;
    searchTitle?: string;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: data.userId,
    };

    if (data.activityType) {
      where.activityType = data.activityType;
    }

    if (data.moduleId) {
      where.moduleId = data.moduleId;
    }

    if (data.startDate || data.endDate) {
      where.timestamp = {};
      if (data.startDate) {
        where.timestamp.gte = data.startDate;
      }
      if (data.endDate) {
        where.timestamp.lte = data.endDate;
      }
    }

    if (data.searchTitle) {
      where.title = {
        contains: data.searchTitle,
        mode: 'insensitive',
      };
    }

    // Get activities
    const [activities, total] = await Promise.all([
      prisma.activityHistory.findMany({
        where,
        include: {
          module: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
            },
          },
          topic: {
            select: {
              id: true,
              title: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.activityHistory.count({ where }),
    ]);

    return {
      success: true,
      data: {
        activities,
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
   * Get activities for a specific module (teacher/admin view)
   */
  async getModuleActivities(data: {
    moduleId: string;
    page?: number;
    limit?: number;
    activityType?: ActivityType;
    studentId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      moduleId: data.moduleId,
    };

    if (data.activityType) {
      where.activityType = data.activityType;
    }

    if (data.studentId) {
      where.userId = data.studentId;
    }

    if (data.startDate || data.endDate) {
      where.timestamp = {};
      if (data.startDate) {
        where.timestamp.gte = data.startDate;
      }
      if (data.endDate) {
        where.timestamp.lte = data.endDate;
      }
    }

    // Get activities
    const [activities, total] = await Promise.all([
      prisma.activityHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          topic: {
            select: {
              id: true,
              title: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.activityHistory.count({ where }),
    ]);

    return {
      success: true,
      data: {
        activities,
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
   * Get recent activities across all users (admin view)
   */
  async getRecentActivities(data: {
    page?: number;
    limit?: number;
    activityType?: ActivityType;
    role?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 50;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (data.activityType) {
      where.activityType = data.activityType;
    }

    if (data.role) {
      where.user = {
        role: data.role,
      };
    }

    if (data.startDate || data.endDate) {
      where.timestamp = {};
      if (data.startDate) {
        where.timestamp.gte = data.startDate;
      }
      if (data.endDate) {
        where.timestamp.lte = data.endDate;
      }
    }

    // Get activities
    const [activities, total] = await Promise.all([
      prisma.activityHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          module: {
            select: {
              id: true,
              title: true,
            },
          },
          topic: {
            select: {
              id: true,
              title: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.activityHistory.count({ where }),
    ]);

    return {
      success: true,
      data: {
        activities,
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
   * Get activity timeline (grouped by date)
   */
  async getActivityTimeline(data: {
    userId: string;
    moduleId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const limit = data.limit || 100;

    // Build where clause
    const where: any = {
      userId: data.userId,
    };

    if (data.moduleId) {
      where.moduleId = data.moduleId;
    }

    if (data.startDate || data.endDate) {
      where.timestamp = {};
      if (data.startDate) {
        where.timestamp.gte = data.startDate;
      }
      if (data.endDate) {
        where.timestamp.lte = data.endDate;
      }
    }

    // Get activities
    const activities = await prisma.activityHistory.findMany({
      where,
      include: {
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    // Group by date
    const timeline: Record<string, any[]> = {};
    activities.forEach((activity) => {
      const dateKey = activity.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!timeline[dateKey]) {
        timeline[dateKey] = [];
      }
      timeline[dateKey].push(activity);
    });

    // Convert to array format
    const timelineArray = Object.entries(timeline).map(([date, activities]) => ({
      date,
      activityCount: activities.length,
      activities,
    }));

    return {
      success: true,
      data: {
        timeline: timelineArray,
        totalActivities: activities.length,
      },
    };
  }

  /**
   * Get activity statistics for a user
   */
  async getUserActivityStats(data: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    // Build where clause
    const where: any = {
      userId: data.userId,
    };

    if (data.startDate || data.endDate) {
      where.timestamp = {};
      if (data.startDate) {
        where.timestamp.gte = data.startDate;
      }
      if (data.endDate) {
        where.timestamp.lte = data.endDate;
      }
    }

    // Get activity counts by type
    const activityCounts = await prisma.activityHistory.groupBy({
      by: ['activityType'],
      where,
      _count: {
        id: true,
      },
    });

    // Get total activities
    const totalActivities = activityCounts.reduce((sum, item) => sum + item._count.id, 0);

    // Get most active modules
    const moduleActivities = await prisma.activityHistory.groupBy({
      by: ['moduleId'],
      where: {
        ...where,
        moduleId: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get module details
    const moduleIds = moduleActivities.map((ma) => ma.moduleId).filter(Boolean) as string[];
    const modules = await prisma.module.findMany({
      where: {
        id: { in: moduleIds },
      },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
      },
    });

    const mostActiveModules = moduleActivities
      .map((ma) => {
        const module = modules.find((m) => m.id === ma.moduleId);
        return module
          ? {
              moduleId: module.id,
              moduleTitle: module.title,
              moduleThumbnail: module.thumbnailUrl,
              activityCount: ma._count.id,
            }
          : null;
      })
      .filter(Boolean);

    // Get activity by day of week
    const allActivities = await prisma.activityHistory.findMany({
      where,
      select: {
        timestamp: true,
      },
    });

    const dayOfWeekCounts: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    allActivities.forEach((activity) => {
      const dayName = activity.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      dayOfWeekCounts[dayName]++;
    });

    return {
      success: true,
      data: {
        totalActivities,
        activityByType: activityCounts.map((ac) => ({
          type: ac.activityType,
          count: ac._count.id,
          percentage: Math.round((ac._count.id / totalActivities) * 100),
        })),
        mostActiveModules,
        activityByDayOfWeek: dayOfWeekCounts,
      },
    };
  }

  /**
   * Get activity statistics for a module (teacher/admin view)
   */
  async getModuleActivityStats(data: {
    moduleId: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    // Build where clause
    const where: any = {
      moduleId: data.moduleId,
    };

    if (data.startDate || data.endDate) {
      where.timestamp = {};
      if (data.startDate) {
        where.timestamp.gte = data.startDate;
      }
      if (data.endDate) {
        where.timestamp.lte = data.endDate;
      }
    }

    // Get activity counts by type
    const activityCounts = await prisma.activityHistory.groupBy({
      by: ['activityType'],
      where,
      _count: {
        id: true,
      },
    });

    // Get total activities
    const totalActivities = activityCounts.reduce((sum, item) => sum + item._count.id, 0);

    // Get most active students
    const studentActivities = await prisma.activityHistory.groupBy({
      by: ['userId'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get student details
    const userIds = studentActivities.map((sa) => sa.userId);
    const students = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const mostActiveStudents = studentActivities.map((sa) => {
      const student = students.find((s) => s.id === sa.userId);
      return {
        studentId: sa.userId,
        studentName: student?.name || 'Unknown',
        studentEmail: student?.email || '',
        activityCount: sa._count.id,
      };
    });

    // Get activity by hour (0-23)
    const allActivities = await prisma.activityHistory.findMany({
      where,
      select: {
        timestamp: true,
      },
    });

    const hourCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }

    allActivities.forEach((activity) => {
      const hour = activity.timestamp.getHours();
      hourCounts[hour]++;
    });

    return {
      success: true,
      data: {
        totalActivities,
        activityByType: activityCounts.map((ac) => ({
          type: ac.activityType,
          count: ac._count.id,
          percentage: Math.round((ac._count.id / totalActivities) * 100),
        })),
        mostActiveStudents,
        activityByHour: hourCounts,
      },
    };
  }

  /**
   * Export activity history as JSON
   */
  async exportActivities(data: {
    userId?: string;
    moduleId?: string;
    startDate?: Date;
    endDate?: Date;
    activityType?: ActivityType;
  }) {
    // Build where clause
    const where: any = {};

    if (data.userId) {
      where.userId = data.userId;
    }

    if (data.moduleId) {
      where.moduleId = data.moduleId;
    }

    if (data.activityType) {
      where.activityType = data.activityType;
    }

    if (data.startDate || data.endDate) {
      where.timestamp = {};
      if (data.startDate) {
        where.timestamp.gte = data.startDate;
      }
      if (data.endDate) {
        where.timestamp.lte = data.endDate;
      }
    }

    // Get all matching activities
    const activities = await prisma.activityHistory.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return {
      success: true,
      data: {
        exportDate: new Date(),
        filters: {
          userId: data.userId,
          moduleId: data.moduleId,
          activityType: data.activityType,
          startDate: data.startDate,
          endDate: data.endDate,
        },
        totalRecords: activities.length,
        activities,
      },
    };
  }

  /**
   * Delete old activities (cleanup)
   */
  async deleteOldActivities(data: {
    beforeDate: Date;
    adminId: string;
  }) {
    // Verify admin role
    const admin = await prisma.user.findFirst({
      where: {
        id: data.adminId,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      throw new Error('Only admins can delete activities');
    }

    const result = await prisma.activityHistory.deleteMany({
      where: {
        timestamp: {
          lt: data.beforeDate,
        },
      },
    });

    return {
      success: true,
      message: `Deleted ${result.count} old activities`,
      data: {
        deletedCount: result.count,
        beforeDate: data.beforeDate,
      },
    };
  }

  /**
   * Search activities by title/description
   */
  async searchActivities(data: {
    query: string;
    userId?: string;
    moduleId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        {
          title: {
            contains: data.query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: data.query,
            mode: 'insensitive',
          },
        },
      ],
    };

    if (data.userId) {
      where.userId = data.userId;
    }

    if (data.moduleId) {
      where.moduleId = data.moduleId;
    }

    // Get activities
    const [activities, total] = await Promise.all([
      prisma.activityHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          module: {
            select: {
              id: true,
              title: true,
            },
          },
          topic: {
            select: {
              id: true,
              title: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.activityHistory.count({ where }),
    ]);

    return {
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}

export const activityService = new ActivityService();
