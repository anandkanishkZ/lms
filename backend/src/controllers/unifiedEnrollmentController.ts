import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';
import { unifiedEnrollmentService } from '../services/unifiedEnrollment.service';
import { z } from 'zod';

// ============================================
// UNIFIED ENROLLMENT CONTROLLER (OPTION 2 - HYBRID)
// ============================================

// Validation schemas
const enrollStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  batchId: z.string().min(1, 'Batch ID is required'),
});

const bulkEnrollSchema = z.object({
  studentIds: z.array(z.string()).min(1, 'At least one student ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  batchId: z.string().min(1, 'Batch ID is required'),
});

const updateEnrollmentSchema = z.object({
  grade: z.enum(['A_PLUS', 'A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D', 'F']).optional(),
  finalMarks: z.number().min(0, 'Final marks must be positive').optional(),
  totalMarks: z.number().min(0, 'Total marks must be positive').optional(),
  attendance: z.number().min(0).max(100, 'Attendance must be between 0-100').optional(),
  isCompleted: z.boolean().optional(),
  isPassed: z.boolean().optional(),
  remarks: z.string().max(500, 'Remarks must be less than 500 characters').optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// CORE ENROLLMENT ENDPOINTS
// ============================================

/**
 * @desc    Enroll student in subject (Core enrollment following photo model)
 * @route   POST /api/v1/admin/enrollments/subject
 * @access  Private (Admin/Teacher)
 */
const enrollStudentInSubject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = enrollStudentSchema.parse(req.body);
  
  const result = await unifiedEnrollmentService.enrollStudentInSubject({
    ...validatedData,
    enrolledBy: req.user!.id,
  });
  
  res.status(result.success ? 201 : 400).json(result);
});

/**
 * @desc    Bulk enroll students in subject
 * @route   POST /api/v1/admin/enrollments/subject/bulk
 * @access  Private (Admin)
 */
const bulkEnrollStudentsInSubject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = bulkEnrollSchema.parse(req.body);
  
  const result = await unifiedEnrollmentService.bulkEnrollStudentsInSubject({
    ...validatedData,
    enrolledBy: req.user!.id,
  });
  
  res.status(result.success ? 201 : 400).json(result);
});

/**
 * @desc    Enroll entire batch in all subjects of a class
 * @route   POST /api/v1/admin/enrollments/batch/:batchId/class/:classId
 * @access  Private (Admin)
 */
const enrollBatchInClass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { batchId, classId } = req.params;
  
  if (!batchId || !classId) {
    res.status(400).json({
      success: false,
      message: 'Batch ID and Class ID are required',
      data: null,
    });
    return;
  }
  
  const result = await unifiedEnrollmentService.enrollBatchInClass(
    batchId,
    classId,
    req.user!.id
  );
  
  res.status(result.success ? 201 : 400).json(result);
});

// ============================================
// QUERY & RETRIEVAL ENDPOINTS
// ============================================

/**
 * @desc    Get student's enrollments
 * @route   GET /api/v1/admin/enrollments/student/:studentId
 * @access  Private (Admin/Teacher/Student)
 */
const getStudentEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId } = req.params;
  const { classId, batchId, subjectId, isActive, isCompleted } = req.query;
  
  // Authorization check
  if (req.user!.role === 'STUDENT' && req.user!.id !== studentId) {
    res.status(403).json({
      success: false,
      message: 'Students can only view their own enrollments',
      data: null,
    });
    return;
  }
  
  const filters: any = {};
  if (classId) filters.classId = classId as string;
  if (batchId) filters.batchId = batchId as string;
  if (subjectId) filters.subjectId = subjectId as string;
  if (isActive !== undefined) filters.isActive = isActive === 'true';
  if (isCompleted !== undefined) filters.isCompleted = isCompleted === 'true';
  
  const result = await unifiedEnrollmentService.getStudentEnrollments(studentId, filters);
  
  res.status(result.success ? 200 : 404).json(result);
});

