import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import notificationService from '../services/notificationService';

const prisma = new PrismaClient();

/**
 * Bulk mark notices as read
 * POST /api/v1/notices/bulk/mark-read
 * Access: All authenticated users
 */
export const bulkMarkAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { noticeIds } = req.body;
    const userId = req.user!.userId;

    if (!Array.isArray(noticeIds) || noticeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'noticeIds must be a non-empty array',
      });
    }

    const count = await notificationService.bulkMarkAsRead(userId, noticeIds);

    res.json({
      success: true,
      message: `${count} notices marked as read`,
      data: { count },
    });
  } catch (error: any) {
    console.error('Error in bulk mark as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notices as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notices as read
 * POST /api/v1/notices/bulk/mark-all-read
 * Access: All authenticated users
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Get all unread notice IDs for the user
    const where: any = {
      isPublished: true,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    // Apply role-based filtering
    if (userRole === 'STUDENT') {
      const student = await prisma.user.findUnique({
        where: { id: userId },
        select: { batchId: true },
      });

      const studentClasses = await prisma.studentClass.findMany({
        where: { studentId: userId },
        select: { classId: true },
      });

      const studentModules = await prisma.moduleEnrollment.findMany({
        where: { studentId: userId, isActive: true },
        select: { moduleId: true },
      });

      where.OR = [
        {
          classId: null,
          batchId: null,
          moduleId: null,
          targetRole: null,
        },
        { targetRole: 'STUDENT' },
        { classId: { in: studentClasses.map((sc) => sc.classId) } },
        student?.batchId ? { batchId: student.batchId } : {},
        { moduleId: { in: studentModules.map((sm) => sm.moduleId) } },
      ];
    } else if (userRole === 'TEACHER') {
      const teacherClasses = await prisma.teacherClass.findMany({
        where: { teacherId: userId },
        select: { classId: true },
      });

      const teacherModules = await prisma.module.findMany({
        where: { teacherId: userId },
        select: { id: true },
      });

      where.OR = [
        {
          classId: null,
          batchId: null,
          moduleId: null,
          targetRole: null,
        },
        { targetRole: 'TEACHER' },
        { classId: { in: teacherClasses.map((tc) => tc.classId) } },
        { moduleId: { in: teacherModules.map((tm) => tm.id) } },
      ];
    }

    const allNotices = await prisma.notice.findMany({
      where,
      select: { id: true },
    });

    const readNoticeIds = await prisma.noticeRead.findMany({
      where: { userId },
      select: { noticeId: true },
    });

    const readIds = new Set(readNoticeIds.map((r) => r.noticeId));
    const unreadIds = allNotices.filter((n) => !readIds.has(n.id)).map((n) => n.id);

    if (unreadIds.length > 0) {
      await notificationService.bulkMarkAsRead(userId, unreadIds);
    }

    res.json({
      success: true,
      message: `${unreadIds.length} notices marked as read`,
      data: { count: unreadIds.length },
    });
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notices as read',
      error: error.message,
    });
  }
};

/**
 * Get notification preferences
 * GET /api/v1/notices/preferences
 * Access: All authenticated users
 */
export const getNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const preferences = await notificationService.getUserPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences',
      error: error.message,
    });
  }
};

/**
 * Update notification preferences
 * PUT /api/v1/notices/preferences
 * Access: All authenticated users
 */
export const updateNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const preferences = req.body;

    const updated = await notificationService.updateUserPreferences(userId, preferences);

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message,
    });
  }
};

/**
 * Get notification statistics
 * GET /api/v1/notices/stats
 * Access: All authenticated users
 */
export const getNotificationStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const stats = await notificationService.getNotificationStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message,
    });
  }
};

/**
 * Soft delete multiple notices
 * POST /api/v1/notices/bulk/delete
 * Access: Admin, Creator
 */
export const bulkDeleteNotices = async (req: AuthRequest, res: Response) => {
  try {
    const { noticeIds } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (!Array.isArray(noticeIds) || noticeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'noticeIds must be a non-empty array',
      });
    }

    // Check permissions
    const notices = await prisma.notice.findMany({
      where: { id: { in: noticeIds } },
      select: { id: true, publishedBy: true },
    });

    // Non-admins can only delete their own notices
    if (userRole !== 'ADMIN') {
      const unauthorized = notices.filter((n) => n.publishedBy !== userId);
      if (unauthorized.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own notices',
        });
      }
    }

    // Soft delete
    await prisma.notice.updateMany({
      where: { id: { in: noticeIds } },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: `${notices.length} notices deleted successfully`,
      data: { count: notices.length },
    });
  } catch (error: any) {
    console.error('Error bulk deleting notices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notices',
      error: error.message,
    });
  }
};

/**
 * Get all batches (for notice targeting)
 * GET /api/v1/notices/batches
 * Access: Admin, Teacher
 */
export const getAllBatches = async (req: AuthRequest, res: Response) => {
  try {
    const batches = await prisma.batch.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      data: batches,
    });
  } catch (error: any) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches',
      error: error.message,
    });
  }
};

/**
 * Get all classes (for notice targeting - Admin only)
 * GET /api/v1/notices/admin/classes
 * Access: Admin
 */
export const getAllClasses = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint',
      });
    }

    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        section: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedClasses = classes.map((c) => ({
      id: c.id,
      name: c.section ? `${c.name} - ${c.section}` : c.name,
    }));

    res.json({
      success: true,
      data: formattedClasses,
    });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes',
      error: error.message,
    });
  }
};

/**
 * Get all modules (for notice targeting - Admin only)
 * GET /api/v1/notices/admin/modules
 * Access: Admin
 */
export const getAllModules = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint',
      });
    }

    const modules = await prisma.module.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: {
        title: 'asc',
      },
    });

    res.json({
      success: true,
      data: modules,
    });
  } catch (error: any) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch modules',
      error: error.message,
    });
  }
};

export default {
  bulkMarkAsRead,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationStats,
  bulkDeleteNotices,
  getAllBatches,
  getAllClasses,
  getAllModules,
};
