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

// Import middlewares
import { authenticateToken } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();
const prisma = new PrismaClient();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/live-classes', authenticateToken, liveClassRoutes);
app.use('/api/materials', authenticateToken, materialRoutes);
app.use('/api/routines', authenticateToken, routineRoutes);
app.use('/api/notices', authenticateToken, noticeRoutes);
app.use('/api/exams', authenticateToken, examRoutes);
app.use('/api/results', authenticateToken, resultRoutes);
app.use('/api/certificates', authenticateToken, certificateRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

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
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
});

export default app;