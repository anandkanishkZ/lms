import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { batchService } from '../services/batch.service';
import { z } from 'zod';

// Validation schemas
const createBatchSchema = z.object({
  name: z.string().min(3, 'Batch name must be at least 3 characters'),
  description: z.string().optional(),
  startYear: z.number().int().min(2000).max(2100),
  endYear: z.number().int().min(2000).max(2100),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  maxStudents: z.number().int().positive().optional(),
});

const updateBatchSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  startYear: z.number().int().min(2000).max(2100).optional(),
  endYear: z.number().int().min(2000).max(2100).optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  maxStudents: z.number().int().positive().optional(),
});

const attachClassSchema = z.object({
  classId: z.string().min(1),
  sequence: z.number().int().positive(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});

// @desc    Create new batch
// @route   POST /api/v1/admin/batches
// @access  Private (Admin)
export const createBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = createBatchSchema.parse(req.body);

  const result = await batchService.createBatch({
    ...validatedData,
    createdBy: req.user!.id,
  });

  res.status(result.success ? 201 : 400).json(result);
});

// @desc    Get all batches
// @route   GET /api/v1/admin/batches
// @access  Private (Admin)
export const getAllBatches = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, startYear, endYear, search, page, limit } = req.query;

  const filters: any = {};
  if (status) filters.status = status;
  if (startYear) filters.startYear = parseInt(startYear as string);
  if (endYear) filters.endYear = parseInt(endYear as string);
  if (search) filters.search = search as string;

  const options: any = {};
  if (page) options.page = parseInt(page as string);
  if (limit) options.limit = parseInt(limit as string);

  const result = await batchService.getAllBatches(filters, options);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Get batch by ID
// @route   GET /api/v1/admin/batches/:id
// @access  Private (Admin)
export const getBatchById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await batchService.getBatchById(req.params.id);

  res.status(result.success ? 200 : 404).json(result);
});

// @desc    Update batch
// @route   PUT /api/v1/admin/batches/:id
// @access  Private (Admin)
export const updateBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = updateBatchSchema.parse(req.body);

  const result = await batchService.updateBatch(req.params.id, validatedData);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Delete batch
// @route   DELETE /api/v1/admin/batches/:id
// @access  Private (Admin)
export const deleteBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await batchService.deleteBatch(req.params.id);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Attach class to batch
// @route   POST /api/v1/admin/batches/:batchId/classes
// @access  Private (Admin)
export const attachClassToBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = attachClassSchema.parse(req.body);

  const result = await batchService.attachClassToBatch({
    batchId: req.params.batchId,
    ...validatedData,
  });

  res.status(result.success ? 201 : 400).json(result);
});

// @desc    Detach class from batch
// @route   DELETE /api/v1/admin/batches/:batchId/classes/:classId
// @access  Private (Admin)
export const detachClassFromBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await batchService.detachClassFromBatch(
    req.params.batchId,
    req.params.classId
  );

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Get batch classes
// @route   GET /api/v1/admin/batches/:batchId/classes
// @access  Private (Admin)
export const getBatchClasses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await batchService.getBatchClasses(req.params.batchId);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Update batch status
// @route   PATCH /api/v1/admin/batches/:batchId/status
// @access  Private (Admin)
export const updateBatchStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  if (!status) {
    res.status(400).json({
      success: false,
      message: 'Status is required',
    });
    return;
  }

  const result = await batchService.updateBatchStatus(
    req.params.batchId,
    status,
    req.user!.id
  );

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Get batch statistics
// @route   GET /api/v1/admin/batches/:batchId/statistics
// @access  Private (Admin)
export const getBatchStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await batchService.getBatchStatistics(req.params.batchId);

  res.status(result.success ? 200 : 400).json(result);
});

// @desc    Get batch students
// @route   GET /api/v1/admin/batches/:batchId/students
// @access  Private (Admin)
export const getBatchStudents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;

  const options: any = {};
  if (page) options.page = parseInt(page as string);
  if (limit) options.limit = parseInt(limit as string);

  const result = await batchService.getBatchStudents(req.params.batchId, options);

  res.status(result.success ? 200 : 400).json(result);
});
