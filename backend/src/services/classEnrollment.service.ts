import { PrismaClient, Grade } from '@prisma/client';

const prisma = new PrismaClient();

interface EnrollStudentInput {
  studentId: string;
  classId: string;
  batchId: string;
  enrolledBy: string;
}

interface BulkEnrollInput {
  studentIds: string[];
  classId: string;
  batchId: string;
  enrolledBy: string;
}

interface UpdateEnrollmentInput {
  isCompleted?: boolean;
  isPassed?: boolean;
  finalGrade?: Grade;
  finalMarks?: number;
  totalMarks?: number;
  attendance?: number;
  remarks?: string;
  isActive?: boolean;
}

interface EnrollmentFilters {
  studentId?: string;
  classId?: string;
  batchId?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

class ClassEnrollmentService {
  // ===================================
  // CREATE OPERATIONS
  // ===================================

  async enrollStudent(data: EnrollStudentInput) {
    try {
      // Validate student exists and is assigned to the batch
      const student = await prisma.user.findUnique({
        where: { id: data.studentId },
      });

      if (!student) {
        return {
          success: false,
          message: 'Student not found',
        };
      }

      if (student.role !== 'STUDENT') {
        return {
          success: false,
          message: 'User is not a student',
        };
      }

      if (student.batchId !== data.batchId) {
        return {
          success: false,
          message: 'Student is not assigned to this batch',
        };
      }

      // Validate batch exists
      const batch = await prisma.batch.findUnique({
        where: { id: data.batchId },
      });

      if (!batch) {
        return {
          success: false,
          message: 'Batch not found',
        };
      }

      // Validate class exists
      const classExists = await prisma.class.findUnique({
        where: { id: data.classId },
      });

      if (!classExists) {
        return {
          success: false,
          message: 'Class not found',
        };
      }

      // Check if class is attached to batch
      const classBatch = await prisma.classBatch.findUnique({
        where: {
          classId_batchId: {
            classId: data.classId,
            batchId: data.batchId,
          },
        },
      });

      if (!classBatch) {
        return {
          success: false,
          message: 'Class is not attached to this batch',
        };
      }

      // Check if student is already enrolled
      const existingEnrollment = await prisma.classEnrollment.findUnique({
        where: {
          studentId_classId_batchId: {
            studentId: data.studentId,
            classId: data.classId,
            batchId: data.batchId,
          },
        },
      });

      if (existingEnrollment) {
        return {
          success: false,
          message: 'Student is already enrolled in this class',
        };
      }

      const enrollment = await prisma.classEnrollment.create({
        data: {
          studentId: data.studentId,
          classId: data.classId,
          batchId: data.batchId,
          enrolledBy: data.enrolledBy,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              symbolNo: true,
            },
          },
          class: true,
          batch: {
            select: {
              id: true,
              name: true,
            },
          },
          enrolledByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Student enrolled successfully',
        data: enrollment,
      };
    } catch (error: any) {
      console.error('Error enrolling student:', error);
      return {
        success: false,
        message: error.message || 'Failed to enroll student',
      };
    }
  }