/**
 * @desc    Get all enrollments with filters and pagination
 * @route   GET /api/v1/admin/enrollments
 * @access  Private (Admin/Teacher)
 */
const getAllEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    studentId, subjectId, classId, batchId,
    isActive, isCompleted, search,
    page, limit, sortBy, sortOrder
  } = req.query;
  
  const filters: any = {};
  if (studentId) filters.studentId = studentId as string;
  if (subjectId) filters.subjectId = subjectId as string;
  if (classId) filters.classId = classId as string;
  if (batchId) filters.batchId = batchId as string;
  if (isActive !== undefined) filters.isActive = isActive === 'true';
  if (isCompleted !== undefined) filters.isCompleted = isCompleted === 'true';
  if (search) filters.search = search as string;
  
  const options: any = {};
  if (page) options.page = parseInt(page as string);
  if (limit) options.limit = parseInt(limit as string);
  if (sortBy) options.sortBy = sortBy as string;
  if (sortOrder) options.sortOrder = sortOrder as 'asc' | 'desc';
  
  const result = await unifiedEnrollmentService.getAllEnrollments(filters, options);
  
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * @desc    Get enrollment by ID
 * @route   GET /api/v1/admin/enrollments/:enrollmentId
 * @access  Private (Admin/Teacher)
 */
const getEnrollmentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // For now, we'll get this via getAllEnrollments with specific ID filter
  // In a real implementation, you might want a dedicated getById method
  const result = await unifiedEnrollmentService.getAllEnrollments(
    { studentId: id }, // This is a simplified approach
    { limit: 1 }
  );
  
  res.status(result.success ? 200 : 404).json(result);
});

// ============================================
// UPDATE & MANAGEMENT ENDPOINTS
// ============================================

/**
 * @desc    Update enrollment details (grades, marks, attendance, etc.)
 * @route   PUT /api/v1/admin/enrollments/subject/:id
 * @access  Private (Admin/Teacher)
 */
const updateEnrollment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validatedData = updateEnrollmentSchema.parse(req.body);
  
  const result = await unifiedEnrollmentService.updateEnrollment(id, validatedData);
  
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * @desc    Deactivate enrollment (soft delete)
 * @route   DELETE /api/v1/admin/enrollments/:enrollmentId
 * @access  Private (Admin)
 */
const deactivateEnrollment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const result = await unifiedEnrollmentService.deactivateEnrollment(id);
  
  res.status(result.success ? 200 : 400).json(result);
});

// ============================================
// ANALYTICS & STATISTICS ENDPOINTS
// ============================================

/**
 * @desc    Get enrollment statistics
 * @route   GET /api/v1/admin/enrollments/statistics
 * @access  Private (Admin/Teacher)
 */
const getEnrollmentStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { batchId, classId, subjectId, isActive } = req.query;
  
  const filters: any = {};
  if (batchId) filters.batchId = batchId as string;
  if (classId) filters.classId = classId as string;
  if (subjectId) filters.subjectId = subjectId as string;
  if (isActive !== undefined) filters.isActive = isActive === 'true';
  
  const result = await unifiedEnrollmentService.getEnrollmentStatistics(filters);
  
  res.status(result.success ? 200 : 400).json(result);
});

// ============================================
// CONVENIENCE ENDPOINTS (Batch Operations)
// ============================================

/**
 * @desc    Get all students in a batch (convenience)
 * @route   GET /api/v1/admin/enrollments/batch/:batchId/students
 * @access  Private (Admin/Teacher)
 */
