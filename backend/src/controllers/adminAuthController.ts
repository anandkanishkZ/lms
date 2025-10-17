import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

interface AdminLoginRequest extends Request {
  body: {
    email: string;
    password: string;
    rememberMe?: boolean;
  };
}

interface AdminTokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

// @desc    Admin login
// @route   POST /api/v1/admin/auth/login
// @access  Public
export const adminLogin = asyncHandler(async (req: AdminLoginRequest, res: Response) => {
  const { email, password, rememberMe = false } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
    return;
  }

  // Find admin user
  const user = await prisma.user.findFirst({
    where: {
      email,
      role: 'ADMIN',
      isActive: true,
    },
  });

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
    return;
  }

  // Check if account is locked
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    const lockoutTime = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
    res.status(423).json({
      success: false,
      message: `Account locked. Try again in ${lockoutTime} minutes.`,
    });
    return;
  }

  // Verify password
  if (!user.password) {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials - password not set',
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Increment login attempts
    const attempts = user.loginAttempts + 1;
    const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 minutes lockout

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: attempts,
        lockoutUntil,
      },
    });

    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
      attemptsLeft: attempts >= 5 ? 0 : 5 - attempts,
    });
    return;
  }

  // Get JWT secrets
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !refreshSecret) {
    throw new Error('JWT secrets are not configured');
  }

  // Create session
  const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)); // 30 days or 1 day
  
  const session = await prisma.adminSession.create({
    data: {
      userId: user.id,
      token: '', // Will be updated after token generation
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
    },
  });

  // Generate tokens
  if (!user.email) {
    res.status(500).json({
      success: false,
      message: 'User email not set',
    });
    return;
  }

  const tokenPayload: AdminTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: session.id,
  };

  const accessToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ sessionId: session.id }, refreshSecret, { 
    expiresIn: rememberMe ? '30d' : '7d' 
  });

  // Update session with tokens
  await prisma.adminSession.update({
    where: { id: session.id },
    data: {
      token: accessToken,
      refreshToken,
    },
  });

  // Reset login attempts and update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      loginAttempts: 0,
      lockoutUntil: null,
      lastLogin: new Date(),
    },
  });

  // Remove sensitive data from user object
  const { password: _, ...userResponse } = user;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
    },
  });
});

// @desc    Admin logout
// @route   POST /api/v1/admin/auth/logout
// @access  Private
export const adminLogout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessionId = req.user?.sessionId;

  if (sessionId) {
    // Delete session from database
    await prisma.adminSession.delete({
      where: { id: sessionId },
    }).catch(() => {
      // Session might already be deleted, ignore error
    });
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

// @desc    Refresh admin token
// @route   POST /api/v1/admin/auth/refresh
// @access  Public
export const adminRefreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: 'Refresh token is required',
    });
    return;
  }

  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  const jwtSecret = process.env.JWT_SECRET;

  if (!refreshSecret || !jwtSecret) {
    throw new Error('JWT secrets are not configured');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, refreshSecret) as { sessionId: string };

    // Find session
    const session = await prisma.adminSession.findFirst({
      where: {
        id: decoded.sessionId,
        refreshToken,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || !session.user.isActive || session.user.role !== 'ADMIN') {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new access token
    if (!session.user.email) {
      res.status(500).json({
        success: false,
        message: 'User email not set',
      });
      return;
    }

    const tokenPayload: AdminTokenPayload = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    };

    const newAccessToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' });

    // Update session with new token
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { token: newAccessToken },
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        user: session.user,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
});

// @desc    Get admin profile
// @route   GET /api/v1/admin/auth/profile
// @access  Private
export const getAdminProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      role: 'ADMIN',
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      profileImage: true,
      verified: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Admin not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @desc    Update admin profile
// @route   PUT /api/v1/admin/auth/profile
// @access  Private
export const updateAdminProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { name, phone } = req.body;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
      updatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      profileImage: true,
      verified: true,
      lastLogin: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser },
  });
});

// @desc    Change admin password
// @route   PUT /api/v1/admin/auth/change-password
// @access  Private
export const changeAdminPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Current password and new password are required',
    });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long',
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Verify current password
  if (!user.password) {
    res.status(400).json({
      success: false,
      message: 'User password not set',
    });
    return;
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
    return;
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  // Invalidate all existing sessions for security
  await prisma.adminSession.deleteMany({
    where: { userId },
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please login again.',
  });
});

export default {
  adminLogin,
  adminLogout,
  adminRefreshToken,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
};