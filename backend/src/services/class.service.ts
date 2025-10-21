import { PrismaClient, Class } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateClassData {
  name: string;
  section?: string;
  description?: string;
  isActive?: boolean;
  grade?: number;
  capacity?: number;
  academicYear?: string;
}

interface UpdateClassData {
  name?: string;
  section?: string;
  description?: string;
  isActive?: boolean;
  grade?: number;
  capacity?: number;
  academicYear?: string;
}

interface ClassFilters {
  search?: string;
  isActive?: boolean;
  grade?: number;
  section?: string;
  academicYear?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Create a new class
 */
export const createClass = async (data: CreateClassData) => {
  // Check if class with same name and section already exists
  const existingClass = await prisma.class.findFirst({
    where: {
      name: data.name,
      section: data.section || null,
    },
  });

  if (existingClass) {
    throw new Error(`Class "${data.name}${data.section ? ` - Section ${data.section}` : ''}" already exists`);
  }

  const newClass = await prisma.class.create({
    data: {
      name: data.name,
      section: data.section,
      description: data.description,
      isActive: data.isActive ?? true,
    },
    include: {
      _count: {
        select: {
          students: true,
          teachers: true,
          modules: true,
          classBatches: true,
        },
      },
    },
  });

  return {
    success: true,
    data: newClass,
    message: 'Class created successfully',
  };
};

/**
 * Get all classes with pagination and filters
 */
export const getAllClasses = async (
  filters: ClassFilters = {},
  pagination: PaginationOptions = {}
) => {
  const {
    search,
    isActive,
    grade,
    section,
    academicYear,
  } = filters;

  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = pagination;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { section: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (section) {
    where.section = section;
  }

  // Get total count
  const total = await prisma.class.count({ where });

  // Get classes
  const classes = await prisma.class.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      _count: {
        select: {
          students: true,
          teachers: true,
          modules: true,
          classBatches: true,
          liveClasses: true,
          exams: true,
          classEnrollments: true,
        },
      },
    },
  });

  return {
    success: true,
    data: classes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get class by ID with full details
 */
export const getClassById = async (classId: string) => {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teachers: {
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      students: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      modules: {
        select: {
          id: true,
          title: true,
          description: true,
        },
        orderBy: {
          title: 'asc',
        },
      },
      classBatches: {
        include: {
          batch: {
            select: {
              id: true,
              name: true,
              startYear: true,
              endYear: true,
              status: true,
            },
          },
        },
        orderBy: {
          sequence: 'asc',
        },
      },
      _count: {
        select: {
          students: true,
          teachers: true,
          modules: true,
          classBatches: true,
          liveClasses: true,
          exams: true,
          notices: true,
          classEnrollments: true,
        },
      },
    },
  });

  if (!classData) {
    throw new Error('Class not found');
  }

  return {
    success: true,
    data: classData,
  };
};

/**
 * Update class
 */
export const updateClass = async (classId: string, data: UpdateClassData) => {
  // Check if class exists
  const existingClass = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!existingClass) {
    throw new Error('Class not found');
  }

  // If name or section is being updated, check for duplicates
  if (data.name || data.section) {
    const duplicateClass = await prisma.class.findFirst({
      where: {
        id: { not: classId },
        name: data.name || existingClass.name,
        section: data.section !== undefined ? data.section : existingClass.section,
      },
    });

    if (duplicateClass) {
      throw new Error(`Class "${data.name || existingClass.name}${data.section ? ` - Section ${data.section}` : ''}" already exists`);
    }
  }

  const updatedClass = await prisma.class.update({
    where: { id: classId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.section !== undefined && { section: data.section }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: {
      _count: {
        select: {
          students: true,
          teachers: true,
          modules: true,
          classBatches: true,
        },
      },
    },
  });

  return {
    success: true,
    data: updatedClass,
    message: 'Class updated successfully',
  };
};

/**
 * Delete class (soft delete by marking inactive)
 */
