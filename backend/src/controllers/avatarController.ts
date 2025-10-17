import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// @desc    Upload profile avatar
// @route   POST /api/v1/auth/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'Please upload an image file',
    });
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    // Delete uploaded file
    fs.unlinkSync(req.file.path);
    res.status(400).json({
      success: false,
      message: 'Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed',
    });
    return;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    // Delete uploaded file
    fs.unlinkSync(req.file.path);
    res.status(400).json({
      success: false,
      message: 'File size should not exceed 5MB',
    });
    return;
  }

  // Get user's current avatar (to delete old one)
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { profileImage: true },
  });

  // Delete old avatar if exists
  if (user?.profileImage) {
    const oldAvatarPath = path.join(process.cwd(), 'uploads', user.profileImage);
    if (fs.existsSync(oldAvatarPath)) {
      try {
        fs.unlinkSync(oldAvatarPath);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }
  }

  // Generate avatar URL (relative path)
  const avatarUrl = `avatars/${req.file.filename}`;

  // Update user's profile image
  const updatedUser = await prisma.user.update({
    where: { id: req.user.userId },
    data: { profileImage: avatarUrl },
    select: {
      id: true,
      symbolNo: true,
      name: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      school: true,
      department: true,
      profileImage: true,
      verified: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    message: 'Profile picture updated successfully',
    data: {
      user: updatedUser,
      profileImage: avatarUrl,
      avatarUrl: `/uploads/${avatarUrl}`,
    },
  });
});

// @desc    Delete profile avatar
// @route   DELETE /api/v1/auth/avatar
// @access  Private
export const deleteAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  // Get user's current avatar
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { profileImage: true },
  });

  if (!user?.profileImage) {
    res.status(404).json({
      success: false,
      message: 'No avatar found',
    });
    return;
  }

  // Delete avatar file
  const avatarPath = path.join(process.cwd(), 'uploads', user.profileImage);
  if (fs.existsSync(avatarPath)) {
    try {
      fs.unlinkSync(avatarPath);
    } catch (error) {
      console.error('Error deleting avatar file:', error);
    }
  }

  // Update user's profile image to null
  const updatedUser = await prisma.user.update({
    where: { id: req.user.userId },
    data: { profileImage: null },
    select: {
      id: true,
      symbolNo: true,
      name: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      school: true,
      department: true,
      profileImage: true,
      verified: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    message: 'Avatar deleted successfully',
    data: {
      user: updatedUser,
    },
  });
});
