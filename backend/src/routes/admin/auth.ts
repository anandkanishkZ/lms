import express from 'express';
import {
  adminLogin,
  adminLogout,
  adminRefreshToken,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from '../../controllers/adminAuthController';
import { authenticateAdmin, optionalAdminAuth } from '../../middlewares/adminAuth';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);
router.post('/refresh', adminRefreshToken);

// Protected routes
router.post('/logout', authenticateAdmin, adminLogout);
router.get('/profile', authenticateAdmin, getAdminProfile);
router.put('/profile', authenticateAdmin, updateAdminProfile);
router.put('/change-password', authenticateAdmin, changeAdminPassword);

export default router;