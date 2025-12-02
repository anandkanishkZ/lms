import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  markAsRead,
  getUnreadCount,
  getTeacherClasses,
  getTeacherModules,
} from '../controllers/noticeController';
import {
  bulkMarkAsRead,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationStats,
  bulkDeleteNotices,
  getAllBatches,
  getAllClasses,
  getAllModules,
} from '../controllers/noticeExtrasController';
import {
  validateCreateNotice,
  validateUpdateNotice,
  validateNoticeId,
  validateGetNotices,
  validateNotificationPreferences,
} from '../middlewares/noticeValidation';
import {
  noticeCreationLimiter,
  noticeUpdateLimiter,
  noticeApiLimiter,
} from '../middlewares/rateLimiter';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Notification preferences routes
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', validateNotificationPreferences, updateNotificationPreferences);

// Statistics route
router.get('/stats', getNotificationStats);

// Get unread count (must be before /:id)
router.get('/unread/count', getUnreadCount);

// Bulk operations
router.post('/bulk/mark-read', bulkMarkAsRead);
router.post('/bulk/mark-all-read', markAllAsRead);
router.post('/bulk/delete', bulkDeleteNotices);

// Teacher-specific routes (must be before /:id)
router.get('/teacher/classes', getTeacherClasses);
router.get('/teacher/modules', getTeacherModules);

// Admin-specific routes (must be before /:id)
router.get('/admin/classes', getAllClasses);
router.get('/admin/modules', getAllModules);

// Batch routes (for targeting)
router.get('/batches', getAllBatches);

// Get all notices (with filtering)
router.get('/', validateGetNotices, getAllNotices);

// Get notice by ID
router.get('/:id', validateNoticeId, getNoticeById);

// Create notice (Admin, Teacher) - with rate limiting
router.post('/', noticeCreationLimiter, validateCreateNotice, createNotice);

// Update notice (Admin, Creator) - with rate limiting
router.put('/:id', noticeUpdateLimiter, validateUpdateNotice, updateNotice);

// Delete notice (Admin, Creator)
router.delete('/:id', validateNoticeId, deleteNotice);

// Mark notice as read
router.post('/:id/read', validateNoticeId, markAsRead);

export default router;