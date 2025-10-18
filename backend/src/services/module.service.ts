import { PrismaClient, Module, ModuleStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ModuleService - Handles all Module/Subject business logic
 * 
 * Features:
 * - Create, update, delete modules
 * - Publish/approve workflow
 * - Search and filter modules
 * - Featured modules
 * - Auto-update topic/lesson counts
 * - Activity logging
 */
class ModuleService {
  /**
   * Create a new module
   * @param data Module creation data
   * @param teacherId ID of teacher creating the module
   * @returns Created module with relations
   */
  async createModule(data: {
    title: string;
    slug: string;
    description?: string;
    subjectId: string;
    classId?: string;
    teacherId: string;
    thumbnailUrl?: string;
    level?: string;
    duration?: number;
    isFeatured?: boolean;
    isPublic?: boolean;
  }) {
    // Check if slug already exists
    const existingModule = await prisma.module.findUnique({
      where: { slug: data.slug },
    });

    if (existingModule) {
      throw new Error('Module with this slug already exists');
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
    });

    if (!subject) {
      throw new Error('Subject not found');
    }

    // Verify class exists (if provided)
    if (data.classId) {
      const classExists = await prisma.class.findUnique({
        where: { id: data.classId },
      });

      if (!classExists) {
        throw new Error('Class not found');
      }
    }

    // Verify teacher exists and has TEACHER or ADMIN role
    const teacher = await prisma.user.findFirst({
      where: {
        id: data.teacherId,
        role: { in: ['TEACHER', 'ADMIN'] },
      },
    });

    if (!teacher) {
      throw new Error('Teacher not found or invalid role');
    }

    // Create module with transaction
    const module = await prisma.$transaction(async (tx) => {
      // Create the module
      const newModule = await tx.module.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          subjectId: data.subjectId,
          classId: data.classId,
          teacherId: data.teacherId,
          thumbnailUrl: data.thumbnailUrl,
          level: data.level || 'BEGINNER',
          duration: data.duration,
          isFeatured: data.isFeatured || false,
          isPublic: data.isPublic || false,
          status: ModuleStatus.DRAFT,
        },
        include: {
          subject: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true, email: true } },
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId: data.teacherId,
          moduleId: newModule.id,
          activityType: 'MODULE_ENROLLED', // Using as "MODULE_CREATED"
          title: `Created module: ${newModule.title}`,
          metadata: {
            action: 'created',
            moduleName: newModule.title,
          },
        },
      });

      return newModule;
    });

    return {
      success: true,
      message: 'Module created successfully',
      data: module,
    };
  }

  /**
   * Get module by ID with full details
   */
  async getModuleById(moduleId: string, includeTopics = false) {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, section: true } },
        teacher: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            profileImage: true,
          } 
        },
        topics: includeTopics ? {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                isPublished: true,
                orderIndex: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        } : false,
        _count: {
          select: {
            topics: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    return {
      success: true,
      data: module,
    };
  }

  /**
   * Get module by slug with full details
   */
  async getModuleBySlug(slug: string, includeTopics = false) {
    const module = await prisma.module.findUnique({
      where: { slug: slug },
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, section: true } },
        teacher: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            profileImage: true,
          } 
        },
        topics: includeTopics ? {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                isPublished: true,
                orderIndex: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        } : false,
        _count: {
          select: {
            topics: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    return {
      success: true,
      data: module,
    };
  }

  /**
   * Get all modules with filters
   */
  async getModules(filters: {
    subjectId?: string;
    classId?: string;
    teacherId?: string;
    status?: ModuleStatus;
    level?: string;
    isFeatured?: boolean;
    isPublic?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      subjectId,
      classId,
      teacherId,
      status,
      level,
      isFeatured,
      isPublic,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ModuleWhereInput = {
      ...(subjectId && { subjectId }),
      ...(classId && { classId }),
      ...(teacherId && { teacherId }),
      ...(status && { status }),
      ...(level && { level }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(isPublic !== undefined && { isPublic }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [modules, total] = await Promise.all([
      prisma.module.findMany({
        where,
        include: {
          subject: { select: { id: true, name: true } },
          class: { select: { id: true, name: true, section: true } },
          teacher: { 
            select: { 
              id: true, 
              name: true,
              profileImage: true,
            } 
          },
          _count: {
            select: {
              topics: true,
              enrollments: true,
              reviews: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.module.count({ where }),
    ]);

    return {
      success: true,
      data: {
        modules,
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
   * Update module
   */
  async updateModule(
    moduleId: string,
    data: Partial<{
      title: string;
      slug: string;
      description: string;
      thumbnailUrl: string;
      subjectId: string;
      classId: string;
      teacherId: string;
      level: string;
      duration: number;
      status: string;
      isFeatured: boolean;
      isPublic: boolean;
    }>,
    userId: string
  ) {
    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!existingModule) {
      throw new Error('Module not found');
    }

    // Check if user is authorized (teacher or admin)
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { id: existingModule.teacherId },
          { role: 'ADMIN' },
        ],
      },
    });

    if (!user) {
      throw new Error('Unauthorized to update this module');
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existingModule.slug) {
      const slugExists = await prisma.module.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw new Error('Slug already exists');
      }
    }

    // Update module with transaction
    const updatedModule = await prisma.$transaction(async (tx) => {
      // Prepare update data - only allow certain fields to be updated
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Add allowed fields if they exist in data
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
      if (data.level !== undefined) updateData.level = data.level;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
      if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
      if (data.status !== undefined) updateData.status = data.status;
      
      // Note: Module system is FREE-only - no pricing fields in schema
      // All modules are available to students without payment
      
      // For relations, only allow if user is admin
      const isAdmin = user.role === 'ADMIN';

      // Teachers cannot modify admin-controlled fields
      // Remove these from the update data if user is not an admin
      if (!isAdmin) {
        delete data.teacherId;    // Cannot reassign module to another teacher
        delete data.isFeatured;   // Cannot change featured status
        delete data.isPublic;     // Cannot change public visibility
        delete data.subjectId;    // Cannot change subject
        delete data.classId;      // Cannot change class
        
        // Teachers can only change status to DRAFT or PENDING_APPROVAL
        if (data.status && !['DRAFT', 'PENDING_APPROVAL'].includes(data.status)) {
          delete data.status;
        }
        
        // Clear admin-only fields from updateData as well
        delete updateData.teacherId;
        delete updateData.isFeatured;
        delete updateData.isPublic;
        delete updateData.subjectId;
        delete updateData.classId;
        
        // Restrict status changes
        if (updateData.status && !['DRAFT', 'PENDING_APPROVAL'].includes(updateData.status)) {
          delete updateData.status;
        }
      }

      if (isAdmin) {
        if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
        if (data.classId !== undefined) updateData.classId = data.classId;
        if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
      }

      const updated = await tx.module.update({
        where: { id: moduleId },
        data: updateData,
        include: {
          subject: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true, email: true } },
        },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId: updated.id,
          activityType: 'MODULE_ENROLLED', // Using as "MODULE_UPDATED"
          title: `Updated module: ${updated.title}`,
          metadata: {
            action: 'updated',
            moduleName: updated.title,
            changes: Object.keys(data),
          },
        },
      });

      return updated;
    });

    return {
      success: true,
      message: 'Module updated successfully',
      data: updatedModule,
    };
  }

  /**
   * Delete module (soft delete by setting status to ARCHIVED)
   */
  async deleteModule(moduleId: string, userId: string) {
    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!existingModule) {
      throw new Error('Module not found');
    }

    // Check authorization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { id: existingModule.teacherId },
          { role: 'ADMIN' },
        ],
      },
    });

    if (!user) {
      throw new Error('Unauthorized to delete this module');
    }

    // Don't allow deletion if there are enrollments
    if (existingModule._count.enrollments > 0) {
      throw new Error('Cannot delete module with active enrollments. Archive it instead.');
    }

    await prisma.$transaction(async (tx) => {
      // Archive the module instead of hard delete
      await tx.module.update({
        where: { id: moduleId },
        data: { status: ModuleStatus.ARCHIVED },
      });

      // Log activity
      await tx.activityHistory.create({
        data: {
          userId,
          moduleId,
          activityType: 'MODULE_ENROLLED', // Using as "MODULE_ARCHIVED"
          title: `Archived module: ${existingModule.title}`,
          metadata: {
            action: 'archived',
            moduleName: existingModule.title,
          },
        },
      });
    });

    return {
      success: true,
      message: 'Module archived successfully',
    };
  }

  /**
   * Publish module (change status from DRAFT to PENDING_APPROVAL)
   */
  async submitForApproval(moduleId: string, userId: string) {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { _count: { select: { topics: true } } },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    if (module.teacherId !== userId) {
      throw new Error('Only the module creator can submit for approval');
    }

    if (module.status !== ModuleStatus.DRAFT) {
      throw new Error('Only draft modules can be submitted for approval');
    }

    if (module._count.topics === 0) {
      throw new Error('Module must have at least one topic before submission');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedModule = await tx.module.update({
        where: { id: moduleId },
        data: { status: ModuleStatus.PENDING_APPROVAL },
      });

      await tx.activityHistory.create({
        data: {
          userId,
          moduleId,
          activityType: 'MODULE_ENROLLED', // Using as "MODULE_SUBMITTED"
          title: `Submitted module for approval: ${module.title}`,
          metadata: {
            action: 'submitted_for_approval',
            moduleName: module.title,
          },
        },
      });

      return updatedModule;
    });

    return {
      success: true,
      message: 'Module submitted for approval',
      data: updated,
    };
  }

  /**
   * Approve module (ADMIN only - change status to APPROVED)
   */
  async approveModule(moduleId: string, adminId: string) {
    // Check if user is admin
    const admin = await prisma.user.findFirst({
      where: { id: adminId, role: 'ADMIN' },
    });

    if (!admin) {
      throw new Error('Only admins can approve modules');
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    if (module.status !== ModuleStatus.PENDING_APPROVAL) {
      throw new Error('Only pending modules can be approved');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedModule = await tx.module.update({
        where: { id: moduleId },
        data: { status: ModuleStatus.APPROVED },
      });

      await tx.activityHistory.create({
        data: {
          userId: adminId,
          moduleId,
          activityType: 'MODULE_ENROLLED', // Using as "MODULE_APPROVED"
          title: `Approved module: ${module.title}`,
          metadata: {
            action: 'approved',
            moduleName: module.title,
            approvedBy: admin.name,
          },
        },
      });

      return updatedModule;
    });

    return {
      success: true,
      message: 'Module approved successfully',
      data: updated,
    };
  }

  /**
   * Publish module (ADMIN only - change status to PUBLISHED)
   */
  async publishModule(moduleId: string, adminId: string) {
    // Check if user is admin
    const admin = await prisma.user.findFirst({
      where: { id: adminId, role: 'ADMIN' },
    });

    if (!admin) {
      throw new Error('Only admins can publish modules');
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    if (module.status !== ModuleStatus.APPROVED) {
      throw new Error('Only approved modules can be published');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedModule = await tx.module.update({
        where: { id: moduleId },
        data: {
          status: ModuleStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      await tx.activityHistory.create({
        data: {
          userId: adminId,
          moduleId,
          activityType: 'MODULE_ENROLLED', // Using as "MODULE_PUBLISHED"
          title: `Published module: ${module.title}`,
          metadata: {
            action: 'published',
            moduleName: module.title,
            publishedBy: admin.name,
          },
        },
      });

      return updatedModule;
    });

    return {
      success: true,
      message: 'Module published successfully',
      data: updated,
    };
  }

  /**
   * Reject module (ADMIN only - change status back to DRAFT)
   */
  async rejectModule(moduleId: string, adminId: string, reason: string) {
    // Check if user is admin
    const admin = await prisma.user.findFirst({
      where: { id: adminId, role: 'ADMIN' },
    });

    if (!admin) {
      throw new Error('Only admins can reject modules');
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    if (module.status !== ModuleStatus.PENDING_APPROVAL) {
      throw new Error('Only pending modules can be rejected');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedModule = await tx.module.update({
        where: { id: moduleId },
        data: { status: ModuleStatus.DRAFT },
      });

      await tx.activityHistory.create({
        data: {
          userId: adminId,
          moduleId,
          activityType: 'MODULE_ENROLLED', // Using as "MODULE_REJECTED"
          title: `Rejected module: ${module.title}`,
          metadata: {
            action: 'rejected',
            moduleName: module.title,
            rejectedBy: admin.name,
            reason,
          },
        },
      });

      return updatedModule;
    });

    return {
      success: true,
      message: 'Module rejected',
      data: updated,
    };
  }

  /**
   * Get featured modules
   */
  async getFeaturedModules(limit = 6) {
    const modules = await prisma.module.findMany({
      where: {
        isFeatured: true,
        status: ModuleStatus.PUBLISHED,
      },
      include: {
        subject: { select: { id: true, name: true } },
        teacher: { 
          select: { 
            id: true, 
            name: true,
            profileImage: true,
          } 
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
      orderBy: [
        { enrollmentCount: 'desc' },
        { avgRating: 'desc' },
      ],
      take: limit,
    });

    return {
      success: true,
      data: modules,
    };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(moduleId: string) {
    await prisma.module.update({
      where: { id: moduleId },
      data: { viewCount: { increment: 1 } },
    });
  }

  /**
   * Update topic and lesson counts (called after topic/lesson changes)
   */
  async updateCounts(moduleId: string) {
    const topics = await prisma.topic.findMany({
      where: { moduleId },
      include: {
        _count: { select: { lessons: true } },
      },
    });

    const totalTopics = topics.length;
    const totalLessons = topics.reduce((sum, topic) => sum + topic._count.lessons, 0);

    await prisma.module.update({
      where: { id: moduleId },
      data: {
        totalTopics,
        totalLessons,
      },
    });
  }
}

export const moduleService = new ModuleService();
