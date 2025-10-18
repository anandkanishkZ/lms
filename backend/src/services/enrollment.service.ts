import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * EnrollmentService - Handles admin-controlled Module enrollment
 * 
 * Features:
 * - Admin-only enrollment (no self-enrollment)
 * - Bulk enrollment
 * - Enrollment management
 * - Enrollment history
 * - Student assignment to modules
 */
class EnrollmentService {
  /**
   * Enroll a single student in a module (ADMIN only)
   */
  async enrollStudent(data: {
    moduleId: string;
    studentId: string;
    enrolledBy: string;
  }) {
    // Verify admin role
    const admin = await prisma.user.findFirst({
      where: {
        id: data.enrolledBy,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      throw new Error('Only admins can enroll students');
    }

    // Verify module exists and is published
    const module = await prisma.module.findUnique({
      where: { id: data.moduleId },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    if (module.status !== 'PUBLISHED') {
      throw new Error('Only published modules can be enrolled in');
    }

    // Verify student exists and has STUDENT role
    const student = await prisma.user.findFirst({
      where: {
        id: data.studentId,
        role: 'STUDENT',
      },
    });

    if (!student) {
      throw new Error('Student not found or invalid role');
    }

    // Check if already enrolled
    const existing = await prisma.moduleEnrollment.findFirst({
      where: {
        moduleId: data.moduleId,
        studentId: data.studentId,
      },
    });

    if (existing) {
      throw new Error('Student is already enrolled in this module');
    }

    // Create enrollment
    const enrollment = await prisma.$transaction(async (tx) => {
      const newEnrollment = await tx.moduleEnrollment.create({
        data: {
          moduleId: data.moduleId,
          studentId: data.studentId,
          enrolledBy: data.enrolledBy,
        },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              symbolNo: true,
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

      // Increment enrollment count
      await tx.module.update({
        where: { id: data.moduleId },
        data: {
          enrollmentCount: { increment: 1 },
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: data.studentId,
          moduleId: data.moduleId,
          activityType: 'MODULE_ENROLLED',
          title: `Enrolled in module: ${module.title}`,
          description: `Enrolled by ${admin.name}`,
          metadata: {
            action: 'student_enrolled',
            enrolledBy: admin.name,
            enrolledByEmail: admin.email,
          },
        },
      });

      return newEnrollment;
    });

    return {
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment,
    };
  }

  /**
   * Bulk enroll multiple students (ADMIN only)
   */
  async bulkEnrollStudents(data: {
    moduleId: string;
    studentIds: string[];
    enrolledBy: string;
  }) {
    // Verify admin role
    const admin = await prisma.user.findFirst({
      where: {
        id: data.enrolledBy,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      throw new Error('Only admins can enroll students');
    }

    // Verify module exists and is published
    const module = await prisma.module.findUnique({
      where: { id: data.moduleId },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    if (module.status !== 'PUBLISHED') {
      throw new Error('Only published modules can be enrolled in');
    }

    // Verify all students exist and have STUDENT role
    const students = await prisma.user.findMany({
      where: {
        id: { in: data.studentIds },
        role: 'STUDENT',
      },
    });

    if (students.length !== data.studentIds.length) {
      throw new Error('Some students not found or have invalid role');
    }

    // Get already enrolled students
    const existingEnrollments = await prisma.moduleEnrollment.findMany({
      where: {
        moduleId: data.moduleId,
        studentId: { in: data.studentIds },
      },
      select: { studentId: true },
    });

    const alreadyEnrolledIds = new Set(existingEnrollments.map((e) => e.studentId));
    const studentsToEnroll = students.filter((s) => !alreadyEnrolledIds.has(s.id));

    if (studentsToEnroll.length === 0) {
      return {
        success: true,
        message: 'All students are already enrolled',
        data: {
          enrolled: 0,
          skipped: alreadyEnrolledIds.size,
        },
      };
    }

    // Bulk create enrollments
    const enrollments = await prisma.$transaction(async (tx) => {
      const newEnrollments = await tx.moduleEnrollment.createMany({
        data: studentsToEnroll.map((student) => ({
          moduleId: data.moduleId,
          studentId: student.id,
          enrolledBy: data.enrolledBy,
        })),
      });

      // Increment enrollment count
      await tx.module.update({
        where: { id: data.moduleId },
        data: {
          enrollmentCount: { increment: studentsToEnroll.length },
        },
      });

      // Log activity for each student
      await tx.activityHistory.createMany({
        data: studentsToEnroll.map((student) => ({
          userId: student.id,
          moduleId: data.moduleId,
          activityType: 'MODULE_ENROLLED',
          title: `Enrolled in module: ${module.title}`,
          description: `Bulk enrolled by ${admin.name}`,
          metadata: {
            action: 'bulk_enrolled',
            enrolledBy: admin.name,
          },
        })),
      });

      return newEnrollments;
    });

    return {
      success: true,
      message: `Successfully enrolled ${studentsToEnroll.length} students`,
      data: {
        enrolled: studentsToEnroll.length,
        skipped: alreadyEnrolledIds.size,
      },
    };
  }

  /**
   * Unenroll a student from a module (ADMIN only)
   */
  async unenrollStudent(enrollmentId: string, adminId: string, reason?: string) {
    // Verify admin role
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      throw new Error('Only admins can unenroll students');
    }

    // Get enrollment with progress data
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        module: {
          select: { id: true, title: true },
        },
        student: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            lessonProgress: true,
            topicProgress: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Warning if student has made progress
    if (enrollment._count.lessonProgress > 0 || enrollment._count.topicProgress > 0) {
      throw new Error(
        `Cannot unenroll student with progress. Student has completed ${enrollment._count.lessonProgress} lessons. Consider marking as inactive instead.`
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete enrollment
      await tx.moduleEnrollment.delete({
        where: { id: enrollmentId },
      });

      // Decrement enrollment count
      await tx.module.update({
        where: { id: enrollment.moduleId },
        data: {
          enrollmentCount: { decrement: 1 },
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: enrollment.studentId,
          moduleId: enrollment.moduleId,
          activityType: 'MODULE_ENROLLED', // Using as "MODULE_UNENROLLED"
          title: `Unenrolled from module: ${enrollment.module.title}`,
          description: `Unenrolled by ${admin.name}${reason ? `: ${reason}` : ''}`,
          metadata: {
            action: 'student_unenrolled',
            unenrolledBy: admin.name,
            reason,
          },
        },
      });
    });

    return {
      success: true,
      message: 'Student unenrolled successfully',
    };
  }

  /**
   * Mark enrollment as active/inactive
   */
  async toggleEnrollmentStatus(enrollmentId: string, adminId: string) {
    // Verify admin role
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      throw new Error('Only admins can modify enrollment status');
    }

    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        module: { select: { title: true } },
        student: { select: { name: true } },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedEnrollment = await tx.moduleEnrollment.update({
        where: { id: enrollmentId },
        data: {
          isActive: !enrollment.isActive,
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: enrollment.studentId,
          moduleId: enrollment.moduleId,
          activityType: 'MODULE_ENROLLED', // Using as "ENROLLMENT_STATUS_CHANGED"
          title: `Enrollment ${updatedEnrollment.isActive ? 'activated' : 'deactivated'}`,
          description: `${enrollment.module.title} enrollment ${updatedEnrollment.isActive ? 'activated' : 'deactivated'} by ${admin.name}`,
          metadata: {
            action: 'enrollment_status_changed',
            newStatus: updatedEnrollment.isActive ? 'active' : 'inactive',
            changedBy: admin.name,
          },
        },
      });

      return updatedEnrollment;
    });

    return {
      success: true,
      message: `Enrollment ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    };
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(enrollmentId: string) {
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            totalTopics: true,
            totalLessons: true,
            duration: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            symbolNo: true,
          },
        },
        enrolledByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            lessonProgress: true,
            topicProgress: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    return {
      success: true,
      data: enrollment,
    };
  }

  /**
   * Get all enrollments for a module
   */
  async getModuleEnrollments(moduleId: string, filters?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { moduleId };
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [enrollments, total] = await Promise.all([
      prisma.moduleEnrollment.findMany({
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
          _count: {
            select: {
              lessonProgress: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.moduleEnrollment.count({ where }),
    ]);

    return {
      success: true,
      data: {
        enrollments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Get all enrollments for a student
   */
  async getStudentEnrollments(studentId: string, filters?: {
    isActive?: boolean;
    moduleStatus?: string;
  }) {
    const where: any = { studentId };
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.moduleStatus) {
      where.module = { status: filters.moduleStatus };
    }

    const enrollments = await prisma.moduleEnrollment.findMany({
      where,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnailUrl: true,
            totalTopics: true,
            totalLessons: true,
            duration: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            lessonProgress: true,
            topicProgress: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = enrollments.map((enrollment) => ({
      ...enrollment,
      progressPercentage: enrollment.progress,
    }));

    return {
      success: true,
      data: enrollmentsWithProgress,
    };
  }

  /**
   * Enroll all students from a class in a module (ADMIN only)
   */
  async enrollClassInModule(data: {
    moduleId: string;
    classId: string;
    enrolledBy: string;
  }) {
    // Verify admin role
    const admin = await prisma.user.findFirst({
      where: {
        id: data.enrolledBy,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      throw new Error('Only admins can enroll students');
    }

    // Get all students in the class
    const studentClasses = await prisma.studentClass.findMany({
      where: { classId: data.classId },
      include: {
        student: {
          select: { id: true },
        },
      },
    });

    const studentIds = studentClasses.map((sc) => sc.student.id);

    if (studentIds.length === 0) {
      throw new Error('No students found in this class');
    }

    // Use bulk enrollment
    return this.bulkEnrollStudents({
      moduleId: data.moduleId,
      studentIds,
      enrolledBy: data.enrolledBy,
    });
  }

  /**
   * Get enrollment statistics for a module
   */
  async getEnrollmentStats(moduleId: string) {
    const [totalEnrollments, activeEnrollments, completedCount] = await Promise.all([
      prisma.moduleEnrollment.count({
        where: { moduleId },
      }),
      prisma.moduleEnrollment.count({
        where: { moduleId, isActive: true },
      }),
      prisma.moduleEnrollment.count({
        where: {
          moduleId,
          completedAt: { not: null },
        },
      }),
    ]);

    // Get average progress
    const enrollments = await prisma.moduleEnrollment.findMany({
      where: { moduleId },
      select: {
        progress: true,
      },
    });

    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
      : 0;

    return {
      success: true,
      data: {
        totalEnrollments,
        activeEnrollments,
        completedCount,
        avgProgress: Math.round(avgProgress),
        completionRate: totalEnrollments > 0 
          ? Math.round((completedCount / totalEnrollments) * 100)
          : 0,
      },
    };
  }
}

export const enrollmentService = new EnrollmentService();
