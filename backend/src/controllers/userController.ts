import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

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