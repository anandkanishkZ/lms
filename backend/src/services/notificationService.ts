import { PrismaClient, NoticeCategory, Priority, Role } from '@prisma/client';

const prisma = new PrismaClient();

export interface NoticeData {
  title: string;
  content: string;
  category?: NoticeCategory;
  priority?: Priority;
  attachmentUrl?: string;
  isPinned?: boolean;
  isPublished?: boolean;
  expiresAt?: Date;
  scheduledFor?: Date;
  actionUrl?: string;
  classId?: string;
  batchId?: string;
  moduleId?: string;
  targetRole?: Role;
  publishedBy: string;
}

export interface NoticeFilters {
  category?: NoticeCategory;
  priority?: Priority;
  isPinned?: boolean;
  classId?: string;
  batchId?: string;
  moduleId?: string;
  includeExpired?: boolean;
  unreadOnly?: boolean;
}

class NotificationService {

  /**
   * Get recipients for a notice based on targeting
   */
  async getRecipients(
    noticeableType: 'class' | 'batch' | 'module' | 'role' | 'global',
    noticeableId?: string,
    targetRole?: Role
  ): Promise<string[]> {
    let recipients: string[] = [];

    try {
      switch (noticeableType) {
        case 'class':
          if (!noticeableId) break;
          const classStudents = await prisma.studentClass.findMany({
            where: { classId: noticeableId, isActive: true },
            select: { studentId: true },
          });
          recipients = classStudents.map((s) => s.studentId);
          break;

        case 'batch':
          if (!noticeableId) break;
          const batchStudents = await prisma.user.findMany({
            where: { batchId: noticeableId, role: 'STUDENT', isActive: true },
            select: { id: true },
          });
          recipients = batchStudents.map((s) => s.id);
          break;

        case 'module':
          if (!noticeableId) break;
          const moduleStudents = await prisma.moduleEnrollment.findMany({
            where: { moduleId: noticeableId, isActive: true },
            select: { studentId: true },
          });
          recipients = moduleStudents.map((s) => s.studentId);
          break;

        case 'role':
          if (!targetRole) break;
          const roleUsers = await prisma.user.findMany({
            where: { role: targetRole, isActive: true },
            select: { id: true },
          });
          recipients = roleUsers.map((u) => u.id);
          break;

        case 'global':
          // Get all active users
          const allUsers = await prisma.user.findMany({
            where: { isActive: true },
            select: { id: true },
          });
          recipients = allUsers.map((u) => u.id);
          break;
      }

      return [...new Set(recipients)]; // Remove duplicates
    } catch (error) {
      console.error('Error getting recipients:', error);
      return [];
    }
  }

  /**
   * Create notice reads for recipients
   */
  async createNoticeReads(noticeId: string, userIds: string[]) {
    try {
      const noticeReads = userIds.map((userId) => ({
        noticeId,
        userId,
        deliveryStatus: 'delivered',
      }));

      // Use createMany with skipDuplicates to avoid unique constraint errors
      await prisma.noticeRead.createMany({
        data: noticeReads,
        skipDuplicates: true,
      });

      console.log(`Created notice reads for ${userIds.length} users`);
      return noticeReads.length;
    } catch (error) {
      console.error('Error creating notice reads:', error);
      return 0;
    }
  }

  /**
   * Check if user should receive notification based on preferences
   */
  async shouldNotifyUser(userId: string, category: NoticeCategory): Promise<boolean> {
    try {
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences) {
        // Default: send all notifications
        return true;
      }

      // Check if in-app notifications are enabled
      if (!preferences.inAppEnabled) {
        return false;
      }

      // Check category preferences
      const categoryMap: Record<NoticeCategory, keyof typeof preferences> = {
        EXAM: 'examNotifications',
        EVENT: 'eventNotifications',
        HOLIDAY: 'eventNotifications',
        GENERAL: 'generalNotifications',
      };

      const prefKey = categoryMap[category];
      if (prefKey && !preferences[prefKey]) {
        return false;
      }

      // Check urgent only mode
      if (preferences.urgentOnly && category !== 'EXAM') {
        return false;
      }

      // Check quiet hours
      if (preferences.quietHoursEnabled && preferences.quietHoursStart && preferences.quietHoursEnd) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const start = preferences.quietHoursStart;
        const end = preferences.quietHoursEnd;

        // Handle quiet hours that span midnight
        if (start < end) {
          if (currentTime >= start && currentTime <= end) {
            return false; // In quiet hours
          }
        } else {
          if (currentTime >= start || currentTime <= end) {
            return false; // In quiet hours (spans midnight)
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return true; // Default to sending notification on error
    }
  }

  /**
   * Get or create notification preferences for user
   */
  async getUserPreferences(userId: string) {
    try {
      let preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences) {
        preferences = await prisma.notificationPreference.create({
          data: { userId },
        });
      }

      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updateUserPreferences(userId: string, preferences: any) {
    try {
      const updated = await prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          ...preferences,
        },
        update: preferences,
      });

      return updated;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Bulk mark notices as read
   */
  async bulkMarkAsRead(userId: string, noticeIds: string[]) {
    try {
      const readRecords = noticeIds.map((noticeId) => ({
        noticeId,
        userId,
        deliveryStatus: 'delivered',
      }));

      await prisma.noticeRead.createMany({
        data: readRecords,
        skipDuplicates: true,
      });

      return noticeIds.length;
    } catch (error) {
      console.error('Error bulk marking as read:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId: string) {
    try {
      // Get total notices user should see
      const userRole = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, batchId: true },
      });

      if (!userRole) {
        throw new Error('User not found');
      }

      // Build filter conditions
      const where: any = {
        isPublished: true,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      };

      // Apply role-based filtering (simplified)
      if (userRole.role === 'STUDENT') {
        const studentClasses = await prisma.studentClass.findMany({
          where: { studentId: userId },
          select: { classId: true },
        });

        where.OR = [
          { classId: null, batchId: null, moduleId: null, targetRole: null },
          { targetRole: 'STUDENT' },
          { classId: { in: studentClasses.map((sc) => sc.classId) } },
          userRole.batchId ? { batchId: userRole.batchId } : {},
        ];
      }

      const totalNotices = await prisma.notice.count({ where });

      const readNotices = await prisma.noticeRead.count({
        where: { userId },
      });

      const unreadNotices = totalNotices - readNotices;

      return {
        total: totalNotices,
        read: readNotices,
        unread: unreadNotices,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
