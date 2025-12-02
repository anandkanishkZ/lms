import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import notificationService from '../services/notificationService';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Verify user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const userRole = socket.userRole!;

    console.log(`User ${userId} (${userRole}) connected via Socket.IO`);

    // Join user-specific room
    socket.join(`user_${userId}`);

    // Join role-specific room
    socket.join(`role_${userRole}`);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to notification server',
      userId,
      timestamp: new Date(),
    });

    // Handle get unread count
    socket.on('get_unread_count', async () => {
      try {
        const stats = await notificationService.getNotificationStats(userId);
        socket.emit('unread_count', {
          unread: stats.unread,
          total: stats.total,
        });
      } catch (error) {
        console.error('Error getting unread count:', error);
        socket.emit('error', { message: 'Failed to get unread count' });
      }
    });

    // Handle mark as read
    socket.on('mark_notification_read', async (data: { noticeId: string }) => {
      try {
        await prisma.noticeRead.upsert({
          where: {
            noticeId_userId: {
              noticeId: data.noticeId,
              userId,
            },
          },
          create: {
            noticeId: data.noticeId,
            userId,
            deliveryStatus: 'delivered',
          },
          update: {
            readAt: new Date(),
          },
        });

        socket.emit('notification_marked_read', {
          noticeId: data.noticeId,
        });

        // Update unread count
        const stats = await notificationService.getNotificationStats(userId);
        socket.emit('unread_count', {
          unread: stats.unread,
          total: stats.total,
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Handle bulk mark as read
    socket.on('bulk_mark_read', async (data: { noticeIds: string[] }) => {
      try {
        await notificationService.bulkMarkAsRead(userId, data.noticeIds);

        socket.emit('bulk_marked_read', {
          noticeIds: data.noticeIds,
        });

        // Update unread count
        const stats = await notificationService.getNotificationStats(userId);
        socket.emit('unread_count', {
          unread: stats.unread,
          total: stats.total,
        });
      } catch (error) {
        console.error('Error bulk marking as read:', error);
        socket.emit('error', { message: 'Failed to mark notifications as read' });
      }
    });

    // Handle typing indicators for future chat features
    socket.on('typing_start', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('user_typing', { userId });
    });

    socket.on('typing_stop', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('user_stopped_typing', { userId });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User ${userId} disconnected: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  // Set Socket.IO instance in notification service
  notificationService.setSocketIO(io);

  console.log('Socket.IO initialized successfully');

  return io;
};

// Broadcast to all users in a role
export const broadcastToRole = (io: SocketIOServer, role: string, event: string, data: any) => {
  io.to(`role_${role}`).emit(event, data);
};

// Broadcast to all connected users
export const broadcastToAll = (io: SocketIOServer, event: string, data: any) => {
  io.emit(event, data);
};

export default initializeSocketIO;
