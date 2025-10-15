import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  verified: boolean;
  isActive: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface FileUploadResult {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

export interface SMSOptions {
  to: string;
  message: string;
}

export interface PushNotificationOptions {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone?: string;
  symbolNo?: string;
  role: Role;
  password: string;
  profileImage?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  verified?: boolean;
  isActive?: boolean;
}

export interface LoginCredentials {
  emailOrPhone: string;
  password: string;
}

export interface RegisterData extends CreateUserData {
  confirmPassword: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LiveClassData {
  title: string;
  description?: string;
  subjectId: string;
  classId: string;
  youtubeUrl?: string;
  meetingLink?: string;
  startTime: Date;
  endTime: Date;
  maxStudents?: number;
}

export interface MaterialData {
  title: string;
  description?: string;
  subjectId: string;
  type: string;
  chapter?: string;
  isPublic?: boolean;
}

export interface NoticeData {
  title: string;
  content: string;
  category: string;
  priority: string;
  classId?: string;
  expiresAt?: Date;
}

export interface ExamData {
  title: string;
  description?: string;
  subjectId: string;
  classId?: string;
  type: string;
  examLink?: string;
  startTime: Date;
  endTime: Date;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  instructions?: string;
}

export interface ResultData {
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  totalMarks: number;
  remarks?: string;
}

export interface QueryFilters {
  search?: string;
  role?: Role;
  classId?: string;
  subjectId?: string;
  status?: string;
  category?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  isPublished?: boolean;
}

export interface AnalyticsData {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  totalMaterials: number;
  totalNotices: number;
  totalExams: number;
  activeUsers: number;
  recentActivity: any[];
}

export interface AttendanceReport {
  studentId: string;
  studentName: string;
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  missedClasses: number;
}

export interface PerformanceReport {
  studentId: string;
  studentName: string;
  subjectWiseMarks: Array<{
    subjectId: string;
    subjectName: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
  }>;
  overallPercentage: number;
  overallGrade: string;
}

export * from '@prisma/client';