import express from 'express';
import adminAuthRoutes from './auth';
import adminUserRoutes from './users';
import { authenticateAdmin } from '../../middlewares/adminAuth';

const router = express.Router();

// Admin authentication routes (public)
router.use('/auth', adminAuthRoutes);

// All other admin routes require authentication
router.use('/users', authenticateAdmin, adminUserRoutes);
// router.use('/dashboard', authenticateAdmin, adminDashboardRoutes);
// Add more admin routes here as needed

export default router;