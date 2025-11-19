import { Router } from 'express';
import {
  enrollStudentInSubject,
  bulkEnrollStudentsInSubject,
  enrollBatchInClass,
  getStudentEnrollments,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deactivateEnrollment,
  getEnrollmentStatistics,
  getBatchStudents,
  getClassSubjects,
  getLegacyStudentClassEnrollments,
} from '../../controllers/unifiedEnrollmentController';
import { authenticate } from '../../middlewares/auth';
import { authorizeRoles } from '../../middlewares/auth';

const router = Router();

// ============================================
// UNIFIED ENROLLMENT ROUTES (OPTION 2 - HYBRID)
// Following the photo model: Student -> Subject (via Class + Batch)
// ============================================

// Apply authentication to all routes
router.use(authenticate);

// ============================================
// CORE ENROLLMENT OPERATIONS
// ============================================

// Enroll student in subject (Core operation following photo model)
router.post('/subject', 
  authorizeRoles('ADMIN', 'TEACHER'), 
  enrollStudentInSubject
);

// Bulk enroll students in subject
router.post('/subject/bulk', 
  authorizeRoles('ADMIN'), 
  bulkEnrollStudentsInSubject
);

// Enroll entire batch in all subjects of a class
router.post('/batch/:batchId/class/:classId', 
  authorizeRoles('ADMIN'), 
  enrollBatchInClass
);

// ============================================
// QUERY & RETRIEVAL OPERATIONS
// ============================================

// Get all enrollments with filters and pagination
router.get('/subject', 
  authorizeRoles('ADMIN', 'TEACHER'), 
  getAllEnrollments
);

// Get enrollment statistics
router.get('/subject/statistics', 
  authorizeRoles('ADMIN', 'TEACHER'), 
  getEnrollmentStatistics
);

// Get enrollment by ID
router.get('/subject/:id', 
  authorizeRoles('ADMIN', 'TEACHER'), 
  getEnrollmentById
);

// Get student's enrollments (accessible by student themselves)
router.get('/student/:studentId', 
  authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), 
  getStudentEnrollments
);

// ============================================
// MANAGEMENT OPERATIONS
// ============================================

// Update enrollment details (grades, marks, attendance)
router.put('/subject/:id', 
  authorizeRoles('ADMIN', 'TEACHER'), 
  updateEnrollment
);

// Deactivate enrollment (soft delete)
router.delete('/subject/:id', 
  authorizeRoles('ADMIN'), 
  deactivateEnrollment
);

// ============================================
// CONVENIENCE & UTILITY OPERATIONS
// ============================================

// Get all students in a batch
router.get('/batch/:batchId/students', 
  authorizeRoles('ADMIN', 'TEACHER'), 
  getBatchStudents
);

// Get all subjects for a class
router.get('/class/:classId/subjects', 
  authorizeRoles('ADMIN', 'TEACHER'), 
  getClassSubjects
);

// ============================================
// LEGACY COMPATIBILITY ROUTES
// ============================================

// Legacy StudentClass format for backward compatibility
router.get('/legacy/student-class', 
  authorizeRoles('ADMIN', 'TEACHER'), 
  getLegacyStudentClassEnrollments
);

export default router;