import express from 'express';
import { register, login, logout, forgotPassword, verifyOTP, resetPassword, verifyEmail, requestVerificationOTP, verifyPhone, getProfile, updateProfile, changePassword } from '../controllers/authController';
import { uploadAvatar, deleteAvatar } from '../controllers/avatarController';
import { getAvatar, getMyAvatar } from '../controllers/avatarViewController';
import { optionalAuth, authenticate } from '../middlewares/auth';
import { uploadSingle, handleUploadError } from '../middlewares/upload';
import { 
  validateLogin, 
  validateRegistration, 
  validatePasswordResetRequest,
  validatePasswordReset,
  validateUserUpdate,
  validateOTPVerification,
  validatePhoneVerification
} from '../middlewares/validator';

const router = express.Router();

// Public routes with validation
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validatePasswordResetRequest, forgotPassword);
router.post('/verify-otp', validateOTPVerification, verifyOTP);
router.post('/reset-password', validatePasswordReset, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Account verification routes (protected)
router.post('/request-verification-otp', authenticate, requestVerificationOTP);
router.post('/verify-phone', authenticate, validatePhoneVerification, verifyPhone);

// Protected routes
router.post('/logout', optionalAuth, logout);
router.get('/me', authenticate, getProfile); // Alias for getCurrentUser
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateUserUpdate, updateProfile);
router.post('/change-password', authenticate, changePassword);

// Avatar routes
router.post('/avatar', authenticate, uploadSingle('avatar'), handleUploadError, uploadAvatar);
router.delete('/avatar', authenticate, deleteAvatar);
router.get('/avatar', authenticate, getMyAvatar); // Get authenticated user's avatar
router.get('/avatars/:filename', getAvatar); // Get any avatar by filename (public)

export default router;