import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  code?: string;
  path?: string;
  value?: any;
  errors?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    const message = 'Invalid data provided';
    error = { ...error, statusCode: 400, message };
  }

  // Prisma known request error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      const target = (err.meta?.target as string[]) || [];
      const message = `Duplicate value for ${target.join(', ')}`;
      error = { ...error, statusCode: 400, message };
    } else if (err.code === 'P2025') {
      // Record not found
      const message = 'Record not found';
      error = { ...error, statusCode: 404, message };
    } else if (err.code === 'P2003') {
      // Foreign key constraint violation
      const message = 'Related record not found';
      error = { ...error, statusCode: 400, message };
    }
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message).join(', ');
    error = { ...error, statusCode: 400, message };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { ...error, statusCode: 401, message };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { ...error, statusCode: 401, message };
  }

  // Cast error
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = { ...error, statusCode: 400, message };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { ...error, statusCode: 413, message };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = { ...error, statusCode: 400, message };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not found - ${req.originalUrl}`) as CustomError;
  error.statusCode = 404;
  next(error);
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);