import express from 'express';
import {
  getTeacherDashboardStats,
  getUpcomingClasses,
  getTeacherRecentActivity,
  getModulePerformance,
} from '../controllers/teacherDashboardController';
import { authenticateToken, requireRole } from '../middlewares/auth';

const router = express.Router();

// All teacher dashboard routes require teacher authentication
router.use(authenticateToken);
router.use(requireRole(['TEACHER']));

// Dashboard statistics
router.get('/stats', getTeacherDashboardStats);
router.get('/upcoming-classes', getUpcomingClasses);
router.get('/recent-activity', getTeacherRecentActivity);
router.get('/module-performance', getModulePerformance);

export default router;
