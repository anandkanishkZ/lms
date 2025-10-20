import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { graduationService } from '../services/graduation.service';
import { z } from 'zod';

// Validation schemas
const graduateStudentSchema = z.object({
  batchId: z.string().min(1),
  studentId: z.string().min(1),
  graduationDate: z.string().transform((str) => new Date(str)),
  overallGrade: z.enum(['A_PLUS', 'A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D', 'F']).optional(),
  overallPercentage: z.number().min(0).max(100).optional(),
  totalCredits: z.number().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  honors: z.string().optional(),
  remarks: z.string().optional(),
});

const graduateBatchSchema = z.object({
  graduationDate: z.string().transform((str) => new Date(str)),
  studentIds: z.array(z.string()).optional(), // Optional: graduate specific students
});

const updateGraduationSchema = z.object({
  overallGrade: z.enum(['A_PLUS', 'A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D', 'F']).optional(),
  overallPercentage: z.number().min(0).max(100).optional(),
  totalCredits: z.number().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  certificateNo: z.string().optional(),
  certificateUrl: z.string().optional(),
  honors: z.string().optional(),
  remarks: z.string().optional(),
  isAwarded: z.boolean().optional(),
});

// @desc    Graduate a single student
// @route   POST /api/v1/admin/graduations/student
// @access  Private (Admin)
export const graduateStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = graduateStudentSchema.parse(req.body);

  const result = await graduationService.graduateStudent({
    ...validatedData,
    createdBy: req.user!.id,
  });

  res.status(result.success ? 201 : 400).json(result);
});

// @desc    Graduate entire batch
// @route   POST /api/v1/admin/graduations/batch/:batchId
// @access  Private (Admin)
export const graduateBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = graduateBatchSchema.parse(req.body);

  const result = await graduationService.graduateBatch({
    batchId: req.params.batchId,
    ...validatedData,
    createdBy: req.user!.id,
  });

  res.status(result.success ? 201 : 400).json(result);
});

// @desc    Get graduation by ID
// @route   GET /api/v1/admin/graduations/:id
// @access  Private (Admin)
export const getGraduationById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await graduationService.getGraduationById(req.params.id);

  res.status(result.success ? 200 : 404).json(result);
});

// @desc    Get batch graduations
// @route   GET /api/v1/admin/graduations/batch/:batchId
// @access  Private (Admin)
export const getBatchGraduations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await graduationService.getBatchGraduations(req.params.batchId);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Get student graduation
// @route   GET /api/v1/admin/graduations/student/:studentId
// @access  Private (Admin)
export const getStudentGraduation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { batchId } = req.query;

  const result = await graduationService.getStudentGraduation(
    req.params.studentId,
    batchId as string | undefined
  );

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Get all graduations
// @route   GET /api/v1/admin/graduations
// @access  Private (Admin)
export const getAllGraduations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { batchId, year } = req.query;

  const filters: any = {};
  if (batchId) filters.batchId = batchId as string;
  if (year) filters.year = parseInt(year as string);

  const result = await graduationService.getAllGraduations(filters);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Update graduation
// @route   PUT /api/v1/admin/graduations/:id
// @access  Private (Admin)
export const updateGraduation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = updateGraduationSchema.parse(req.body);

  const result = await graduationService.updateGraduation(req.params.id, validatedData);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Attach certificate to graduation
// @route   POST /api/v1/admin/graduations/:id/certificate
// @access  Private (Admin)
export const attachCertificate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { certificateUrl } = req.body;

  if (!certificateUrl) {
    res.status(400).json({
      success: false,
      message: 'Certificate URL is required',
    });
    return;
  }

  const result = await graduationService.attachCertificate(req.params.id, certificateUrl);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Revoke graduation
// @route   DELETE /api/v1/admin/graduations/:id
// @access  Private (Admin)
export const revokeGraduation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await graduationService.revokeGraduation(req.params.id);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Get graduation statistics
// @route   GET /api/v1/admin/graduations/statistics
// @access  Private (Admin)
export const getGraduationStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { batchId } = req.query;

  const result = await graduationService.getGraduationStatistics(
    batchId as string | undefined
  );

  res.status(result.success ? 200 : 400).json(result);
});
