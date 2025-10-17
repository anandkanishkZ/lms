import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service';
import { smsService } from '../services/sms.service';

const prisma = new PrismaClient();

// Validation schemas
const createStudentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  school: z.string().min(2, 'School name is required'),
  phone: z.string().optional().refine((val) => !val || (val.length >= 10 && /^\+?[\d\s\-\(\)]+$/.test(val)), 'Invalid phone format'),
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, 'Invalid email format'),
});

const createTeacherSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  department: z.string().min(2, 'Department is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format'),
  email: z.string().email('Invalid email address'),
  experience: z.string().optional(),
});

// Generate unique user ID
const generateUserId = (): string => {
  const currentYear = new Date().getFullYear();
  const uniqueCode = Math.floor(Math.random() * 900) + 100; // 3 digit random number
  return `${currentYear}${uniqueCode}`;
};

// Generate temporary password
// Format: firstName + last 2 digits of year (e.g., "John25")
const generateTempPassword = (firstName: string): string => {
  const currentYear = new Date().getFullYear();
  const yearLastTwoDigits = currentYear.toString().slice(-2); // Get last 2 digits (e.g., "25" from "2025")
  return `${firstName}${yearLastTwoDigits}`;
};

// @desc    Create new student
// @route   POST /api/v1/admin/users/student
// @access  Private (Admin)
export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createStudentSchema.parse(req.body);
  
  // Check if email already exists (if provided)
  if (validatedData.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
      return;
    }
  }

  // Check if phone already exists (if provided)
  if (validatedData.phone) {
    const existingUser = await prisma.user.findUnique({
      where: { phone: validatedData.phone }
    });
    
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
      return;
    }
  }

  // Generate unique symbol number
  let symbolNo;
  let isUnique = false;
  while (!isUnique) {
    symbolNo = generateUserId();
    const existingUser = await prisma.user.findUnique({
      where: { symbolNo }
    });
    if (!existingUser) isUnique = true;
  }

  // Generate temporary password and hash it
  const tempPassword = generateTempPassword(validatedData.firstName);
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  // Create full name
  const fullName = `${validatedData.firstName} ${validatedData.middleName ? validatedData.middleName + ' ' : ''}${validatedData.lastName}`.trim();

  // Create the student user
  const student = await prisma.user.create({
    data: {
      name: fullName,
      firstName: validatedData.firstName,
      middleName: validatedData.middleName || null,
      lastName: validatedData.lastName,
      email: validatedData.email || undefined,
      phone: validatedData.phone || null,
      school: validatedData.school,
      symbolNo: symbolNo!,
      password: hashedPassword,
      role: 'STUDENT',
      verified: false,
      isActive: true,
    }
  });

  // Send welcome email and SMS
  const loginUrl = process.env.APP_URL || 'http://localhost:3000';
  const notificationResults = {
    email: { sent: false, error: null as string | null },
    sms: { sent: false, error: null as string | null }
  };

  // Send email if email is provided
  if (student.email) {
    try {
      const emailResult = await emailService.sendWelcomeEmail({
        name: student.name,
        symbolNo: student.symbolNo!,
        email: student.email,
        tempPassword: tempPassword,
        role: 'STUDENT',
        school: student.school || undefined,
        loginUrl: loginUrl
      });
      notificationResults.email.sent = emailResult.success;
      if (!emailResult.success) {
        notificationResults.email.error = emailResult.message;
      }
    } catch (error: any) {
      console.error('Email sending failed:', error);
      notificationResults.email.error = error.message;
    }
  }

  // Send SMS if phone is provided
  if (student.phone) {
    try {
      const smsResult = await smsService.sendWelcomeSMS({
        name: student.name,
        symbolNo: student.symbolNo!,
        tempPassword: tempPassword,
        phone: student.phone,
        role: 'STUDENT',
        loginUrl: loginUrl
      });
      notificationResults.sms.sent = smsResult.success;
      if (!smsResult.success) {
        notificationResults.sms.error = smsResult.message;
      }
    } catch (error: any) {
      console.error('SMS sending failed:', error);
      notificationResults.sms.error = error.message;
    }
  }

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    data: {
      id: student.id,
      name: student.name,
      symbolNo: student.symbolNo,
      email: student.email,
      phone: student.phone,
      school: student.school,
      tempPassword: tempPassword, // Send this to admin for initial setup
    },
    notifications: notificationResults
  });
});

