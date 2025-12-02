import express from 'express';
import {
  getDashboardStats,
  getEnrollmentGrowth,
  getCourseDistribution,
  getRecentActivity,
  getActivityChart,
} from '../controllers/dashboardController';
import { authenticateToken, requireRole } from '../middlewares/auth';

const router = express.Router();

// All dashboard routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/enrollment-growth', getEnrollmentGrowth);
router.get('/dashboard/course-distribution', getCourseDistribution);
router.get('/dashboard/recent-activity', getRecentActivity);
router.get('/dashboard/activity-chart', getActivityChart);

// Legacy route
router.get('/', (req: any, res: any) => res.json({ message: 'Analytics endpoint - Use specific dashboard routes' }));

export default router;