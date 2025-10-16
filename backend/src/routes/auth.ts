import express from 'express';
import { register, login, logout, forgotPassword, resetPassword, verifyEmail } from '../controllers/authController';
import { optionalAuth } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.post('/logout', optionalAuth, logout);

export default router;