// @desc    Create new teacher
// @route   POST /api/v1/admin/users/teacher
// @access  Private (Admin)
export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createTeacherSchema.parse(req.body);
  
  // Check if email already exists
  const existingEmailUser = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });
  
  if (existingEmailUser) {
    res.status(400).json({
      success: false,
      message: 'Email already exists'
    });
    return;
  }

  // Check if phone already exists
  const existingPhoneUser = await prisma.user.findUnique({
    where: { phone: validatedData.phone }
  });
  
  if (existingPhoneUser) {
    res.status(400).json({
      success: false,
      message: 'Phone number already exists'
    });
    return;
  }

  // Generate unique symbol number
  let symbolNo;
  let isUnique = false;
  while (!isUnique) {
    symbolNo = generateUserId();
    const existingUser = await prisma.user.findUnique({
      where: { symbolNo }
    });
    if (!existingUser) isUnique = true;
  }

  // Generate temporary password and hash it
  const tempPassword = generateTempPassword(validatedData.firstName);
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  // Create full name
  const fullName = `${validatedData.firstName} ${validatedData.middleName ? validatedData.middleName + ' ' : ''}${validatedData.lastName}`.trim();

  // Create the teacher user
  const teacher = await prisma.user.create({
    data: {
      name: fullName,
      firstName: validatedData.firstName,
      middleName: validatedData.middleName || null,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      department: validatedData.department,
      experience: validatedData.experience || null,
      symbolNo: symbolNo!,
      password: hashedPassword,
      role: 'TEACHER',
      verified: false,
      isActive: true,
    }
  });

  // Send welcome email and SMS
  const loginUrl = process.env.APP_URL || 'http://localhost:3000';
  const notificationResults = {
    email: { sent: false, error: null as string | null },
    sms: { sent: false, error: null as string | null }
  };

  // Send email
  try {
    const emailResult = await emailService.sendWelcomeEmail({
      name: teacher.name,
      symbolNo: teacher.symbolNo!,
      email: teacher.email!,
      tempPassword: tempPassword,
      role: 'TEACHER',
      department: teacher.department || undefined,
      loginUrl: loginUrl
    });
    notificationResults.email.sent = emailResult.success;
    if (!emailResult.success) {
      notificationResults.email.error = emailResult.message;
    }
  } catch (error: any) {
    console.error('Email sending failed:', error);
    notificationResults.email.error = error.message;
  }

  // Send SMS
  try {
    const smsResult = await smsService.sendWelcomeSMS({
      name: teacher.name,
      symbolNo: teacher.symbolNo!,
      tempPassword: tempPassword,
      phone: teacher.phone!,
      role: 'TEACHER',
      loginUrl: loginUrl
    });
    notificationResults.sms.sent = smsResult.success;
    if (!smsResult.success) {
      notificationResults.sms.error = smsResult.message;
    }
  } catch (error: any) {
    console.error('SMS sending failed:', error);
    notificationResults.sms.error = error.message;
  }

  res.status(201).json({
    success: true,
    message: 'Teacher created successfully',
    data: {
      id: teacher.id,
      name: teacher.name,
      symbolNo: teacher.symbolNo,
      email: teacher.email,
      phone: teacher.phone,
      department: teacher.department,
      experience: teacher.experience,
      tempPassword: tempPassword, // Send this to admin for initial setup
    },
    notifications: notificationResults
  });
});

