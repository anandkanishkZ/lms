import express from 'express';
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  attachClassToBatch,
  detachClassFromBatch,
  getBatchClasses,
  updateBatchStatus,
  getBatchStatistics,
  getBatchStudents,
} from '../../controllers/batchController';

const router = express.Router();

// Batch CRUD operations
router.post('/', createBatch);
router.get('/', getAllBatches);
router.get('/:id', getBatchById);
router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);

// Class-Batch operations
router.post('/:batchId/classes', attachClassToBatch);
router.delete('/:batchId/classes/:classId', detachClassFromBatch);
router.get('/:batchId/classes', getBatchClasses);

// Status management
router.patch('/:batchId/status', updateBatchStatus);

// Statistics and analytics
router.get('/:batchId/statistics', getBatchStatistics);
router.get('/:batchId/students', getBatchStudents);

export default router;
