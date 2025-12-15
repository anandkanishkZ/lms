import { Router } from 'express';
import { uploadSingle, handleUploadError } from '../middlewares/upload';
import { authenticateToken } from '../middlewares/auth';
import path from 'path';

const router = Router();

/**
 * @route   POST /api/v1/upload/editor-image
 * @desc    Upload image for rich text editor
 * @access  Private (Teacher/Admin)
 */
router.post(
  '/editor-image',
  authenticateToken,
  (req, res, next) => {
    // Create a custom multer instance for editor images
    const multer = require('multer');
    const fs = require('fs');
    const { v4: uuidv4 } = require('uuid');

    const uploadDir = path.join(__dirname, '../../uploads/editor-images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (req: any, file: any, cb: any) => {
        cb(null, uploadDir);
      },
      filename: (req: any, file: any, cb: any) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });

    const fileFilter = (req: any, file: any, cb: any) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'));
      }
    };

    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for images
      },
      fileFilter: fileFilter,
    }).single('image');

    upload(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              success: false,
              message: 'Image too large. Maximum size is 5MB.',
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading image',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      // Return the secure API URL instead of direct file path
      const imageUrl = `/api/v1/upload/files/${req.file.filename}`;
      
      return res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    });
  }
);

/**
 * @route   POST /api/v1/upload/editor-file
 * @desc    Upload any file for rich text editor (PDF, DOCX, XLSX, images, etc.)
 * @access  Private (Teacher/Admin)
 */
router.post(
  '/editor-file',
  authenticateToken,
  (req, res, next) => {
    const multer = require('multer');
    const fs = require('fs');
    const { v4: uuidv4 } = require('uuid');

    const uploadDir = path.join(__dirname, '../../uploads/editor-files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (req: any, file: any, cb: any) => {
        cb(null, uploadDir);
      },
      filename: (req: any, file: any, cb: any) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });

    const fileFilter = (req: any, file: any, cb: any) => {
      // Allow most common file types
      const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|jpeg|jpg|png|gif|webp|svg|mp4|mp3|avi|mkv|mov|wav/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      
      // Also check mimetype for common types
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-rar-compressed',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/x-msvideo',
        'video/x-matroska',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
      ];
      
      const mimetypeValid = allowedMimeTypes.includes(file.mimetype);

      if (extname || mimetypeValid) {
        return cb(null, true);
      } else {
        cb(new Error('File type not supported. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR, images, videos, audio'));
      }
    };

    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for general files
      },
      fileFilter: fileFilter,
    }).single('file');

    upload(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              success: false,
              message: 'File too large. Maximum size is 50MB.',
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading file',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
        });
      }

      // Return the secure API URL instead of direct file path
      const fileUrl = `/api/v1/upload/files/${req.file.filename}`;
      
      return res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    });
  }
);

/**
 * @route   POST /api/v1/upload/exam-answer
 * @desc    Upload answer images/files for exam questions (up to 5 files)
 * @access  Private (Student)
 */
router.post(
  '/exam-answer',
  authenticateToken,
  (req, res, next) => {
    const multer = require('multer');
    const fs = require('fs');
    const { v4: uuidv4 } = require('uuid');

    const uploadDir = path.join(__dirname, '../../uploads/exam-answers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (req: any, file: any, cb: any) => {
        cb(null, uploadDir);
      },
      filename: (req: any, file: any, cb: any) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });

    const fileFilter = (req: any, file: any, cb: any) => {
      // Allow images and PDF files for exam answers
      const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
      ];
      
      const mimetypeValid = allowedMimeTypes.includes(file.mimetype);

      if (extname && mimetypeValid) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) and PDF are allowed for exam answers'));
      }
    };

    // Support multiple files (up to 5)
    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 5, // Maximum 5 files
      },
      fileFilter: fileFilter,
    }).array('files', 5); // Accept up to 5 files with field name 'files'

    upload(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              success: false,
              message: 'File too large. Maximum size is 10MB per file.',
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files. Maximum 5 files allowed.',
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading files',
        });
      }

      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided',
        });
      }

      // Return array of uploaded file URLs
      const uploadedFiles = files.map(file => ({
        url: `/api/v1/upload/exam-files/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      }));

      return res.json({
        success: true,
        message: `${files.length} file(s) uploaded successfully`,
        data: uploadedFiles,
      });
    });
  }
);

/**
 * @route   GET /api/v1/upload/exam-files/:filename
 * @desc    Serve exam answer files publicly without authentication
 * @access  Public (No authentication required)
 */
router.get(
  '/exam-files/:filename',
  async (req, res): Promise<void> => {
    try {
      const { filename } = req.params;
      const fs = require('fs');

      // Prevent directory traversal attacks
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        res.status(400).json({
          success: false,
          message: 'Invalid filename',
        });
        return;
      }

      const filePath = path.join(__dirname, '../../uploads/exam-answers', filename);
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'File not found',
        });
        return;
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.setHeader('Content-Disposition', 'inline'); // Allow inline viewing
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error: any) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error reading file',
          });
        }
      });

      fileStream.pipe(res);

    } catch (error) {
      console.error('Error serving exam file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error serving file',
        });
      }
    }
  }
);

/**
 * @route   GET /api/v1/upload/files/:filename
 * @desc    Securely serve uploaded files with authentication
 * @access  Private (Authenticated users only)
 */
router.get(
  '/files/:filename',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const { filename } = req.params;
      const fs = require('fs');

      // Prevent directory traversal attacks
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        res.status(400).json({
          success: false,
          message: 'Invalid filename',
        });
        return;
      }

      // Check editor-files, editor-images, and exam-answers directories
      let filePath = path.join(__dirname, '../../uploads/editor-files', filename);
      let fileExists = fs.existsSync(filePath);

      if (!fileExists) {
        filePath = path.join(__dirname, '../../uploads/editor-images', filename);
        fileExists = fs.existsSync(filePath);
      }

      if (!fileExists) {
        filePath = path.join(__dirname, '../../uploads/exam-answers', filename);
        fileExists = fs.existsSync(filePath);
      }

      if (!fileExists) {
        res.status(404).json({
          success: false,
          message: 'File not found',
        });
        return;
      }

      // Get file stats for content-length header
      const stats = fs.statSync(filePath);
      
      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
      
      // For PDFs and images, allow inline viewing; for others, force download
      if (['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
        res.setHeader('Content-Disposition', 'inline');
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filename)}"`);
      }

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error: any) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error reading file',
          });
        }
      });

      // Pipe the file to response
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error serving file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error serving file',
        });
      }
    }
  }
);

export default router;
