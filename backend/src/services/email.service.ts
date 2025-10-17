import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface WelcomeEmailData {
  name: string;
  symbolNo: string;
  email?: string;
  tempPassword: string;
  role: 'STUDENT' | 'TEACHER';
  school?: string;
  department?: string;
  loginUrl: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailHost || !emailUser || !emailPass) {
      console.warn('⚠️ Email configuration missing. Email service disabled.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email service connection failed:', error);
          this.transporter = null;
        } else {
          console.log('✅ Email service ready to send messages');
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  private generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    const appName = process.env.APP_NAME || 'LMS';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const currentYear = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${appName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                                🎓 Welcome to ${appName}
                            </h1>
                            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
                                Your ${data.role === 'STUDENT' ? 'Student' : 'Teacher'} Account Has Been Created
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Dear <strong>${data.name}</strong>,
                            </p>
                            
                            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                                Your account has been successfully created in our Learning Management System. 
                                Below are your login credentials to access the platform.
                            </p>

                            <!-- Credentials Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border: 2px solid #e5e7eb; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
                                            🔐 Your Login Credentials
                                        </h2>
                                        
                                        <!-- User Details -->
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            ${data.school ? `
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">School:</td>
                                                <td style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0;">${data.school}</td>
                                            </tr>
                                            ` : ''}
                                            ${data.department ? `
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Department:</td>
                                                <td style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0;">${data.department}</td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Symbol Number:</td>
                                                <td style="color: #2563eb; font-size: 15px; font-weight: 700; font-family: 'Courier New', monospace; padding: 8px 0;">${data.symbolNo}</td>
                                            </tr>
                                            ${data.email ? `
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Email:</td>
                                                <td style="color: #1f2937; font-size: 14px; font-weight: 600; padding: 8px 0;">${data.email}</td>
                                            </tr>
                                            ` : ''}
                                        </table>

                                        <!-- Password Box - Highlighted -->
                                        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin-top: 20px;">
                                            <p style="color: #991b1b; font-size: 13px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                                                ⚠️ Temporary Password
                                            </p>
                                            <p style="color: #dc2626; font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace; margin: 0; letter-spacing: 2px;">
                                                ${data.tempPassword}
                                            </p>
                                        </div>

                                    </td>
                                </tr>
                            </table>

                            <!-- Instructions -->
                            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                                    📋 How to Login
                                </h3>
                                <ol style="color: #1f2937; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                    <li>Visit: <a href="${data.loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${data.loginUrl}</a></li>
                                    <li>Enter your <strong>Symbol Number</strong> ${data.email ? 'or <strong>Email</strong>' : ''} as username</li>
                                    <li>Enter the <strong>temporary password</strong> shown above</li>
                                    <li><span style="color: #dc2626; font-weight: 600;">⚠️ Change your password immediately after login</span></li>
                                </ol>
                            </div>

                            <!-- Security Notice -->
                            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
                                <p style="color: #92400e; font-size: 13px; line-height: 1.6; margin: 0;">
                                    <strong>🔒 Security Note:</strong> This is a temporary password for your first login. 
                                    For security reasons, please change it to a strong, unique password after logging in.
                                </p>
                            </div>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="${data.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                            Login to Your Account →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Support -->
                            <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
                                Need help? Contact your administrator or visit our support page.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
                                This email was sent from <strong>${appName}</strong>
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                                © ${currentYear} ${appName}. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private generateWelcomeEmailText(data: WelcomeEmailData): string {
    const appName = process.env.APP_NAME || 'LMS';
    
    return `
Welcome to ${appName}!

Dear ${data.name},

Your ${data.role === 'STUDENT' ? 'student' : 'teacher'} account has been successfully created.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.school ? `School: ${data.school}\n` : ''}${data.department ? `Department: ${data.department}\n` : ''}Symbol Number: ${data.symbolNo}
${data.email ? `Email: ${data.email}\n` : ''}
TEMPORARY PASSWORD: ${data.tempPassword}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO LOGIN:

1. Visit: ${data.loginUrl}
2. Enter your Symbol Number${data.email ? ' or Email' : ''} as username
3. Enter the temporary password shown above
4. ⚠️ IMPORTANT: Change your password immediately after login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 SECURITY NOTE:
This is a temporary password for your first login. Please change it to a strong, unique password for security.

Need help? Contact your administrator.

Best regards,
${appName} Team
    `.trim();
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      return {
        success: false,
        message: 'Email service not configured'
      };
    }

    if (!data.email) {
      return {
        success: false,
        message: 'No email address provided'
      };
    }

    try {
      const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
      const appName = process.env.APP_NAME || 'LMS';

      const mailOptions: EmailOptions = {
        to: data.email,
        subject: `Welcome to ${appName} - Your Login Credentials`,
        html: this.generateWelcomeEmailHTML(data),
        text: this.generateWelcomeEmailText(data)
      };

      await this.sendEmail(mailOptions);

      console.log(`✅ Welcome email sent to: ${data.email}`);
      return {
        success: true,
        message: 'Welcome email sent successfully'
      };
    } catch (error: any) {
      console.error('❌ Failed to send welcome email:', error);
      return {
        success: false,
        message: error.message || 'Failed to send email'
      };
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    await this.transporter.sendMail({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
