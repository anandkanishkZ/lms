import { PrismaClient, Grade } from '@prisma/client';

const prisma = new PrismaClient();

interface GraduateStudentInput {
  batchId: string;
  studentId: string;
  graduationDate: Date;
  overallGrade?: Grade;
  overallPercentage?: number;
  totalCredits?: number;
  cgpa?: number;
  honors?: string;
  remarks?: string;
  createdBy: string;
}

interface GraduateBatchInput {
  batchId: string;
  graduationDate: Date;
  studentIds?: string[]; // Optional: graduate specific students
  createdBy: string;
}

interface UpdateGraduationInput {
  overallGrade?: Grade;
  overallPercentage?: number;
  totalCredits?: number;
  cgpa?: number;
  certificateNo?: string;
  certificateUrl?: string;
  honors?: string;
  remarks?: string;
  isAwarded?: boolean;
}

class GraduationService {
  // ===================================
  // CREATE OPERATIONS
  // ===================================

  async graduateStudent(data: GraduateStudentInput) {
    try {
      // Validate batch
      const batch = await prisma.batch.findUnique({
        where: { id: data.batchId },
      });

      if (!batch) {
        return {
          success: false,
          message: 'Batch not found',
        };
      }

      if (batch.status !== 'COMPLETED' && batch.status !== 'GRADUATED') {
        return {
          success: false,
          message: 'Batch must be completed before graduating students',
        };
      }

      // Validate student
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
          message: 'Student is not part of this batch',
        };
      }

      // Check if already graduated
      const existingGraduation = await prisma.graduation.findUnique({
        where: {
          batchId_studentId: {
            batchId: data.batchId,
            studentId: data.studentId,
          },
        },
      });

      if (existingGraduation) {
        return {
          success: false,
          message: 'Student has already graduated from this batch',
        };
      }

      // Generate certificate number
      const certificateNo = await this.generateCertificateNumber(data.batchId);

