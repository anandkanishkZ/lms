export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  symbolNo?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  profileImage?: string;
  verified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginData {
  emailOrPhone: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role?: 'STUDENT' | 'TEACHER';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
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

export interface DashboardStats {
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

export interface LiveClass {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  youtubeUrl?: string;
  meetingLink?: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  isRecorded: boolean;
  recordingUrl?: string;
  maxStudents?: number;
  createdAt: string;
  updatedAt: string;
  subject: {
    id: string;
    name: string;
    color?: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
    section?: string;
  };
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  type: 'PDF' | 'DOCX' | 'PPT' | 'VIDEO' | 'LINK' | 'IMAGE';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  chapter?: string;
  teacherId: string;
  isPublic: boolean;
  downloadCount: number;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  subject: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'EXAM' | 'EVENT' | 'HOLIDAY' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachmentUrl?: string;
  classId?: string;
  publishedBy: string;
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: string;
    name: string;
    section?: string;
  };
  publishedByUser: {
    id: string;
    name: string;
  };
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  classId?: string;
  type: 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  examLink?: string;
  startTime: string;
  endTime: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  instructions?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  subject: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
    section?: string;
  };
  createdByUser: {
    id: string;
    name: string;
  };
}

export interface Result {
  id: string;
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  totalMarks: number;
  percentage: number;
  grade?: 'A_PLUS' | 'A' | 'B_PLUS' | 'B' | 'C_PLUS' | 'C' | 'D' | 'F';
  remarks?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
  };
  exam: {
    id: string;
    title: string;
  };
  subject: {
    id: string;
    name: string;
  };
}

export interface Notification {
  id: string;
  senderId?: string;
  receiverId: string;
  title: string;
  message: string;
  type: 'LIVE_CLASS' | 'EXAM' | 'NOTICE' | 'RESULT' | 'MATERIAL' | 'MESSAGE' | 'GENERAL';
  data?: any;
  isRead: boolean;
  readAt?: string;
  sentAt: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
  };
}