  async bulkEnrollStudents(data: BulkEnrollInput) {
    try {
      // Validate batch and class
      const batch = await prisma.batch.findUnique({
        where: { id: data.batchId },
      });

      if (!batch) {
        return {
          success: false,
          message: 'Batch not found',
        };
      }

      const classExists = await prisma.class.findUnique({
        where: { id: data.classId },
      });

      if (!classExists) {
        return {
          success: false,
          message: 'Class not found',
        };
      }

      // Check if class is attached to batch
      const classBatch = await prisma.classBatch.findUnique({
        where: {
          classId_batchId: {
            classId: data.classId,
            batchId: data.batchId,
          },
        },
      });

      if (!classBatch) {
        return {
          success: false,
          message: 'Class is not attached to this batch',
        };
      }

      // Get all students
      const students = await prisma.user.findMany({
        where: {
          id: { in: data.studentIds },
          role: 'STUDENT',
          batchId: data.batchId,
        },
      });

      if (students.length === 0) {
        return {
          success: false,
          message: 'No valid students found in this batch',
        };
      }

      // Filter out already enrolled students
      const existingEnrollments = await prisma.classEnrollment.findMany({
        where: {
          studentId: { in: data.studentIds },
          classId: data.classId,
          batchId: data.batchId,
        },
      });

      const enrolledStudentIds = existingEnrollments.map((e) => e.studentId);
      const studentsToEnroll = students.filter(
        (s) => !enrolledStudentIds.includes(s.id)
      );

      if (studentsToEnroll.length === 0) {
        return {
          success: false,
          message: 'All selected students are already enrolled',
        };
      }

      // Create enrollments
      const enrollments = await prisma.classEnrollment.createMany({
        data: studentsToEnroll.map((student) => ({
          studentId: student.id,
          classId: data.classId,
          batchId: data.batchId,
          enrolledBy: data.enrolledBy,
        })),
      });

      return {
        success: true,
        message: `Successfully enrolled ${enrollments.count} students`,
        data: {
          enrolledCount: enrollments.count,
          skippedCount: enrolledStudentIds.length,
        },
      };
    } catch (error: any) {
      console.error('Error in bulk enrollment:', error);
      return {
        success: false,
        message: error.message || 'Failed to enroll students',
      };
    }
  }

  async enrollBatchToClass(batchId: string, classId: string, enrolledBy: string) {
    try {
      // Get all students in the batch
      const students = await prisma.user.findMany({
        where: {
          batchId,
          role: 'STUDENT',
          isActive: true,
        },
      });

      if (students.length === 0) {
        return {
          success: false,
          message: 'No active students found in this batch',
        };
      }

      return await this.bulkEnrollStudents({
        studentIds: students.map((s) => s.id),
        classId,
        batchId,
        enrolledBy,
      });
    } catch (error: any) {
      console.error('Error enrolling batch:', error);
      return {
        success: false,
        message: error.message || 'Failed to enroll batch',
      };
    }
  }

  // ===================================
  // READ OPERATIONS
  // ===================================

  async getEnrollmentById(enrollmentId: string) {
    try {
      const enrollment = await prisma.classEnrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              symbolNo: true,
            },
          },
          class: true,
          batch: {
            select: {
              id: true,
              name: true,
              startYear: true,
              endYear: true,
            },
          },
          enrolledByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!enrollment) {
        return {
          success: false,
          message: 'Enrollment not found',
        };
      }

