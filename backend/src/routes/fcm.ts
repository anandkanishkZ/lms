import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { registerToken, unregisterToken, getTokens } from '../controllers/fcmController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/fcm/register
 * @desc    Register FCM device token for push notifications
 * @access  Private (All authenticated users)
 */
router.post('/register', registerToken);

/**
 * @route   POST /api/v1/fcm/unregister
 * @desc    Unregister FCM device token
 * @access  Private (All authenticated users)
 */
router.post('/unregister', unregisterToken);

/**
 * @route   GET /api/v1/fcm/tokens
 * @desc    Get user's registered device tokens
 * @access  Private (All authenticated users)
 */
router.get('/tokens', getTokens);

export default router;
