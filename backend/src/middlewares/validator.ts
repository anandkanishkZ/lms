import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Password validation class
export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Length check
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }
    if (password.length > this.MAX_LENGTH) {
      errors.push(`Password must not exceed ${this.MAX_LENGTH} characters`);
    }

    // Complexity checks
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Common password check
    const commonPasswords = [
      'password', '12345678', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890',
      'password1', 'iloveyou', 'princess', 'rockyou', '123456789'
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
    }

    // Sequential characters check
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password contains too many repeated characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Validation middleware error handler
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? (err as any).path : 'unknown',
        message: err.msg
      }))
    });
  }
  next();
};

// Login validation - supports both 'email' and 'identifier' fields
export const validateLogin = [
  // Use custom validation to handle both 'email' and 'identifier' fields
  body(['email', 'identifier', 'emailOrPhone'])
    .custom((value, { req }) => {
      // At least one identifier field must be present
      const identifier = req.body.email || req.body.identifier || req.body.emailOrPhone;
      if (!identifier) {
        throw new Error('Email, phone, or symbol number is required');
      }
      return true;
    })
    .optional({ checkFalsy: true })
    .trim(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 1 }).withMessage('Password is required'),
  
  handleValidationErrors
];

// Registration validation
export const validateRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces')
    .escape(),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .custom((value) => {
      const validation = PasswordValidator.validate(value);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('role')
    .optional()
    .isIn(['STUDENT', 'TEACHER', 'ADMIN']).withMessage('Invalid role'),
  
  handleValidationErrors
];

// Password reset request validation
export const validatePasswordResetRequest = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  handleValidationErrors
];

// Password reset validation
export const validatePasswordReset = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required')
    .isLength({ min: 64, max: 64 }).withMessage('Invalid reset token format'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .custom((value) => {
      const validation = PasswordValidator.validate(value);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Notice validation
export const validateNotice = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters')
    .escape(),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10, max: 50000 }).withMessage('Content must be 10-50000 characters'),
  
  body('priority')
    .optional()
    .isIn(['HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid priority. Must be HIGH, MEDIUM, or LOW'),
  
  body('targetAudience')
    .optional()
    .isIn(['ALL', 'STUDENTS', 'TEACHERS', 'PARENTS']).withMessage('Invalid target audience'),
  
  handleValidationErrors
];

// File upload validation
export const validateFileUpload = [
  body('filename')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Filename too long')
    .matches(/^[a-zA-Z0-9-_. ]+$/).withMessage('Filename contains invalid characters'),
  
  handleValidationErrors
];

// User update validation
export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces')
    .escape(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  
  body('symbolNo')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Symbol number must be 1-50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters')
    .escape(),
  
  handleValidationErrors
];

// Module/Course validation
export const validateModule = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters')
    .escape(),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
  
  body('level')
    .optional()
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).withMessage('Invalid level'),
  
  handleValidationErrors
];

// Exam validation
export const validateExam = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters')
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 1, max: 600 }).withMessage('Duration must be 1-600 minutes'),
  
  body('totalMarks')
    .notEmpty().withMessage('Total marks is required')
    .isInt({ min: 1 }).withMessage('Total marks must be positive'),
  
  handleValidationErrors
];

// Generic ID validation
export const validateId = [
  body('id')
    .trim()
    .notEmpty().withMessage('ID is required')
    .isLength({ min: 1 }).withMessage('Invalid ID format'),
  
  handleValidationErrors
];
