import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    // Check if service account path is provided
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!serviceAccountPath && !projectId) {
      console.warn('⚠️  Firebase credentials not configured. Push notifications will be disabled.');
      return null;
    }

    // Initialize with service account file
    if (serviceAccountPath) {
      try {
        // Resolve the path relative to the project root
        const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
        
        // Check if file exists
        if (!fs.existsSync(resolvedPath)) {
          console.error(`❌ Firebase service account file not found at: ${resolvedPath}`);
          return null;
        }

        // Read and parse the service account file
        const serviceAccountContent = fs.readFileSync(resolvedPath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountContent);
        
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        console.log('✅ Firebase Admin SDK initialized with service account');
      } catch (error) {
        console.error('❌ Error loading Firebase service account:', error);
        return null;
      }
    } 
    // Initialize with environment variables (for production)
    else if (projectId) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
      });
      console.log('✅ Firebase Admin SDK initialized with application default credentials');
    }

    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
};

/**
 * Register a device token for push notifications
 */
export const registerDeviceToken = async (
  userId: string,
  token: string,
  platform: string = 'android',
  deviceId?: string,
  appVersion?: string
) => {
  try {
    // Check if token already exists
    const existingToken = await prisma.deviceToken.findUnique({
      where: { token },
    });

    if (existingToken) {
      // Update existing token
      return await prisma.deviceToken.update({
        where: { token },
        data: {
          userId,
          platform,
          deviceId,
          appVersion,
          isActive: true,
          lastUsed: new Date(),
        },
      });
    }

    // Create new token
    return await prisma.deviceToken.create({
      data: {
        userId,
        token,
        platform,
        deviceId,
        appVersion,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Error registering device token:', error);
    throw error;
  }
};

/**
 * Unregister a device token
 */
export const unregisterDeviceToken = async (token: string) => {
  try {
    return await prisma.deviceToken.update({
      where: { token },
      data: { isActive: false },
    });
  } catch (error) {
    console.error('Error unregistering device token:', error);
    throw error;
  }
};

/**
 * Get active device tokens for a user
 */
export const getUserDeviceTokens = async (userId: string): Promise<string[]> => {
  try {
    const tokens = await prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        token: true,
      },
    });

    return tokens.map((t) => t.token);
  } catch (error) {
    console.error('Error fetching user device tokens:', error);
    return [];
  }
};

/**
 * Get active device tokens for multiple users
 */
export const getMultipleUsersDeviceTokens = async (userIds: string[]): Promise<string[]> => {
  try {
    const tokens = await prisma.deviceToken.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
      },
      select: {
        token: true,
      },
    });

    return tokens.map((t) => t.token);
  } catch (error) {
    console.error('Error fetching multiple users device tokens:', error);
    return [];
  }
};

/**
 * Send push notification to specific tokens
 */
export const sendPushNotification = async (
  tokens: string[],
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
) => {
  try {
    if (!firebaseApp) {
      console.warn('⚠️  Firebase not initialized. Skipping push notification.');
      return { success: false, error: 'Firebase not initialized' };
    }

    if (tokens.length === 0) {
      console.warn('⚠️  No tokens provided for push notification');
      return { success: false, error: 'No tokens provided' };
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'notices', // Match with Flutter channel ID
          sound: 'default',
          priority: 'high',
          visibility: 'public',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            contentAvailable: true,
          },
        },
      },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(`✅ Push notification sent: ${response.successCount} successful, ${response.failureCount} failed`);

    // Remove invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          // Remove tokens with permanent errors
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      // Deactivate invalid tokens
      if (invalidTokens.length > 0) {
        await prisma.deviceToken.updateMany({
          where: { token: { in: invalidTokens } },
          data: { isActive: false },
        });
        console.log(`🗑️  Removed ${invalidTokens.length} invalid tokens`);
      }
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to specific users
 */
export const sendPushNotificationToUsers = async (
  userIds: string[],
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
) => {
  try {
    const tokens = await getMultipleUsersDeviceTokens(userIds);
    
    if (tokens.length === 0) {
      console.warn('⚠️  No active device tokens found for specified users');
      return { success: false, error: 'No active tokens found' };
    }

    return await sendPushNotification(tokens, notification, data);
  } catch (error: any) {
    console.error('Error sending push notification to users:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification when a notice is created
 */
export const sendNoticeNotification = async (
  notice: {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    targetRole?: string;
    classId?: string;
    batchId?: string;
    moduleId?: string;
  }
) => {
  try {
    // Determine target users based on notice configuration
    const targetUserIds = await getNoticeTargetUsers(notice);

    if (targetUserIds.length === 0) {
      console.warn('⚠️  No target users found for notice notification');
      return { success: false, error: 'No target users found' };
    }

    // Prepare notification
    const notificationTitle = `📢 New ${notice.category} Notice`;
    const notificationBody = notice.title;
    
    // Priority emoji
    const priorityEmoji = notice.priority === 'URGENT' ? '🚨 ' : 
                         notice.priority === 'HIGH' ? '⚠️ ' : '';

    const data = {
      type: 'notice',
      noticeId: notice.id,
      category: notice.category,
      priority: notice.priority,
      clickAction: 'FLUTTER_NOTIFICATION_CLICK',
    };

    return await sendPushNotificationToUsers(
      targetUserIds,
      {
        title: priorityEmoji + notificationTitle,
        body: notificationBody,
      },
      data
    );
  } catch (error: any) {
    console.error('Error sending notice notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get target user IDs for a notice based on its configuration
 */
const getNoticeTargetUsers = async (notice: {
  targetRole?: string;
  classId?: string;
  batchId?: string;
  moduleId?: string;
}): Promise<string[]> => {
  try {
    const where: any = {
      isActive: true,
      role: 'STUDENT', // Default to students
    };

    // If targetRole is specified, use it
    if (notice.targetRole) {
      where.role = notice.targetRole;
    }

    // If specific class, batch, or module is targeted
    if (notice.classId || notice.batchId || notice.moduleId) {
      const orConditions: any[] = [];

      // Students in specific class
      if (notice.classId) {
        const studentsInClass = await prisma.studentClass.findMany({
          where: { classId: notice.classId },
          select: { studentId: true },
        });
        orConditions.push({ id: { in: studentsInClass.map((s) => s.studentId) } });
      }

      // Students in specific batch
      if (notice.batchId) {
        orConditions.push({ batchId: notice.batchId });
      }

      // Students enrolled in specific module
      if (notice.moduleId) {
        const studentsInModule = await prisma.moduleEnrollment.findMany({
          where: { moduleId: notice.moduleId, isActive: true },
          select: { studentId: true },
        });
        orConditions.push({ id: { in: studentsInModule.map((s) => s.studentId) } });
      }

      // Combine with OR if there are specific targets
      if (orConditions.length > 0) {
        const users = await prisma.user.findMany({
          where: {
            ...where,
            OR: orConditions,
          },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }
    }

    // If no specific targeting, get all users matching the role/default criteria
    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    return users.map((u) => u.id);
  } catch (error) {
    console.error('Error getting notice target users:', error);
    return [];
  }
};

export default {
  initializeFirebase,
  registerDeviceToken,
  unregisterDeviceToken,
  getUserDeviceTokens,
  getMultipleUsersDeviceTokens,
  sendPushNotification,
  sendPushNotificationToUsers,
  sendNoticeNotification,
};
