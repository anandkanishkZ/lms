import { Router } from 'express';
import * as classController from '../../controllers/classController';

const router = Router();

/**
 * @route   POST /api/v1/admin/classes
 * @desc    Create a new class
 * @access  Admin
 */
router.post('/', classController.createClass);

/**
 * @route   GET /api/v1/admin/classes
 * @desc    Get all classes with pagination and filters
 * @access  Admin
 */
router.get('/', classController.getAllClasses);

/**
 * @route   GET /api/v1/admin/classes/:id/statistics
 * @desc    Get class statistics (must be before /:id route)
 * @access  Admin
 */
router.get('/:id/statistics', classController.getClassStatistics);

/**
 * @route   GET /api/v1/admin/classes/:id
 * @desc    Get class by ID with full details
 * @access  Admin
 */
router.get('/:id', classController.getClassById);

/**
 * @route   PUT /api/v1/admin/classes/:id
 * @desc    Update class
 * @access  Admin
 */
router.put('/:id', classController.updateClass);

/**
 * @route   DELETE /api/v1/admin/classes/:id
 * @desc    Delete class (soft delete by default, use ?hardDelete=true for permanent delete)
 * @access  Admin
 */
router.delete('/:id', classController.deleteClass);

/**
 * @route   POST /api/v1/admin/classes/:id/teachers
 * @desc    Assign teacher to class with subject (must be before other teacher routes)
 * @access  Admin
 */
router.post('/:id/teachers', classController.assignTeacher);

/**
 * @route   DELETE /api/v1/admin/classes/:id/teachers/:teacherId/subjects/:subjectId
 * @desc    Remove teacher from class
 * @access  Admin
 */
router.delete('/:id/teachers/:teacherId/subjects/:subjectId', classController.removeTeacher);

export default router;
