import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { activityService } from '../services/activity.service';
import { ActivityType } from '@prisma/client';

// @desc    Get user activities
// @route   GET /api/activities/users/:userId
// @access  Student (own) / Admin/Teacher
export const getUserActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId;

  // Check authorization
  if (userId !== req.user!.id && req.user!.role !== 'ADMIN' && req.user!.role !== 'TEACHER') {
    res.status(403).json({
      success: false,
      message: 'You are not authorized to view these activities',
    });
    return;
  }

  const {
    page,
    limit,
    activityType,
    moduleId,
    startDate,
    endDate,
    searchTitle,
  } = req.query;

  const result = await activityService.getUserActivities({
    userId,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    activityType: activityType as ActivityType,
    moduleId: moduleId as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    searchTitle: searchTitle as string,
  });

  res.status(200).json(result);
});

// @desc    Get module activities
// @route   GET /api/activities/modules/:moduleId
// @access  Admin/Teacher
export const getModuleActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page,
    limit,
    activityType,
    studentId,
    startDate,
    endDate,
  } = req.query;

  const result = await activityService.getModuleActivities({
    moduleId: req.params.moduleId,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    activityType: activityType as ActivityType,
    studentId: studentId as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Get recent activities (admin view)
// @route   GET /api/activities/recent
// @access  Admin
export const getRecentActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page,
    limit,
    activityType,
    role,
    startDate,
    endDate,
  } = req.query;

  const result = await activityService.getRecentActivities({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    activityType: activityType as ActivityType,
    role: role as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Get activity timeline
// @route   GET /api/activities/timeline/:userId
// @access  Student (own) / Admin/Teacher
export const getActivityTimeline = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId;

  // Check authorization
  if (userId !== req.user!.id && req.user!.role !== 'ADMIN' && req.user!.role !== 'TEACHER') {
    res.status(403).json({
      success: false,
      message: 'You are not authorized to view this timeline',
    });
    return;
  }

  const { moduleId, startDate, endDate, limit } = req.query;

  const result = await activityService.getActivityTimeline({
    userId,
    moduleId: moduleId as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Get user activity statistics
// @route   GET /api/activities/stats/users/:userId
// @access  Student (own) / Admin/Teacher
export const getUserActivityStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId;

  // Check authorization
  if (userId !== req.user!.id && req.user!.role !== 'ADMIN' && req.user!.role !== 'TEACHER') {
    res.status(403).json({
      success: false,
      message: 'You are not authorized to view these statistics',
    });
    return;
  }

  const { startDate, endDate } = req.query;

  const result = await activityService.getUserActivityStats({
    userId,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Get module activity statistics
// @route   GET /api/activities/stats/modules/:moduleId
// @access  Admin/Teacher
export const getModuleActivityStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query;

  const result = await activityService.getModuleActivityStats({
    moduleId: req.params.moduleId,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Export activities
// @route   GET /api/activities/export
// @access  Admin/Teacher
export const exportActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    userId,
    moduleId,
    activityType,
    startDate,
    endDate,
  } = req.query;

  const result = await activityService.exportActivities({
    userId: userId as string,
    moduleId: moduleId as string,
    activityType: activityType as ActivityType,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Search activities
// @route   GET /api/activities/search
// @access  Authenticated
export const searchActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query, userId, moduleId, page, limit } = req.query;

  if (!query) {
    res.status(400).json({
      success: false,
      message: 'Search query is required',
    });
    return;
  }

  // If searching for another user, check authorization
  if (userId && userId !== req.user!.id) {
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'TEACHER') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to search these activities',
      });
      return;
    }
  }

  const result = await activityService.searchActivities({
    query: query as string,
    userId: userId as string,
    moduleId: moduleId as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.status(200).json(result);
});

// @desc    Delete old activities
// @route   DELETE /api/activities/cleanup
// @access  Admin
export const deleteOldActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { beforeDate } = req.body;

  if (!beforeDate) {
    res.status(400).json({
      success: false,
      message: 'beforeDate is required',
    });
    return;
  }

  const result = await activityService.deleteOldActivities({
    beforeDate: new Date(beforeDate),
    adminId: req.user!.id,
  });

  res.status(200).json(result);
});
