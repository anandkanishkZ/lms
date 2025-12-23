import crypto from 'crypto';
import { prisma } from '../config/database';
import { smsService } from './sms.service';

interface OTPVerificationResult {
  success: boolean;
  message: string;
  userId?: string;
}

interface OTPGenerationResult {
  success: boolean;
  message: string;
  otpId?: string;
}

class OTPService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly RESEND_COOLDOWN_SECONDS = 60;

  /**
   * Generate a random 6-digit OTP
   */
  private generateOTP(): string {
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
  }

  /**
   * Hash OTP for secure storage
   */
  private hashOTP(otp: string): string {
    return crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
  }

  /**
   * Request OTP for password reset
   * @param phone - User's phone number
   * @param purpose - Purpose of OTP (PASSWORD_RESET, LOGIN, etc.)
   */
  async requestOTP(phone: string, purpose: 'PASSWORD_RESET' | 'LOGIN' = 'PASSWORD_RESET'): Promise<OTPGenerationResult> {
    try {
      // Find user by phone
      const user = await prisma.user.findUnique({
        where: { phone },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          isActive: true
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'No account found with this phone number'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Check if there's a recent OTP request (cooldown period)
      const recentOTP = await prisma.oTPVerification.findFirst({
        where: {
          userId: user.id,
          purpose,
          createdAt: {
            gte: new Date(Date.now() - this.RESEND_COOLDOWN_SECONDS * 1000)
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (recentOTP) {
        const secondsLeft = Math.ceil(
          (this.RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - recentOTP.createdAt.getTime())) / 1000
        );
        return {
          success: false,
          message: `Please wait ${secondsLeft} seconds before requesting a new OTP`
        };
      }

      // Generate OTP
      const otp = this.generateOTP();
      const hashedOTP = this.hashOTP(otp);
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Invalidate all previous OTPs for this user and purpose
      await prisma.oTPVerification.updateMany({
        where: {
          userId: user.id,
          purpose,
          verified: false
        },
        data: { verified: true } // Mark as used/expired
      });

      // Store OTP in database
      const otpRecord = await prisma.oTPVerification.create({
        data: {
          userId: user.id,
          otpHash: hashedOTP,
          purpose,
          expiresAt,
          attempts: 0,
          verified: false
        }
      });

      // Send OTP via SMS
      const smsMessage = this.generateOTPMessage(user.name, otp, purpose);
      const smsResult = await smsService.sendSMS(phone, smsMessage);

      if (!smsResult.success) {
        // Delete the OTP record if SMS failed
        await prisma.oTPVerification.delete({
          where: { id: otpRecord.id }
        });

        return {
          success: false,
          message: 'Failed to send OTP. Please try again.'
        };
      }

      console.log(`✅ OTP sent to ${phone} for ${purpose}`);

      // In development, log the OTP (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 OTP for ${phone}: ${otp}`);
      }

      return {
        success: true,
        message: 'OTP sent successfully to your phone number',
        otpId: otpRecord.id
      };
    } catch (error: any) {
      console.error('❌ Error requesting OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  /**
   * Verify OTP
   * @param phone - User's phone number
   * @param otp - OTP to verify
   * @param purpose - Purpose of OTP
   */
  async verifyOTP(
    phone: string,
    otp: string,
    purpose: 'PASSWORD_RESET' | 'LOGIN' = 'PASSWORD_RESET'
  ): Promise<OTPVerificationResult> {
    try {
      // Find user by phone
      const user = await prisma.user.findUnique({
        where: { phone },
        select: { id: true, name: true }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid verification code'
        };
      }

      // Find the latest unverified OTP for this user and purpose
      const otpRecord = await prisma.oTPVerification.findFirst({
        where: {
          userId: user.id,
          purpose,
          verified: false,
          expiresAt: {
            gte: new Date()
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'OTP expired or not found. Please request a new one.'
        };
      }

      // Check max attempts
      if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
        await prisma.oTPVerification.update({
          where: { id: otpRecord.id },
          data: { verified: true } // Mark as used to prevent further attempts
        });

        return {
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        };
      }

      // Verify OTP
      const hashedInputOTP = this.hashOTP(otp);
      const isValid = crypto.timingSafeEqual(
        Buffer.from(hashedInputOTP),
        Buffer.from(otpRecord.otpHash)
      );

      // Increment attempts
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 }
      });

      if (!isValid) {
        const attemptsLeft = this.MAX_ATTEMPTS - (otpRecord.attempts + 1);
        return {
          success: false,
          message: `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`
        };
      }

      // Mark OTP as verified
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: {
          verified: true,
          verifiedAt: new Date()
        }
      });

      console.log(`✅ OTP verified for user ${user.id}`);

      return {
        success: true,
        message: 'OTP verified successfully',
        userId: user.id
      };
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  /**
   * Check if OTP was recently verified (for multi-step flows)
   * @param phone - User's phone number
   * @param otp - OTP to check
   * @param purpose - Purpose of OTP
   */
  async checkRecentlyVerifiedOTP(
    phone: string,
    otp: string,
    purpose: 'PASSWORD_RESET' | 'LOGIN' = 'PASSWORD_RESET'
  ): Promise<OTPVerificationResult> {
    try {
      // Find user by phone
      const user = await prisma.user.findUnique({
        where: { phone },
        select: { id: true, name: true }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid verification code'
        };
      }

      // Find recently verified OTP (within 5 minutes of verification)
      const otpRecord = await prisma.oTPVerification.findFirst({
        where: {
          userId: user.id,
          purpose,
          verified: true,
          verifiedAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // Within last 5 minutes
          },
          expiresAt: {
            gte: new Date() // Still not expired
          }
        },
        orderBy: { verifiedAt: 'desc' }
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'OTP expired or not found. Please request a new one.'
        };
      }

      // Verify OTP hash matches
      const hashedInputOTP = this.hashOTP(otp);
      const isValid = crypto.timingSafeEqual(
        Buffer.from(hashedInputOTP),
        Buffer.from(otpRecord.otpHash)
      );

      if (!isValid) {
        return {
          success: false,
          message: 'Invalid OTP'
        };
      }

      console.log(`✅ Recently verified OTP checked for user ${user.id}`);

      return {
        success: true,
        message: 'OTP is valid',
        userId: user.id
      };
    } catch (error: any) {
      console.error('❌ Error checking recently verified OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  /**
   * Generate OTP message for SMS
   */
  private generateOTPMessage(name: string, otp: string, purpose: string): string {
    const firstName = name.split(' ')[0];
    const appName = process.env.APP_NAME || 'LMS';
    const purposeText = purpose === 'PASSWORD_RESET' ? 'password reset' : 'login';

    return `Dear ${firstName},

Your OTP for ${purposeText} is: ${otp}

This OTP is valid for ${this.OTP_EXPIRY_MINUTES} minutes.
Do not share this OTP with anyone.

- ${appName}`;
  }

  /**
   * Clean up expired OTPs (run periodically)
   */
  async cleanupExpiredOTPs(): Promise<void> {
    try {
      const result = await prisma.oTPVerification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      console.log(`🧹 Cleaned up ${result.count} expired OTPs`);
    } catch (error) {
      console.error('❌ Error cleaning up OTPs:', error);
    }
  }
}

// Export singleton instance
export const otpService = new OTPService();
