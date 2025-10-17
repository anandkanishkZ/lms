import express from 'express';
import { 
  createStudent,
  createTeacher,
  getUsers,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
  getUserAuditTrail
} from '../../controllers/userController';

const router = express.Router();

// Create new student
router.post('/student', createStudent);

// Create new teacher
router.post('/teacher', createTeacher);

// Get all users with filtering
router.get('/', getUsers);

// Update user
router.put('/:id', updateUser);

// Block user
router.post('/:id/block', blockUser);

// Unblock user
router.post('/:id/unblock', unblockUser);

// Delete user
router.delete('/:id', deleteUser);

// Get user audit trail
router.get('/:id/audit-trail', getUserAuditTrail);

export default router;