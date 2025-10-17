// Admin Feature - Public API
// This file exports everything that other parts of the application can use from the admin feature

// ==================== Components ====================
export { default as AdminLayout } from './components/layout/AdminLayout';
export { default as AdminSidebar } from './components/layout/AdminSidebar';
export { default as AdminHeader } from './components/layout/AdminHeader';
export { default as StatsCard } from './components/dashboard/StatsCard';
export { default as ActivityFeed } from './components/dashboard/ActivityFeed';
export { default as QuickActions } from './components/dashboard/QuickActions';
export * from './components/dashboard/Charts';

// ==================== Hooks ====================
export { useAdminAuth } from './hooks/useAdminAuth';
export { useUsers, useUserDetail, useUserAuditTrail } from './hooks/useUsers';
export { useAdminStats } from './hooks/useAdminStats';

// ==================== Services ====================
export { adminApiService } from './services/admin-api.service';

// ==================== Store ====================
export { useAdminAuthStore } from './store/admin-auth.store';

// ==================== Types ====================
export type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  AdminUser,
  CreateStudentData,
  CreateTeacherData,
  GetUsersParams,
  UserItem,
  UsersListResponse,
  UpdateUserData,
  BlockUserData,
  AuditTrailResponse,
  AuditTrailItem,
  Pagination,
} from './types';
