import express from 'express';
import {
  enrollStudent,
  bulkEnrollStudents,
  enrollBatchToClass,
  getEnrollmentById,
  getEnrollments,
  getStudentEnrollments,
  getClassEnrollments,
  updateEnrollment,
  markAsCompleted,
  unenrollStudent,
  promoteToNextClass,
} from '../../controllers/classEnrollmentController';

const router = express.Router();

// Enrollment operations
router.post('/class', enrollStudent);
router.post('/class/bulk', bulkEnrollStudents);
router.post('/batch/:batchId/class/:classId', enrollBatchToClass);

// Get enrollments
router.get('/class', getEnrollments);
router.get('/class/:id', getEnrollmentById);
router.get('/student/:studentId', getStudentEnrollments);
router.get('/class-list/:classId', getClassEnrollments);

// Update enrollment
router.put('/class/:id', updateEnrollment);
router.patch('/class/:id/complete', markAsCompleted);

// Promotion
router.post('/class/:id/promote', promoteToNextClass);

// Delete enrollment
router.delete('/class/:id', unenrollStudent);

export default router;
