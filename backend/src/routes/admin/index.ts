import express from 'express';
import adminAuthRoutes from './auth';
import adminUserRoutes from './users';
import batchRoutes from './batches';
import classEnrollmentRoutes from './classEnrollments';
import graduationRoutes from './graduations';
import { authenticateAdmin } from '../../middlewares/adminAuth';

const router = express.Router();

// Admin authentication routes (public)
router.use('/auth', adminAuthRoutes);

// All other admin routes require authentication
router.use('/users', authenticateAdmin, adminUserRoutes);
router.use('/batches', authenticateAdmin, batchRoutes);
router.use('/enrollments', authenticateAdmin, classEnrollmentRoutes);
router.use('/graduations', authenticateAdmin, graduationRoutes);
// router.use('/dashboard', authenticateAdmin, adminDashboardRoutes);
// Add more admin routes here as needed

export default router;