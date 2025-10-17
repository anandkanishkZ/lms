import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { progressService } from '../services/progress.service';

// @desc    Start/track lesson progress
// @route   POST /api/progress/lessons/:lessonId/start
// @access  Student
export const startLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { enrollmentId } = req.body;

  if (!enrollmentId) {
    res.status(400).json({
      success: false,
      message: 'Enrollment ID is required',
    });
    return;
  }

  const result = await progressService.startLesson({
    lessonId: req.params.lessonId,
    studentId: req.user!.id,
    enrollmentId,
  });

  res.status(200).json(result);
});

// @desc    Mark lesson as completed
// @route   POST /api/progress/lessons/:lessonId/complete
// @access  Student
export const completeLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { enrollmentId, score, watchTime } = req.body;

  if (!enrollmentId) {
    res.status(400).json({
      success: false,
      message: 'Enrollment ID is required',
    });
    return;
  }

  const result = await progressService.completeLesson({
    lessonId: req.params.lessonId,
    studentId: req.user!.id,
    enrollmentId,
    score,
    watchTime,
  });

  res.status(200).json(result);
});

// @desc    Update video progress
// @route   POST /api/progress/lessons/:lessonId/video
// @access  Student
export const updateVideoProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { enrollmentId, watchTime, lastPosition } = req.body;

  if (!enrollmentId) {
    res.status(400).json({
      success: false,
      message: 'Enrollment ID is required',
    });
    return;
  }

  const result = await progressService.updateVideoProgress({
    lessonId: req.params.lessonId,
    enrollmentId,
    watchTime,
    lastPosition,
  });

  res.status(200).json(result);
});

// @desc    Update quiz progress
// @route   POST /api/progress/lessons/:lessonId/quiz
// @access  Student
export const updateQuizProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { enrollmentId, score, passed } = req.body;

  if (!enrollmentId) {
    res.status(400).json({
      success: false,
      message: 'Enrollment ID is required',
    });
    return;
  }

  if (score === undefined) {
    res.status(400).json({
      success: false,
      message: 'Score is required',
    });
    return;
  }

  const result = await progressService.updateQuizProgress({
    lessonId: req.params.lessonId,
    studentId: req.user!.id,
    enrollmentId,
    score,
    passed,
  });

  res.status(200).json(result);
});

// @desc    Get module progress for student
// @route   GET /api/progress/modules/:moduleId
// @access  Student (own progress) / Admin/Teacher
export const getModuleProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId } = req.query;

  // If studentId provided, verify authorization
  let targetStudentId = req.user!.id;

  if (studentId && studentId !== req.user!.id) {
    // Only admin/teacher can view other students' progress
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'TEACHER') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to view this progress',
      });
      return;
    }
    targetStudentId = studentId as string;
  }

  const result = await progressService.getModuleProgress(
    req.params.moduleId,
    targetStudentId
  );

  res.status(200).json(result);
});

// @desc    Get student's overall progress
// @route   GET /api/progress/students/:studentId
// @access  Student (own progress) / Admin/Teacher
export const getStudentOverallProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const studentId = req.params.studentId;

  // Check authorization
  if (studentId !== req.user!.id && req.user!.role !== 'ADMIN' && req.user!.role !== 'TEACHER') {
    res.status(403).json({
      success: false,
      message: 'You are not authorized to view this progress',
    });
    return;
  }

  const result = await progressService.getStudentOverallProgress(studentId);

  res.status(200).json(result);
});

// @desc    Get lesson progress
// @route   GET /api/progress/lessons/:lessonId
// @access  Student/Teacher/Admin
export const getLessonProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { enrollmentId } = req.query;

  if (!enrollmentId) {
    res.status(400).json({
      success: false,
      message: 'Enrollment ID is required',
    });
    return;
  }

  const result = await progressService.getLessonProgress(
    req.params.lessonId,
    enrollmentId as string
  );

  res.status(200).json(result);
});

// @desc    Reset lesson progress
// @route   DELETE /api/progress/lessons/:lessonId/reset
// @access  Admin
export const resetLessonProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { enrollmentId } = req.body;

  if (!enrollmentId) {
    res.status(400).json({
      success: false,
      message: 'Enrollment ID is required',
    });
    return;
  }

  const result = await progressService.resetLessonProgress(
    req.params.lessonId,
    enrollmentId,
    req.user!.id
  );

  res.status(200).json(result);
});

// @desc    Get module progress statistics
// @route   GET /api/progress/modules/:moduleId/stats
// @access  Admin/Teacher
export const getModuleProgressStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await progressService.getModuleProgressStats(req.params.moduleId);

  res.status(200).json(result);
});
