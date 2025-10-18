import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import liveClassRoutes from './routes/liveClasses';
import materialRoutes from './routes/materials';
import routineRoutes from './routes/routines';
import noticeRoutes from './routes/notices';
import examRoutes from './routes/exams';
import resultRoutes from './routes/results';
import certificateRoutes from './routes/certificates';
import notificationRoutes from './routes/notifications';
import messageRoutes from './routes/messages';
import analyticsRoutes from './routes/analytics';

// Import admin routes
import adminRoutes from './routes/admin';

// Import Module System routes
import moduleRoutes from './routes/modules';
import topicRoutes from './routes/topics';
import lessonRoutes from './routes/lessons';
import enrollmentRoutes from './routes/enrollments';
import progressRoutes from './routes/progress';
import activityRoutes from './routes/activities';
import youtubeLiveRoutes from './routes/youtubeLive';
import subjectRoutes from './routes/subjects';
import classRoutes from './routes/classes';

// Import middlewares
import { authenticateToken } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();
const prisma = new PrismaClient();

// CORS configuration (must be before rate limiting)
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting (after CORS to avoid blocking preflight requests)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // Increased for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip preflight requests from rate limiting
  skip: (req) => req.method === 'OPTIONS',
  // Custom handler to return JSON
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 900
    });
  },
});

// Apply rate limiting only to non-development environments or specific routes
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
} else {
  // In development, use a more lenient rate limiter
  const devLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 1000, // Very high limit for development
    skip: (req) => req.method === 'OPTIONS',
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded in development',
        error: 'RATE_LIMIT_EXCEEDED'
      });
    },
  });
  app.use(devLimiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static('uploads'));

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authenticateToken, userRoutes);
app.use('/api/v1/live-classes', authenticateToken, liveClassRoutes);
app.use('/api/v1/materials', authenticateToken, materialRoutes);
app.use('/api/v1/routines', authenticateToken, routineRoutes);
app.use('/api/v1/notices', authenticateToken, noticeRoutes);
app.use('/api/v1/exams', authenticateToken, examRoutes);
app.use('/api/v1/results', authenticateToken, resultRoutes);
app.use('/api/v1/certificates', authenticateToken, certificateRoutes);
app.use('/api/v1/notifications', authenticateToken, notificationRoutes);
app.use('/api/v1/messages', authenticateToken, messageRoutes);
app.use('/api/v1/analytics', authenticateToken, analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);

// Module System routes (Courses -> Modules/Subjects)
app.use('/api/v1/modules', moduleRoutes);
app.use('/api/v1/topics', topicRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/youtube-live', youtubeLiveRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/classes', classRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Graceful shutdown...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api/v1`);
});

export default app;