export const deleteClass = async (classId: string, hardDelete: boolean = false) => {
  const existingClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      _count: {
        select: {
          students: true,
          teachers: true,
          classBatches: true,
          classEnrollments: true,
        },
      },
    },
  });

  if (!existingClass) {
    throw new Error('Class not found');
  }

  // Check if class has active enrollments
  if (existingClass._count.students > 0 || existingClass._count.classEnrollments > 0) {
    if (!hardDelete) {
      // Soft delete - just mark as inactive
      await prisma.class.update({
        where: { id: classId },
        data: { isActive: false },
      });

      return {
        success: true,
        message: 'Class marked as inactive (has active students/enrollments)',
      };
    } else {
      throw new Error('Cannot delete class with active students or enrollments. Archive it instead.');
    }
  }

  if (hardDelete) {
    // Hard delete
    await prisma.class.delete({
      where: { id: classId },
    });

    return {
      success: true,
      message: 'Class deleted permanently',
    };
  } else {
    // Soft delete
    await prisma.class.update({
      where: { id: classId },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Class marked as inactive',
    };
  }
};

/**
 * Assign teacher to class with subject
 */
export const assignTeacherToClass = async (
  classId: string,
  teacherId: string,
  subjectId: string
) => {
  // Verify class exists
  const classExists = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!classExists) {
    throw new Error('Class not found');
  }

  // Verify teacher exists and has TEACHER role
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
  });

  if (!teacher || teacher.role !== 'TEACHER') {
    throw new Error('Teacher not found or invalid role');
  }

  // Verify subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new Error('Subject not found');
  }

  // Check if already assigned
  const existingAssignment = await prisma.teacherClass.findUnique({
    where: {
      teacherId_classId_subjectId: {
        teacherId,
        classId,
        subjectId,
      },
    },
  });

  if (existingAssignment) {
    throw new Error('Teacher already assigned to this class for this subject');
  }

  // Create assignment
  const assignment = await prisma.teacherClass.create({
    data: {
      teacherId,
      classId,
      subjectId,
    },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  return {
    success: true,
    data: assignment,
    message: 'Teacher assigned to class successfully',
  };
};

/**
 * Remove teacher from class
 */
export const removeTeacherFromClass = async (
  classId: string,
  teacherId: string,
  subjectId: string
) => {
  const assignment = await prisma.teacherClass.findUnique({
    where: {
      teacherId_classId_subjectId: {
        teacherId,
        classId,
        subjectId,
      },
    },
  });

  if (!assignment) {
    throw new Error('Teacher assignment not found');
  }

  await prisma.teacherClass.delete({
    where: {
      teacherId_classId_subjectId: {
        teacherId,
        classId,
        subjectId,
      },
    },
  });

  return {
    success: true,
    message: 'Teacher removed from class successfully',
  };
};

/**
 * Get class statistics
 */
export const getClassStatistics = async (classId: string) => {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      _count: {
        select: {
          students: true,
          teachers: true,
          modules: true,
          liveClasses: true,
          exams: true,
          notices: true,
          classBatches: true,
          classEnrollments: true,
        },
      },
    },
  });

  if (!classData) {
    throw new Error('Class not found');
  }

  // Get active batches
  const activeBatches = await prisma.classBatch.count({
    where: {
      classId,
      isActive: true,
    },
  });

  // Get completed exams
  const completedExams = await prisma.exam.count({
    where: {
      classId,
      status: 'COMPLETED',
    },
  });

  // Get upcoming live classes
  const upcomingLiveClasses = await prisma.liveClass.count({
    where: {
      classId,
      status: 'SCHEDULED',
    },
  });

  return {
    success: true,
    data: {
      totalStudents: classData._count.students,
      totalTeachers: classData._count.teachers,
      totalModules: classData._count.modules,
      totalLiveClasses: classData._count.liveClasses,
      upcomingLiveClasses,
      totalExams: classData._count.exams,
      completedExams,
      totalNotices: classData._count.notices,
      totalBatches: classData._count.classBatches,
      activeBatches,
      totalEnrollments: classData._count.classEnrollments,
    },
  };
};

export default {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  assignTeacherToClass,
  removeTeacherFromClass,
  getClassStatistics,
};
