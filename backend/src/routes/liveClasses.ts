import express from 'express';
import {
  createLiveClass,
  getLiveClasses,
  getLiveClassById,
  updateLiveClass,
  deleteLiveClass,
  joinLiveClass,
  leaveLiveClass,
} from '../controllers/liveClassController';
import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// Get all live classes
router.get('/', getLiveClasses);

// Create new live class (Teacher/Admin only)
router.post('/', authorizeRoles('TEACHER', 'ADMIN'), createLiveClass);

// Get live class by ID
router.get('/:id', getLiveClassById);

// Update live class (Teacher/Admin only)
router.put('/:id', authorizeRoles('TEACHER', 'ADMIN'), updateLiveClass);

// Delete live class (Teacher/Admin only)
router.delete('/:id', authorizeRoles('TEACHER', 'ADMIN'), deleteLiveClass);

// Join live class (Student only)
router.post('/:id/join', authorizeRoles('STUDENT'), joinLiveClass);

// Leave live class (Student only)
router.post('/:id/leave', authorizeRoles('STUDENT'), leaveLiveClass);

export default router;