console.log('🚀 Starting server initialization...');

import express, { Application, Request, Response, NextFunction } from 'express';
console.log('✅ Express imported');
import cors from 'cors';
console.log('✅ CORS imported');
import helmet from 'helmet';
console.log('✅ Helmet imported');
import morgan from 'morgan';
console.log('✅ Morgan imported');
import compression from 'compression';
console.log('✅ Compression imported');
import rateLimit from 'express-rate-limit';
console.log('✅ Rate limit imported');
import { PrismaClient } from '@prisma/client';
console.log('✅ Prisma imported');
import dotenv from 'dotenv';
console.log('✅ Dotenv imported');
import swaggerUi from 'swagger-ui-express';
console.log('✅ Swagger UI imported');
import YAML from 'yamljs';
console.log('✅ YAML imported');
import path from 'path';
console.log('✅ Path imported');

// Import routes
import authRoutes from './routes/auth';
console.log('✅ Auth routes imported');
import userRoutes from './routes/users';
console.log('✅ User routes imported');
import liveClassRoutes from './routes/liveClasses';
console.log('✅ Live class routes imported');
import materialRoutes from './routes/materials';
console.log('✅ Material routes imported');
import routineRoutes from './routes/routines';
console.log('✅ Routine routes imported');
import noticeRoutes from './routes/notices';
console.log('✅ Notice routes imported');
import examRoutes from './routes/exams';
console.log('✅ Exam routes imported');
import resultRoutes from './routes/results';
console.log('✅ Result routes imported');
import certificateRoutes from './routes/certificates';
console.log('✅ Certificate routes imported');
import notificationRoutes from './routes/notifications';
console.log('✅ Notification routes imported');
import messageRoutes from './routes/messages';
console.log('✅ Message routes imported');
import analyticsRoutes from './routes/analytics';
console.log('✅ Analytics routes imported');
import teacherDashboardRoutes from './routes/teacherDashboard';
console.log('✅ Teacher dashboard routes imported');
import moduleApprovalRoutes from './routes/moduleApproval';
console.log('✅ Module approval routes imported');

// Import admin routes
import adminRoutes from './routes/admin';
console.log('✅ Admin routes imported');

// Import Module System routes
import moduleRoutes from './routes/modules';
console.log('✅ Module routes imported');
import topicRoutes from './routes/topics';
console.log('✅ Topic routes imported');
import lessonRoutes from './routes/lessons';
console.log('✅ Lesson routes imported');
import enrollmentRoutes from './routes/enrollments';
console.log('✅ Enrollment routes imported');
import progressRoutes from './routes/progress';
console.log('✅ Progress routes imported');
import activityRoutes from './routes/activities';
console.log('✅ Activity routes imported');
import youtubeLiveRoutes from './routes/youtubeLive';
console.log('✅ YouTube live routes imported');
import subjectRoutes from './routes/subjects';
console.log('✅ Subject routes imported');
import classRoutes from './routes/classes';
console.log('✅ Class routes imported');
import resourceRoutes from './routes/resources';
console.log('✅ Resource routes imported');
import uploadRoutes from './routes/upload';
console.log('✅ Upload routes imported');
import featuredVideoRoutes from './routes/featuredVideoRoutes';
console.log('✅ Featured video routes imported');

// Import middlewares
import { authenticateToken } from './middlewares/auth';
console.log('✅ Auth middleware imported');
import { errorHandler } from './middlewares/errorHandler';
console.log('✅ Error handler imported');
import { auditLog } from './middlewares/auditLog';
console.log('✅ Audit log middleware imported');
import { secureLog } from './utils/logger';
console.log('✅ Logger imported');

console.log('🔧 Configuring environment variables...');
dotenv.config();
console.log('✅ Environment variables configured');

console.log('🔧 Initializing Express app...');
const app: Application = express();
console.log('✅ Express app initialized');

console.log('🔧 Initializing Prisma Client...');
const prisma = new PrismaClient();
console.log('✅ Prisma Client initialized');

console.log('🔧 Loading Swagger documentation...');
// Load Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
console.log('✅ Swagger documentation loaded');

console.log('🔧 Configuring middlewares...');
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      secureLog.warn('HTTP request redirected to HTTPS', { 
        ip: req.ip, 
        path: req.path 
      });
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
console.log('✅ HTTPS redirect configured');

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
console.log('✅ CORS configured');

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
console.log('✅ Preflight requests handler configured');

console.log('🔧 Configuring Helmet security headers...');
// Enhanced security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'self'", "https://www.youtube.com"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { 
    action: 'deny' // Prevent clickjacking
  },
  noSniff: true, // Prevent MIME type sniffing
  xssFilter: true, // Enable XSS filter
  referrerPolicy: { 
    policy: 'strict-origin-when-cross-origin' 
  },
  crossOriginEmbedderPolicy: false, // Required for Swagger UI
  crossOriginResourcePolicy: { 
    policy: 'cross-origin' 
  }
}));
console.log('✅ Helmet configured');

