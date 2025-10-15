import express from 'express';
import { getProfile, updateProfile, getUserById, getAllUsers } from '@/controllers/userController';
import { authorizeRoles } from '@/middlewares/auth';

const router = express.Router();

// Get current user profile
router.get('/profile', getProfile);

// Update current user profile
router.put('/profile', updateProfile);

// Get user by ID (Admin only)
router.get('/:id', authorizeRoles('ADMIN'), getUserById);

// Get all users (Admin only)
router.get('/', authorizeRoles('ADMIN'), getAllUsers);

export default router;