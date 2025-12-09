import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { youtubeLiveService } from '../services/youtubeLive.service';

// @desc    Create/Schedule a YouTube Live session
// @route   POST /api/youtube-live
// @access  Teacher/Admin
export const createLiveSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await youtubeLiveService.createLiveSession({
    ...req.body,
    createdBy: req.user!.id,
  });

  res.status(201).json(result);
});

// @desc    Update live session
// @route   PUT /api/youtube-live/:sessionId
// @access  Teacher/Admin
export const updateLiveSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await youtubeLiveService.updateLiveSession({
    sessionId: req.params.sessionId,
    ...req.body,
    updatedBy: req.user!.id,
  });

  res.status(200).json(result);
});

// @desc    Start live session
// @route   POST /api/youtube-live/:sessionId/start
// @access  Teacher/Admin
export const startLiveSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await youtubeLiveService.startLiveSession({
    sessionId: req.params.sessionId,
    startedBy: req.user!.id,
  });

  res.status(200).json(result);
});

// @desc    End live session
// @route   POST /api/youtube-live/:sessionId/end
// @access  Teacher/Admin
export const endLiveSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { recordingUrl } = req.body;

  const result = await youtubeLiveService.endLiveSession({
    sessionId: req.params.sessionId,
    recordingUrl,
    endedBy: req.user!.id,
  });

  res.status(200).json(result);
});

// @desc    Update viewer count
// @route   POST /api/youtube-live/:sessionId/viewers
// @access  Teacher/Admin
export const updateViewerCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentViewers } = req.body;

  if (currentViewers === undefined) {
    res.status(400).json({
      success: false,
      message: 'currentViewers is required',
    });
    return;
  }

  const result = await youtubeLiveService.updateViewerCount({
    sessionId: req.params.sessionId,
    currentViewers,
  });

  res.status(200).json(result);
});

// @desc    Get live session by ID
// @route   GET /api/youtube-live/:sessionId
// @access  Authenticated
export const getLiveSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await youtubeLiveService.getLiveSession(req.params.sessionId);

  res.status(200).json(result);
});

// @desc    Get live session by lesson ID
// @route   GET /api/youtube-live/lessons/:lessonId
// @access  Authenticated
export const getLiveSessionByLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await youtubeLiveService.getLiveSessionByLesson(req.params.lessonId);

  res.status(200).json(result);
});

// @desc    Get upcoming live sessions
// @route   GET /api/youtube-live/upcoming
// @access  Authenticated
export const getUpcomingLiveSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { moduleId, limit } = req.query;

  const result = await youtubeLiveService.getUpcomingLiveSessions({
    moduleId: moduleId as string,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Get currently live sessions
// @route   GET /api/youtube-live/current
// @access  Authenticated
export const getCurrentlyLiveSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { moduleId } = req.query;

  const result = await youtubeLiveService.getCurrentlyLiveSessions({
    moduleId: moduleId as string,
  });

  res.status(200).json(result);
});

// @desc    Get past live sessions
// @route   GET /api/youtube-live/past
// @access  Authenticated
export const getPastLiveSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { moduleId, page, limit } = req.query;

  const result = await youtubeLiveService.getPastLiveSessions({
    moduleId: moduleId as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Delete live session
// @route   DELETE /api/youtube-live/:sessionId
// @access  Teacher/Admin
export const deleteLiveSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await youtubeLiveService.deleteLiveSession({
    sessionId: req.params.sessionId,
    deletedBy: req.user!.id,
  });

  res.status(200).json(result);
});

// @desc    Get live session statistics
// @route   GET /api/youtube-live/stats
// @access  Admin/Teacher
export const getLiveSessionStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { moduleId } = req.query;

  const result = await youtubeLiveService.getLiveSessionStats(
    moduleId as string | undefined
  );

  res.status(200).json(result);
});

// @desc    Get live sessions by module
// @route   GET /api/youtube-live/module/:moduleId
// @access  Authenticated
export const getLiveSessionsByModule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await youtubeLiveService.getLiveSessionsByModule(req.params.moduleId);

  res.status(200).json(result);
});
