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

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get unread count (must be before /:id)
router.get('/unread/count', getUnreadCount);

// Teacher-specific routes (must be before /:id)
router.get('/teacher/classes', getTeacherClasses);
router.get('/teacher/modules', getTeacherModules);

// Get all notices (with filtering)
router.get('/', getAllNotices);

// Get notice by ID
router.get('/:id', getNoticeById);

// Create notice (Admin, Teacher)
router.post('/', createNotice);

// Update notice (Admin, Creator)
router.put('/:id', updateNotice);

// Delete notice (Admin, Creator)
router.delete('/:id', deleteNotice);

// Mark notice as read
router.post('/:id/read', markAsRead);

export default router;