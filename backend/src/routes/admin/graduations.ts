import express from 'express';
import {
  graduateStudent,
  graduateBatch,
  getGraduationById,
  getBatchGraduations,
  getStudentGraduation,
  getAllGraduations,
  updateGraduation,
  attachCertificate,
  revokeGraduation,
  getGraduationStatistics,
} from '../../controllers/graduationController';

const router = express.Router();

// Graduation operations
router.post('/student', graduateStudent);
router.post('/batch/:batchId', graduateBatch);

// Get graduations
router.get('/', getAllGraduations);
router.get('/statistics', getGraduationStatistics);
router.get('/:id', getGraduationById);
router.get('/batch/:batchId', getBatchGraduations);
router.get('/student/:studentId', getStudentGraduation);

// Update graduation
router.put('/:id', updateGraduation);
router.post('/:id/certificate', attachCertificate);

// Delete graduation
router.delete('/:id', revokeGraduation);

export default router;
