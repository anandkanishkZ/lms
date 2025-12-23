import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, LoginCredentials, RegisterData } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { otpService } from '../services/otp.service';

const prisma = new PrismaClient();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, role = 'STUDENT' }: RegisterData = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });

  if (existingUser) {
    res.status(400).json({
      success: false,
      message: 'User already exists with this email or phone',
    });
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role: role as any,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      verified: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    jwtSecret
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Support both 'identifier' (student portal) and 'emailOrPhone' (admin/legacy)
  const identifier = req.body.identifier || req.body.emailOrPhone;
  const { password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({
      success: false,
      message: 'Please provide email/phone/symbol number and password',
    });
    return;
  }

  // Find user by email, phone, or symbol number
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
        { symbolNo: identifier },
      ],
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

  // Check if user has password
  if (!user.password) {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
    return;
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
    return;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    jwtSecret
  );

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token,
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  // In a stateless JWT system, logout is typically handled on the frontend
  // by removing the token from storage. However, we can log this action.
  
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// @desc    Forgot password - Request OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400).json({
      success: false,
      message: 'Phone number is required',
    });
    return;
  }

  // Request OTP
  const result = await otpService.requestOTP(phone, 'PASSWORD_RESET');

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.message,
    });
    return;
  }

  res.json({
    success: true,
    message: result.message,
  });
});

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    res.status(400).json({
      success: false,
      message: 'Phone number and OTP are required',
    });
    return;
  }

  // Verify OTP
  const result = await otpService.verifyOTP(phone, otp, 'PASSWORD_RESET');

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.message,
    });
    return;
  }

  res.json({
    success: true,
    message: result.message,
    data: {
      userId: result.userId
    }
  });
});

// @desc    Reset password with verified OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp, newPassword } = req.body;

  if (!phone || !otp || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Phone number, OTP, and new password are required',
    });
    return;
  }

  // Check if OTP was recently verified (allows verified OTPs within 5 minutes)
  const verifyResult = await otpService.checkRecentlyVerifiedOTP(phone, otp, 'PASSWORD_RESET');

  if (!verifyResult.success) {
    res.status(400).json({
      success: false,
      message: verifyResult.message,
    });
    return;
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user password
  await prisma.user.update({
    where: { id: verifyResult.userId },
    data: {
      password: hashedPassword,
    },
  });

  console.log(`✅ Password reset successful for user ${verifyResult.userId}`);

  res.json({
    success: true,
    message: 'Password reset successful. You can now login with your new password.',
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  // TODO: Implement email verification with proper token validation
  // For now, this is a placeholder
  res.json({
    success: true,
    message: 'Email verification is not yet implemented. Please use phone verification.',
  });
});

// @desc    Request phone verification OTP
// @route   POST /api/auth/request-verification-otp
// @access  Private
export const requestVerificationOTP = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, name: true, phone: true, verified: true },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  if (user.verified) {
    res.status(400).json({
      success: false,
      message: 'Account is already verified',
    });
    return;
  }

  if (!user.phone) {
    res.status(400).json({
      success: false,
      message: 'Phone number is required for verification',
    });
    return;
  }

  // Request OTP for account verification
  const result = await otpService.requestOTP(user.phone, 'LOGIN');

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: result.message,
    });
    return;
  }

  res.json({
    success: true,
    message: 'Verification OTP sent to your phone number',
  });
});

// @desc    Verify phone with OTP
// @route   POST /api/auth/verify-phone
// @access  Private
export const verifyPhone = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  const { otp } = req.body;

  if (!otp) {
    res.status(400).json({
      success: false,
      message: 'OTP is required',
    });
    return;
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, phone: true, verified: true },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  if (user.verified) {
    res.status(400).json({
      success: false,
      message: 'Account is already verified',
    });
    return;
  }

  if (!user.phone) {
    res.status(400).json({
      success: false,
      message: 'Phone number not found',
    });
    return;
  }

  // Verify OTP
  const verifyResult = await otpService.verifyOTP(user.phone, otp, 'LOGIN');

  if (!verifyResult.success) {
    res.status(400).json({
      success: false,
      message: verifyResult.message,
    });
    return;
  }

  // Mark user as verified
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { verified: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      verified: true,
      profileImage: true,
    },
  });

  console.log(`✅ User ${user.id} verified successfully`);

  res.json({
    success: true,
    message: 'Phone number verified successfully. Your account is now verified!',
    data: updatedUser,
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
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

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  const { firstName, middleName, lastName, email, phone, school, symbolNo } = req.body;
  
  // Get name from request body (for direct updates) or build from firstName, middleName, lastName
  let name = req.body.name;
  if (!name && (firstName || middleName || lastName)) {
    const nameParts = [firstName, middleName, lastName].filter(Boolean);
    name = nameParts.join(' ') || undefined;
  }
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: req.user.userId },
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email is already taken',
      });
      return;
    }
  }

  // Check if phone is being changed and if it's already taken
  if (phone) {
    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: req.user.userId },
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Phone number is already taken',
      });
      return;
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      ...(firstName && { firstName }),
      ...(middleName !== undefined && { middleName: middleName || null }),
      ...(lastName && { lastName }),
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(school && { school }),
      ...(symbolNo !== undefined && { symbolNo: symbolNo || null }),
    },
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
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Please provide current and new password',
    });
    return;
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Check if user has password
  if (!user.password) {
    res.status(400).json({
      success: false,
      message: 'User does not have a password set',
    });
    return;
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
    return;
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await prisma.user.update({
    where: { id: req.user.userId },
    data: { password: hashedPassword },
  });

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});