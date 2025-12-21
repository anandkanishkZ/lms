import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { resourceService } from '../services/resource.service';

// @desc    Create a new resource
// @route   POST /api/modules/:moduleId/resources
// @route   POST /api/topics/:topicId/resources
// @route   POST /api/lessons/:lessonId/resources
// @access  Teacher/Admin
export const createResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { moduleId, topicId, lessonId } = req.params;
  
  // Handle file upload
  let fileData = {};
  if (req.file) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    // Extract only the relative path after 'uploads'
    const filePath = req.file.path.replace(/\\/g, '/');
    const uploadsIndex = filePath.indexOf('uploads/');
    const relativePath = uploadsIndex !== -1 ? filePath.substring(uploadsIndex) : filePath;
    
    fileData = {
      fileUrl: `${baseUrl}/${relativePath}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };
  }

  const result = await resourceService.createResource({
    ...req.body,
    ...fileData,
    moduleId,
    topicId,
    lessonId,
    uploadedBy: req.user!.id,
  });

  res.status(201).json(result);
});

// @desc    Get resource by ID
// @route   GET /api/resources/:id
// @access  Authenticated
export const getResourceById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await resourceService.getResourceById(
    req.params.id,
    req.user!.id,
    req.user!.role
  );

  res.status(200).json(result);
});

// @desc    Get resources with filters
// @route   GET /api/modules/:moduleId/resources
// @route   GET /api/topics/:topicId/resources
// @route   GET /api/lessons/:lessonId/resources
// @access  Authenticated
export const getResources = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { moduleId, topicId, lessonId } = req.params;
  const {
    category,
    type,
    status,
    includeHidden,
    search,
    tags,
    isPinned,
    isMandatory,
    page,
    limit,
  } = req.query;

  const result = await resourceService.getResources({
    moduleId,
    topicId,
    lessonId,
    category: category as any,
    type: type as any,
    status: status as any,
    includeHidden: includeHidden === 'true',
    search: search as string,
    tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
    isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
    isMandatory: isMandatory === 'true' ? true : isMandatory === 'false' ? false : undefined,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    userId: req.user!.id,
    userRole: req.user!.role,
  });

  res.status(200).json(result);
});

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Teacher/Admin
export const updateResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await resourceService.updateResource(
    req.params.id,
    req.body,
    req.user!.id,
    req.user!.role
  );

  res.status(200).json(result);
});

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Teacher/Admin
export const deleteResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await resourceService.deleteResource(
    req.params.id,
    req.user!.id,
    req.user!.role
  );

  res.status(200).json(result);
});

// @desc    Toggle resource visibility (hide/unhide)
// @route   PATCH /api/resources/:id/visibility
// @access  Teacher/Admin
export const toggleVisibility = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isHidden, reason } = req.body;

  if (typeof isHidden !== 'boolean') {
    res.status(400).json({
      success: false,
      message: 'isHidden must be a boolean value',
    });
    return;
  }

  const result = await resourceService.toggleVisibility(
    req.params.id,
    isHidden,
    req.user!.id,
    req.user!.role,
    reason
  );

  res.status(200).json(result);
});

// @desc    Bulk operations on resources
// @route   POST /api/resources/bulk
// @access  Teacher/Admin
export const bulkOperation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { action, resourceIds, reason } = req.body;

  if (!action || !resourceIds || !Array.isArray(resourceIds)) {
    res.status(400).json({
      success: false,
      message: 'action and resourceIds array are required',
    });
    return;
  }

  const validActions = ['hide', 'unhide', 'publish', 'archive', 'delete'];
  if (!validActions.includes(action)) {
    res.status(400).json({
      success: false,
      message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
    });
    return;
  }

  const result = await resourceService.bulkOperation(
    action,
    resourceIds,
    req.user!.id,
    req.user!.role,
    reason
  );

  res.status(200).json(result);
});

// @desc    Track resource access (view or download)
// @route   POST /api/resources/:id/track
// @access  Authenticated
export const trackAccess = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { action } = req.body;

  if (!action || !['VIEW', 'DOWNLOAD'].includes(action)) {
    res.status(400).json({
      success: false,
      message: 'action must be VIEW or DOWNLOAD',
    });
    return;
  }

  const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const result = await resourceService.trackAccess(
    req.params.id,
    req.user!.id,
    action,
    ipAddress,
    userAgent
  );

  res.status(200).json(result);
});

// @desc    Reorder resources
// @route   PATCH /api/modules/:moduleId/resources/reorder
// @route   PATCH /api/topics/:topicId/resources/reorder
// @route   PATCH /api/lessons/:lessonId/resources/reorder
// @access  Teacher/Admin
export const reorderResources = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { resourceOrders } = req.body;

  if (!resourceOrders || !Array.isArray(resourceOrders)) {
    res.status(400).json({
      success: false,
      message: 'resourceOrders array is required',
    });
    return;
  }

  const result = await resourceService.reorderResources(
    resourceOrders,
    req.user!.id,
    req.user!.role
  );

  res.status(200).json(result);
});

// @desc    Get resource analytics
// @route   GET /api/resources/:id/analytics
// @access  Teacher/Admin
export const getResourceAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await resourceService.getResourceById(
    req.params.id,
    req.user!.id,
    req.user!.role
  );

  if (!result.data.accessStats) {
    res.status(403).json({
      success: false,
      message: 'You do not have permission to view analytics',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: result.data.accessStats,
  });
});
