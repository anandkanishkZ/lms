import express from 'express';
import {
  createModule,
  getModules,
  getModuleById,
  getModuleBySlug,
  updateModule,
  deleteModule,
  submitForApproval,
  approveModule,
  publishModule,
  rejectModule,
  getFeaturedModules,
  incrementViewCount,
} from '../controllers/moduleController';
import {
  submitReview,
  getMyReview,
  getModuleReviews,
  getModuleRatingStats,
  deleteReview,
  toggleReviewVisibility,
  getTeacherModuleReviews
} from '../controllers/moduleReviewController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedModules);

// Authenticated routes
router.get('/', authenticateToken, getModules);
router.get('/slug/:slug', authenticateToken, getModuleBySlug);
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

// Rating/Review routes (Student access)
router.post('/:id/reviews', authenticateToken, authorizeRoles('STUDENT'), submitReview);
router.get('/:id/reviews/my', authenticateToken, authorizeRoles('STUDENT'), getMyReview);
router.get('/:id/reviews', authenticateToken, getModuleReviews);
router.get('/:id/reviews/stats', authenticateToken, getModuleRatingStats);
router.delete('/:id/reviews/my', authenticateToken, authorizeRoles('STUDENT'), deleteReview);

// Teacher/Admin review management routes
router.get('/:id/reviews/teacher', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), getTeacherModuleReviews);
router.patch('/:id/reviews/:reviewId/toggle', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), toggleReviewVisibility);

export default router;
