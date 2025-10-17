import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

interface AdminTokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

// Admin authentication middleware
export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as AdminTokenPayload;

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
      return;
    }

    // Verify session exists and is valid
    const session = await prisma.adminSession.findFirst({
      where: {
        id: decoded.sessionId,
        token,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            verified: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || !session.user.isActive || session.user.role !== 'ADMIN') {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
      return;
    }

    // Attach user info to request
    if (!session.user.email) {
      res.status(500).json({
        success: false,
        message: 'User email not set',
      });
      return;
    }

    req.user = {
      id: session.user.id,
      userId: session.user.id,
      sessionId: session.id,
      name: session.user.name,
      email: session.user.email,
      phone: session.user.phone || undefined,
      role: session.user.role as 'ADMIN' | 'TEACHER' | 'STUDENT',
      verified: session.user.verified,
      isActive: session.user.isActive,
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid access token',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Access token expired',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Middleware to check if user is admin (for routes that accept multiple roles)
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Admin privileges required',
    });
    return;
  }

  next();
};

// Optional admin authentication (doesn't fail if no token)
export const optionalAdminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as AdminTokenPayload;

    if (decoded.role === 'ADMIN') {
      const session = await prisma.adminSession.findFirst({
        where: {
          id: decoded.sessionId,
          token,
          expiresAt: { gt: new Date() },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              verified: true,
              isActive: true,
            },
          },
        },
      });

      if (session && session.user.isActive && session.user.role === 'ADMIN' && session.user.email) {
        req.user = {
          id: session.user.id,
          userId: session.user.id,
          sessionId: session.id,
          name: session.user.name,
          email: session.user.email,
          phone: session.user.phone || undefined,
          role: session.user.role as 'ADMIN' | 'TEACHER' | 'STUDENT',
          verified: session.user.verified,
          isActive: session.user.isActive,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

export default {
  authenticateAdmin,
  requireAdmin,
  optionalAdminAuth,
};