const getBatchStudents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { batchId } = req.params;
  
  const result = await unifiedEnrollmentService.getAllEnrollments(
    { batchId, isActive: true },
    { limit: 1000, sortBy: 'studentName', sortOrder: 'asc' }
  );
  
  if (result.success && result.data) {
    // Group by student to avoid duplicates
    const studentsMap = new Map();
    result.data.enrollments.forEach((enrollment: any) => {
      if (!studentsMap.has(enrollment.studentId)) {
        studentsMap.set(enrollment.studentId, {
          student: enrollment.student,
          enrollmentCount: 0,
          subjects: [],
        });
      }
      const studentData = studentsMap.get(enrollment.studentId);
      studentData.enrollmentCount++;
      studentData.subjects.push(enrollment.subject);
    });
    
    const students = Array.from(studentsMap.values());
    
    res.status(200).json({
      success: true,
      message: 'Batch students retrieved successfully',
      data: {
        batchId,
        students,
        totalStudents: students.length,
      },
    });
  } else {
    res.status(400).json(result);
  }
});

/**
 * @desc    Get all subjects for a class
 * @route   GET /api/v1/admin/enrollments/class/:classId/subjects
 * @access  Private (Admin/Teacher)
 */
const getClassSubjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  
  const result = await unifiedEnrollmentService.getAllEnrollments(
    { classId, isActive: true },
    { limit: 1000, sortBy: 'subjectName', sortOrder: 'asc' }
  );
  
  if (result.success && result.data) {
    // Group by subject to avoid duplicates
    const subjectsMap = new Map();
    result.data.enrollments.forEach((enrollment: any) => {
      if (!subjectsMap.has(enrollment.subjectId)) {
        subjectsMap.set(enrollment.subjectId, {
          subject: enrollment.subject,
          enrollmentCount: 0,
          students: [],
        });
      }
      const subjectData = subjectsMap.get(enrollment.subjectId);
      subjectData.enrollmentCount++;
      subjectData.students.push(enrollment.student);
    });
    
    const subjects = Array.from(subjectsMap.values());
    
    res.status(200).json({
      success: true,
      message: 'Class subjects retrieved successfully',
      data: {
        classId,
        subjects,
        totalSubjects: subjects.length,
      },
    });
  } else {
    res.status(400).json(result);
  }
});

// ============================================
// LEGACY COMPATIBILITY ENDPOINTS
// ============================================

/**
 * @desc    Get enrollments (legacy StudentClass format)
 * @route   GET /api/v1/admin/enrollments/legacy/student-class
 * @access  Private (Admin/Teacher)
 * @note    Provides backward compatibility with existing frontend components
 */
const getLegacyStudentClassEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId, classId, isActive } = req.query;
  
  const filters: any = {};
  if (studentId) filters.studentId = studentId as string;
  if (classId) filters.classId = classId as string;
  if (isActive !== undefined) filters.isActive = isActive === 'true';
  
  const result = await unifiedEnrollmentService.getAllEnrollments(filters);
  
  if (result.success && result.data) {
    // Transform to legacy format
    const legacyEnrollments = result.data.enrollments.map((enrollment: any) => ({
      id: enrollment.id,
      studentId: enrollment.studentId,
      classId: enrollment.classId,
      isActive: enrollment.isActive,
      enrolledAt: enrollment.enrolledAt,
      student: enrollment.student,
      class: enrollment.class,
      // Add subjects as array for compatibility
      subjects: [enrollment.subject],
    }));
    
    res.status(200).json({
      success: true,
      message: 'Legacy enrollments retrieved successfully',
      data: {
        enrollments: legacyEnrollments,
        pagination: result.data.pagination,
      },
    });
  } else {
    res.status(400).json(result);
  }
});

export {
  // Core operations
  enrollStudentInSubject,
  bulkEnrollStudentsInSubject,
  enrollBatchInClass,
  
  // Queries
  getStudentEnrollments,
  getAllEnrollments,
  getEnrollmentById,
  
  // Management
  updateEnrollment,
  deactivateEnrollment,
  
  // Analytics
  getEnrollmentStatistics,
  
  // Convenience
  getBatchStudents,
  getClassSubjects,
  
  // Legacy
  getLegacyStudentClassEnrollments,
};