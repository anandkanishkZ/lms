import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { classEnrollmentService } from '../services/classEnrollment.service';
import { z } from 'zod';

// Validation schemas
const enrollStudentSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
  batchId: z.string().min(1),
});

const bulkEnrollSchema = z.object({
  studentIds: z.array(z.string()).min(1, 'At least one student ID is required'),
  classId: z.string().min(1),
  batchId: z.string().min(1),
});

const updateEnrollmentSchema = z.object({
  isCompleted: z.boolean().optional(),
  isPassed: z.boolean().optional(),
  finalGrade: z.enum(['A_PLUS', 'A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D', 'F']).optional(),
  finalMarks: z.number().optional(),
  totalMarks: z.number().optional(),
  attendance: z.number().min(0).max(100).optional(),
  remarks: z.string().optional(),
  isActive: z.boolean().optional(),
});

// @desc    Enroll student to class
// @route   POST /api/v1/admin/enrollments/class
// @access  Private (Admin)
export const enrollStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = enrollStudentSchema.parse(req.body);

  const result = await classEnrollmentService.enrollStudent({
    ...validatedData,
    enrolledBy: req.user!.id,
  });

  res.status(result.success ? 201 : 400).json(result);
});

// @desc    Bulk enroll students to class
// @route   POST /api/v1/admin/enrollments/class/bulk
// @access  Private (Admin)
export const bulkEnrollStudents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = bulkEnrollSchema.parse(req.body);

  const result = await classEnrollmentService.bulkEnrollStudents({
    ...validatedData,
    enrolledBy: req.user!.id,
  });

  res.status(result.success ? 201 : 400).json(result);
});

// @desc    Enroll entire batch to class
// @route   POST /api/v1/admin/enrollments/batch/:batchId/class/:classId
// @access  Private (Admin)
export const enrollBatchToClass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await classEnrollmentService.enrollBatchToClass(
    req.params.batchId,
    req.params.classId,
    req.user!.id
  );

  res.status(result.success ? 201 : 400).json(result);
});

// @desc    Get enrollment by ID
// @route   GET /api/v1/admin/enrollments/class/:id
// @access  Private (Admin)
export const getEnrollmentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await classEnrollmentService.getEnrollmentById(req.params.id);

  res.status(result.success ? 200 : 404).json(result);
});

// @desc    Get enrollments with filters
// @route   GET /api/v1/admin/enrollments/class
// @access  Private (Admin)
export const getEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId, classId, batchId, isActive, isCompleted } = req.query;

  const filters: any = {};
  if (studentId) filters.studentId = studentId as string;
  if (classId) filters.classId = classId as string;
  if (batchId) filters.batchId = batchId as string;
  if (isActive !== undefined) filters.isActive = isActive === 'true';
  if (isCompleted !== undefined) filters.isCompleted = isCompleted === 'true';

  const result = await classEnrollmentService.getEnrollments(filters);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Get student enrollments
// @route   GET /api/v1/admin/enrollments/student/:studentId
// @access  Private (Admin)
export const getStudentEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await classEnrollmentService.getStudentEnrollments(req.params.studentId);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Get class enrollments
// @route   GET /api/v1/admin/enrollments/class-list/:classId
// @access  Private (Admin)
export const getClassEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { batchId } = req.query;

  const result = await classEnrollmentService.getClassEnrollments(
    req.params.classId,
    batchId as string | undefined
  );

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Update enrollment
// @route   PUT /api/v1/admin/enrollments/class/:id
// @access  Private (Admin)
export const updateEnrollment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = updateEnrollmentSchema.parse(req.body);

  const result = await classEnrollmentService.updateEnrollment(req.params.id, validatedData);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Mark enrollment as completed
// @route   PATCH /api/v1/admin/enrollments/class/:id/complete
// @access  Private (Admin)
export const markAsCompleted = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isPassed, finalGrade, finalMarks, totalMarks, attendance, remarks } = req.body;

  const academicData: any = {};
  if (isPassed !== undefined) academicData.isPassed = isPassed;
  if (finalGrade) academicData.finalGrade = finalGrade;
  if (finalMarks !== undefined) academicData.finalMarks = finalMarks;
  if (totalMarks !== undefined) academicData.totalMarks = totalMarks;
  if (attendance !== undefined) academicData.attendance = attendance;
  if (remarks) academicData.remarks = remarks;

  const result = await classEnrollmentService.markAsCompleted(req.params.id, academicData);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Unenroll student
// @route   DELETE /api/v1/admin/enrollments/class/:id
// @access  Private (Admin)
export const unenrollStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await classEnrollmentService.unenrollStudent(req.params.id);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Promote student to next class
// @route   POST /api/v1/admin/enrollments/class/:id/promote
// @access  Private (Admin)
export const promoteToNextClass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nextClassId } = req.body;

  if (!nextClassId) {
    res.status(400).json({
      success: false,
      message: 'Next class ID is required',
    });
    return;
  }

  const result = await classEnrollmentService.promoteToNextClass(
    req.params.id,
    nextClassId,
    req.user!.id
  );

  res.status(result.success ? 201 : 400).json(result);
});
