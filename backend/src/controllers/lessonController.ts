import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { lessonService } from '../services/lesson.service';

// @desc    Create a new lesson
// @route   POST /api/lessons
// @access  Teacher/Admin
export const createLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await lessonService.createLesson(req.body, req.user!.id);

  res.status(201).json(result);
});

// @desc    Get lesson by ID
// @route   GET /api/lessons/:id
// @access  Authenticated
export const getLessonById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await lessonService.getLessonById(req.params.id, req.user!.id);

  if (!result.data) {
    res.status(404).json({
      success: false,
      message: 'Lesson not found',
    });
    return;
  }

  res.status(200).json(result);
});

// @desc    Get lessons by topic ID
// @route   GET /api/topics/:topicId/lessons
// @access  Authenticated
export const getLessonsByTopic = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { includeUnpublished } = req.query;
  const isTeacher = req.user?.role === 'TEACHER' || req.user?.role === 'ADMIN';

  const result = await lessonService.getLessonsByTopic(
    req.params.topicId,
    includeUnpublished === 'true' && isTeacher
  );

  res.status(200).json(result);
});

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Teacher/Admin
export const updateLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await lessonService.updateLesson(
    req.params.id,
    req.body,
    req.user!.id
  );

  res.status(200).json(result);
});

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Teacher/Admin
export const deleteLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await lessonService.deleteLesson(req.params.id, req.user!.id);

  res.status(200).json(result);
});

// @desc    Add attachment to lesson
// @route   POST /api/lessons/:id/attachments
// @access  Teacher/Admin
export const addAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await lessonService.addAttachment({
    lessonId: req.params.id,
    ...req.body,
  }, req.user!.id);

  res.status(201).json(result);
});

// @desc    Delete attachment
// @route   DELETE /api/lessons/:lessonId/attachments/:attachmentId
// @access  Teacher/Admin
export const deleteAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await lessonService.deleteAttachment(
    req.params.attachmentId,
    req.user!.id
  );

  res.status(200).json(result);
});

// @desc    Track attachment download
// @route   POST /api/lessons/:lessonId/attachments/:attachmentId/download
// @access  Authenticated
export const trackDownload = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await lessonService.trackDownload(req.params.attachmentId);

  res.status(200).json(result);
});

// @desc    Increment lesson view count
// @route   POST /api/lessons/:id/view
// @access  Authenticated
export const incrementViewCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await lessonService.incrementViewCount(req.params.id, req.user!.id);

  res.status(200).json(result);
});

// @desc    Get lessons by type
// @route   GET /api/modules/:moduleId/lessons/type/:type
// @access  Authenticated
export const getLessonsByType = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await lessonService.getLessonsByType(
    req.params.moduleId,
    req.params.type as any
  );

  res.status(200).json(result);
});

// @desc    Search lessons
// @route   GET /api/modules/:moduleId/lessons/search
// @access  Authenticated
export const searchLessons = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query, type } = req.query;

  if (!query) {
    res.status(400).json({
      success: false,
      message: 'Search query is required',
    });
    return;
  }

  const result = await lessonService.searchLessons(query as string, {
    moduleId: req.params.moduleId,
    type: type as any,
  });

  res.status(200).json(result);
});

// @desc    Duplicate lesson
// @route   POST /api/lessons/:id/duplicate
// @access  Teacher/Admin
export const duplicateLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { newTopicId } = req.body;

  const result = await lessonService.duplicateLesson(
    req.params.id,
    req.user!.id,
    newTopicId
  );

  res.status(201).json(result);
});
