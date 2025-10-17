import express from 'express';
import {
  createLesson,
  getLessonById,
  getLessonsByTopic,
  updateLesson,
  deleteLesson,
  addAttachment,
  deleteAttachment,
  trackDownload,
  incrementViewCount,
  getLessonsByType,
  searchLessons,
  duplicateLesson,
} from '../controllers/lessonController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// Get lessons by topic - Authenticated
router.get('/topics/:topicId/lessons', authenticateToken, getLessonsByTopic);

// Get lessons by type in a module - Authenticated
router.get('/modules/:moduleId/lessons/type/:type', authenticateToken, getLessonsByType);

// Search lessons in a module - Authenticated
router.get('/modules/:moduleId/lessons/search', authenticateToken, searchLessons);

// Get single lesson - Authenticated
router.get('/:id', authenticateToken, getLessonById);

// Track lesson view - Authenticated
router.post('/:id/view', authenticateToken, incrementViewCount);

// Track attachment download - Authenticated
router.post('/:lessonId/attachments/:attachmentId/download', authenticateToken, trackDownload);

// Teacher/Admin routes - Manage lessons
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), createLesson);
router.put('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateLesson);
router.delete('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), deleteLesson);
router.post('/:id/duplicate', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), duplicateLesson);

// Attachment management - Teacher/Admin
router.post('/:id/attachments', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), addAttachment);
router.delete('/:lessonId/attachments/:attachmentId', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), deleteAttachment);

export default router;
