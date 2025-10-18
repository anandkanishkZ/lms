import express from 'express';
import {
  createResource,
  getResourceById,
  getResources,
  updateResource,
  deleteResource,
  toggleVisibility,
  bulkOperation,
  trackAccess,
  reorderResources,
  getResourceAnalytics,
} from '../controllers/resourceController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { uploadSingle, handleUploadError } from '../middlewares/upload';

const router = express.Router();

// ============================================
// RESOURCE CRUD ROUTES
// ============================================

// Get single resource (authenticated users)
router.get('/:id', authenticateToken, getResourceById);

// Update resource (teachers can update their own module resources, admins can update all)
router.put('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateResource);

// Delete resource (teachers can delete from their modules, admins can delete all)
router.delete('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), deleteResource);

// ============================================
// SPECIAL OPERATIONS
// ============================================

// Toggle visibility (hide/unhide)
router.patch('/:id/visibility', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), toggleVisibility);

// Track access (view/download) - All authenticated users
router.post('/:id/track', authenticateToken, trackAccess);

// Get resource analytics (teacher/admin only)
router.get('/:id/analytics', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), getResourceAnalytics);

// Bulk operations (teacher/admin only)
router.post('/bulk', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), bulkOperation);

// ============================================
// MODULE-LEVEL RESOURCES
// ============================================

// Get all resources for a module
router.get('/modules/:moduleId', authenticateToken, getResources);

// Create resource for a module (with optional file upload)
router.post('/modules/:moduleId', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), uploadSingle('resource'), createResource, handleUploadError);

// Reorder module resources
router.patch('/modules/:moduleId/reorder', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), reorderResources);

// ============================================
// TOPIC-LEVEL RESOURCES
// ============================================

// Get all resources for a topic
router.get('/topics/:topicId', authenticateToken, getResources);

// Create resource for a topic (with optional file upload)
router.post('/topics/:topicId', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), uploadSingle('resource'), createResource, handleUploadError);

// Reorder topic resources
router.patch('/topics/:topicId/reorder', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), reorderResources);

// ============================================
// LESSON-LEVEL RESOURCES
// ============================================

// Get all resources for a lesson
router.get('/lessons/:lessonId', authenticateToken, getResources);

// Create resource for a lesson (with optional file upload)
router.post('/lessons/:lessonId', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), uploadSingle('resource'), createResource, handleUploadError);

// Reorder lesson resources
router.patch('/lessons/:lessonId/reorder', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), reorderResources);

export default router;
