import express from 'express';
import {
  createTopic,
  getTopicById,
  getTopicsByModule,
  updateTopic,
  deleteTopic,
  duplicateTopic,
  reorderTopics,
} from '../controllers/topicController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// Get topics by module - Authenticated
router.get('/modules/:moduleId/topics', authenticateToken, getTopicsByModule);

// Get single topic - Authenticated
router.get('/:id', authenticateToken, getTopicById);

// Teacher/Admin routes - Manage topics
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), createTopic);
router.put('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateTopic);
router.delete('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), deleteTopic);
router.post('/:id/duplicate', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), duplicateTopic);

// Reorder topics in module - Teacher/Admin
router.patch('/modules/:moduleId/reorder', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), reorderTopics);

export default router;
