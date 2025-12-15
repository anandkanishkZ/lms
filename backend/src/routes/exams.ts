import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { uploadMultiple, handleUploadError } from '../middlewares/upload';
import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  addQuestionToExam,
  updateQuestionInExam,
  removeQuestionFromExam,
  startExamAttempt,
  submitAnswer,
  submitExamAttempt,
  getExamAttempts,
  gradeAnswer,
  getMyExamResult,
  getExamPreview,
} from '../controllers/examController';

const router = express.Router();

// ============================================
// EXAM MANAGEMENT ROUTES (Teacher/Admin)
// ============================================

/**
 * @route   GET /api/v1/exams
 * @desc    Get all exams (with filters)
 * @access  Private
 */
router.get('/', authenticateToken, getAllExams);

/**
 * @route   POST /api/v1/exams
 * @desc    Create a new exam
 * @access  Private (Teacher/Admin)
 */
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), createExam);

/**
 * @route   GET /api/v1/exams/:id/preview
 * @desc    Get exam preview (student-safe, no answers)
 * @access  Private (Student)
 */
router.get('/:id/preview', authenticateToken, authorizeRoles('STUDENT'), getExamPreview);

/**
 * @route   GET /api/v1/exams/:id
 * @desc    Get single exam by ID (full details for teachers/admins)
 * @access  Private
 */
router.get('/:id', authenticateToken, getExamById);

/**
 * @route   PUT /api/v1/exams/:id
 * @desc    Update exam
 * @access  Private (Teacher/Admin)
 */
router.put('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateExam);

/**
 * @route   DELETE /api/v1/exams/:id
 * @desc    Delete exam
 * @access  Private (Teacher/Admin)
 */
router.delete('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), deleteExam);

// ============================================
// QUESTION MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/v1/exams/:id/questions
 * @desc    Add question to exam
 * @access  Private (Teacher/Admin)
 */
router.post('/:id/questions', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), addQuestionToExam);

/**
 * @route   PUT /api/v1/exams/:examId/questions/:questionId
 * @desc    Update question in exam
 * @access  Private (Teacher/Admin)
 */
router.put('/:examId/questions/:questionId', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateQuestionInExam);

/**
 * @route   DELETE /api/v1/exams/:examId/questions/:questionId
 * @desc    Remove question from exam
 * @access  Private (Teacher/Admin)
 */
router.delete('/:examId/questions/:questionId', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), removeQuestionFromExam);

// ============================================
// STUDENT EXAM TAKING ROUTES
// ============================================

/**
 * @route   POST /api/v1/exams/:id/start
 * @desc    Start exam attempt
 * @access  Private (Student)
 */
router.post('/:id/start', authenticateToken, authorizeRoles('STUDENT'), startExamAttempt);

/**
 * @route   POST /api/v1/exams/:examId/attempts/:attemptId/answer
 * @desc    Submit answer for a question (supports file uploads)
 * @access  Private (Student)
 */
router.post(
  '/:examId/attempts/:attemptId/answer',
  authenticateToken,
  authorizeRoles('STUDENT'),
  uploadMultiple('files', 5),
  handleUploadError,
  submitAnswer
);

/**
 * @route   POST /api/v1/exams/:examId/attempts/:attemptId/submit
 * @desc    Submit exam attempt
 * @access  Private (Student)
 */
router.post('/:examId/attempts/:attemptId/submit', authenticateToken, authorizeRoles('STUDENT'), submitExamAttempt);

/**
 * @route   GET /api/v1/exams/:id/my-result
 * @desc    Get student's exam result
 * @access  Private (Student)
 */
router.get('/:id/my-result', authenticateToken, authorizeRoles('STUDENT'), getMyExamResult);

// ============================================
// GRADING ROUTES (Teacher/Admin)
// ============================================

/**
 * @route   GET /api/v1/exams/:id/attempts
 * @desc    Get all attempts for an exam (for grading)
 * @access  Private (Teacher/Admin)
 */
router.get('/:id/attempts', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), getExamAttempts);

/**
 * @route   PUT /api/v1/exams/answers/:answerId/grade
 * @desc    Grade an answer
 * @access  Private (Teacher/Admin)
 */
router.put('/answers/:answerId/grade', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), gradeAnswer);

export default router;