import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @desc    Get all pending modules for approval
 * @route   GET /api/v1/admin/modules/approval/pending
 * @access  Admin
 */
export const getPendingModules = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const [modules, total] = await Promise.all([
    prisma.module.findMany({
      where: {
        status: 'PENDING_APPROVAL',
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
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
            section: true,
          },
        },
        _count: {
          select: {
            topics: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: Number(limit),
    }),
    prisma.module.count({
      where: {
        status: 'PENDING_APPROVAL',
      },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      modules,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/**
 * @desc    Get all approved/rejected modules history
 * @route   GET /api/v1/admin/modules/approval/history
 * @access  Admin
 */
export const getApprovalHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, status } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  // Build where clause
  const where: any = {
    OR: [
      { status: 'APPROVED' },
      { status: 'PUBLISHED' },
    ],
  };
  
  // If status filter is provided
  if (status && ['APPROVED', 'PUBLISHED', 'ARCHIVED'].includes(status as string)) {
    where.status = status;
    delete where.OR;
  }
  
  // Add rejection filter
  if (status === 'REJECTED') {
    where.rejectedAt = { not: null };
    delete where.OR;
    delete where.status;
  }
  
  const [modules, total] = await Promise.all([
    prisma.module.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        rejecter: {
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
        _count: {
          select: {
            topics: true,
            enrollments: true,
          },
        },
      },
      orderBy: [
        { approvedAt: 'desc' },
        { rejectedAt: 'desc' },
        { updatedAt: 'desc' },
      ],
      skip,
      take: Number(limit),
    }),
    prisma.module.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      modules,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/**
 * @desc    Approve a module
 * @route   POST /api/v1/admin/modules/approval/:id/approve
 * @access  Admin
 */
export const approveModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { publishImmediately = false } = req.body;
  const adminId = req.user!.id;

  // Check if module exists
  const module = await prisma.module.findUnique({
    where: { id },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!module) {
    res.status(404).json({
      success: false,
      message: 'Module not found',
    });
    return;
  }

  // Check if module is pending approval
  if (module.status !== 'PENDING_APPROVAL') {
    res.status(400).json({
      success: false,
      message: 'Module is not pending approval',
    });
    return;
  }

  // Update module with transaction
  const updatedModule = await prisma.$transaction(async (tx) => {
    const updated = await tx.module.update({
      where: { id },
      data: {
        status: publishImmediately ? 'PUBLISHED' : 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date(),
        publishedAt: publishImmediately ? new Date() : null,
        rejectedBy: null, // Clear rejection data if previously rejected
        rejectedAt: null,
        rejectionReason: null,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for teacher
    await tx.notification.create({
      data: {
        type: 'LIVE_CLASS', // Reusing existing type
        title: `Module Approved: ${module.title}`,
        message: publishImmediately
          ? `Your module "${module.title}" has been approved and published by admin.`
          : `Your module "${module.title}" has been approved. You can now publish it.`,
        senderId: adminId,
        receiverId: module.teacherId,
      },
    });

    // Log activity
    await tx.activityHistory.create({
      data: {
        userId: adminId,
        moduleId: id,
        activityType: 'MODULE_ENROLLED',
        title: `Approved module: ${module.title}`,
        metadata: {
          action: 'approved',
          moduleName: module.title,
          publishImmediately,
        },
      },
    });

    return updated;
  });

  res.status(200).json({
    success: true,
    message: publishImmediately
      ? 'Module approved and published successfully'
      : 'Module approved successfully',
    data: updatedModule,
  });
});

/**
 * @desc    Reject a module
 * @route   POST /api/v1/admin/modules/approval/:id/reject
 * @access  Admin
 */
export const rejectModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const adminId = req.user!.id;

  if (!reason || reason.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Rejection reason is required',
    });
    return;
  }

  // Check if module exists
  const module = await prisma.module.findUnique({
    where: { id },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!module) {
    res.status(404).json({
      success: false,
      message: 'Module not found',
    });
    return;
  }

  // Check if module is pending approval
  if (module.status !== 'PENDING_APPROVAL') {
    res.status(400).json({
      success: false,
      message: 'Module is not pending approval',
    });
    return;
  }

  // Update module with transaction
  const updatedModule = await prisma.$transaction(async (tx) => {
    const updated = await tx.module.update({
      where: { id },
      data: {
        status: 'DRAFT', // Reset to draft for teacher to fix
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: reason,
        approvedBy: null, // Clear approval data
        approvedAt: null,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        rejecter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for teacher
    await tx.notification.create({
      data: {
        type: 'LIVE_CLASS',
        title: `Module Rejected: ${module.title}`,
        message: `Your module "${module.title}" has been rejected. Reason: ${reason}`,
        senderId: adminId,
        receiverId: module.teacherId,
      },
    });

    // Log activity
    await tx.activityHistory.create({
      data: {
        userId: adminId,
        moduleId: id,
        activityType: 'MODULE_ENROLLED',
        title: `Rejected module: ${module.title}`,
        metadata: {
          action: 'rejected',
          moduleName: module.title,
          reason,
        },
      },
    });

    return updated;
  });

  res.status(200).json({
    success: true,
    message: 'Module rejected successfully',
    data: updatedModule,
  });
});

/**
 * @desc    Get approval statistics
 * @route   GET /api/v1/admin/modules/approval/stats
 * @access  Admin
 */
export const getApprovalStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [pending, approved, rejected, published] = await Promise.all([
    prisma.module.count({
      where: { status: 'PENDING_APPROVAL' },
    }),
    prisma.module.count({
      where: { status: 'APPROVED' },
    }),
    prisma.module.count({
      where: {
        rejectedAt: { not: null },
        status: 'DRAFT',
      },
    }),
    prisma.module.count({
      where: { status: 'PUBLISHED' },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      pending,
      approved,
      rejected,
      published,
      total: pending + approved + rejected + published,
    },
  });
});
