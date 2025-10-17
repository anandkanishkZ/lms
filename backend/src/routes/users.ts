import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  getUserById, 
  getAllUsers, 
  toggleUserStatus,
  createStudent,
  createTeacher,
  getUsers
} from '../controllers/userController';
import { authorizeRoles } from '../middlewares/auth';
import adminAuth from '../middlewares/adminAuth';

const router = express.Router();

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin user management routes
router.post('/student', adminAuth.requireAdmin, createStudent);
router.post('/teacher', adminAuth.requireAdmin, createTeacher);
router.get('/', adminAuth.requireAdmin, getUsers);

// Legacy routes (keeping for compatibility)
router.get('/:id', authorizeRoles('ADMIN'), getUserById);
router.get('/all', authorizeRoles('ADMIN'), getAllUsers);
router.patch('/:id/toggle-status', authorizeRoles('ADMIN'), toggleUserStatus);

export default router;