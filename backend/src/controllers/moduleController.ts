import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { moduleService } from '../services/module.service';

// @desc    Create a new module
// @route   POST /api/modules
// @access  Teacher/Admin
export const createModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await moduleService.createModule({
    ...req.body,
    createdBy: req.user!.id,
  });

  res.status(201).json(result);
});

// @desc    Get all modules
// @route   GET /api/modules
// @access  Public/Authenticated
export const getModules = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page,
    limit,
    subjectId,
    classId,
    teacherId,
    status,
    level,
    search,
  } = req.query;

  const result = await moduleService.getModules({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    subjectId: subjectId as string,
    classId: classId as string,
    teacherId: teacherId as string,
    status: status as any,
    level: level as any,
    search: search as string,
  });

  res.status(200).json(result);
});

// @desc    Get module by ID
// @route   GET /api/modules/:id
// @access  Public/Authenticated
export const getModuleById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await moduleService.getModuleById(req.params.id);

  if (!result.data) {
    res.status(404).json({
      success: false,
      message: 'Module not found',
    });
    return;
  }

  res.status(200).json(result);
});

// @desc    Get module by slug
// @route   GET /api/modules/slug/:slug
// @access  Public/Authenticated
export const getModuleBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await moduleService.getModuleBySlug(req.params.slug);

  if (!result.data) {
    res.status(404).json({
      success: false,
      message: 'Module not found',
    });
    return;
  }

  res.status(200).json(result);
});

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Teacher/Admin
export const updateModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await moduleService.updateModule(
    req.params.id,
    req.body,
    req.user!.id
  );

  res.status(200).json(result);
});

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Teacher/Admin
export const deleteModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await moduleService.deleteModule(req.params.id, req.user!.id);

  res.status(200).json(result);
});

// @desc    Submit module for approval
// @route   POST /api/modules/:id/submit
// @access  Teacher
export const submitForApproval = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await moduleService.submitForApproval(req.params.id, req.user!.id);

  res.status(200).json(result);
});

// @desc    Approve module
// @route   POST /api/modules/:id/approve
// @access  Admin
export const approveModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await moduleService.approveModule(req.params.id, req.user!.id);

  res.status(200).json(result);
});

// @desc    Publish module
// @route   POST /api/modules/:id/publish
// @access  Admin
export const publishModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await moduleService.publishModule(req.params.id, req.user!.id);

  res.status(200).json(result);
});

// @desc    Reject module
// @route   POST /api/modules/:id/reject
// @access  Admin
export const rejectModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;

  if (!reason) {
    res.status(400).json({
      success: false,
      message: 'Rejection reason is required',
    });
    return;
  }

  const result = await moduleService.rejectModule(req.params.id, req.user!.id, reason);

  res.status(200).json(result);
});

// @desc    Get featured modules
// @route   GET /api/modules/featured
// @access  Public
export const getFeaturedModules = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit } = req.query;

  const result = await moduleService.getFeaturedModules(
    limit ? parseInt(limit as string) : undefined
  );

  res.status(200).json(result);
});

// @desc    Increment module view count
// @route   POST /api/modules/:id/view
// @access  Authenticated
export const incrementViewCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await moduleService.incrementViewCount(req.params.id);

  res.status(200).json(result);
});
