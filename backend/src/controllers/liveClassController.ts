import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

// @desc    Create live class
// @route   POST /api/live-classes
// @access  Private (Teacher/Admin)
export const createLiveClass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    subjectId,
    classId,
    moduleId,
    youtubeUrl,
    meetingLink,
    startTime,
    endTime,
    maxStudents,
  } = req.body;

  const teacherId = req.user!.id;

  // If moduleId is provided, validate teacher owns the module and get class/subject from it
  if (moduleId) {
    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        teacherId,
      },
      include: {
        class: true,
        subject: true,
      },
    });

    if (!module && req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to add live classes to this module',
      });
      return;
    }

    // If module exists, teacher is authorized (they own the module)
    // No need for additional TeacherClass check
  } else {
    // If no moduleId, validate teacher has access to this class and subject
    const teacherClass = await prisma.teacherClass.findFirst({
      where: {
        teacherId,
        classId,
        subjectId,
        isActive: true,
      },
    });

    if (!teacherClass && req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to create classes for this subject/class',
      });
      return;
    }
  }

  const liveClass = await prisma.liveClass.create({
    data: {
      title,
      description,
      subjectId,
      teacherId,
      classId,
      moduleId,
      youtubeUrl,
      meetingLink,
      startTime: new Date(startTime),
      ...(endTime && { endTime: new Date(endTime) }),
      maxStudents,
    },
    include: {
      subject: { select: { name: true } },
      teacher: { select: { name: true } },
      class: { select: { name: true, section: true } },
      module: { select: { id: true, title: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Live class created successfully',
    data: { liveClass },
  });
});

// @desc    Get live classes
// @route   GET /api/live-classes
// @access  Private
export const getLiveClasses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    status,
    classId,
    subjectId,
    moduleId,
    date,
    upcoming = false,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  // Filter by user role
  if (req.user!.role === 'TEACHER') {
    where.teacherId = req.user!.id;
  } else if (req.user!.role === 'STUDENT') {
    // Get student's classes
    const studentClasses = await prisma.studentClass.findMany({
      where: { studentId: req.user!.id, isActive: true },
      select: { classId: true },
    });
    const classIds = studentClasses.map((sc: { classId: string }) => sc.classId);
    where.classId = { in: classIds };
  }

  // Apply filters
  if (status) where.status = status;
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (moduleId) where.moduleId = moduleId;
  if (date) {
    const startOfDay = new Date(date as string);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    where.startTime = {
      gte: startOfDay,
      lt: endOfDay,
    };
  }
  if (upcoming === 'true') {
    where.startTime = { gte: new Date() };
    where.status = { in: ['SCHEDULED', 'LIVE'] };
  }

  const [liveClasses, total] = await Promise.all([
    prisma.liveClass.findMany({
      where,
      include: {
        subject: { select: { name: true, color: true } },
        teacher: { select: { name: true } },
        class: { select: { name: true, section: true } },
        module: { select: { id: true, title: true } },
        _count: { select: { attendances: true } },
      },
      orderBy: { startTime: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.liveClass.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'Live classes retrieved successfully',
    data: {
      liveClasses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    },
  });
});

// @desc    Get live class by ID
// @route   GET /api/live-classes/:id
// @access  Private
export const getLiveClassById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const liveClass = await prisma.liveClass.findUnique({
    where: { id },
    include: {
      subject: { select: { name: true, color: true } },
      teacher: { select: { name: true, email: true } },
      class: { select: { name: true, section: true } },
      attendances: {
        include: {
          student: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!liveClass) {
    res.status(404).json({
      success: false,
      message: 'Live class not found',
    });
    return;
  }

  // Check access permissions
  if (req.user!.role === 'STUDENT') {
    const studentClass = await prisma.studentClass.findFirst({
      where: {
        studentId: req.user!.id,
        classId: liveClass.classId,
        isActive: true,
      },
    });
    if (!studentClass) {
      res.status(403).json({
        success: false,
        message: 'You are not enrolled in this class',
      });
      return;
    }
  }

  res.json({
    success: true,
    message: 'Live class retrieved successfully',
    data: { liveClass },
  });
});

// @desc    Update live class
// @route   PUT /api/live-classes/:id
// @access  Private (Teacher/Admin)
export const updateLiveClass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const liveClass = await prisma.liveClass.findUnique({
    where: { id },
    select: { teacherId: true },
  });

  if (!liveClass) {
    res.status(404).json({
      success: false,
      message: 'Live class not found',
    });
    return;
  }

  // Check permissions
  if (req.user!.role === 'TEACHER' && liveClass.teacherId !== req.user!.id) {
    res.status(403).json({
      success: false,
      message: 'You can only update your own classes',
    });
    return;
  }

  const updatedLiveClass = await prisma.liveClass.update({
    where: { id },
    data: {
      ...updateData,
      startTime: updateData.startTime ? new Date(updateData.startTime) : undefined,
      endTime: updateData.endTime ? new Date(updateData.endTime) : undefined,
    },
    include: {
      subject: { select: { name: true } },
      teacher: { select: { name: true } },
      class: { select: { name: true, section: true } },
    },
  });

  res.json({
    success: true,
    message: 'Live class updated successfully',
    data: { liveClass: updatedLiveClass },
  });
});

// @desc    Delete live class
// @route   DELETE /api/live-classes/:id
// @access  Private (Teacher/Admin)
export const deleteLiveClass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const liveClass = await prisma.liveClass.findUnique({
    where: { id },
    select: { teacherId: true, status: true },
  });

  if (!liveClass) {
    res.status(404).json({
      success: false,
      message: 'Live class not found',
    });
    return;
  }

  // Check permissions
  if (req.user!.role === 'TEACHER' && liveClass.teacherId !== req.user!.id) {
    res.status(403).json({
      success: false,
      message: 'You can only delete your own classes',
    });
    return;
  }

  // Prevent deletion of live or completed classes
  if (liveClass.status === 'LIVE') {
    res.status(400).json({
      success: false,
      message: 'Cannot delete a live class',
    });
    return;
  }

  await prisma.liveClass.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Live class deleted successfully',
  });
});

