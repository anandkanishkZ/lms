import express from 'express';
import {
  enrollStudent,
  bulkEnrollStudents,
  enrollClassInModule,
  unenrollStudent,
  toggleEnrollmentStatus,
  getEnrollmentById,
  getModuleEnrollments,
  getStudentEnrollments,
  getEnrollmentStats,
} from '../controllers/enrollmentController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// Admin-only routes - Enrollment management
router.post('/', authenticateToken, authorizeRoles('ADMIN'), enrollStudent);
router.post('/bulk', authenticateToken, authorizeRoles('ADMIN'), bulkEnrollStudents);
router.post('/class', authenticateToken, authorizeRoles('ADMIN'), enrollClassInModule);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), unenrollStudent);
router.patch('/:id/status', authenticateToken, authorizeRoles('ADMIN'), toggleEnrollmentStatus);

// Get enrollment - Admin or enrolled student
router.get('/:id', authenticateToken, getEnrollmentById);

// Get module enrollments - Admin/Teacher
router.get('/modules/:moduleId/enrollments', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), getModuleEnrollments);

// Get enrollment stats - Admin/Teacher
router.get('/modules/:moduleId/stats', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), getEnrollmentStats);

// Get student enrollments - Admin or the student
router.get('/students/:studentId/enrollments', authenticateToken, getStudentEnrollments);

export default router;
