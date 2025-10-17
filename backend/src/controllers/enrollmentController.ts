import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { enrollmentService } from '../services/enrollment.service';

// @desc    Enroll a student in a module
// @route   POST /api/enrollments
// @access  Admin
export const enrollStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await enrollmentService.enrollStudent({
    ...req.body,
    enrolledBy: req.user!.id,
  });

  res.status(201).json(result);
});

// @desc    Bulk enroll students in a module
// @route   POST /api/enrollments/bulk
// @access  Admin
export const bulkEnrollStudents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await enrollmentService.bulkEnrollStudents({
    ...req.body,
    enrolledBy: req.user!.id,
  });

  res.status(201).json(result);
});

// @desc    Enroll entire class in a module
// @route   POST /api/enrollments/class
// @access  Admin
export const enrollClassInModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await enrollmentService.enrollClassInModule({
    ...req.body,
    enrolledBy: req.user!.id,
  });

  res.status(201).json(result);
});

// @desc    Unenroll a student from a module
// @route   DELETE /api/enrollments/:id
// @access  Admin
export const unenrollStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await enrollmentService.unenrollStudent(req.params.id, req.user!.id);

  res.status(200).json(result);
});

// @desc    Toggle enrollment status (active/inactive)
// @route   PATCH /api/enrollments/:id/status
// @access  Admin
export const toggleEnrollmentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await enrollmentService.toggleEnrollmentStatus(req.params.id, req.user!.id);

  res.status(200).json(result);
});

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Admin/Student (own enrollment)
export const getEnrollmentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await enrollmentService.getEnrollmentById(req.params.id);

  if (!result.data) {
    res.status(404).json({
      success: false,
      message: 'Enrollment not found',
    });
    return;
  }

  // Check authorization: Admin or the enrolled student
  if (req.user!.role !== 'ADMIN' && result.data.studentId !== req.user!.id) {
    res.status(403).json({
      success: false,
      message: 'You are not authorized to view this enrollment',
    });
    return;
  }

  res.status(200).json(result);
});

// @desc    Get all enrollments for a module
// @route   GET /api/modules/:moduleId/enrollments
// @access  Admin/Teacher
export const getModuleEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;

  const result = await enrollmentService.getModuleEnrollments(req.params.moduleId, {
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Get student's enrollments
// @route   GET /api/students/:studentId/enrollments
// @access  Admin/Student (own enrollments)
export const getStudentEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const studentId = req.params.studentId;

  // Check authorization: Admin or the student themselves
  if (req.user!.role !== 'ADMIN' && req.user!.id !== studentId) {
    res.status(403).json({
      success: false,
      message: 'You are not authorized to view these enrollments',
    });
    return;
  }

  const result = await enrollmentService.getStudentEnrollments(studentId);

  res.status(200).json(result);
});

// @desc    Get enrollment statistics for a module
// @route   GET /api/modules/:moduleId/enrollments/stats
// @access  Admin/Teacher
export const getEnrollmentStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await enrollmentService.getEnrollmentStats(req.params.moduleId);

  res.status(200).json(result);
});
