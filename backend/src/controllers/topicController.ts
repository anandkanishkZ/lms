import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { topicService } from '../services/topic.service';

// @desc    Create a new topic
// @route   POST /api/topics
// @access  Teacher/Admin
export const createTopic = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await topicService.createTopic(req.body, req.user!.id);

  res.status(201).json(result);
});

// @desc    Get topic by ID
// @route   GET /api/topics/:id
// @access  Authenticated
export const getTopicById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { includeLessons } = req.query;

  const result = await topicService.getTopicById(
    req.params.id,
    includeLessons === 'true'
  );

  if (!result.data) {
    res.status(404).json({
      success: false,
      message: 'Topic not found',
    });
    return;
  }

  res.status(200).json(result);
});

// @desc    Get topics by module ID
// @route   GET /api/modules/:moduleId/topics
// @access  Authenticated
export const getTopicsByModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { includeLessons } = req.query;

  const result = await topicService.getTopicsByModule(
    req.params.moduleId,
    includeLessons === 'true'
  );

  res.status(200).json(result);
});

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Teacher/Admin
export const updateTopic = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await topicService.updateTopic(
    req.params.id,
    req.body,
    req.user!.id
  );

  res.status(200).json(result);
});

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Teacher/Admin
export const deleteTopic = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await topicService.deleteTopic(req.params.id, req.user!.id);

  res.status(200).json(result);
});

// @desc    Duplicate topic
// @route   POST /api/topics/:id/duplicate
// @access  Teacher/Admin
export const duplicateTopic = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await topicService.duplicateTopic(req.params.id, req.user!.id);

  res.status(201).json(result);
});

// @desc    Reorder topics in a module
// @route   PATCH /api/modules/:moduleId/topics/reorder
// @access  Teacher/Admin
export const reorderTopics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { moduleId } = req.params;
  const { topics } = req.body; // Array of { id, orderIndex }

  if (!Array.isArray(topics) || topics.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Topics array is required and must not be empty',
    });
    return;
  }

  const result = await topicService.reorderTopics(moduleId, topics, req.user!.id);

  res.status(200).json(result);
});
