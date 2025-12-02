import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get dashboard statistics for admin
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total counts
    const [
      totalStudents,
      totalTeachers,
      activeModules,
      liveClassesToday,
      studentsLastMonth,
      teachersLastMonth,
      modulesLastMonth,
    ] = await Promise.all([
      // Total active students
      prisma.user.count({
        where: {
          role: 'STUDENT',
          isActive: true,
        },
      }),
      // Total active teachers
      prisma.user.count({
        where: {
          role: 'TEACHER',
          isActive: true,
        },
      }),
      // Active published modules
      prisma.module.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
      // Live classes scheduled for today
      prisma.liveClass.count({
        where: {
          startTime: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lt: new Date(now.setHours(23, 59, 59, 999)),
          },
          status: {
            in: ['SCHEDULED', 'LIVE'],
          },
        },
      }),
      // Students from last month
      prisma.user.count({
        where: {
          role: 'STUDENT',
          isActive: true,
          createdAt: {
            gte: lastMonth,
            lt: firstDayOfMonth,
          },
        },
      }),
      // Teachers from last month
      prisma.user.count({
        where: {
          role: 'TEACHER',
          isActive: true,
          createdAt: {
            gte: lastMonth,
            lt: firstDayOfMonth,
          },
        },
      }),
      // Modules from last month
      prisma.module.count({
        where: {
          status: 'PUBLISHED',
          createdAt: {
            gte: lastMonth,
            lt: firstDayOfMonth,
          },
        },
      }),
    ]);

    // Calculate this month's counts
    const studentsThisMonth = await prisma.user.count({
      where: {
        role: 'STUDENT',
        isActive: true,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    const teachersThisMonth = await prisma.user.count({
      where: {
        role: 'TEACHER',
        isActive: true,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    const modulesThisMonth = await prisma.module.count({
      where: {
        status: 'PUBLISHED',
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    // Calculate percentage changes
    const studentChange = studentsLastMonth > 0 
      ? ((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100 
      : studentsThisMonth > 0 ? 100 : 0;

    const teacherChange = teachersLastMonth > 0 
      ? ((teachersThisMonth - teachersLastMonth) / teachersLastMonth) * 100 
      : teachersThisMonth > 0 ? 100 : 0;

    const moduleChange = modulesLastMonth > 0 
      ? ((modulesThisMonth - modulesLastMonth) / modulesLastMonth) * 100 
      : modulesThisMonth > 0 ? 100 : 0;

    // Get last month's live classes for comparison
    const liveClassesLastMonth = await prisma.liveClass.count({
      where: {
        startTime: {
          gte: lastMonth,
          lt: lastMonthEnd,
        },
      },
    });

    const liveClassesThisMonth = await prisma.liveClass.count({
      where: {
        startTime: {
          gte: firstDayOfMonth,
        },
      },
    });

    const liveClassChange = liveClassesLastMonth > 0
      ? ((liveClassesThisMonth - liveClassesLastMonth) / liveClassesLastMonth) * 100
      : liveClassesThisMonth > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        activeModules,
        liveClassesToday,
        changes: {
          students: {
            value: Math.abs(Number(studentChange.toFixed(1))),
            type: studentChange >= 0 ? 'increase' : 'decrease',
          },
          teachers: {
            value: Math.abs(Number(teacherChange.toFixed(1))),
            type: teacherChange >= 0 ? 'increase' : 'decrease',
          },
          modules: {
            value: Math.abs(Number(moduleChange.toFixed(1))),
            type: moduleChange >= 0 ? 'increase' : 'decrease',
          },
          liveClasses: {
            value: Math.abs(Number(liveClassChange.toFixed(1))),
            type: liveClassChange >= 0 ? 'increase' : 'decrease',
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get enrollment growth data for chart
 * GET /api/dashboard/enrollment-growth
 */
export const getEnrollmentGrowth = async (req: Request, res: Response) => {
  try {
    const months = 12;
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [students, teachers] = await Promise.all([
        prisma.user.count({
          where: {
            role: 'STUDENT',
            createdAt: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        }),
        prisma.user.count({
          where: {
            role: 'TEACHER',
            createdAt: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        }),
      ]);

      data.push({
        month: firstDay.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        students,
        teachers,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching enrollment growth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment growth data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get course distribution data
 * GET /api/dashboard/course-distribution
 */
export const getCourseDistribution = async (req: Request, res: Response) => {
  try {
    // Get all subjects with their module counts
    const subjects = await prisma.subject.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            modules: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    });

    const distribution = subjects
      .map((subject) => ({
        name: subject.name,
        value: subject._count.modules,
        color: subject.color || '#3b82f6',
      }))
      .filter((item) => item.value > 0);

    res.json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    console.error('Error fetching course distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course distribution',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get recent activity data
 * GET /api/dashboard/recent-activity
 */
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const limit = 10;

    // Get recent enrollments
    const recentEnrollments = await prisma.moduleEnrollment.findMany({
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

    // Get recent classes
    const recentClasses = await prisma.liveClass.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get recent notices
    const recentNotices = await prisma.notice.findMany({
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
      where: {
        isPublished: true,
      },
      include: {
        publishedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Combine and format activities
    const activities = [
      ...recentEnrollments.map((enrollment) => ({
        id: enrollment.id,
        type: 'enrollment' as const,
        title: `${enrollment.student.name} enrolled in ${enrollment.module.title}`,
        description: enrollment.module.title,
        timestamp: enrollment.enrolledAt,
        user: enrollment.student,
      })),
      ...recentClasses.map((liveClass) => ({
        id: liveClass.id,
        type: 'class' as const,
        title: `${liveClass.teacher.name} scheduled a class`,
        description: `${liveClass.title} - ${liveClass.subject?.name || 'General'}`,
        timestamp: liveClass.createdAt,
        user: liveClass.teacher,
      })),
      ...recentNotices.map((notice) => ({
        id: notice.id,
        type: 'notice' as const,
        title: notice.title,
        description: `${notice.category} notice published`,
        timestamp: notice.publishedAt || notice.createdAt,
        user: {
          id: notice.publishedByUser.id,
          name: notice.publishedByUser.name,
          email: notice.publishedByUser.email,
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
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get activity chart data (daily activity for last 30 days)
 * GET /api/dashboard/activity-chart
 */
export const getActivityChart = async (req: Request, res: Response) => {
  try {
    const days = 30;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [enrollments, classes, exams] = await Promise.all([
        prisma.moduleEnrollment.count({
          where: {
            enrolledAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        prisma.liveClass.count({
          where: {
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        prisma.exam.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
      ]);

      data.push({
        date: startOfDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        enrollments,
        classes,
        exams,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching activity chart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity chart data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
