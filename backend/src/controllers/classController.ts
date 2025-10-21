import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as classService from '../services/class.service';

// Validation schemas
const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100),
  section: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional().default(true),
});

const updateClassSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  section: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

const assignTeacherSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
});

/**
 * POST /api/v1/admin/classes
 * Create a new class
 */
export const createClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createClassSchema.parse(req.body);
    const result = await classService.createClass(validatedData);
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
      return;
    }
    next(error);
  }
};

/**
 * GET /api/v1/admin/classes
 * Get all classes with pagination and filters
 */
export const getAllClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      isActive,
      grade,
      section,
      academicYear,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const filters = {
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      grade: grade ? parseInt(grade as string) : undefined,
      section: section as string,
      academicYear: academicYear as string,
    };

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      sortBy: (sortBy as string) || 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await classService.getAllClasses(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/classes/:id
 * Get class by ID with full details
 */
export const getClassById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await classService.getClassById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/classes/:id
 * Update class
 */
export const updateClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateClassSchema.parse(req.body);
    const result = await classService.updateClass(id, validatedData);
    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
      return;
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/classes/:id
 * Delete class (soft delete by default)
 */
export const deleteClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;
    
    const result = await classService.deleteClass(
      id,
      hardDelete === 'true'
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/classes/:id/teachers
 * Assign teacher to class with subject
 */
export const assignTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: classId } = req.params;
    const validatedData = assignTeacherSchema.parse(req.body);
    
    const result = await classService.assignTeacherToClass(
      classId,
      validatedData.teacherId,
      validatedData.subjectId
    );
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
      return;
    }
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/classes/:id/teachers/:teacherId/subjects/:subjectId
 * Remove teacher from class
 */
export const removeTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: classId, teacherId, subjectId } = req.params;
    
    const result = await classService.removeTeacherFromClass(
      classId,
      teacherId,
      subjectId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/classes/:id/statistics
 * Get class statistics
 */
export const getClassStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await classService.getClassStatistics(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  assignTeacher,
  removeTeacher,
  getClassStatistics,
};
