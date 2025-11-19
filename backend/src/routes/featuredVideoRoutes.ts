import { Router } from 'express';
import { featuredVideoController } from '../controllers/featuredVideoController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = Router();

/**
 * Featured Video Routes
 * Handles dynamic featured video functionality for modules
 */

// Public route - Get module's current featured video (includes live class check)
router.get('/modules/:moduleId/featured-video', featuredVideoController.getModuleFeaturedVideo);

// Teacher routes - Manage featured videos
router.put('/modules/:moduleId/featured-video', 
  authenticateToken, 
  authorizeRoles('TEACHER', 'ADMIN'), 
  featuredVideoController.updateModuleFeaturedVideo
);

// Admin/Teacher routes - Get active live classes
router.get('/featured-videos/active-live-classes',
  authenticateToken,
  authorizeRoles('TEACHER', 'ADMIN'),
  featuredVideoController.getActiveLiveClasses
);

// Utility route - Convert YouTube URL to embed format
router.post('/featured-videos/youtube-embed',
  authenticateToken,
  authorizeRoles('TEACHER', 'ADMIN'),
  featuredVideoController.getYouTubeEmbedUrl
);

export default router;