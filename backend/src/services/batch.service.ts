import { PrismaClient, BatchStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateBatchInput {
  name: string;
  description?: string;
  startYear: number;
  endYear: number;
  startDate: Date;
  endDate?: Date;
  maxStudents?: number;
  createdBy: string;
}

interface UpdateBatchInput {
  name?: string;
  description?: string;
  startYear?: number;
  endYear?: number;
  startDate?: Date;
  endDate?: Date;
  maxStudents?: number;
  status?: BatchStatus;
}

interface AttachClassToBatchInput {
  batchId: string;
  classId: string;
  sequence: number;
  startDate: Date;
  endDate?: Date;
}

interface BatchFilters {
  status?: BatchStatus;
  startYear?: number;
  endYear?: number;
  search?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

class BatchService {
  // ===================================
  // CREATE OPERATIONS
  // ===================================

  async createBatch(data: CreateBatchInput) {
    try {
      // Validate years
      if (data.startYear >= data.endYear) {
        return {
          success: false,
          message: 'End year must be greater than start year',
        };
      }

      // Check if batch name already exists
      const existingBatch = await prisma.batch.findUnique({
        where: { name: data.name },
      });

      if (existingBatch) {
        return {
          success: false,
          message: 'Batch with this name already exists',
        };
      }

      const batch = await prisma.batch.create({
        data: {
          name: data.name,
          description: data.description,
          startYear: data.startYear,
          endYear: data.endYear,
          startDate: data.startDate,
          endDate: data.endDate,
          maxStudents: data.maxStudents,
          createdBy: data.createdBy,
        },
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              students: true,
              classBatches: true,
              classEnrollments: true,
              graduations: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Batch created successfully',
        data: batch,
      };
    } catch (error: any) {
      console.error('Error creating batch:', error);
      return {
        success: false,
        message: error.message || 'Failed to create batch',
      };
    }
  }

  // ===================================
  // READ OPERATIONS
  // ===================================

  async getAllBatches(filters: BatchFilters = {}, options: PaginationOptions = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const where: Prisma.BatchWhereInput = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.startYear) {
        where.startYear = filters.startYear;
      }

      if (filters.endYear) {
        where.endYear = filters.endYear;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [batches, total] = await Promise.all([
        prisma.batch.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            createdByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                students: true,
                classBatches: true,
                classEnrollments: true,
                graduations: true,
              },
            },
          },
        }),
        prisma.batch.count({ where }),
      ]);

      return {
        success: true,
        data: {
          batches,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error: any) {
      console.error('Error fetching batches:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch batches',
      };
    }
  }

  async getBatchById(batchId: string) {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          classBatches: {
            include: {
              class: true,
            },
            orderBy: {
              sequence: 'asc',
            },
          },
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              symbolNo: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              students: true,
              classBatches: true,
              classEnrollments: true,
              graduations: true,
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

      return {
        success: true,
        data: batch,
      };
    } catch (error: any) {
      console.error('Error fetching batch:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch batch',
      };
    }
  }

  // ===================================
  // UPDATE OPERATIONS
  // ===================================

  async updateBatch(batchId: string, data: UpdateBatchInput) {
    try {
      // Check if batch exists
      const existingBatch = await prisma.batch.findUnique({
        where: { id: batchId },
      });

      if (!existingBatch) {
        return {
          success: false,
          message: 'Batch not found',
        };
      }

      // If updating name, check for duplicates
      if (data.name && data.name !== existingBatch.name) {
        const duplicateBatch = await prisma.batch.findUnique({
          where: { name: data.name },
        });

        if (duplicateBatch) {
          return {
            success: false,
            message: 'Batch with this name already exists',
          };
        }
      }

      const batch = await prisma.batch.update({
        where: { id: batchId },
        data,
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              students: true,
              classBatches: true,
              classEnrollments: true,
              graduations: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Batch updated successfully',
        data: batch,
      };
    } catch (error: any) {
      console.error('Error updating batch:', error);
      return {
        success: false,
        message: error.message || 'Failed to update batch',
      };
    }
  }

  // ===================================
  // DELETE OPERATIONS
  // ===================================

  async deleteBatch(batchId: string) {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        include: {
          _count: {
            select: {
              students: true,
              classEnrollments: true,
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

      // Prevent deletion if batch has students
      if (batch._count.students > 0) {
        return {
          success: false,
          message: 'Cannot delete batch with enrolled students. Please remove all students first.',
        };
      }

      await prisma.batch.delete({
        where: { id: batchId },
      });

      return {
        success: true,
        message: 'Batch deleted successfully',
      };
    } catch (error: any) {
      console.error('Error deleting batch:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete batch',
      };
    }
  }

  // ===================================
  // CLASS-BATCH OPERATIONS
  // ===================================

  async attachClassToBatch(data: AttachClassToBatchInput) {
    try {
      // Check if batch exists
      const batch = await prisma.batch.findUnique({
        where: { id: data.batchId },
      });

      if (!batch) {
        return {
          success: false,
          message: 'Batch not found',
        };
      }

      // Check if class exists
      const classExists = await prisma.class.findUnique({
        where: { id: data.classId },
      });

      if (!classExists) {
        return {
          success: false,
          message: 'Class not found',
        };
      }

      // Check if already attached
      const existingLink = await prisma.classBatch.findUnique({
        where: {
          classId_batchId: {
            classId: data.classId,
            batchId: data.batchId,
          },
        },
      });

      if (existingLink) {
        return {
          success: false,
          message: 'Class is already attached to this batch',
        };
      }

      const classBatch = await prisma.classBatch.create({
        data: {
          batchId: data.batchId,
          classId: data.classId,
          sequence: data.sequence,
          startDate: data.startDate,
          endDate: data.endDate,
        },
        include: {
          class: true,
          batch: true,
        },
      });

      return {
        success: true,
        message: 'Class attached to batch successfully',
        data: classBatch,
      };
    } catch (error: any) {
      console.error('Error attaching class to batch:', error);
      return {
        success: false,
        message: error.message || 'Failed to attach class to batch',
      };
    }
  }

  async detachClassFromBatch(batchId: string, classId: string) {
    try {
      const classBatch = await prisma.classBatch.findUnique({
        where: {
          classId_batchId: {
            classId,
            batchId,
          },
        },
      });

      if (!classBatch) {
        return {
          success: false,
          message: 'Class is not attached to this batch',
        };
      }

      // Check if there are active enrollments
      const enrollmentCount = await prisma.classEnrollment.count({
        where: {
          batchId,
          classId,
        },
      });

      if (enrollmentCount > 0) {
        return {
          success: false,
          message: 'Cannot detach class with active enrollments. Please remove enrollments first.',
        };
      }

      await prisma.classBatch.delete({
        where: {
          classId_batchId: {
            classId,
            batchId,
          },
        },
      });

      return {
        success: true,
        message: 'Class detached from batch successfully',
      };
    } catch (error: any) {
      console.error('Error detaching class from batch:', error);
      return {
        success: false,
        message: error.message || 'Failed to detach class from batch',
      };
    }
  }

  async getBatchClasses(batchId: string) {
    try {
      const classBatches = await prisma.classBatch.findMany({
        where: { batchId },
        include: {
          class: true,
        },
        orderBy: {
          sequence: 'asc',
        },
      });

      return {
        success: true,
        data: classBatches,
      };
    } catch (error: any) {
      console.error('Error fetching batch classes:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch batch classes',
      };
    }
  }

  // ===================================
  // STATUS MANAGEMENT
  // ===================================

  async updateBatchStatus(batchId: string, status: BatchStatus, userId: string) {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        return {
          success: false,
          message: 'Batch not found',
        };
      }

      const updateData: any = { status };

      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }

      if (status === 'GRADUATED') {
        updateData.graduatedAt = new Date();
      }

      const updatedBatch = await prisma.batch.update({
        where: { id: batchId },
        data: updateData,
      });

      return {
        success: true,
        message: `Batch status updated to ${status}`,
        data: updatedBatch,
      };
    } catch (error: any) {
      console.error('Error updating batch status:', error);
      return {
        success: false,
        message: error.message || 'Failed to update batch status',
      };
    }
  }

  // ===================================
  // STATISTICS & ANALYTICS
  // ===================================

  async getBatchStatistics(batchId: string) {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
        include: {
          _count: {
            select: {
              students: true,
              classBatches: true,
              classEnrollments: true,
              graduations: true,
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

      // Get active enrollments by class
      const enrollmentsByClass = await prisma.classEnrollment.groupBy({
        by: ['classId'],
        where: {
          batchId,
          isActive: true,
        },
        _count: true,
      });

      // Get completion rate
      const completedEnrollments = await prisma.classEnrollment.count({
        where: {
          batchId,
          isCompleted: true,
        },
      });

      const totalEnrollments = batch._count.classEnrollments;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      // Get pass rate
      const passedEnrollments = await prisma.classEnrollment.count({
        where: {
          batchId,
          isPassed: true,
        },
      });

      const passRate = completedEnrollments > 0 ? (passedEnrollments / completedEnrollments) * 100 : 0;

      return {
        success: true,
        data: {
          batch: {
            id: batch.id,
            name: batch.name,
            status: batch.status,
            startYear: batch.startYear,
            endYear: batch.endYear,
          },
          statistics: {
            totalStudents: batch._count.students,
            totalClasses: batch._count.classBatches,
            totalEnrollments: batch._count.classEnrollments,
            totalGraduations: batch._count.graduations,
            completedEnrollments,
            completionRate: Math.round(completionRate * 100) / 100,
            passedEnrollments,
            passRate: Math.round(passRate * 100) / 100,
            enrollmentsByClass,
          },
        },
      };
    } catch (error: any) {
      console.error('Error fetching batch statistics:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch batch statistics',
      };
    }
  }

  async getBatchStudents(batchId: string, options: PaginationOptions = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const [students, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            batchId,
            role: 'STUDENT',
          },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            symbolNo: true,
            profileImage: true,
            batchId: true,
            isActive: true,
            createdAt: true,
            classEnrollments: {
              where: { batchId },
              include: {
                class: true,
              },
              orderBy: {
                enrolledAt: 'desc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.user.count({
          where: {
            batchId,
            role: 'STUDENT',
          },
        }),
      ]);

      console.log(`📊 Batch ${batchId} - Found ${students.length} students with enrollments:`, 
        students.map(s => ({ 
          name: s.name, 
          enrollments: s.classEnrollments.length 
        }))
      );

      return {
        success: true,
        data: students,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error('Error fetching batch students:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch batch students',
      };
    }
  }
}

export const batchService = new BatchService();
