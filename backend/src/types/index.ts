import { Request } from 'express';

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: string;
  userId: string; // Same as id, for backward compatibility
  name: string;
  email: string;
  phone?: string;
  role: Role;
  verified: boolean;
  isActive: boolean;
  sessionId?: string;
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
  identifier?: string; // Student portal uses this
  emailOrPhone?: string; // Admin/legacy uses this
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

// Batch & Graduation System Types
export type BatchStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'GRADUATED' | 'ARCHIVED';

export interface BatchData {
  name: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  status?: BatchStatus;
  createdById: string;
}

export interface UpdateBatchData {
  name?: string;
  description?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: BatchStatus;
}

export interface BatchFilters extends QueryFilters {
  status?: BatchStatus;
  startDate?: Date;
  endDate?: Date;
  createdById?: string;
}

export interface AttachClassToBatchData {
  classId: string;
  sequence: number;
}

export interface BatchStatistics {
  totalStudents: number;
  totalEnrollments: number;
  completedEnrollments: number;
  activeEnrollments: number;
  totalGraduations: number;
  averageAttendance: number;
  completionRate: number;
  passRate: number;
  classesBySequence: Array<{
    sequence: number;
    className: string;
    enrollmentCount: number;
    completedCount: number;
  }>;
}

export interface ClassEnrollmentData {
  studentId: string;
  classId: string;
  batchId: string;
  enrolledById: string;
  status?: string;
  remarks?: string;
}

export interface BulkEnrollmentData {
  enrollments: ClassEnrollmentData[];
}

export interface UpdateEnrollmentData {
  status?: string;
  finalGrade?: string;
  attendance?: number;
  remarks?: string;
}

export interface MarkCompletedData {
  completedAt: Date | string;
  finalGrade: string;
  attendance?: number;
}

export interface PromoteStudentData {
  targetClassId: string;
}

export interface EnrollmentFilters extends QueryFilters {
  studentId?: string;
  classId?: string;
  batchId?: string;
  status?: string;
  enrolledById?: string;
}

export interface GraduationData {
  studentId: string;
  batchId: string;
  graduationDate: Date | string;
  remarks?: string;
  issuedById: string;
}

export interface GraduateBatchData {
  graduationDate: Date | string;
  remarks?: string;
}

export interface UpdateGraduationData {
  graduationDate?: Date | string;
  certificateNumber?: string;
  certificateUrl?: string;
  gpa?: number;
  honors?: string;
  remarks?: string;
}

export interface AttachCertificateData {
  certificateUrl: string;
}

export interface GraduationFilters extends QueryFilters {
  studentId?: string;
  batchId?: string;
  issuedById?: string;
  startDate?: Date;
  endDate?: Date;
  hasHonors?: boolean;
}

export interface GraduationStatistics {
  totalGraduations: number;
  graduationsByBatch: Array<{
    batchId: string;
    batchName: string;
    graduationCount: number;
  }>;
  averageGpa: number;
  honorsDistribution: {
    distinction: number;
    firstClass: number;
    secondClass: number;
    none: number;
  };
  graduationsByYear: Array<{
    year: number;
    count: number;
  }>;
}

export * from '@prisma/client';