import express from 'express';
import {
  getPendingModules,
  getApprovalHistory,
  approveModule,
  rejectModule,
  getApprovalStats,
} from '../controllers/moduleApprovalController';
import { authenticateToken } from '../middlewares/auth';
import { requireRole } from '../middlewares/auth';

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// @route   GET /api/v1/admin/modules/approval/stats
router.get('/stats', getApprovalStats);

// @route   GET /api/v1/admin/modules/approval/pending
router.get('/pending', getPendingModules);

// @route   GET /api/v1/admin/modules/approval/history
router.get('/history', getApprovalHistory);

// @route   POST /api/v1/admin/modules/approval/:id/approve
router.post('/:id/approve', approveModule);

// @route   POST /api/v1/admin/modules/approval/:id/reject
router.post('/:id/reject', rejectModule);

export default router;
