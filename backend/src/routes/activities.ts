import express from 'express';
import {
  getUserActivities,
  getModuleActivities,
  getRecentActivities,
  getActivityTimeline,
  getUserActivityStats,
  getModuleActivityStats,
  exportActivities,
  searchActivities,
  deleteOldActivities,
} from '../controllers/activityController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// Get activities - Student (own) or Admin/Teacher
router.get('/users/:userId', authenticateToken, getUserActivities);
router.get('/timeline/:userId', authenticateToken, getActivityTimeline);
router.get('/stats/users/:userId', authenticateToken, getUserActivityStats);

// Module activities - Admin/Teacher
router.get('/modules/:moduleId', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), getModuleActivities);
router.get('/stats/modules/:moduleId', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), getModuleActivityStats);

// Admin-only routes
router.get('/recent', authenticateToken, authorizeRoles('ADMIN'), getRecentActivities);
router.get('/export', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), exportActivities);
router.delete('/cleanup', authenticateToken, authorizeRoles('ADMIN'), deleteOldActivities);

// Search activities - Authenticated
router.get('/search', authenticateToken, searchActivities);

export default router;
