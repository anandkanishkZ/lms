import rateLimit from 'express-rate-limit';

// Rate limiter for notice creation - prevent spam
export const noticeCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each user to 20 notice creations per 15 minutes
  message: {
    success: false,
    message: 'Too many notices created. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use userId from request for identification
  keyGenerator: (req: any) => {
    return req.user?.userId || req.ip;
  },
  skip: (req: any) => {
    // Skip rate limiting for admins
    return req.user?.role === 'ADMIN';
  },
});

// Rate limiter for notice updates
export const noticeUpdateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each user to 30 updates per 5 minutes
  message: {
    success: false,
    message: 'Too many update requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?.userId || req.ip,
});

// Rate limiter for general notice API calls
export const noticeApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each user to 100 requests per minute
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?.userId || req.ip,
});
