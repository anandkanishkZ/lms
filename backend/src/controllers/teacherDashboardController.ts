import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * Get teacher dashboard statistics
 * GET /api/teacher/dashboard/stats
 */
export const getTeacherDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.userId;

    if (!teacherId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - Teacher ID not found',
      });
      return;
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get all stats in parallel
    const [
      // Total modules created by this teacher
      totalModules,
      publishedModules,
      
      // Total students enrolled in teacher's modules
      totalStudentsResult,
      
      // Active classes (scheduled or live) for today
      todayClasses,
      
      // Pending exam submissions to grade
      pendingGrading,
      
      // Recent enrollments in teacher's modules (last 30 days)
      recentEnrollments,
      
      // This month's enrollments
      thisMonthEnrollments,
      lastMonthEnrollments,
    ] = await Promise.all([
      // Total modules
      prisma.module.count({
        where: {
          teacherId,
        },
      }),
      
      // Published modules
      prisma.module.count({
        where: {
          teacherId,
          status: 'PUBLISHED',
        },
      }),
      
      // Total unique students
      prisma.moduleEnrollment.findMany({
        where: {
          module: {
            teacherId,
          },
        },
        select: {
          studentId: true,
        },
        distinct: ['studentId'],
      }),
      
      // Today's classes
      prisma.liveClass.count({
        where: {
          teacherId,
          startTime: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lt: new Date(now.setHours(23, 59, 59, 999)),
          },
          status: {
            in: ['SCHEDULED', 'LIVE'],
          },
        },
      }),
      
      // Pending grading (exams created by teacher with ungraded attempts)
      prisma.studentExamAttempt.count({
        where: {
          exam: {
            createdBy: teacherId,
          },
          submittedAt: {
            not: null,
          },
          gradedAt: null,
        },
      }),
      
      // Recent enrollments (last 30 days)
      prisma.moduleEnrollment.count({
        where: {
          module: {
            teacherId,
          },
          enrolledAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // This month enrollments
      prisma.moduleEnrollment.count({
        where: {
          module: {
            teacherId,
          },
          enrolledAt: {
            gte: firstDayOfMonth,
          },
        },
      }),
      
      // Last month enrollments
      prisma.moduleEnrollment.count({
        where: {
          module: {
            teacherId,
          },
          enrolledAt: {
            gte: lastMonth,
            lt: firstDayOfMonth,
          },
        },
      }),
    ]);

    const totalStudents = totalStudentsResult.length;

    // Calculate enrollment change percentage
    const enrollmentChange = lastMonthEnrollments > 0
      ? ((thisMonthEnrollments - lastMonthEnrollments) / lastMonthEnrollments) * 100
      : thisMonthEnrollments > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        totalModules,
        publishedModules,
        totalStudents,
        todayClasses,
        pendingGrading,
        recentEnrollments,
        enrollmentChange: {
          value: Math.abs(Number(enrollmentChange.toFixed(1))),
          type: enrollmentChange >= 0 ? 'increase' : 'decrease',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get teacher's upcoming classes
 * GET /api/teacher/dashboard/upcoming-classes
 */
export const getUpcomingClasses = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.userId;

    if (!teacherId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const now = new Date();
    const limit = parseInt(req.query.limit as string) || 5;

    const classes = await prisma.liveClass.findMany({
      where: {
        teacherId,
        startTime: {
          gte: now,
        },
        status: {
          in: ['SCHEDULED', 'LIVE'],
        },
      },
      take: limit,
      orderBy: {
        startTime: 'asc',
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: classes.map((cls) => ({
        id: cls.id,
        title: cls.title,
        description: cls.description,
        startTime: cls.startTime,
        endTime: cls.endTime,
        status: cls.status,
        subject: cls.subject.name,
        module: cls.module?.title,
        className: cls.class.name,
        meetingLink: cls.meetingLink,
        youtubeUrl: cls.youtubeUrl,
        attendanceCount: cls._count.attendances,
      })),
    });
  } catch (error) {
    console.error('Error fetching upcoming classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming classes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get teacher's recent activity
 * GET /api/teacher/dashboard/recent-activity
 */
export const getTeacherRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.userId;

    if (!teacherId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent enrollments in teacher's modules
    const recentEnrollments = await prisma.moduleEnrollment.findMany({
      where: {
        module: {
          teacherId,
        },
      },
      take: limit,
      orderBy: {
        enrolledAt: 'desc',
      },
      include: {
        student: {
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
      },
    });

    // Get recent exam attempts
    const recentAttempts = await prisma.studentExamAttempt.findMany({
      where: {
        exam: {
          createdBy: teacherId,
        },
        submittedAt: {
          not: null,
        },
      },
      take: limit,
      orderBy: {
        submittedAt: 'desc',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Get recent live classes
    const recentClasses = await prisma.liveClass.findMany({
      where: {
        teacherId,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Combine all activities
    const activities = [
      ...recentEnrollments.map((enrollment) => ({
        id: enrollment.id,
        type: 'enrollment' as const,
        title: `${enrollment.student.name} enrolled`,
        description: `New enrollment in ${enrollment.module.title}`,
        timestamp: enrollment.enrolledAt,
        user: enrollment.student,
        metadata: {
          moduleId: enrollment.module.id,
          moduleTitle: enrollment.module.title,
        },
      })),
      ...recentAttempts.map((attempt) => ({
        id: attempt.id,
        type: 'submission' as const,
        title: `${attempt.student.name} submitted exam`,
        description: `Exam: ${attempt.exam.title}${attempt.gradedAt ? ' (Graded)' : ' (Pending)'}`,
        timestamp: attempt.submittedAt!,
        user: attempt.student,
        metadata: {
          examId: attempt.exam.id,
          examTitle: attempt.exam.title,
          isGraded: !!attempt.gradedAt,
        },
      })),
      ...recentClasses.map((liveClass) => ({
        id: liveClass.id,
        type: 'class' as const,
        title: `Class: ${liveClass.title}`,
        description: `${liveClass.subject.name} - ${liveClass.class.name}`,
        timestamp: liveClass.createdAt,
        user: null,
        metadata: {
          classId: liveClass.id,
          status: liveClass.status,
        },
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Error fetching teacher recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get teacher's module performance
 * GET /api/teacher/dashboard/module-performance
 */
export const getModulePerformance = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.userId;

    if (!teacherId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const modules = await prisma.module.findMany({
      where: {
        teacherId,
        status: 'PUBLISHED',
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const performance = modules.map((module) => {
      const avgRating = module.reviews.length > 0
        ? module.reviews.reduce((sum, r) => sum + r.rating, 0) / module.reviews.length
        : 0;

      return {
        id: module.id,
        title: module.title,
        enrollments: module._count.enrollments,
        reviews: module._count.reviews,
        averageRating: Number(avgRating.toFixed(1)),
        thumbnail: module.thumbnailUrl,
      };
    });

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    console.error('Error fetching module performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch module performance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
