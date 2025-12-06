import crypto from 'crypto';

export class PasswordResetService {
  /**
   * Generate a cryptographically secure password reset token
   * @returns Object containing the token, its hash, and expiry time
   */
  static generateResetToken(): { token: string; hash: string; expiry: Date } {
    // Generate 32 random bytes and convert to hex (64 characters)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before storing in database
    const hash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Set expiry to 1 hour from now
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    
    return { token, hash, expiry };
  }

  /**
   * Verify a reset token against its stored hash using timing-safe comparison
   * @param token - The token provided by the user
   * @param storedHash - The hash stored in the database
   * @returns Boolean indicating if the token is valid
   */
  static verifyResetToken(token: string, storedHash: string): boolean {
    try {
      // Hash the provided token
      const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // Use timing-safe comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(tokenHash),
        Buffer.from(storedHash)
      );
    } catch (error) {
      // If buffers are different lengths, timingSafeEqual throws
      return false;
    }
  }

  /**
   * Check if a reset token has expired
   * @param expiry - The expiry date from the database
   * @returns Boolean indicating if the token has expired
   */
  static isTokenExpired(expiry: Date): boolean {
    return new Date() > new Date(expiry);
  }

  /**
   * Generate a secure random password
   * @param length - Length of the password (default: 16)
   * @returns Randomly generated password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % charset.length;
      password += charset[randomIndex];
    }
    
    return password;
  }
}