// @desc    Get all users with filtering and pagination
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, page = 1, limit = 10, search } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};
  
  // Filter by role if specified
  if (role && ['STUDENT', 'TEACHER', 'ADMIN'].includes(role as string)) {
    where.role = role;
  }

  // Search functionality
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { symbolNo: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phone: true,
        symbolNo: true,
        role: true,
        school: true,
        department: true,
        experience: true,
        verified: true,
        isActive: true,
        isBlocked: true,
        blockReason: true,
        blockedAt: true,
        blockedBy: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / take);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      symbolNo: true,
      role: true,
      profileImage: true,
      verified: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      profile: true,
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user },
  });
});

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, profileImage, profileData } = req.body;
  const userId = req.user!.id;

  // Update user basic info
  const updateData: any = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (profileImage) updateData.profileImage = profileImage;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      symbolNo: true,
      role: true,
      profileImage: true,
      verified: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  // Update or create profile if profileData is provided
  if (profileData) {
    await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      symbolNo: true,
      role: true,
      profileImage: true,
      verified: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      profile: true,
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: { user },
  });
});

// @desc    Get all users with pagination
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};
  if (role && role !== 'ALL') {
    where.role = role;
  }
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string, mode: 'insensitive' } },
      { symbolNo: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Build orderBy clause
  const orderBy: any = {};
  orderBy[sortBy as string] = sortOrder;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        symbolNo: true,
        role: true,
        profileImage: true,
        verified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users,
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

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Admin only)
export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isActive: true, name: true },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
    },
  });

  res.json({
    success: true,
    message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user: updatedUser },
  });
});

// Validation schema for user updates
const updateUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
  school: z.string().min(2, 'School name is required').optional(),
  department: z.string().min(2, 'Department is required').optional(),
  experience: z.string().optional(),
});

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user?.userId;

  if (!adminId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  const validatedData = updateUserSchema.parse(req.body);

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });

  if (!existingUser) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  // Check for email conflicts
  if (validatedData.email && validatedData.email !== existingUser.email) {
    const emailExists = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        NOT: { id }
      }
    });

    if (emailExists) {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
      return;
    }
  }

  // Check for phone conflicts
  if (validatedData.phone && validatedData.phone !== existingUser.phone) {
    const phoneExists = await prisma.user.findFirst({
      where: {
        phone: validatedData.phone,
        NOT: { id }
      }
    });

    if (phoneExists) {
      res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
      return;
    }
  }

  // Update full name if first or last name changes
  let updatedData: any = { ...validatedData };
  if (validatedData.firstName || validatedData.lastName || validatedData.middleName !== undefined) {
    const firstName = validatedData.firstName || existingUser.firstName;
    const middleName = validatedData.middleName !== undefined ? validatedData.middleName : existingUser.middleName;
    const lastName = validatedData.lastName || existingUser.lastName;
    updatedData.name = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...updatedData,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      phone: true,
      symbolNo: true,
      role: true,
      school: true,
      department: true,
      experience: true,
      verified: true,
      isActive: true,
      isBlocked: true,
      blockReason: true,
      blockedAt: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Log the update action
  await prisma.activityLog.create({
    data: {
      userId: id,
      performedBy: adminId,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: id,
      details: {
        updatedFields: Object.keys(validatedData),
        oldData: {
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
        },
        newData: updatedData,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser },
  });
});

// Validation schema for blocking users
const blockUserSchema = z.object({
  reason: z.string().min(5, 'Block reason must be at least 5 characters'),
  notes: z.string().optional(),
});

