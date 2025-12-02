import { Response } from 'express';
import { PrismaClient, NoticeCategory, Priority, Role } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * Create a new notice
 * POST /api/v1/notices
 * Access: Admin, Teacher
 */
export const createNotice = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      attachmentUrl,
      isPinned,
      expiresAt,
      classId,
      batchId,
      moduleId,
      targetRole,
      isPublished,
    } = req.body;

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Validate permissions
    if (userRole === 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Students cannot create notices',
      });
    }

    // Teachers can only create notices for their classes/modules
    if (userRole === 'TEACHER' && !classId && !moduleId && !batchId) {
      return res.status(400).json({
        success: false,
        message: 'Teachers must specify a class, batch, or module for notices',
      });
    }

    // Only admins can create global notices
    if (userRole === 'TEACHER' && !classId && !moduleId && !batchId) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create global notices',
      });
    }

    // Teachers cannot target ADMIN role
    if (userRole === 'TEACHER' && targetRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Teachers cannot create notices targeted to admins',
      });
    }

    // Verify ownership for teachers
    if (userRole === 'TEACHER') {
      if (moduleId) {
        const module = await prisma.module.findUnique({
          where: { id: moduleId },
        });
        if (!module || module.teacherId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You can only create notices for your own modules',
          });
        }
      }
      
      if (classId) {
        const teacherClass = await prisma.teacherClass.findFirst({
          where: { teacherId: userId, classId },
        });
        if (!teacherClass) {
          return res.status(403).json({
            success: false,
            message: 'You can only create notices for your assigned classes',
          });
        }
      }
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category: category || NoticeCategory.GENERAL,
        priority: priority || Priority.MEDIUM,
        attachmentUrl,
        isPinned: isPinned || false,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        classId,
        batchId,
        moduleId,
        targetRole,
        publishedBy: userId,
      },
      include: {
        publishedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        class: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } },
        module: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice,
    });
  } catch (error: any) {
    console.error('Error creating notice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notice',
      error: error.message,
    });
  }
};

/**
 * Get all notices (with filtering)
 * GET /api/v1/notices
 * Access: All authenticated users
 */
export const getAllNotices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const {
      category,
      priority,
      isPinned,
      classId,
      batchId,
      moduleId,
      includeExpired,
      unreadOnly,
    } = req.query;

    // Build filter conditions
    const where: any = {
      isPublished: true,
    };

    // Filter by expiration (exclude expired by default)
    if (includeExpired !== 'true') {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by priority
    if (priority) {
      where.priority = priority;
    }

    // Filter by pinned status
    if (isPinned === 'true') {
      where.isPinned = true;
    }

    // Role-based filtering
    if (userRole === 'STUDENT') {
      // Get student's class and batch
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

      // Students see:
      // 1. Global notices (no targeting)
      // 2. Notices targeted to their role
      // 3. Notices targeted to their classes
      // 4. Notices targeted to their batch
      // 5. Notices targeted to their modules
      const orConditions: any[] = [
        // Global notices
        {
          classId: null,
          batchId: null,
          moduleId: null,
          targetRole: null,
        },
        // Role-targeted
        { targetRole: 'STUDENT' },
      ];

      // Only add class condition if student has classes
      if (studentClasses.length > 0) {
        orConditions.push({
          classId: { in: studentClasses.map((sc) => sc.classId) },
        });
      }

      // Only add batch condition if student has a batch
      if (student?.batchId) {
        orConditions.push({ batchId: student.batchId });
      }

      // Only add module condition if student has enrollments
      if (studentModules.length > 0) {
        orConditions.push({
          moduleId: { in: studentModules.map((sm) => sm.moduleId) },
        });
      }

      where.OR = orConditions;
    } else if (userRole === 'TEACHER') {
      // Teachers see:
      // 1. Global notices
      // 2. Notices targeted to teachers
      // 3. Notices for their classes
      // 4. Notices for their modules
      const teacherClasses = await prisma.teacherClass.findMany({
        where: { teacherId: userId },
        select: { classId: true },
      });

      const teacherModules = await prisma.module.findMany({
        where: { teacherId: userId },
        select: { id: true },
      });

      const orConditions: any[] = [
        {
          classId: null,
          batchId: null,
          moduleId: null,
          targetRole: null,
        },
        { targetRole: 'TEACHER' },
      ];

      // Only add class condition if teacher has classes
      if (teacherClasses.length > 0) {
        orConditions.push({
          classId: { in: teacherClasses.map((tc) => tc.classId) },
        });
      }

      // Only add module condition if teacher has modules
      if (teacherModules.length > 0) {
        orConditions.push({
          moduleId: { in: teacherModules.map((tm) => tm.id) },
        });
      }

      where.OR = orConditions;
    }
    // Admins see all published notices (no additional filter)

    // Manual filters for specific targeting
    if (classId) {
      where.classId = classId;
    }
    if (batchId) {
      where.batchId = batchId;
    }
    if (moduleId) {
      where.moduleId = moduleId;
    }

    // Get notices
    let notices = await prisma.notice.findMany({
      where,
      include: {
        publishedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        class: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } },
        module: { select: { id: true, title: true } },
        readBy: {
          where: { userId },
          select: { readAt: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
    });

    // Filter unread only if requested
    if (unreadOnly === 'true') {
      notices = notices.filter((notice) => notice.readBy.length === 0);
    }

    // Add isRead flag
    const noticesWithReadStatus = notices.map((notice) => ({
      ...notice,
      isRead: notice.readBy.length > 0,
      readBy: undefined, // Remove readBy array from response
    }));

    res.json({
      success: true,
      message: 'Notices retrieved successfully',
      data: noticesWithReadStatus,
    });
  } catch (error: any) {
    console.error('Error fetching notices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notices',
      error: error.message,
    });
  }
};

