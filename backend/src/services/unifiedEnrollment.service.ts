import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// ============================================
// UNIFIED ENROLLMENT SERVICE (OPTION 2 - HYBRID)
// ============================================

// Validation schemas
const enrollStudentSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  batchId: z.string().min(1),
  enrolledBy: z.string().min(1),
});

const bulkEnrollSchema = z.object({
  studentIds: z.array(z.string()).min(1),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  batchId: z.string().min(1),
  enrolledBy: z.string().min(1),
});

const updateEnrollmentSchema = z.object({
  grade: z.enum(['A_PLUS', 'A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D', 'F']).optional(),
  finalMarks: z.number().min(0).optional(),
  totalMarks: z.number().min(0).optional(),
  attendance: z.number().min(0).max(100).optional(),
  isCompleted: z.boolean().optional(),
  isPassed: z.boolean().optional(),
  remarks: z.string().optional(),
  isActive: z.boolean().optional(),
});

interface EnrollmentFilters {
  studentId?: string;
  subjectId?: string;
  classId?: string;
  batchId?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  search?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class UnifiedEnrollmentService {
  
  // ============================================
  // CORE ENROLLMENT FUNCTIONS
  // ============================================
  
  /**
   * Enroll a single student in a subject
   * Follows the photo model: Student -> Subject (via Class + Batch)
   */
  async enrollStudentInSubject(data: z.infer<typeof enrollStudentSchema>) {
    try {
      // Validate input data
      const validatedData = enrollStudentSchema.parse(data);
      
      // Validate relationships exist
      await this.validateEnrollmentRelationships(validatedData);
      
      // Check for existing enrollment
      const existingEnrollment = await prisma.subjectEnrollment.findUnique({
        where: {
          studentId_subjectId_classId_batchId: {
            studentId: validatedData.studentId,
            subjectId: validatedData.subjectId,
            classId: validatedData.classId,
            batchId: validatedData.batchId,
          },
        },
      });
      
      if (existingEnrollment) {
        return {
          success: false,
          message: 'Student is already enrolled in this subject',
          data: null,
        };
      }
      
      // Create enrollment
      const enrollment = await prisma.subjectEnrollment.create({
        data: {
          ...validatedData,
          enrolledAt: new Date(),
          isActive: true,
          isCompleted: false,
        },
        include: {
          student: {
            select: { id: true, name: true, email: true, symbolNo: true },
          },
          subject: {
            select: { id: true, name: true, code: true },
          },
          class: {
            select: { id: true, name: true, section: true },
          },
          batch: {
            select: { id: true, name: true, startYear: true, endYear: true },
          },
        },
      });
      
      return {
        success: true,
        message: 'Student enrolled successfully',
        data: enrollment,
      };
      
    } catch (error) {
      console.error('Error enrolling student:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to enroll student',
        data: null,
      };
    }
  }
  
  /**
   * Bulk enroll multiple students in a subject
   */
  async bulkEnrollStudentsInSubject(data: z.infer<typeof bulkEnrollSchema>) {
    try {
      const validatedData = bulkEnrollSchema.parse(data);
      
      // Validate relationships
      await this.validateBulkEnrollmentRelationships(validatedData);
      
      // Check for existing enrollments
      const existingEnrollments = await prisma.subjectEnrollment.findMany({
        where: {
          studentId: { in: validatedData.studentIds },
          subjectId: validatedData.subjectId,
          classId: validatedData.classId,
          batchId: validatedData.batchId,
        },
        select: { studentId: true },
      });
      
      const existingStudentIds = existingEnrollments.map(e => e.studentId);
      const newStudentIds = validatedData.studentIds.filter(id => !existingStudentIds.includes(id));
      
      if (newStudentIds.length === 0) {
        return {
          success: false,
          message: 'All students are already enrolled in this subject',
          data: { alreadyEnrolled: existingStudentIds.length, newEnrollments: 0 },
        };
      }
      
      // Create bulk enrollments
      const enrollmentData = newStudentIds.map(studentId => ({
        studentId,
        subjectId: validatedData.subjectId,
        classId: validatedData.classId,
        batchId: validatedData.batchId,
        enrolledBy: validatedData.enrolledBy,
        enrolledAt: new Date(),
        isActive: true,
        isCompleted: false,
      }));
      
      const result = await prisma.subjectEnrollment.createMany({
        data: enrollmentData,
        skipDuplicates: true,
      });
      
      return {
        success: true,
        message: `Successfully enrolled ${result.count} students`,
        data: {
          newEnrollments: result.count,
          alreadyEnrolled: existingStudentIds.length,
          skipped: validatedData.studentIds.length - result.count - existingStudentIds.length,
        },
      };
      
    } catch (error) {
      console.error('Error bulk enrolling students:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to bulk enroll students',
        data: null,
      };
    }
  }
  
  /**
   * Enroll all students in a batch to all subjects in a class
   * This follows the batch -> class relationship from the photo
   */
  async enrollBatchInClass(batchId: string, classId: string, enrolledBy: string) {
    try {
      // Validate batch and class exist and are linked
      const classBatch = await prisma.classBatch.findUnique({
        where: {
          classId_batchId: { classId, batchId },
        },
        include: {
          batch: {
            include: {
              students: {
                where: { role: 'STUDENT', isActive: true },
                select: { id: true, name: true },
              },
            },
          },
          class: {
            include: {
              teachers: {
                where: { isActive: true },
                include: {
                  subject: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      });
      
      if (!classBatch) {
        return {
          success: false,
          message: 'Class is not linked to this batch',
          data: null,
        };
      }
      
      const students = classBatch.batch.students;
      const subjects = classBatch.class.teachers.map(t => t.subject);
      
      if (students.length === 0) {
        return {
          success: false,
          message: 'No active students found in this batch',
          data: null,
        };
      }
      
      if (subjects.length === 0) {
        return {
          success: false,
          message: 'No subjects assigned to this class',
          data: null,
        };
      }
      
      // Create enrollment combinations
      const enrollmentData = [];
      for (const student of students) {
        for (const subject of subjects) {
          enrollmentData.push({
            studentId: student.id,
            subjectId: subject.id,
            classId,
            batchId,
            enrolledBy,
            enrolledAt: new Date(),
            isActive: true,
            isCompleted: false,
          });
        }
      }
      
      // Bulk create enrollments (skip duplicates)
      const result = await prisma.subjectEnrollment.createMany({
        data: enrollmentData,
        skipDuplicates: true,
      });
      
      return {
        success: true,
        message: `Successfully enrolled ${students.length} students in ${subjects.length} subjects`,
        data: {
          studentsEnrolled: students.length,
          subjectsPerStudent: subjects.length,
          totalEnrollments: result.count,
          batchName: classBatch.batch.name,
          className: classBatch.class.name,
        },
      };
      
    } catch (error) {
      console.error('Error enrolling batch in class:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to enroll batch in class',
        data: null,
      };
    }
  }
  
  // ============================================
  // QUERY & RETRIEVAL FUNCTIONS
  // ============================================
  
  /**
   * Get student's enrollments (simplified query following photo model)
   */
  async getStudentEnrollments(studentId: string, filters: Partial<EnrollmentFilters> = {}) {
    try {
      const enrollments = await prisma.subjectEnrollment.findMany({
        where: {
          studentId,
          isActive: filters.isActive ?? true,
          isCompleted: filters.isCompleted,
          classId: filters.classId,
          batchId: filters.batchId,
          subjectId: filters.subjectId,
        },
        include: {
          subject: {
            select: { 
              id: true, name: true, code: true, color: true,
            },
          },
          class: {
            select: { 
              id: true, name: true, section: true,
            },
          },
          batch: {
            select: { 
              id: true, name: true, startYear: true, endYear: true, status: true,
            },
          },
          enrolledByUser: {
            select: { id: true, name: true },
          },
        },
        orderBy: [
          { batch: { startYear: 'desc' } },
          { subject: { name: 'asc' } },
        ],
      });
      
      return {
        success: true,
        message: 'Enrollments retrieved successfully',
        data: enrollments,
      };
      
    } catch (error) {
      console.error('Error getting student enrollments:', error);
      return {
        success: false,
        message: 'Failed to retrieve enrollments',
        data: null,
      };
    }
  }
  
  /**
   * Get all enrollments with filters and pagination
   */
  async getAllEnrollments(
    filters: EnrollmentFilters = {},
    options: PaginationOptions = {}
  ) {
    try {
      const { page = 1, limit = 50, sortBy = 'enrolledAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;
      
      // Build where clause
      const whereClause: any = {};
      
      if (filters.studentId) whereClause.studentId = filters.studentId;
      if (filters.subjectId) whereClause.subjectId = filters.subjectId;
      if (filters.classId) whereClause.classId = filters.classId;
      if (filters.batchId) whereClause.batchId = filters.batchId;
      if (filters.isActive !== undefined) whereClause.isActive = filters.isActive;
      if (filters.isCompleted !== undefined) whereClause.isCompleted = filters.isCompleted;
      
      // Add search functionality
      if (filters.search) {
        whereClause.OR = [
          {
            student: {
              name: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            subject: {
              name: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            class: {
              name: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            batch: {
              name: { contains: filters.search, mode: 'insensitive' },
            },
          },
        ];
      }
      
      // Build order by clause
      const orderBy: any = {};
      if (sortBy === 'studentName') {
        orderBy.student = { name: sortOrder };
      } else if (sortBy === 'subjectName') {
        orderBy.subject = { name: sortOrder };
      } else if (sortBy === 'className') {
        orderBy.class = { name: sortOrder };
      } else if (sortBy === 'batchName') {
        orderBy.batch = { name: sortOrder };
      } else {
        orderBy[sortBy] = sortOrder;
      }
      
      // Get total count
      const totalCount = await prisma.subjectEnrollment.count({
        where: whereClause,
      });
      
      // Get enrollments
      const enrollments = await prisma.subjectEnrollment.findMany({
        where: whereClause,
        include: {
          student: {
            select: { 
              id: true, name: true, email: true, symbolNo: true,
            },
          },
          subject: {
            select: { 
              id: true, name: true, code: true, color: true,
            },
          },
          class: {
            select: { 
              id: true, name: true, section: true,
            },
          },
          batch: {
            select: { 
              id: true, name: true, startYear: true, endYear: true, status: true,
            },
          },
          enrolledByUser: {
            select: { id: true, name: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      });
      
      return {
        success: true,
        message: 'Enrollments retrieved successfully',
        data: {
          enrollments,
          pagination: {
            page,
            limit,
            total: totalCount,
            pages: Math.ceil(totalCount / limit),
          },
        },
      };
      
    } catch (error) {
      console.error('Error getting all enrollments:', error);
      return {
        success: false,
        message: 'Failed to retrieve enrollments',
        data: null,
      };
    }
  }
  
  // ============================================
  // UPDATE & MANAGEMENT FUNCTIONS
  // ============================================
  
  /**
   * Update enrollment details
   */
  async updateEnrollment(
    enrollmentId: string,
    updateData: z.infer<typeof updateEnrollmentSchema>
  ) {
    try {
      const validatedData = updateEnrollmentSchema.parse(updateData);
      
      // Check if enrollment exists
      const existingEnrollment = await prisma.subjectEnrollment.findUnique({
        where: { id: enrollmentId },
        select: { id: true, isActive: true },
      });
      
      if (!existingEnrollment) {
        return {
          success: false,
          message: 'Enrollment not found',
          data: null,
        };
      }
      
      // Calculate percentage if both marks are provided
      let calculatedData: any = { ...validatedData };
      if (validatedData.finalMarks && validatedData.totalMarks && validatedData.totalMarks > 0) {
        calculatedData.percentage = (validatedData.finalMarks / validatedData.totalMarks) * 100;
      }
      
      // Auto-complete if passed and not already completed
      if (validatedData.isPassed === true && !existingEnrollment.isActive) {
        calculatedData.isCompleted = true;
        calculatedData.completedAt = new Date();
      }
      
      const updatedEnrollment = await prisma.subjectEnrollment.update({
        where: { id: enrollmentId },
        data: {
          ...calculatedData,
          updatedAt: new Date(),
        },
        include: {
          student: {
            select: { id: true, name: true },
          },
          subject: {
            select: { id: true, name: true },
          },
          class: {
            select: { id: true, name: true },
          },
          batch: {
            select: { id: true, name: true },
          },
        },
      });
      
      return {
        success: true,
        message: 'Enrollment updated successfully',
        data: updatedEnrollment,
      };
      
    } catch (error) {
      console.error('Error updating enrollment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update enrollment',
        data: null,
      };
    }
  }
  
  /**
   * Deactivate enrollment (soft delete)
   */
  async deactivateEnrollment(enrollmentId: string) {
    try {
      const enrollment = await prisma.subjectEnrollment.update({
        where: { id: enrollmentId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
        select: { id: true, studentId: true, subjectId: true },
      });
      
      return {
        success: true,
        message: 'Enrollment deactivated successfully',
        data: enrollment,
      };
      
    } catch (error) {
      console.error('Error deactivating enrollment:', error);
      return {
        success: false,
        message: 'Failed to deactivate enrollment',
        data: null,
      };
    }
  }
  
  // ============================================
  // ANALYTICS & STATISTICS
  // ============================================
  
  /**
   * Get enrollment statistics
   */
  async getEnrollmentStatistics(filters: Partial<EnrollmentFilters> = {}) {
    try {
      const whereClause: any = {};
      
      if (filters.batchId) whereClause.batchId = filters.batchId;
      if (filters.classId) whereClause.classId = filters.classId;
      if (filters.subjectId) whereClause.subjectId = filters.subjectId;
      if (filters.isActive !== undefined) whereClause.isActive = filters.isActive;
      
      const [
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        passedEnrollments,
        uniqueStudents,
        uniqueSubjects,
        averageAttendance,
        gradeDistribution,
      ] = await Promise.all([
        // Total enrollments
        prisma.subjectEnrollment.count({ where: whereClause }),
        
        // Active enrollments
        prisma.subjectEnrollment.count({
          where: { ...whereClause, isActive: true },
        }),
        
        // Completed enrollments
        prisma.subjectEnrollment.count({
          where: { ...whereClause, isCompleted: true },
        }),
        
        // Passed enrollments
        prisma.subjectEnrollment.count({
          where: { ...whereClause, isPassed: true },
        }),
        
        // Unique students
        prisma.subjectEnrollment.findMany({
          where: whereClause,
          select: { studentId: true },
          distinct: ['studentId'],
        }),
        
        // Unique subjects
        prisma.subjectEnrollment.findMany({
          where: whereClause,
          select: { subjectId: true },
          distinct: ['subjectId'],
        }),
        
        // Average attendance
        prisma.subjectEnrollment.aggregate({
          where: { 
            ...whereClause, 
            attendance: { not: null },
          },
          _avg: { attendance: true },
        }),
        
        // Grade distribution
        prisma.subjectEnrollment.groupBy({
          by: ['grade'],
          where: { 
            ...whereClause, 
            grade: { not: null },
          },
          _count: true,
        }),
      ]);
      
      const stats = {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        passedEnrollments,
        uniqueStudents: uniqueStudents.length,
        uniqueSubjects: uniqueSubjects.length,
        averageAttendance: averageAttendance._avg.attendance || 0,
        completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
        passRate: completedEnrollments > 0 ? (passedEnrollments / completedEnrollments) * 100 : 0,
        gradeDistribution: gradeDistribution.reduce((acc: any, item: any) => {
          acc[item.grade || 'NO_GRADE'] = item._count;
          return acc;
        }, {} as Record<string, number>),
      };
      
      return {
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats,
      };
      
    } catch (error) {
      console.error('Error getting enrollment statistics:', error);
      return {
        success: false,
        message: 'Failed to retrieve statistics',
        data: null,
      };
    }
  }
  
  // ============================================
  // VALIDATION HELPERS
  // ============================================
  
  /**
   * Validate enrollment relationships exist and are valid
   */
  private async validateEnrollmentRelationships(data: {
    studentId: string;
    subjectId: string;
    classId: string;
    batchId: string;
    enrolledBy: string;
  }) {
    // Check student exists and is active
    const student = await prisma.user.findFirst({
      where: {
        id: data.studentId,
        role: 'STUDENT',
        isActive: true,
        batchId: data.batchId, // Student must belong to the batch
      },
    });
    
    if (!student) {
      throw new Error('Student not found or not in the specified batch');
    }
    
    // Check subject exists and is active
    const subject = await prisma.subject.findFirst({
      where: {
        id: data.subjectId,
        isActive: true,
      },
    });
    
    if (!subject) {
      throw new Error('Subject not found or not active');
    }
    
    // Check class exists and is active
    const classEntity = await prisma.class.findFirst({
      where: {
        id: data.classId,
        isActive: true,
      },
    });
    
    if (!classEntity) {
      throw new Error('Class not found or not active');
    }
    
    // Check batch exists and is active
    const batch = await prisma.batch.findFirst({
      where: {
        id: data.batchId,
        status: { in: ['ACTIVE', 'PLANNING'] }, // Allow enrollment in active or planning batches
      },
    });
    
    if (!batch) {
      throw new Error('Batch not found or not available for enrollment');
    }
    
    // Check class-batch relationship exists
    const classBatch = await prisma.classBatch.findUnique({
      where: {
        classId_batchId: {
          classId: data.classId,
          batchId: data.batchId,
        },
      },
    });
    
    if (!classBatch) {
      throw new Error('Class is not linked to this batch');
    }
    
    // Check subject is taught in this class
    const teacherClass = await prisma.teacherClass.findFirst({
      where: {
        classId: data.classId,
        subjectId: data.subjectId,
        isActive: true,
      },
    });
    
    if (!teacherClass) {
      throw new Error('Subject is not taught in this class');
    }
    
    // Check enrolledBy user exists and has permission
    const enrollingUser = await prisma.user.findFirst({
      where: {
        id: data.enrolledBy,
        role: { in: ['ADMIN', 'TEACHER'] },
        isActive: true,
      },
    });
    
    if (!enrollingUser) {
      throw new Error('Enrolling user not found or does not have permission');
    }
  }
  
  /**
   * Validate bulk enrollment relationships
   */
  private async validateBulkEnrollmentRelationships(data: {
    studentIds: string[];
    subjectId: string;
    classId: string;
    batchId: string;
    enrolledBy: string;
  }) {
    // Validate each student individually
    const students = await prisma.user.findMany({
      where: {
        id: { in: data.studentIds },
        role: 'STUDENT',
        isActive: true,
        batchId: data.batchId,
      },
      select: { id: true },
    });
    
    const foundStudentIds = students.map(s => s.id);
    const missingStudents = data.studentIds.filter(id => !foundStudentIds.includes(id));
    
    if (missingStudents.length > 0) {
      throw new Error(`Students not found or not in batch: ${missingStudents.join(', ')}`);
    }
    
    // Validate other relationships (same as single enrollment)
    await this.validateEnrollmentRelationships({
      studentId: data.studentIds[0], // Use first student for other validations
      subjectId: data.subjectId,
      classId: data.classId,
      batchId: data.batchId,
      enrolledBy: data.enrolledBy,
    });
  }
}

// Export singleton instance
export const unifiedEnrollmentService = new UnifiedEnrollmentService();