import { PrismaClient, ModuleResource, ResourceStatus, ResourceCategory, ResourceType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ResourceService - Handles all Module Content/Resource business logic
 * 
 * Features:
 * - Create, update, delete resources
 * - Role-based visibility control
 * - Hide/unhide functionality
 * - Access tracking and analytics
 * - Bulk operations
 * - Permission checks
 */
class ResourceService {
  /**
   * Create a new resource
   */
  async createResource(data: {
    title: string;
    description?: string;
    category?: ResourceCategory;
    tags?: string[];
    type: ResourceType;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    externalUrl?: string;
    moduleId?: string;
    topicId?: string;
    lessonId?: string;
    status?: ResourceStatus;
    isHidden?: boolean;
    visibleToRoles?: string[];
    isPinned?: boolean;
    isMandatory?: boolean;
    orderIndex?: number;
    uploadedBy: string;
  }) {
    // Validation: Must attach to at least one level
    if (!data.moduleId && !data.topicId && !data.lessonId) {
      throw new Error('Resource must be attached to a module, topic, or lesson');
    }

    // Verify attachment points exist
    if (data.moduleId) {
      const module = await prisma.module.findUnique({
        where: { id: data.moduleId },
        include: { teacher: true },
      });
      if (!module) throw new Error('Module not found');
      
      // Permission check: Only module teacher or admin can add resources
      const uploader = await prisma.user.findUnique({ where: { id: data.uploadedBy } });
      if (!uploader) throw new Error('Uploader not found');
      
      if (uploader.role !== 'ADMIN' && module.teacherId !== data.uploadedBy) {
        throw new Error('You can only add resources to your own modules');
      }
    }

    if (data.topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: data.topicId },
        include: { module: { include: { teacher: true } } },
      });
      if (!topic) throw new Error('Topic not found');
      
      const uploader = await prisma.user.findUnique({ where: { id: data.uploadedBy } });
      if (uploader?.role !== 'ADMIN' && topic.module.teacherId !== data.uploadedBy) {
        throw new Error('You can only add resources to topics in your own modules');
      }
    }

    if (data.lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: data.lessonId },
        include: { topic: { include: { module: { include: { teacher: true } } } } },
      });
      if (!lesson) throw new Error('Lesson not found');
      
      const uploader = await prisma.user.findUnique({ where: { id: data.uploadedBy } });
      if (uploader?.role !== 'ADMIN' && lesson.topic.module.teacherId !== data.uploadedBy) {
        throw new Error('You can only add resources to lessons in your own modules');
      }
    }

    // Set default visible roles if not provided
    const visibleToRoles = data.visibleToRoles || ['STUDENT', 'TEACHER', 'ADMIN'];

    // Convert string booleans to actual booleans (when data comes from FormData)
    // FormData converts all values to strings, so we need to handle both true boolean and "true" string
    const isPinned = data.isPinned === true || (data.isPinned as any) === 'true';
    const isMandatory = data.isMandatory === true || (data.isMandatory as any) === 'true';
    const isHidden = data.isHidden === true || (data.isHidden as any) === 'true';

    const resource = await prisma.moduleResource.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category || 'OTHER',
        tags: data.tags || [],
        type: data.type,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        externalUrl: data.externalUrl,
        moduleId: data.moduleId,
        topicId: data.topicId,
        lessonId: data.lessonId,
        status: data.status || 'PUBLISHED',
        isHidden,
        visibleToRoles,
        isPinned,
        isMandatory,
        orderIndex: data.orderIndex || 0,
        uploadedBy: data.uploadedBy,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        module: { select: { id: true, title: true } },
        topic: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
        uploader: { select: { id: true, name: true, email: true } },
      },
    });

    // Log activity
    await this.logAccess({
      resourceId: resource.id,
      userId: data.uploadedBy,
      action: 'CREATE',
    });

    return {
      success: true,
      message: 'Resource created successfully',
      data: resource,
    };
  }

  /**
   * Get resource by ID with access control
   */
  async getResourceById(resourceId: string, userId: string, userRole: string) {
    const resource = await prisma.moduleResource.findUnique({
      where: { id: resourceId },
      include: {
        module: { select: { id: true, title: true, teacherId: true } },
        topic: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
        uploader: { select: { id: true, name: true, email: true, profileImage: true } },
        _count: {
          select: {
            accessLogs: true,
          },
        },
      },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Access control check
    const canAccess = await this.checkAccess(resource, userId, userRole);
    if (!canAccess) {
      throw new Error('You do not have permission to access this resource');
    }

    // Get access stats for teachers and admins
    let accessStats = null;
    if (userRole === 'ADMIN' || (resource.module?.teacherId === userId)) {
      const logs = await prisma.resourceAccessLog.findMany({
        where: { resourceId },
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });

      accessStats = {
        totalViews: resource.viewCount,
        totalDownloads: resource.downloadCount,
        recentAccess: logs,
      };
    }

    return {
      success: true,
      data: {
        ...resource,
        accessStats,
      },
    };
  }

  /**
   * Get resources with filters and role-based access
   */
  async getResources(filters: {
    moduleId?: string;
    topicId?: string;
    lessonId?: string;
    category?: ResourceCategory;
    type?: ResourceType;
    status?: ResourceStatus;
    includeHidden?: boolean;
    search?: string;
    tags?: string[];
    isPinned?: boolean;
    isMandatory?: boolean;
    page?: number;
    limit?: number;
    userId: string;
    userRole: string;
  }) {
    const {
      moduleId,
      topicId,
      lessonId,
      category,
      type,
      status,
      includeHidden = false,
      search,
      tags,
      isPinned,
      isMandatory,
      page = 1,
      limit = 20,
      userId,
      userRole,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ModuleResourceWhereInput = {
      ...(moduleId && { moduleId }),
      ...(topicId && { topicId }),
      ...(lessonId && { lessonId }),
      ...(category && { category }),
      ...(type && { type }),
      ...(status && { status }),
      ...(isPinned !== undefined && { isPinned }),
      ...(isMandatory !== undefined && { isMandatory }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } },
        ],
      }),
      ...(tags && tags.length > 0 && {
        tags: { hasSome: tags },
      }),
    };

    // Apply visibility filters based on role
    if (userRole === 'STUDENT') {
      where.status = 'PUBLISHED';
      where.isHidden = false;
      where.visibleToRoles = { has: 'STUDENT' };
    } else if (userRole === 'TEACHER' && !includeHidden) {
      where.OR = [
        { status: 'PUBLISHED', isHidden: false },
        { uploadedBy: userId },
      ];
    } else if (userRole === 'TEACHER' && includeHidden) {
      // Teachers can see hidden resources in their own modules
      if (moduleId) {
        const module = await prisma.module.findUnique({ where: { id: moduleId } });
        if (module?.teacherId !== userId) {
          where.isHidden = false;
        }
      }
    }
    // Admins can see everything

    const [resources, total] = await Promise.all([
      prisma.moduleResource.findMany({
        where,
        include: {
          module: { select: { id: true, title: true } },
          topic: { select: { id: true, title: true } },
          lesson: { select: { id: true, title: true } },
          uploader: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy: [
          { isPinned: 'desc' },
          { orderIndex: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.moduleResource.count({ where }),
    ]);

    return {
      success: true,
      data: {
        resources,
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
   * Update resource
   */
  async updateResource(
    resourceId: string,
    data: Partial<{
      title: string;
      description: string;
      category: ResourceCategory;
      tags: string[];
      status: ResourceStatus;
      isHidden: boolean;
      isPinned: boolean;
      isMandatory: boolean;
      orderIndex: number;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      externalUrl: string;
    }>,
    userId: string,
    userRole: string
  ) {
    const resource = await prisma.moduleResource.findUnique({
      where: { id: resourceId },
      include: {
        module: { select: { teacherId: true } },
      },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Permission check
    if (userRole !== 'ADMIN' && resource.uploadedBy !== userId && resource.module?.teacherId !== userId) {
      throw new Error('You do not have permission to update this resource');
    }

    // Convert string booleans to actual booleans (when data comes from FormData)
    if (data.isPinned !== undefined) {
      data.isPinned = data.isPinned === true || (data.isPinned as any) === 'true';
    }
    if (data.isMandatory !== undefined) {
      data.isMandatory = data.isMandatory === true || (data.isMandatory as any) === 'true';
    }
    if (data.isHidden !== undefined) {
      data.isHidden = data.isHidden === true || (data.isHidden as any) === 'true';
    }

    // Update publishedAt if status changes to PUBLISHED
    const updateData: any = { ...data };
    if (data.status === 'PUBLISHED' && resource.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }
    if (data.status === 'ARCHIVED') {
      updateData.archivedAt = new Date();
    }

    // Increment version
    updateData.version = resource.version + 1;

    const updated = await prisma.moduleResource.update({
      where: { id: resourceId },
      data: updateData,
      include: {
        module: { select: { id: true, title: true } },
        topic: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
        uploader: { select: { id: true, name: true, email: true } },
      },
    });

    // Log activity
    await this.logAccess({
      resourceId,
      userId,
      action: 'EDIT',
      metadata: { changes: data },
    });

    return {
      success: true,
      message: 'Resource updated successfully',
      data: updated,
    };
  }

  /**
   * Delete resource
   */
  async deleteResource(resourceId: string, userId: string, userRole: string) {
    const resource = await prisma.moduleResource.findUnique({
      where: { id: resourceId },
      include: {
        module: { select: { teacherId: true } },
      },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Permission check
    if (userRole !== 'ADMIN' && resource.uploadedBy !== userId && resource.module?.teacherId !== userId) {
      throw new Error('You do not have permission to delete this resource');
    }

    // Log before deletion
    await this.logAccess({
      resourceId,
      userId,
      action: 'DELETE',
    });

    await prisma.moduleResource.delete({
      where: { id: resourceId },
    });

    return {
      success: true,
      message: 'Resource deleted successfully',
    };
  }

  /**
   * Toggle resource visibility (hide/unhide)
   */
  async toggleVisibility(
    resourceId: string,
    isHidden: boolean,
    userId: string,
    userRole: string,
    reason?: string
  ) {
    const resource = await prisma.moduleResource.findUnique({
      where: { id: resourceId },
      include: {
        module: { select: { teacherId: true } },
      },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Permission check
    if (userRole !== 'ADMIN' && resource.uploadedBy !== userId && resource.module?.teacherId !== userId) {
      throw new Error('You do not have permission to modify visibility of this resource');
    }

    const updated = await prisma.moduleResource.update({
      where: { id: resourceId },
      data: { isHidden },
    });

    // Log activity
    await this.logAccess({
      resourceId,
      userId,
      action: isHidden ? 'HIDE' : 'UNHIDE',
      metadata: { reason },
    });

    return {
      success: true,
      message: `Resource ${isHidden ? 'hidden' : 'unhidden'} successfully`,
      data: { isHidden: updated.isHidden },
    };
  }

  /**
   * Bulk operations on resources
   */
  async bulkOperation(
    action: 'hide' | 'unhide' | 'publish' | 'archive' | 'delete',
    resourceIds: string[],
    userId: string,
    userRole: string,
    reason?: string
  ) {
    if (resourceIds.length === 0) {
      throw new Error('No resources provided');
    }

    const resources = await prisma.moduleResource.findMany({
      where: { id: { in: resourceIds } },
      include: {
        module: { select: { teacherId: true } },
      },
    });

    // Permission check for each resource
    const allowed: string[] = [];
    const denied: string[] = [];

    for (const resource of resources) {
      const hasPermission =
        userRole === 'ADMIN' ||
        resource.uploadedBy === userId ||
        resource.module?.teacherId === userId;

      if (hasPermission) {
        allowed.push(resource.id);
      } else {
        denied.push(resource.id);
      }
    }

    let processed = 0;
    let updateData: any = {};

    switch (action) {
      case 'hide':
        updateData = { isHidden: true };
        break;
      case 'unhide':
        updateData = { isHidden: false };
        break;
      case 'publish':
        updateData = { status: 'PUBLISHED', publishedAt: new Date() };
        break;
      case 'archive':
        updateData = { status: 'ARCHIVED', archivedAt: new Date() };
        break;
      case 'delete':
        processed = await prisma.moduleResource.deleteMany({
          where: { id: { in: allowed } },
        }).then(res => res.count);
        break;
    }

    if (action !== 'delete' && allowed.length > 0) {
      const result = await prisma.moduleResource.updateMany({
        where: { id: { in: allowed } },
        data: updateData,
      });
      processed = result.count;
    }

    // Log bulk operation
    for (const resourceId of allowed) {
      await this.logAccess({
        resourceId,
        userId,
        action: `BULK_${action.toUpperCase()}`,
        metadata: { reason, totalResources: resourceIds.length },
      });
    }

    return {
      success: true,
      message: `Bulk ${action} completed`,
      data: {
        processed,
        failed: denied.length,
        denied,
      },
    };
  }

  /**
   * Track resource access (view or download)
   */
  async trackAccess(
    resourceId: string,
    userId: string,
    action: 'VIEW' | 'DOWNLOAD',
    ipAddress?: string,
    userAgent?: string
  ) {
    const resource = await prisma.moduleResource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Update counters
    const updateData: any = {};
    if (action === 'VIEW') {
      updateData.viewCount = { increment: 1 };
    } else if (action === 'DOWNLOAD') {
      updateData.downloadCount = { increment: 1 };
    }

    const updated = await prisma.moduleResource.update({
      where: { id: resourceId },
      data: updateData,
    });

    // Log access
    await this.logAccess({
      resourceId,
      userId,
      action,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      data: {
        viewCount: updated.viewCount,
        downloadCount: updated.downloadCount,
      },
    };
  }

  /**
   * Reorder resources
   */
  async reorderResources(
    resources: Array<{ resourceId: string; orderIndex: number }>,
    userId: string,
    userRole: string
  ) {
    // Verify all resources exist and user has permission
    const resourceIds = resources.map(r => r.resourceId);
    const foundResources = await prisma.moduleResource.findMany({
      where: { id: { in: resourceIds } },
      include: {
        module: { select: { teacherId: true } },
      },
    });

    if (foundResources.length !== resources.length) {
      throw new Error('One or more resources not found');
    }

    // Permission check
    for (const resource of foundResources) {
      if (
        userRole !== 'ADMIN' &&
        resource.uploadedBy !== userId &&
        resource.module?.teacherId !== userId
      ) {
        throw new Error(`No permission to reorder resource: ${resource.title}`);
      }
    }

    // Update order indexes
    await prisma.$transaction(
      resources.map(({ resourceId, orderIndex }) =>
        prisma.moduleResource.update({
          where: { id: resourceId },
          data: { orderIndex },
        })
      )
    );

    return {
      success: true,
      message: 'Resources reordered successfully',
    };
  }

  /**
   * Check if user can access a resource
   */
  private async checkAccess(
    resource: ModuleResource & { module?: { teacherId: string } | null },
    userId: string,
    userRole: string
  ): Promise<boolean> {
    // Admins can access everything
    if (userRole === 'ADMIN') return true;

    // Resource owner can access
    if (resource.uploadedBy === userId) return true;

    // Module teacher can access
    if (resource.module?.teacherId === userId) return true;

    // Students can only access published, non-hidden resources
    if (userRole === 'STUDENT') {
      if (resource.status !== 'PUBLISHED') return false;
      if (resource.isHidden) return false;
      if (!resource.visibleToRoles.includes('STUDENT')) return false;

      // Check enrollment if attached to a module
      if (resource.moduleId) {
        const enrollment = await prisma.moduleEnrollment.findFirst({
          where: {
            moduleId: resource.moduleId,
            studentId: userId,
            isActive: true,
          },
        });
        return !!enrollment;
      }
    }

    // Teachers can access published resources
    if (userRole === 'TEACHER') {
      if (resource.status === 'PUBLISHED' && !resource.isHidden) return true;
    }

    return false;
  }

  /**
   * Log resource access
   */
  private async logAccess(data: {
    resourceId: string;
    userId: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    await prisma.resourceAccessLog.create({
      data: {
        resourceId: data.resourceId,
        userId: data.userId,
        action: data.action,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata,
      },
    });
  }
}

export const resourceService = new ResourceService();