      return {
        success: true,
        data: enrollment,
      };
    } catch (error: any) {
      console.error('Error fetching enrollment:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch enrollment',
      };
    }
  }

  async getEnrollments(filters: EnrollmentFilters = {}) {
    try {
      const where: any = {};

      if (filters.studentId) where.studentId = filters.studentId;
      if (filters.classId) where.classId = filters.classId;
      if (filters.batchId) where.batchId = filters.batchId;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.isCompleted !== undefined) where.isCompleted = filters.isCompleted;

      const enrollments = await prisma.classEnrollment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              symbolNo: true,
            },
          },
          class: true,
          batch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      });

      return {
        success: true,
        data: enrollments,
      };
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch enrollments',
      };
    }
  }

  async getStudentEnrollments(studentId: string) {
    try {
      const enrollments = await prisma.classEnrollment.findMany({
        where: { studentId },
        include: {
          class: true,
          batch: {
            select: {
              id: true,
              name: true,
              startYear: true,
              endYear: true,
            },
          },
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      });

      return {
        success: true,
        data: enrollments,
      };
    } catch (error: any) {
      console.error('Error fetching student enrollments:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch student enrollments',
      };
    }
  }

  async getClassEnrollments(classId: string, batchId?: string) {
    try {
      const where: any = { classId };
      if (batchId) where.batchId = batchId;

      const enrollments = await prisma.classEnrollment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              symbolNo: true,
              isActive: true,
            },
          },
          batch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          student: {
            name: 'asc',
          },
        },
      });

      return {
        success: true,
        data: enrollments,
      };
    } catch (error: any) {
      console.error('Error fetching class enrollments:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch class enrollments',
      };
    }
  }

  // ===================================
  // UPDATE OPERATIONS
  // ===================================

  async updateEnrollment(enrollmentId: string, data: UpdateEnrollmentInput) {
    try {
      const enrollment = await prisma.classEnrollment.findUnique({
        where: { id: enrollmentId },
      });

      if (!enrollment) {
        return {
          success: false,
          message: 'Enrollment not found',
        };
      }

      const updateData: any = { ...data };

      // Set completion date if marking as completed
      if (data.isCompleted === true && !enrollment.isCompleted) {
        updateData.completedAt = new Date();
      }

      const updatedEnrollment = await prisma.classEnrollment.update({
        where: { id: enrollmentId },
        data: updateData,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              symbolNo: true,
            },
          },
          class: true,
          batch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Enrollment updated successfully',
        data: updatedEnrollment,
      };
    } catch (error: any) {
      console.error('Error updating enrollment:', error);
      return {
        success: false,
        message: error.message || 'Failed to update enrollment',
      };
    }
  }

  async markAsCompleted(enrollmentId: string, academicData?: {
    isPassed?: boolean;
    finalGrade?: Grade;
    finalMarks?: number;
    totalMarks?: number;
    attendance?: number;
    remarks?: string;
  }) {
    try {
      return await this.updateEnrollment(enrollmentId, {
        isCompleted: true,
        ...academicData,
      });
    } catch (error: any) {
      console.error('Error marking enrollment as completed:', error);
      return {
        success: false,
        message: error.message || 'Failed to mark enrollment as completed',
      };
    }
  }

  // ===================================
  // DELETE OPERATIONS
  // ===================================

  async unenrollStudent(enrollmentId: string) {
    try {
      const enrollment = await prisma.classEnrollment.findUnique({
        where: { id: enrollmentId },
      });

      if (!enrollment) {
        return {
          success: false,
          message: 'Enrollment not found',
        };
      }

      await prisma.classEnrollment.delete({
        where: { id: enrollmentId },
      });

      return {
        success: true,
        message: 'Student unenrolled successfully',
      };
    } catch (error: any) {
      console.error('Error unenrolling student:', error);
      return {
        success: false,
        message: error.message || 'Failed to unenroll student',
      };
    }
  }

  // ===================================
  // PROMOTION
  // ===================================

  async promoteToNextClass(enrollmentId: string, nextClassId: string, enrolledBy: string) {
    try {
      // Get current enrollment
      const currentEnrollment = await prisma.classEnrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          class: true,
          batch: true,
        },
      });

      if (!currentEnrollment) {
        return {
          success: false,
          message: 'Current enrollment not found',
        };
      }

      // Check if next class is in the same batch
      const nextClassBatch = await prisma.classBatch.findUnique({
        where: {
          classId_batchId: {
            classId: nextClassId,
            batchId: currentEnrollment.batchId,
          },
        },
      });

      if (!nextClassBatch) {
        return {
          success: false,
          message: 'Next class is not part of this batch',
        };
      }

      // Mark current enrollment as completed (if not already)
      if (!currentEnrollment.isCompleted) {
        await this.updateEnrollment(enrollmentId, {
          isCompleted: true,
        });
      }

      // Enroll to next class
      const newEnrollment = await this.enrollStudent({
        studentId: currentEnrollment.studentId,
        classId: nextClassId,
        batchId: currentEnrollment.batchId,
        enrolledBy,
      });

      return {
        success: true,
        message: 'Student promoted to next class successfully',
        data: newEnrollment.data,
      };
    } catch (error: any) {
      console.error('Error promoting student:', error);
      return {
        success: false,
        message: error.message || 'Failed to promote student',
      };
    }
  }
}

export const classEnrollmentService = new ClassEnrollmentService();
