import express from 'express';
import {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
  submitForApproval,
  approveModule,
  publishModule,
  rejectModule,
  getFeaturedModules,
  incrementViewCount,
} from '../controllers/moduleController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedModules);

// Authenticated routes
router.get('/', authenticateToken, getModules);
router.get('/:id', authenticateToken, getModuleById);
router.post('/:id/view', authenticateToken, incrementViewCount);

// Teacher/Admin routes - Create and manage modules
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), createModule);
router.put('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateModule);
router.delete('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), deleteModule);

// Module workflow routes
router.post('/:id/submit', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), submitForApproval);

// Admin-only routes - Approval workflow
router.post('/:id/approve', authenticateToken, authorizeRoles('ADMIN'), approveModule);
router.post('/:id/publish', authenticateToken, authorizeRoles('ADMIN'), publishModule);
router.post('/:id/reject', authenticateToken, authorizeRoles('ADMIN'), rejectModule);

export default router;
