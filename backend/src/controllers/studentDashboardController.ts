import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

// @desc    Get student dashboard statistics
// @route   GET /api/v1/students/dashboard
// @access  Private (Student)
export const getStudentDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  const studentId = req.user.userId;

  try {
    // Get enrolled modules count
    const enrolledModules = await prisma.moduleEnrollment.count({
      where: {
        studentId: studentId,
        isActive: true,
      },
    });

    // Get completed modules count
    const completedModules = await prisma.moduleEnrollment.count({
      where: {
        studentId: studentId,
        completedAt: {
          not: null,
        },
      },
    });

    // Get total exams available
    const totalExams = await prisma.exam.count({
      where: {
        publishedAt: {
          not: null,
        },
      },
    });

    // Get exam attempts and calculate average score
    const examAttempts = await prisma.studentExamAttempt.findMany({
      where: {
        studentId: studentId,
        isCompleted: true,
      },
      select: {
        totalScore: true,
      },
    });

    const averageScore = examAttempts.length > 0
      ? examAttempts.reduce((sum: number, attempt: any) => sum + (attempt.totalScore || 0), 0) / examAttempts.length
      : 0;

    // Get recent activity (recent enrollments, exam attempts, etc.)
    const recentEnrollments = await prisma.moduleEnrollment.findMany({
      where: {
        studentId: studentId,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    const recentExamAttempts = await prisma.studentExamAttempt.findMany({
      where: {
        studentId: studentId,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Combine and format recent activity
    const recentActivity = [
      ...recentEnrollments.map((enrollment: any) => ({
        type: 'enrollment',
        title: `Enrolled in ${enrollment.module.title}`,
        date: enrollment.createdAt,
        moduleId: enrollment.module.id,
      })),
      ...recentExamAttempts.map((attempt: any) => ({
        type: 'exam',
        title: `Attempted ${attempt.exam.title}`,
        date: attempt.createdAt,
        examId: attempt.exam.id,
        score: attempt.totalScore,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    // Get current progress
    const enrollmentsWithProgress = await prisma.moduleEnrollment.findMany({
      where: {
        studentId: studentId,
        isActive: true,
      },
      select: {
        moduleId: true,
        progress: true,
        module: {
          select: {
            title: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        enrolledModules,
        completedModules,
        totalExams,
        averageScore: Math.round(averageScore * 100) / 100,
        recentActivity,
        currentProgress: enrollmentsWithProgress,
      },
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard',
    });
  }
});
