export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  verified: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface CreateStudentData {
  firstName: string;
  middleName?: string;
  lastName: string;
  school: string;
  phone?: string;
  email?: string;
}

export interface CreateTeacherData {
  firstName: string;
  middleName?: string;
  lastName: string;
  department: string;
  phone: string;
  email: string;
  experience?: string;
}

export interface GetUsersParams {
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserItem {
  id: string;
  name: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  symbolNo: string | null;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  school: string | null;
  department: string | null;
  experience: string | null;
  batchId: string | null;
  batch?: {
    id: string;
    name: string;
    status: string;
  } | null;
  verified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  blockReason: string | null;
  blockedAt: string | null;
  blockedBy: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsersListResponse {
  users: UserItem[];
  pagination: Pagination;
}

export interface UpdateUserData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  school?: string;
  department?: string;
  experience?: string;
}

export interface BlockUserData {
  reason: string;
  notes?: string;
}

export interface AuditTrailItem {
  id: string;
  action: string;
  entity: string | null;
  details: any;
  notes: string | null;
  timestamp: string;
  performedBy: AdminUser | null;
  ipAddress: string | null;
}

export interface AuditTrailResponse {
  user: AdminUser;
  auditTrail: AuditTrailItem[];
  pagination: Pagination;
}
