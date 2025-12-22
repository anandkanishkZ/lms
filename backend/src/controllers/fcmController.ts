import { Response } from 'express';
import { AuthRequest } from '../types';
import {
  registerDeviceToken,
  unregisterDeviceToken,
  getUserDeviceTokens,
} from '../services/firebaseService';

/**
 * Register FCM device token
 * POST /api/v1/fcm/register
 * Access: All authenticated users
 */
export const registerToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token, platform, deviceId, appVersion } = req.body;
    const userId = req.user!.userId;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Device token is required',
      });
    }

    const deviceToken = await registerDeviceToken(
      userId,
      token,
      platform || 'android',
      deviceId,
      appVersion
    );

    res.status(200).json({
      success: true,
      message: 'Device token registered successfully',
      data: deviceToken,
    });
  } catch (error: any) {
    console.error('Error registering device token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device token',
      error: error.message,
    });
  }
};

/**
 * Unregister FCM device token
 * POST /api/v1/fcm/unregister
 * Access: All authenticated users
 */
export const unregisterToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Device token is required',
      });
    }

    await unregisterDeviceToken(token);

    res.status(200).json({
      success: true,
      message: 'Device token unregistered successfully',
    });
  } catch (error: any) {
    console.error('Error unregistering device token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister device token',
      error: error.message,
    });
  }
};

/**
 * Get user's registered device tokens
 * GET /api/v1/fcm/tokens
 * Access: All authenticated users
 */
export const getTokens = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tokens = await getUserDeviceTokens(userId);

    res.status(200).json({
      success: true,
      data: { tokens },
    });
  } catch (error: any) {
    console.error('Error fetching device tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device tokens',
      error: error.message,
    });
  }
};
