import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';

// @desc    Get avatar image
// @route   GET /api/v1/avatars/:filename
// @access  Public (for display purposes)
export const getAvatar = asyncHandler(async (req: Request, res: Response) => {
  const { filename } = req.params;

  // Validate filename to prevent directory traversal
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).json({
      success: false,
      message: 'Invalid filename',
    });
    return;
  }

  const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', filename);

  // Check if file exists
  if (!fs.existsSync(avatarPath)) {
    res.status(404).json({
      success: false,
      message: 'Avatar not found',
    });
    return;
  }

  // Get file extension
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Set proper headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

  // Stream the file
  const fileStream = fs.createReadStream(avatarPath);
  fileStream.pipe(res);
});

// @desc    Get user's own avatar
// @route   GET /api/v1/auth/avatar
// @access  Private
export const getMyAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  // Get user from database
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { profileImage: true },
  });

  if (!user || !user.profileImage) {
    res.status(404).json({
      success: false,
      message: 'No avatar found',
    });
    return;
  }

  const avatarPath = path.join(process.cwd(), 'uploads', user.profileImage);

  if (!fs.existsSync(avatarPath)) {
    res.status(404).json({
      success: false,
      message: 'Avatar file not found',
    });
    return;
  }

  const ext = path.extname(user.profileImage).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const fileStream = fs.createReadStream(avatarPath);
  fileStream.pipe(res);
});