console.log('🔧 Configuring compression...');
app.use(compression());
console.log('✅ Compression configured');

// Rate limiting (after CORS to avoid blocking preflight requests)
console.log('🔧 Configuring rate limiting...');
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
console.log('✅ Rate limiter created');

// Apply rate limiting only to non-development environments or specific routes
console.log('🔧 Applying rate limiting middleware...');
console.log('⚠️ Rate limiting temporarily disabled for debugging');
// TODO: Re-enable rate limiting after fixing the hang issue
/*
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
  console.log('✅ Production rate limiter applied');
} else {
  console.log('🔧 Creating development rate limiter...');
  // In development, use a more lenient rate limiter
  const devLimiter = rateLimit({
    windowMs: parseInt(process.env.DEV_RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute default
    max: parseInt(process.env.DEV_RATE_LIMIT_MAX_REQUESTS || '1000'), // Very high limit for development
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
*/
console.log('✅ Rate limiting step completed (disabled)');

// Body parsing middleware with size limits
console.log('🔧 Configuring body parsing middleware...');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('✅ Body parsing middleware configured');

// Request size monitoring middleware
console.log('🔧 Configuring request size monitoring...');
app.use((req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB
    secureLog.warn('Request entity too large', { 
      contentLength, 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(413).json({
      success: false,
      message: 'Request entity too large. Maximum size is 10MB.'
    });
  }
  next();
});
console.log('✅ Request size monitoring configured');

// Audit logging middleware (log all requests)
console.log('🔧 Configuring audit logging middleware...');
app.use(auditLog);
console.log('✅ Audit logging middleware configured');

// Logging middleware
console.log('🔧 Configuring HTTP request logging...');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Using morgan dev mode...');
  app.use(morgan('dev'));
  console.log('✅ Morgan dev mode configured');
} else {
  console.log('🔧 Using morgan combined mode...');
  app.use(morgan('combined'));
  console.log('✅ Morgan combined mode configured');
}
console.log('✅ HTTP request logging configured');

// SECURITY: Disable direct static file serving for editor uploads
// Files should only be accessed through authenticated API endpoints
// Only allow avatars to be served statically
console.log('🔧 Configuring static file serving...');
app.use('/uploads/avatars', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static('uploads/avatars'));
console.log('✅ Static file serving configured');

// Health check route
console.log('🔧 Setting up health check route...');
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});
console.log('✅ Health check route configured');

// API Documentation - Swagger UI
console.log('🔧 Setting up Swagger UI...');
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 30px 0 }
    .swagger-ui .info .title { font-size: 36px; color: #667eea }
  `,
  customSiteTitle: 'Smart School LMS API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerDocument, swaggerUiOptions));
console.log('✅ Swagger UI configured');

// Alternative: JSON API documentation
console.log('🔧 Setting up JSON API documentation...');
app.get('/api/docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});
console.log('✅ JSON API documentation configured');

// API v1 routes
console.log('🔧 Registering API routes...');
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
app.use('/api/v1/teacher/dashboard', teacherDashboardRoutes);
app.use('/api/v1/admin/modules/approval', moduleApprovalRoutes);
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
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1', featuredVideoRoutes);
console.log('✅ All API routes registered');

// 404 handler
console.log('🔧 Setting up 404 handler...');
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});
console.log('✅ 404 handler configured');

// Error handling middleware
console.log('🔧 Setting up error handler...');
app.use(errorHandler);
console.log('✅ Error handler configured');

// Graceful shutdown
console.log('🔧 Setting up graceful shutdown handlers...');
process.on('SIGINT', async () => {
  secureLog.info('Received SIGINT signal. Initiating graceful shutdown...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  secureLog.info('Received SIGTERM signal. Initiating graceful shutdown...');
  await prisma.$disconnect();
  process.exit(0);
});
console.log('✅ Graceful shutdown handlers configured');

// Handle uncaught exceptions
console.log('🔧 Setting up exception handlers...');
process.on('uncaughtException', (error: Error) => {
  secureLog.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  secureLog.error('Unhandled Rejection', { reason });
  process.exit(1);
});
console.log('✅ Exception handlers configured');

const PORT = process.env.PORT || 5000;

console.log('🔧 Starting server on port', PORT);
app.listen(PORT, () => {
  console.log('✅ Server listen() callback executed');
  try {
    secureLog.info(`Server started successfully`, {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });
    console.log('✅ First secureLog.info completed');
    secureLog.info(`API Base URL: http://localhost:${PORT}/api/v1`);
    console.log('✅ Second secureLog.info completed');
    secureLog.info(`API Documentation: http://localhost:${PORT}/api/docs`);
    console.log('✅ Third secureLog.info completed');
    console.log(`🎉 Server started successfully on port ${PORT}`);
  } catch (error) {
    console.error('❌ Error in listen callback:', error);
  }
});

export default app;