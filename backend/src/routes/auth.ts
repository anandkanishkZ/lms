import express from 'express';
import { register, login, logout, forgotPassword, resetPassword, verifyEmail, getProfile, updateProfile, changePassword } from '../controllers/authController';
import { uploadAvatar, deleteAvatar } from '../controllers/avatarController';
import { getAvatar, getMyAvatar } from '../controllers/avatarViewController';
import { optionalAuth, authenticate } from '../middlewares/auth';
import { uploadSingle, handleUploadError } from '../middlewares/upload';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.post('/logout', optionalAuth, logout);
router.get('/me', authenticate, getProfile); // Alias for getCurrentUser
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

// Avatar routes
router.post('/avatar', authenticate, uploadSingle('avatar'), handleUploadError, uploadAvatar);
router.delete('/avatar', authenticate, deleteAvatar);
router.get('/avatar', authenticate, getMyAvatar); // Get authenticated user's avatar
router.get('/avatars/:filename', getAvatar); // Get any avatar by filename (public)

export default router;