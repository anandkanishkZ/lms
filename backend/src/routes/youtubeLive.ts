import express from 'express';
import {
  createLiveSession,
  updateLiveSession,
  startLiveSession,
  endLiveSession,
  updateViewerCount,
  getLiveSession,
  getLiveSessionByLesson,
  getUpcomingLiveSessions,
  getCurrentlyLiveSessions,
  getPastLiveSessions,
  deleteLiveSession,
  getLiveSessionStats,
} from '../controllers/youtubeLiveController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// Public/Authenticated routes - View sessions
router.get('/upcoming', authenticateToken, getUpcomingLiveSessions);
router.get('/current', authenticateToken, getCurrentlyLiveSessions);
router.get('/past', authenticateToken, getPastLiveSessions);
router.get('/lessons/:lessonId', authenticateToken, getLiveSessionByLesson);
router.get('/:sessionId', authenticateToken, getLiveSession);

// Teacher/Admin routes - Manage sessions
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), createLiveSession);
router.put('/:sessionId', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateLiveSession);
router.delete('/:sessionId', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), deleteLiveSession);

// Teacher/Admin routes - Control live status
router.post('/:sessionId/start', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), startLiveSession);
router.post('/:sessionId/end', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), endLiveSession);
router.post('/:sessionId/viewers', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateViewerCount);

// Admin/Teacher routes - Statistics
router.get('/stats', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), getLiveSessionStats);

export default router;
