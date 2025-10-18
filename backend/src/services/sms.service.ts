import axios, { AxiosInstance } from 'axios';

interface WelcomeSMSData {
  name: string;
  symbolNo: string;
  tempPassword: string;
  phone: string;
  role: 'STUDENT' | 'TEACHER';
  loginUrl: string;
}

interface SMSResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface SociairSMSResponse {
  message: string;
  ntc?: number;
  ncell?: number;
  smartcell?: number;
  other?: number;
  invalid_number?: string[];
}

interface SociairBalanceResponse {
  balance: string;
  ntc_rate: string;
  ncell_rate: string;
  smartcell_rate: string;
}

class SMSService {
  private client: AxiosInstance | null = null;
  private apiUrl: string | null = null;
  private bearerToken: string | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    this.apiUrl = process.env.SOCIAIRSMS_API_URL || null;
    this.bearerToken = process.env.SOCIAIRSMS_BEARER_TOKEN || null;

    if (!this.apiUrl || !this.bearerToken) {
      console.warn('⚠️ Sociairsms configuration missing. SMS service disabled.');
      return;
    }

    // Check if credentials are still placeholders
    if (this.bearerToken.includes('your_bearer_token')) {
      console.warn('⚠️ Sociairsms bearer token is placeholder. SMS service disabled.');
      return;
    }

    try {
      this.client = axios.create({
        baseURL: this.apiUrl,
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });

      console.log('✅ SMS service (Sociairsms) initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SMS service:', error);
      this.client = null;
    }
  }

  /**
   * Format phone number for Nepal
   * Ensures phone number starts with country code +977
   */
  private formatPhoneNumber(phone: string): string {
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    
    // Remove any leading zeros
    formattedPhone = formattedPhone.replace(/^0+/, '');
    
    // If it starts with +977, remove it (Sociairsms expects just the number)
    if (formattedPhone.startsWith('+977')) {
      formattedPhone = formattedPhone.substring(4);
    } else if (formattedPhone.startsWith('977')) {
      formattedPhone = formattedPhone.substring(3);
    }
    
    return formattedPhone;
  }

  /**
   * Generate welcome SMS message
   */
  private generateWelcomeSMS(data: WelcomeSMSData): string {
    const appName = process.env.APP_NAME || 'LMS';
    
    // Extract first name from full name
    const firstName = data.name.split(' ')[0];
    
    const message = `Dear ${firstName},

You have been successfully enrolled!

Symbol No: ${data.symbolNo}
Password: ${data.tempPassword}
Login URL: ${data.loginUrl}

// Please change your password after first login.

// - Free Education In Nepal Campaign`;

    return message;
  }

  /**
   * Check SMS service balance
   */
  async checkBalance(): Promise<SMSResponse> {
    if (!this.client) {
      return {
        success: false,
        message: 'SMS service not configured'
      };
    }

    try {
      const response = await this.client.get<SociairBalanceResponse>('/balance');
      
      console.log('📊 SMS Balance:', {
        balance: response.data.balance,
        ntc_rate: response.data.ntc_rate,
        ncell_rate: response.data.ncell_rate,
        smartcell_rate: response.data.smartcell_rate
      });

      return {
        success: true,
        message: 'Balance retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ Failed to check SMS balance:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check balance'
      };
    }
  }

  /**
   * Send SMS to single or multiple numbers
   */
  async sendSMS(phone: string | string[], message: string): Promise<SMSResponse> {
    if (!this.client) {
      return {
        success: false,
        message: 'SMS service not configured'
      };
    }

    try {
      // Format phone numbers
      let formattedPhones: string;
      
      if (Array.isArray(phone)) {
        formattedPhones = phone.map(p => this.formatPhoneNumber(p)).join(',');
      } else {
        formattedPhones = this.formatPhoneNumber(phone);
      }

      const response = await this.client.post<SociairSMSResponse>('/sms', {
        message: message,
        mobile: formattedPhones
      });

      // Check if there are invalid numbers
      if (response.data.invalid_number && response.data.invalid_number.length > 0) {
        console.warn('⚠️ Some numbers are invalid:', response.data.invalid_number);
        return {
          success: false,
          message: 'Some phone numbers are invalid',
          data: response.data
        };
      }

      console.log(`✅ SMS sent successfully to: ${formattedPhones}`);
      
      return {
        success: true,
        message: 'SMS sent successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Send welcome SMS to newly created user
   */
  async sendWelcomeSMS(data: WelcomeSMSData): Promise<SMSResponse> {
    if (!this.client) {
      return {
        success: false,
        message: 'SMS service not configured'
      };
    }

    if (!data.phone) {
      return {
        success: false,
        message: 'No phone number provided'
      };
    }

    const smsContent = this.generateWelcomeSMS(data);
    return await this.sendSMS(data.phone, smsContent);
  }

  /**
   * Test SMS service connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const result = await this.checkBalance();
      return result.success;
    } catch (error) {
      console.error('SMS connection test failed:', error);
      return false;
    }
  }

  /**
   * Check if SMS service is configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }
}

// Export singleton instance
export const smsService = new SMSService();
