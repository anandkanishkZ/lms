import express from 'express';
import {
  startLesson,
  completeLesson,
  updateVideoProgress,
  updateQuizProgress,
  getModuleProgress,
  getStudentOverallProgress,
  getLessonProgress,
  resetLessonProgress,
  getModuleProgressStats,
} from '../controllers/progressController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// Student routes - Track progress
router.post('/lessons/:lessonId/start', authenticateToken, startLesson);
router.post('/lessons/:lessonId/complete', authenticateToken, completeLesson);
router.post('/lessons/:lessonId/video', authenticateToken, updateVideoProgress);
router.post('/lessons/:lessonId/quiz', authenticateToken, updateQuizProgress);

// Get progress - Student (own) or Admin/Teacher
router.get('/modules/:moduleId', authenticateToken, getModuleProgress);
router.get('/students/:studentId', authenticateToken, getStudentOverallProgress);
router.get('/lessons/:lessonId', authenticateToken, getLessonProgress);

// Admin routes
router.delete('/lessons/:lessonId/reset', authenticateToken, authorizeRoles('ADMIN'), resetLessonProgress);

// Admin/Teacher routes - Statistics
router.get('/modules/:moduleId/stats', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), getModuleProgressStats);

export default router;