/**
 * Get notice by ID
 * GET /api/v1/notices/:id
 * Access: All authenticated users
 */
export const getNoticeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notice = await prisma.notice.findUnique({
      where: { id },
      include: {
        publishedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
          },
        },
        class: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } },
        module: { select: { id: true, title: true } },
        readBy: {
          where: { userId },
          select: { readAt: true },
        },
      },
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    // Increment view count
    await prisma.notice.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Mark as read if not already
    if (notice.readBy.length === 0) {
      await prisma.noticeRead.create({
        data: {
          noticeId: id,
          userId,
        },
      });
    }

    res.json({
      success: true,
      message: 'Notice retrieved successfully',
      data: {
        ...notice,
        isRead: notice.readBy.length > 0,
        readBy: undefined,
      },
    });
  } catch (error: any) {
    console.error('Error fetching notice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notice',
      error: error.message,
    });
  }
};

/**
 * Update notice
 * PUT /api/v1/notices/:id
 * Access: Admin, Notice creator
 */
export const updateNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const updates = req.body;

    const existingNotice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!existingNotice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    // Check permissions - Everyone can only update their own notices
    if (existingNotice.publishedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own notices',
      });
    }

    // Teachers cannot target ADMIN role
    if (userRole === 'TEACHER' && updates.targetRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Teachers cannot create notices targeted to admins',
      });
    }

    // Verify teacher ownership for updated targeting
    if (userRole === 'TEACHER') {
      if (updates.moduleId) {
        const module = await prisma.module.findUnique({
          where: { id: updates.moduleId },
        });
        if (!module || module.teacherId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You can only create notices for your own modules',
          });
        }
      }
      
      if (updates.classId) {
        const teacherClass = await prisma.teacherClass.findFirst({
          where: { teacherId: userId, classId: updates.classId },
        });
        if (!teacherClass) {
          return res.status(403).json({
            success: false,
            message: 'You can only create notices for your assigned classes',
          });
        }
      }

      // Teachers must specify at least one target
      if (!updates.classId && !updates.moduleId && !updates.batchId && 
          !existingNotice.classId && !existingNotice.moduleId && !existingNotice.batchId) {
        return res.status(400).json({
          success: false,
          message: 'Teachers must specify a class, batch, or module for notices',
        });
      }
    }

    // Update publishedAt if changing to published
    if (updates.isPublished && !existingNotice.isPublished) {
      updates.publishedAt = new Date();
    }

    const notice = await prisma.notice.update({
      where: { id },
      data: updates,
      include: {
        publishedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        class: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } },
        module: { select: { id: true, title: true } },
      },
    });

    res.json({
      success: true,
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (error: any) {
    console.error('Error updating notice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notice',
      error: error.message,
    });
  }
};

/**
 * Delete notice
 * DELETE /api/v1/notices/:id
 * Access: Admin, Notice creator
 */
export const deleteNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const existingNotice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!existingNotice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    // Check permissions - Everyone can only delete their own notices
    if (existingNotice.publishedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own notices',
      });
    }

    await prisma.notice.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting notice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notice',
      error: error.message,
    });
  }
};

/**
 * Mark notice as read
 * POST /api/v1/notices/:id/read
 * Access: All authenticated users
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if notice exists
    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    // Create or update read record
    await prisma.noticeRead.upsert({
      where: {
        noticeId_userId: {
          noticeId: id,
          userId,
        },
      },
      create: {
        noticeId: id,
        userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Notice marked as read',
    });
  } catch (error: any) {
    console.error('Error marking notice as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notice as read',
      error: error.message,
    });
  }
};

/**
 * Get unread notice count
 * GET /api/v1/notices/unread/count
 * Access: All authenticated users
 */
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Build filter similar to getAllNotices
    const where: any = {
      isPublished: true,
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

    // Get all notices user should see
    const allNotices = await prisma.notice.findMany({
      where,
      select: { id: true },
    });

    // Get read notices
    const readNotices = await prisma.noticeRead.findMany({
      where: {
        userId,
        noticeId: { in: allNotices.map((n) => n.id) },
      },
      select: { noticeId: true },
    });

    const unreadCount = allNotices.length - readNotices.length;

    res.json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: {
        unreadCount,
        totalCount: allNotices.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message,
    });
  }
};

/**
 * Get teacher's assigned classes
 * GET /api/v1/notices/teacher/classes
 * Access: Teacher only
 */
export const getTeacherClasses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (userRole !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint',
      });
    }

    const teacherClasses = await prisma.teacherClass.findMany({
      where: { teacherId: userId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true,
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

    const formattedClasses = teacherClasses.map((tc) => ({
      id: tc.class.id,
      name: tc.class.section ? `${tc.class.name} - ${tc.class.section}` : tc.class.name,
      subjectName: tc.subject.name,
    }));

    res.json({
      success: true,
      data: formattedClasses,
    });
  } catch (error: any) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher classes',
      error: error.message,
    });
  }
};

/**
 * Get teacher's modules
 * GET /api/v1/notices/teacher/modules
 * Access: Teacher only
 */
export const getTeacherModules = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (userRole !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint',
      });
    }

    const modules = await prisma.module.findMany({
      where: { teacherId: userId },
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
    console.error('Error fetching teacher modules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher modules',
      error: error.message,
    });
  }
};

export default {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  markAsRead,
  getUnreadCount,
  getTeacherClasses,
  getTeacherModules,
};