      // Create graduation record
      const graduation = await prisma.graduation.create({
        data: {
          batchId: data.batchId,
          studentId: data.studentId,
          graduationDate: data.graduationDate,
          overallGrade: data.overallGrade,
          overallPercentage: data.overallPercentage,
          totalCredits: data.totalCredits,
          cgpa: data.cgpa,
          certificateNo,
          honors: data.honors,
          remarks: data.remarks,
          createdBy: data.createdBy,
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
          batch: {
            select: {
              id: true,
              name: true,
              startYear: true,
              endYear: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Student graduated successfully',
        data: graduation,
      };
    } catch (error: any) {
      console.error('Error graduating student:', error);
      return {
        success: false,
        message: error.message || 'Failed to graduate student',
      };
    }
  }

  async graduateBatch(data: GraduateBatchInput) {
    try {
      // Validate batch
      const batch = await prisma.batch.findUnique({
        where: { id: data.batchId },
        include: {
          _count: {
            select: {
              students: true,
            },
          },
        },
      });

      if (!batch) {
        return {
          success: false,
          message: 'Batch not found',
        };
      }

      if (batch.status !== 'COMPLETED') {
        return {
          success: false,
          message: 'Batch must be marked as completed before graduation',
        };
      }

      // Get students to graduate
      let studentsToGraduate;
      if (data.studentIds && data.studentIds.length > 0) {
        // Graduate specific students
        studentsToGraduate = await prisma.user.findMany({
          where: {
            id: { in: data.studentIds },
            batchId: data.batchId,
            role: 'STUDENT',
          },
        });
      } else {
        // Graduate all students in batch
        studentsToGraduate = await prisma.user.findMany({
          where: {
            batchId: data.batchId,
            role: 'STUDENT',
            isActive: true,
          },
        });
      }

      if (studentsToGraduate.length === 0) {
        return {
          success: false,
          message: 'No eligible students found for graduation',
        };
      }

      // Check for already graduated students
      const existingGraduations = await prisma.graduation.findMany({
        where: {
          batchId: data.batchId,
          studentId: { in: studentsToGraduate.map((s) => s.id) },
        },
      });

      const graduatedStudentIds = existingGraduations.map((g) => g.studentId);
      const studentsToProcess = studentsToGraduate.filter(
        (s) => !graduatedStudentIds.includes(s.id)
      );

      if (studentsToProcess.length === 0) {
        return {
          success: false,
          message: 'All selected students have already graduated',
        };
      }

      // Get academic performance for each student
      const graduations = [];
      for (const student of studentsToProcess) {
        const academicData = await this.calculateAcademicPerformance(
          student.id,
          data.batchId
        );

        const certificateNo = await this.generateCertificateNumber(data.batchId);

        const graduation = await prisma.graduation.create({
          data: {
            batchId: data.batchId,
            studentId: student.id,
            graduationDate: data.graduationDate,
            overallGrade: academicData.grade,
            overallPercentage: academicData.percentage,
            cgpa: academicData.cgpa,
            certificateNo,
            createdBy: data.createdBy,
          },
        });

        graduations.push(graduation);
      }

      // Update batch status to GRADUATED
      await prisma.batch.update({
        where: { id: data.batchId },
        data: {
          status: 'GRADUATED',
          graduatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: `Successfully graduated ${graduations.length} students`,
        data: {
          graduatedCount: graduations.length,
          skippedCount: graduatedStudentIds.length,
          graduations,
        },
      };
    } catch (error: any) {
      console.error('Error graduating batch:', error);
      return {
        success: false,
        message: error.message || 'Failed to graduate batch',
      };
    }
  }

  // ===================================
  // READ OPERATIONS
  // ===================================

  async getGraduationById(graduationId: string) {
    try {
      const graduation = await prisma.graduation.findUnique({
        where: { id: graduationId },
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
          batch: {
            select: {
              id: true,
              name: true,
              startYear: true,
              endYear: true,
              startDate: true,
              endDate: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!graduation) {
        return {
          success: false,
          message: 'Graduation record not found',
        };
      }

      return {
        success: true,
        data: graduation,
      };
    } catch (error: any) {
      console.error('Error fetching graduation:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch graduation',
      };
    }
  }

  async getBatchGraduations(batchId: string) {
    try {
      const graduations = await prisma.graduation.findMany({
        where: { batchId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              symbolNo: true,
            },
          },
        },
        orderBy: {
          graduationDate: 'desc',
        },
      });

      return {
        success: true,
        data: graduations,
      };
    } catch (error: any) {
      console.error('Error fetching batch graduations:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch batch graduations',
      };
    }
  }

  async getStudentGraduation(studentId: string, batchId?: string) {
    try {
      const where: any = { studentId };
      if (batchId) where.batchId = batchId;

      const graduations = await prisma.graduation.findMany({
        where,
        include: {
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
          graduationDate: 'desc',
        },
      });

      return {
        success: true,
        data: graduations,
      };
    } catch (error: any) {
      console.error('Error fetching student graduation:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch student graduation',
      };
    }
  }

  async getAllGraduations(filters: { batchId?: string; year?: number } = {}) {
    try {
      const where: any = {};

      if (filters.batchId) {
        where.batchId = filters.batchId;
      }

      if (filters.year) {
        const yearStart = new Date(filters.year, 0, 1);
        const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
        where.graduationDate = {
          gte: yearStart,
          lte: yearEnd,
        };
      }

      const graduations = await prisma.graduation.findMany({
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
          graduationDate: 'desc',
        },
      });

      return {
        success: true,
        data: graduations,
      };
    } catch (error: any) {
      console.error('Error fetching graduations:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch graduations',
      };
    }
  }

  // ===================================
  // UPDATE OPERATIONS
  // ===================================

  async updateGraduation(graduationId: string, data: UpdateGraduationInput) {
    try {
      const graduation = await prisma.graduation.findUnique({
        where: { id: graduationId },
      });

      if (!graduation) {
        return {
          success: false,
          message: 'Graduation record not found',
        };
      }

      const updateData: any = { ...data };

      // Set awarded date if marking as awarded
      if (data.isAwarded === true && !graduation.isAwarded) {
        updateData.awardedAt = new Date();
      }

      const updatedGraduation = await prisma.graduation.update({
        where: { id: graduationId },
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
        message: 'Graduation updated successfully',
        data: updatedGraduation,
      };
    } catch (error: any) {
      console.error('Error updating graduation:', error);
      return {
        success: false,
        message: error.message || 'Failed to update graduation',
      };
    }
  }

  async attachCertificate(graduationId: string, certificateUrl: string) {
    try {
      return await this.updateGraduation(graduationId, {
        certificateUrl,
        isAwarded: true,
      });
    } catch (error: any) {
      console.error('Error attaching certificate:', error);
      return {
        success: false,
        message: error.message || 'Failed to attach certificate',
      };
    }
  }

  // ===================================
  // DELETE OPERATIONS
  // ===================================

  async revokeGraduation(graduationId: string) {
    try {
      const graduation = await prisma.graduation.findUnique({
        where: { id: graduationId },
      });

      if (!graduation) {
        return {
          success: false,
          message: 'Graduation record not found',
        };
      }

      await prisma.graduation.delete({
        where: { id: graduationId },
      });

      return {
        success: true,
        message: 'Graduation revoked successfully',
      };
    } catch (error: any) {
      console.error('Error revoking graduation:', error);
      return {
        success: false,
        message: error.message || 'Failed to revoke graduation',
      };
    }
  }

  // ===================================
  // UTILITY METHODS
  // ===================================

  private async generateCertificateNumber(batchId: string): Promise<string> {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        select: {
          name: true,
          endYear: true,
        },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      // Count existing graduations
      const count = await prisma.graduation.count({
        where: { batchId },
      });

      // Format: BATCH-YEAR-NUMBER (e.g., BATCH-2025-001)
      const certificateNo = `BATCH-${batch.endYear}-${String(count + 1).padStart(4, '0')}`;

      return certificateNo;
    } catch (error: any) {
      console.error('Error generating certificate number:', error);
      throw error;
    }
  }

  private async calculateAcademicPerformance(studentId: string, batchId: string) {
    try {
      // Get all class enrollments for the student in this batch
      const enrollments = await prisma.classEnrollment.findMany({
        where: {
          studentId,
          batchId,
          isCompleted: true,
        },
      });

      if (enrollments.length === 0) {
        return {
          percentage: 0,
          cgpa: 0,
          grade: undefined,
        };
      }

      // Calculate average percentage
      const totalMarks = enrollments.reduce((sum, e) => sum + (e.finalMarks || 0), 0);
      const totalPossibleMarks = enrollments.reduce((sum, e) => sum + (e.totalMarks || 0), 0);
      const percentage = totalPossibleMarks > 0 ? (totalMarks / totalPossibleMarks) * 100 : 0;

      // Calculate CGPA (assuming 10-point scale)
      const cgpa = (percentage / 100) * 10;

      // Determine grade
      let grade: Grade | undefined;
      if (percentage >= 90) grade = 'A_PLUS';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B_PLUS';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C_PLUS';
      else if (percentage >= 40) grade = 'C';
      else if (percentage >= 33) grade = 'D';
      else grade = 'F';

      return {
        percentage: Math.round(percentage * 100) / 100,
        cgpa: Math.round(cgpa * 100) / 100,
        grade,
      };
    } catch (error: any) {
      console.error('Error calculating academic performance:', error);
      return {
        percentage: 0,
        cgpa: 0,
        grade: undefined,
      };
    }
  }

  // ===================================
  // STATISTICS
  // ===================================

  async getGraduationStatistics(batchId?: string) {
    try {
      const where: any = {};
      if (batchId) where.batchId = batchId;

      const [total, awarded, byGrade] = await Promise.all([
        prisma.graduation.count({ where }),
        prisma.graduation.count({
          where: { ...where, isAwarded: true },
        }),
        prisma.graduation.groupBy({
          by: ['overallGrade'],
          where,
          _count: true,
        }),
      ]);

      return {
        success: true,
        data: {
          totalGraduations: total,
          awardedCertificates: awarded,
          pendingCertificates: total - awarded,
          gradeDistribution: byGrade,
        },
      };
    } catch (error: any) {
      console.error('Error fetching graduation statistics:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch graduation statistics',
      };
    }
  }
}

export const graduationService = new GraduationService();
