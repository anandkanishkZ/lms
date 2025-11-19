import express from 'express';
import adminAuthRoutes from './auth';
import adminUserRoutes from './users';
import batchRoutes from './batches';
import classRoutes from './classes';
import classEnrollmentRoutes from './classEnrollments';
import graduationRoutes from './graduations';
import unifiedEnrollmentRoutes from './unifiedEnrollments'; // New unified enrollment system
import { authenticateAdmin } from '../../middlewares/adminAuth';

const router = express.Router();

// Admin authentication routes (public)
router.use('/auth', adminAuthRoutes);

// All other admin routes require authentication
router.use('/users', authenticateAdmin, adminUserRoutes);
router.use('/batches', authenticateAdmin, batchRoutes);
router.use('/classes', authenticateAdmin, classRoutes);
router.use('/enrollments', authenticateAdmin, classEnrollmentRoutes); // Legacy enrollment routes
router.use('/enrollments-v2', authenticateAdmin, unifiedEnrollmentRoutes); // New unified enrollment system (Option 2)
router.use('/graduations', authenticateAdmin, graduationRoutes);
// router.use('/dashboard', authenticateAdmin, adminDashboardRoutes);
// Add more admin routes here as needed

export default router;