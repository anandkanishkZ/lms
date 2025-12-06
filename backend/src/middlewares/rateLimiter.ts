import rateLimit from 'express-rate-limit';

// Rate limiter for notice creation - prevent spam
export const noticeCreationLimiter = rateLimit({
  windowMs: parseInt(process.env.NOTICE_CREATION_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.NOTICE_CREATION_MAX_REQUESTS || '20'), // Limit each user to 20 notice creations per window
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
  windowMs: parseInt(process.env.NOTICE_UPDATE_WINDOW_MS || '300000'), // 5 minutes default
  max: parseInt(process.env.NOTICE_UPDATE_MAX_REQUESTS || '30'), // Limit each user to 30 updates per window
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
  windowMs: parseInt(process.env.NOTICE_API_WINDOW_MS || '60000'), // 1 minute default
  max: parseInt(process.env.NOTICE_API_MAX_REQUESTS || '100'), // Limit each user to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?.userId || req.ip,
});
