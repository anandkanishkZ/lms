import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import fs from 'fs';

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/webm'
];

// File magic numbers (signatures) for validation
const FILE_SIGNATURES: { [key: string]: string[] } = {
  'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
  'image/png': ['89504e47'],
  'image/gif': ['47494638'],
  'application/pdf': ['25504446'],
  'application/zip': ['504b0304'],
};

// File filter with security checks
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  try {
    // Check file type
    const allowedTypes = [
      ...ALLOWED_IMAGE_TYPES,
      ...ALLOWED_DOCUMENT_TYPES,
      ...ALLOWED_VIDEO_TYPES
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type: ${file.mimetype}. Only images, documents, and videos are allowed.`));
    }
    
    // Check file extension matches MIME type
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt',
      '.mp4', '.mpeg', '.webm'
    ];
    
    if (!validExtensions.includes(ext)) {
      return cb(new Error(`Invalid file extension: ${ext}`));
    }
    
    // Validate filename doesn't contain path traversal
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return cb(new Error('Invalid filename - path traversal detected'));
    }
    
    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

// Secure storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on file type
    let uploadDir = 'uploads';
    
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      if (req.path.includes('avatar')) {
        uploadDir = 'uploads/avatars';
      } else {
        uploadDir = 'uploads/images';
      }
    } else if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      uploadDir = 'uploads/documents';
    } else if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      uploadDir = 'uploads/videos';
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate cryptographically secure filename
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const filename = `${timestamp}-${randomName}${ext}`;
    cb(null, filename);
  }
});

// File validation after upload
export const validateUploadedFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  try {
    // Check if file exists
    if (!fs.existsSync(file.path)) {
      return { valid: false, error: 'File not found after upload' };
    }
    
    // Read first 4 bytes for magic number validation
    const fileBuffer = fs.readFileSync(file.path, { encoding: null });
    const fileSignature = fileBuffer.toString('hex', 0, 4);
    
    // Check magic numbers for supported file types
    const expectedSignatures = FILE_SIGNATURES[file.mimetype];
    
    if (expectedSignatures) {
      const signatureMatch = expectedSignatures.some(sig => 
        fileSignature.startsWith(sig)
      );
      
      if (!signatureMatch) {
        // File signature doesn't match MIME type - potential security threat
        fs.unlinkSync(file.path); // Delete the file
        return { 
          valid: false, 
          error: 'File signature does not match declared type. File may be disguised.' 
        };
      }
    }
    
    // Check file size (enforced by multer, but double-check)
    const stats = fs.statSync(file.path);
    if (stats.size > 10 * 1024 * 1024) { // 10MB
      fs.unlinkSync(file.path);
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }
    
    return { valid: true };
  } catch (error) {
    // Clean up file on error
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return { 
      valid: false, 
      error: `File validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

// Configure multer with security settings
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1, // Only 1 file per request
    fields: 10, // Limit form fields
    parts: 20 // Limit total parts
  }
});

// Specific upload configurations
export const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed for avatars'));
    }
    fileFilter(req, file, cb);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for avatars
    files: 1
  }
});

export const uploadDocument = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only document files are allowed'));
    }
    fileFilter(req, file, cb);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
    files: 1
  }
});

export const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed'));
    }
    fileFilter(req, file, cb);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
    files: 1
  }
});