// @desc    Block user
// @route   POST /api/v1/admin/users/:id/block
// @access  Private (Admin)
export const blockUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user?.userId;

  if (!adminId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  const { reason, notes } = blockUserSchema.parse(req.body);

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  if (user.isBlocked) {
    res.status(400).json({
      success: false,
      message: 'User is already blocked'
    });
    return;
  }

  // Prevent blocking admin users
  if (user.role === 'ADMIN') {
    res.status(400).json({
      success: false,
      message: 'Cannot block admin users'
    });
    return;
  }

  // Block the user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      isBlocked: true,
      blockReason: reason,
      blockedBy: adminId,
      blockedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      blockReason: true,
      blockedAt: true,
    },
  });

  // Log the block action
  await prisma.activityLog.create({
    data: {
      userId: id,
      performedBy: adminId,
      action: 'USER_BLOCKED',
      entity: 'User',
      entityId: id,
      details: {
        reason,
        blockedUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      notes,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  res.json({
    success: true,
    message: 'User blocked successfully',
    data: { user: updatedUser },
  });
});

// @desc    Unblock user
// @route   POST /api/v1/admin/users/:id/unblock
// @access  Private (Admin)
export const unblockUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user?.userId;
  const { notes } = req.body;

  if (!adminId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  if (!user.isBlocked) {
    res.status(400).json({
      success: false,
      message: 'User is not blocked'
    });
    return;
  }

  // Unblock the user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      isBlocked: false,
      blockReason: null,
      blockedBy: null,
      blockedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      blockReason: true,
      blockedAt: true,
    },
  });

  // Log the unblock action
  await prisma.activityLog.create({
    data: {
      userId: id,
      performedBy: adminId,
      action: 'USER_UNBLOCKED',
      entity: 'User',
      entityId: id,
      details: {
        unblockedUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        previousBlockReason: user.blockReason,
      },
      notes,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  res.json({
    success: true,
    message: 'User unblocked successfully',
    data: { user: updatedUser },
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user?.userId;
  const { notes } = req.body;

  if (!adminId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  // Prevent deleting admin users
  if (user.role === 'ADMIN') {
    res.status(400).json({
      success: false,
      message: 'Cannot delete admin users'
    });
    return;
  }

  // Prevent self-deletion
  if (user.id === adminId) {
    res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
    return;
  }

  // Log the deletion action before deleting
  await prisma.activityLog.create({
    data: {
      userId: id,
      performedBy: adminId,
      action: 'USER_DELETED',
      entity: 'User',
      entityId: id,
      details: {
        deletedUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          symbolNo: user.symbolNo,
        },
      },
      notes,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  // Delete the user (cascade will handle related records)
  await prisma.user.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Get user audit trail
// @route   GET /api/v1/admin/users/:id/audit-trail
// @access  Private (Admin)
export const getUserAuditTrail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true }
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Get audit trail for the user
  const auditLogs = await prisma.activityLog.findMany({
    where: {
      OR: [
        { userId: id },
        { entityId: id, entity: 'User' }
      ]
    },
    orderBy: { timestamp: 'desc' },
    skip,
    take: Number(limit),
  });

  // Get total count for pagination
  const totalCount = await prisma.activityLog.count({
    where: {
      OR: [
        { userId: id },
        { entityId: id, entity: 'User' }
      ]
    }
  });

  // Get admin names for performed by actions
  const adminIds = auditLogs
    .map(log => log.performedBy)
    .filter(Boolean)
    .filter((id, index, arr) => arr.indexOf(id) === index) as string[];

  const admins = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true, email: true }
  });

  const adminMap = admins.reduce((map, admin) => {
    map[admin.id] = admin;
    return map;
  }, {} as Record<string, typeof admins[0]>);

  // Format audit logs with admin information
  const formattedLogs = auditLogs.map(log => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    details: log.details,
    notes: log.notes,
    timestamp: log.timestamp,
    performedBy: log.performedBy ? adminMap[log.performedBy] : null,
    ipAddress: log.ipAddress,
  }));

  res.json({
    success: true,
    data: {
      user,
      auditTrail: formattedLogs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        hasNext: skip + Number(limit) < totalCount,
        hasPrev: Number(page) > 1,
      }
    }
  });
});