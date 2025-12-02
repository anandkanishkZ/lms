import { body, param, query, validationResult } from 'express-validator';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

// Middleware to handle validation errors
export const handleValidationErrors = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : undefined,
        message: err.msg,
      })),
    });
  }
  next();
};

// Notice creation validation
export const validateCreateNotice = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),

  body('category')
    .optional()
    .isIn(['EXAM', 'EVENT', 'HOLIDAY', 'GENERAL'])
    .withMessage('Invalid category'),

  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),

  body('attachmentUrl')
    .optional()
    .isURL()
    .withMessage('Attachment URL must be a valid URL'),

  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),

  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('expiresAt must be a valid ISO date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('expiresAt must be in the future');
      }
      return true;
    }),

  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('scheduledFor must be a valid ISO date'),

  body('actionUrl')
    .optional()
    .isURL()
    .withMessage('actionUrl must be a valid URL'),

  body('classId')
    .optional()
    .isString()
    .withMessage('classId must be a string'),

  body('batchId')
    .optional()
    .isString()
    .withMessage('batchId must be a string'),

  body('moduleId')
    .optional()
    .isString()
    .withMessage('moduleId must be a string'),

  body('targetRole')
    .optional()
    .isIn(['ADMIN', 'TEACHER', 'STUDENT'])
    .withMessage('Invalid target role'),

  handleValidationErrors,
];

// Notice update validation (same as create but all optional)
export const validateUpdateNotice = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Notice ID is required'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),

  body('category')
    .optional()
    .isIn(['EXAM', 'EVENT', 'HOLIDAY', 'GENERAL'])
    .withMessage('Invalid category'),

  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),

  body('attachmentUrl')
    .optional()
    .isURL()
    .withMessage('Attachment URL must be a valid URL'),

  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),

  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),

  body('expiresAt')
    .optional()
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('expiresAt must be in the future');
      }
      return true;
    }),

  handleValidationErrors,
];

// Notice ID validation
export const validateNoticeId = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Notice ID is required'),

  handleValidationErrors,
];

// Get notices query validation
export const validateGetNotices = [
  query('category')
    .optional()
    .isIn(['EXAM', 'EVENT', 'HOLIDAY', 'GENERAL'])
    .withMessage('Invalid category'),

  query('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority'),

  query('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),

  query('includeExpired')
    .optional()
    .isBoolean()
    .withMessage('includeExpired must be a boolean'),

  query('unreadOnly')
    .optional()
    .isBoolean()
    .withMessage('unreadOnly must be a boolean'),

  query('classId')
    .optional()
    .isString()
    .withMessage('classId must be a string'),

  query('batchId')
    .optional()
    .isString()
    .withMessage('batchId must be a string'),

  query('moduleId')
    .optional()
    .isString()
    .withMessage('moduleId must be a string'),

  handleValidationErrors,
];

// Notification preferences validation
export const validateNotificationPreferences = [
  body('emailEnabled')
    .optional()
    .isBoolean()
    .withMessage('emailEnabled must be a boolean'),

  body('inAppEnabled')
    .optional()
    .isBoolean()
    .withMessage('inAppEnabled must be a boolean'),

  body('pushEnabled')
    .optional()
    .isBoolean()
    .withMessage('pushEnabled must be a boolean'),

  body('examNotifications')
    .optional()
    .isBoolean()
    .withMessage('examNotifications must be a boolean'),

  body('eventNotifications')
    .optional()
    .isBoolean()
    .withMessage('eventNotifications must be a boolean'),

  body('generalNotifications')
    .optional()
    .isBoolean()
    .withMessage('generalNotifications must be a boolean'),

  body('urgentOnly')
    .optional()
    .isBoolean()
    .withMessage('urgentOnly must be a boolean'),

  body('quietHoursEnabled')
    .optional()
    .isBoolean()
    .withMessage('quietHoursEnabled must be a boolean'),

  body('quietHoursStart')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('quietHoursStart must be in HH:mm format'),

  body('quietHoursEnd')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('quietHoursEnd must be in HH:mm format'),

  handleValidationErrors,
];