// @desc    Join live class (mark attendance)
// @route   POST /api/live-classes/:id/join
// @access  Private (Student)
export const joinLiveClass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const studentId = req.user!.id;

  if (req.user!.role !== 'STUDENT') {
    res.status(403).json({
      success: false,
      message: 'Only students can join live classes',
    });
    return;
  }

  const liveClass = await prisma.liveClass.findUnique({
    where: { id },
    select: { classId: true, status: true, maxStudents: true },
  });

  if (!liveClass) {
    res.status(404).json({
      success: false,
      message: 'Live class not found',
    });
    return;
  }

  // Check if student is enrolled in the class
  const studentClass = await prisma.studentClass.findFirst({
    where: {
      studentId,
      classId: liveClass.classId,
      isActive: true,
    },
  });

  if (!studentClass) {
    res.status(403).json({
      success: false,
      message: 'You are not enrolled in this class',
    });
    return;
  }

  // Check if class is live or scheduled
  if (liveClass.status !== 'LIVE' && liveClass.status !== 'SCHEDULED') {
    res.status(400).json({
      success: false,
      message: 'This class is not available for joining',
    });
    return;
  }

  // Check max students limit
  if (liveClass.maxStudents) {
    const attendanceCount = await prisma.attendance.count({
      where: { liveClassId: id },
    });
    if (attendanceCount >= liveClass.maxStudents) {
      res.status(400).json({
        success: false,
        message: 'Class is full',
      });
      return;
    }
  }

  // Create or update attendance
  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_liveClassId: {
        studentId,
        liveClassId: id,
      },
    },
    update: {
      joinedAt: new Date(),
      isPresent: true,
    },
    create: {
      studentId,
      liveClassId: id,
      joinedAt: new Date(),
      isPresent: true,
    },
  });

  res.json({
    success: true,
    message: 'Successfully joined the live class',
    data: { attendance },
  });
});

// @desc    Leave live class
// @route   POST /api/live-classes/:id/leave
// @access  Private (Student)
export const leaveLiveClass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const studentId = req.user!.id;

  const attendance = await prisma.attendance.findUnique({
    where: {
      studentId_liveClassId: {
        studentId,
        liveClassId: id,
      },
    },
  });

  if (!attendance) {
    res.status(404).json({
      success: false,
      message: 'Attendance record not found',
    });
    return;
  }

  const leftAt = new Date();
  const duration = Math.floor((leftAt.getTime() - attendance.joinedAt.getTime()) / (1000 * 60));

  await prisma.attendance.update({
    where: {
      studentId_liveClassId: {
        studentId,
        liveClassId: id,
      },
    },
    data: {
      leftAt,
      duration,
    },
  });

  res.json({
    success: true,
    message: 'Successfully left the live class',
    data: { duration },
  });
});

// @desc    Get live classes by module
// @route   GET /api/live-classes/module/:moduleId
// @access  Private
export const getLiveClassesByModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { moduleId } = req.params;

  const liveClasses = await prisma.liveClass.findMany({
    where: {
      moduleId,
    },
    include: {
      subject: { select: { id: true, name: true } },
      teacher: { select: { id: true, name: true } },
      class: { select: { id: true, name: true, section: true } },
      module: { select: { id: true, title: true } },
      _count: {
        select: {
          attendances: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  res.json({
    success: true,
    data: liveClasses,
  });
});