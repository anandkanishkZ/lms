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

// Admin-only routes - Module creation and deletion
// Only admins can create modules and assign them to teachers
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createModule);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteModule);

// Teacher/Admin routes - Update modules
// Teachers can update their assigned modules, admins can update any module
router.put('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateModule);

// Module workflow routes
router.post('/:id/submit', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), submitForApproval);

// Admin-only routes - Approval workflow
router.post('/:id/approve', authenticateToken, authorizeRoles('ADMIN'), approveModule);
router.post('/:id/publish', authenticateToken, authorizeRoles('ADMIN'), publishModule);
router.post('/:id/reject', authenticateToken, authorizeRoles('ADMIN'), rejectModule);

export default router;
