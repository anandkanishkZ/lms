import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'general';
    
    // Organize files by type
    if (file.fieldname === 'avatar' || file.fieldname === 'profileImage') {
      subDir = 'avatars';
    } else if (file.fieldname === 'material') {
      subDir = 'materials';
    } else if (file.fieldname === 'notice') {
      subDir = 'notices';
    } else if (file.fieldname === 'certificate') {
      subDir = 'certificates';
    }

    const fullPath = path.join(uploadDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types
  const allowedTypes: { [key: string]: RegExp } = {
    avatar: /jpeg|jpg|png|gif|webp/,
    profileImage: /jpeg|jpg|png|gif|webp/,
    material: /pdf|doc|docx|ppt|pptx|txt|mp4|avi|mkv/,
    notice: /pdf|doc|docx|jpg|jpeg|png/,
    certificate: /pdf/,
  };

  const fieldType = file.fieldname || 'general';
  const allowedExtensions = allowedTypes[fieldType] || /jpeg|jpg|png|pdf|doc|docx/;
  
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${fieldType}. Allowed types: ${allowedExtensions.source}`));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Max 5 files
  },
  fileFilter: fileFilter,
});

// Middleware functions
export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => upload.array(fieldName, maxCount);
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

// Error handling middleware for multer
export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files.',
      });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
      return;
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  next(err);
};

export { upload };