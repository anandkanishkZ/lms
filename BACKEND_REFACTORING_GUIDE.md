# 🔧 Backend Refactoring Implementation Guide

**Project:** Smart School Management System - Backend  
**Target:** Transform MVC to Clean Architecture with proper layers  
**Timeline:** 3-4 weeks  
**Priority:** 🚨 CRITICAL

---

## 📋 Current Architecture Issues

### 🔴 Problem 1: Fat Controllers
```typescript
// adminAuthController.ts - 427 lines!
// Contains:
// - Business logic
// - Database queries
// - Validation
// - Response formatting
// - Error handling
```

### 🔴 Problem 2: Empty Services Layer
```
backend/src/services/ → EMPTY!
```

### 🔴 Problem 3: Empty Models Layer
```
backend/src/models/ → EMPTY!
```

### 🔴 Problem 4: Direct Prisma Calls Everywhere
```typescript
// In controllers:
const user = await prisma.user.findFirst({ ... });
const classes = await prisma.class.findMany({ ... });
// Scattered across all controllers
```

---

## ✅ Target Architecture: Clean Architecture

```
backend/src/
├── controllers/         # HTTP Layer (thin)
│   ├── admin/
│   └── api/
├── services/           # Business Logic Layer
│   ├── auth/
│   ├── user/
│   └── ...
├── repositories/       # Data Access Layer
│   ├── user.repository.ts
│   └── ...
├── models/            # Domain Models
│   ├── entities/
│   └── interfaces/
├── middlewares/       # Cross-cutting concerns
├── utils/             # Utilities
├── errors/            # Custom errors
├── config/            # Configuration
└── types/             # TypeScript types
```

---

## 🔄 Step-by-Step Implementation

### Phase 1: Foundation (Week 1)

#### Step 1.1: Create Error Classes

**File: `backend/src/errors/AppError.ts`**
```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**File: `backend/src/errors/ValidationError.ts`**
```typescript
import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, 400, true, code);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
```

**File: `backend/src/errors/AuthenticationError.ts`**
```typescript
import { AppError } from './AppError';

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', code: string = 'AUTH_ERROR') {
    super(message, 401, true, code);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}
```

**File: `backend/src/errors/AuthorizationError.ts`**
```typescript
import { AppError } from './AppError';

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', code: string = 'FORBIDDEN') {
    super(message, 403, true, code);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}
```

**File: `backend/src/errors/NotFoundError.ts`**
```typescript
import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', code: string = 'NOT_FOUND') {
    super(`${resource} not found`, 404, true, code);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
```

**File: `backend/src/errors/index.ts`**
```typescript
export * from './AppError';
export * from './ValidationError';
export * from './AuthenticationError';
export * from './AuthorizationError';
export * from './NotFoundError';
```

#### Step 1.2: Create Response Utilities

**File: `backend/src/utils/response.util.ts`**
```typescript
import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp?: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    error?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
      code,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message?: string
  ): Response {
    return this.success(
      res,
      data,
      message,
      200,
      { pagination }
    );
  }
}
```

#### Step 1.3: Create Logger

**File: `backend/src/utils/logger.util.ts`**
```typescript
import winston from 'winston';
import path from 'path';

const logDir = 'logs';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

// If not in production, log to console too
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
```

**Install Winston:**
```bash
npm install winston
npm install -D @types/winston
```

#### Step 1.4: Create Repository Base Class

**File: `backend/src/repositories/base.repository.ts`**
```typescript
import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected model: any;

  constructor(prisma: PrismaClient, model: any) {
    this.prisma = prisma;
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
    });
  }

  async findMany(options?: any): Promise<T[]> {
    return this.model.findMany(options);
  }

  async create(data: any): Promise<T> {
    return this.model.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }
}
```

#### Step 1.5: Create User Repository

**File: `backend/src/repositories/user.repository.ts`**
```typescript
import { PrismaClient, User, Role } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CreateUserData {
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  symbolNo?: string;
  school?: string;
  department?: string;
  experience?: string;
  role: Role;
  password: string;
  profileImage?: string;
}

export interface UpdateUserData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  verified?: boolean;
}

export interface UserFilters {
  role?: Role;
  isActive?: boolean;
  verified?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.model.findUnique({
      where: { phone },
    });
  }

  async findBySymbolNo(symbolNo: string): Promise<User | null> {
    return this.model.findUnique({
      where: { symbolNo },
    });
  }

  async findByRole(role: Role): Promise<User[]> {
    return this.model.findMany({
      where: { role },
    });
  }

  async findWithFilters(
    filters: UserFilters,
    pagination: PaginationOptions
  ): Promise<{ users: User[]; total: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { symbolNo: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.model.count({ where }),
    ]);

    return { users, total };
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.model.create({
      data,
    });
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async blockUser(id: string, reason: string, blockedBy: string): Promise<User> {
    return this.model.update({
      where: { id },
      data: {
        isBlocked: true,
        blockReason: reason,
        blockedBy,
        blockedAt: new Date(),
      },
    });
  }

  async unblockUser(id: string): Promise<User> {
    return this.model.update({
      where: { id },
      data: {
        isBlocked: false,
        blockReason: null,
        blockedBy: null,
        blockedAt: null,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.model.update({
      where: { id },
      data: {
        lastLogin: new Date(),
        loginAttempts: 0,
        lockoutUntil: null,
      },
    });
  }

  async incrementLoginAttempts(id: string): Promise<User> {
    return this.model.update({
      where: { id },
      data: {
        loginAttempts: { increment: 1 },
      },
    });
  }

  async lockUser(id: string, lockoutUntil: Date): Promise<User> {
    return this.model.update({
      where: { id },
      data: {
        lockoutUntil,
      },
    });
  }

  async deleteUser(id: string): Promise<User> {
    return this.model.delete({
      where: { id },
    });
  }
}
```

#### Step 1.6: Create Auth Service

**File: `backend/src/services/auth/auth.service.ts`**
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';
import { UserRepository } from '../../repositories/user.repository';
import { 
  AuthenticationError, 
  ValidationError, 
  NotFoundError 
} from '../../errors';
import logger from '../../utils/logger.util';

export interface LoginCredentials {
  email?: string;
  phone?: string;
  symbolNo?: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email?: string;
  role: Role;
  sessionId?: string;
}

export interface LoginResult {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY: string;
  private readonly REFRESH_TOKEN_EXPIRY: string;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(private userRepository: UserRepository) {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    this.ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRY || '1h';
    this.REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  async login(
    credentials: LoginCredentials,
    role?: Role
  ): Promise<LoginResult> {
    // Validate credentials
    this.validateLoginCredentials(credentials);

    // Find user
    const user = await this.findUserByCredentials(credentials);

    if (!user) {
      logger.warn('Login attempt with invalid credentials', { credentials });
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if user is locked out
    await this.checkLockout(user);

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password!
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if user has required role
    if (role && user.role !== role) {
      logger.warn('Login attempt with wrong role', { 
        userId: user.id, 
        expectedRole: role, 
        actualRole: user.role 
      });
      throw new AuthenticationError('Access denied');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is inactive');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new AuthenticationError(
        `Account is blocked. Reason: ${user.blockReason || 'Contact administrator'}`
      );
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.info('User logged in successfully', { 
      userId: user.id, 
      role: user.role 
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = jwt.verify(
        refreshToken,
        this.JWT_REFRESH_SECRET
      ) as TokenPayload;

      const user = await this.userRepository.findById(payload.userId);

      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid refresh token');
      }

      return this.generateAccessToken(user);
    } catch (error) {
      logger.error('Refresh token validation failed', { error });
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      return payload;
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password!);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid old password');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.userRepository.updateUser(userId, {
      password: hashedPassword,
    });

    logger.info('Password changed successfully', { userId });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private validateLoginCredentials(credentials: LoginCredentials): void {
    if (!credentials.password) {
      throw new ValidationError('Password is required');
    }

    const hasIdentifier = credentials.email || credentials.phone || credentials.symbolNo;

    if (!hasIdentifier) {
      throw new ValidationError('Email, phone, or symbol number is required');
    }
  }

  private async findUserByCredentials(
    credentials: LoginCredentials
  ): Promise<User | null> {
    if (credentials.email) {
      return this.userRepository.findByEmail(credentials.email);
    }

    if (credentials.phone) {
      return this.userRepository.findByPhone(credentials.phone);
    }

    if (credentials.symbolNo) {
      return this.userRepository.findBySymbolNo(credentials.symbolNo);
    }

    return null;
  }

  private async checkLockout(user: User): Promise<void> {
    if (user.lockoutUntil && new Date() < user.lockoutUntil) {
      const remainingTime = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / 1000 / 60
      );
      throw new AuthenticationError(
        `Account is locked. Try again in ${remainingTime} minutes`
      );
    }
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const updatedUser = await this.userRepository.incrementLoginAttempts(user.id);

    if (updatedUser.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
      await this.userRepository.lockUser(user.id, lockoutUntil);
      
      logger.warn('User account locked due to failed login attempts', { 
        userId: user.id 
      });
      
      throw new AuthenticationError(
        'Too many failed login attempts. Account locked for 15 minutes'
      );
    }
  }

  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email || undefined,
      role: user.role,
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email || undefined,
      role: user.role,
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }
}
```

#### Step 1.7: Create User Service

**File: `backend/src/services/user/user.service.ts`**
```typescript
import { User, Role } from '@prisma/client';
import { 
  UserRepository, 
  CreateUserData, 
  UpdateUserData, 
  UserFilters,
  PaginationOptions 
} from '../../repositories/user.repository';
import { AuthService } from '../auth/auth.service';
import { 
  ValidationError, 
  NotFoundError, 
  AuthorizationError 
} from '../../errors';
import logger from '../../utils/logger.util';

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  school: string;
  classSection?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface CreateTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  experience?: string;
}

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService
  ) {}

  async getUserById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUsers(
    filters: UserFilters,
    pagination: PaginationOptions
  ): Promise<{ users: Omit<User, 'password'>[]; total: number; totalPages: number }> {
    const { users, total } = await this.userRepository.findWithFilters(
      filters,
      pagination
    );

    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return {
      users: usersWithoutPassword,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async createStudent(data: CreateStudentData): Promise<Omit<User, 'password'>> {
    // Validate email uniqueness if provided
    if (data.email) {
      await this.checkEmailUnique(data.email);
    }

    // Validate phone uniqueness if provided
    if (data.phone) {
      await this.checkPhoneUnique(data.phone);
    }

    // Generate symbol number
    const symbolNo = await this.generateSymbolNumber();

    // Generate temporary password
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await this.authService.hashPassword(tempPassword);

    const userData: CreateUserData = {
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      symbolNo,
      school: data.school,
      role: Role.STUDENT,
      password: hashedPassword,
    };

    const user = await this.userRepository.createUser(userData);

    logger.info('Student created', { userId: user.id, symbolNo });

    // TODO: Send welcome email/SMS with credentials

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createTeacher(data: CreateTeacherData): Promise<Omit<User, 'password'>> {
    // Validate email uniqueness
    await this.checkEmailUnique(data.email);

    // Validate phone uniqueness
    await this.checkPhoneUnique(data.phone);

    // Generate temporary password
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await this.authService.hashPassword(tempPassword);

    const userData: CreateUserData = {
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      department: data.department,
      experience: data.experience,
      role: Role.TEACHER,
      password: hashedPassword,
    };

    const user = await this.userRepository.createUser(userData);

    logger.info('Teacher created', { userId: user.id });

    // TODO: Send welcome email with credentials

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    id: string,
    data: UpdateUserData
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Validate email uniqueness if changing email
    if (data.email && data.email !== user.email) {
      await this.checkEmailUnique(data.email);
    }

    const updatedUser = await this.userRepository.updateUser(id, data);

    logger.info('User updated', { userId: id });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async blockUser(
    id: string,
    reason: string,
    blockedBy: string
  ): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role === Role.ADMIN) {
      throw new AuthorizationError('Cannot block admin users');
    }

    await this.userRepository.blockUser(id, reason, blockedBy);

    logger.info('User blocked', { userId: id, reason, blockedBy });
  }

  async unblockUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    await this.userRepository.unblockUser(id);

    logger.info('User unblocked', { userId: id });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role === Role.ADMIN) {
      throw new AuthorizationError('Cannot delete admin users');
    }

    await this.userRepository.deleteUser(id);

    logger.info('User deleted', { userId: id });
  }

  private async checkEmailUnique(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }
  }

  private async checkPhoneUnique(phone: string): Promise<void> {
    const existingUser = await this.userRepository.findByPhone(phone);
    if (existingUser) {
      throw new ValidationError('Phone number already exists');
    }
  }

  private async generateSymbolNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.userRepository.count({ role: Role.STUDENT });
    return `${year}${String(count + 1).padStart(5, '0')}`;
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
```

#### Step 1.8: Refactor Controller (Make it Thin)

**File: `backend/src/controllers/admin/adminAuthController.ts`**
```typescript
import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseUtil } from '../../utils/response.util';
import { AuthService } from '../../services/auth/auth.service';
import { asyncHandler } from '../../middlewares/errorHandler';
import { Role } from '@prisma/client';

export class AdminAuthController {
  constructor(private authService: AuthService) {}

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password, rememberMe = false } = req.body;

    const result = await this.authService.login(
      { email, password },
      Role.ADMIN
    );

    return ResponseUtil.success(
      res,
      result,
      'Login successful',
      200
    );
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Handle session cleanup if needed
    
    return ResponseUtil.success(
      res,
      undefined,
      'Logout successful'
    );
  });

  refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;

    const accessToken = await this.authService.refreshAccessToken(refreshToken);

    return ResponseUtil.success(
      res,
      { accessToken },
      'Token refreshed successfully'
    );
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return ResponseUtil.error(res, 'User not found', 404);
    }

    // You could use UserService here to get full profile
    const user = req.user;

    return ResponseUtil.success(
      res,
      user,
      'Profile retrieved successfully'
    );
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return ResponseUtil.error(res, 'User not found', 404);
    }

    await this.authService.changePassword(userId, oldPassword, newPassword);

    return ResponseUtil.success(
      res,
      undefined,
      'Password changed successfully'
    );
  });
}
```

#### Step 1.9: Dependency Injection Setup

**File: `backend/src/container.ts`**
```typescript
import { PrismaClient } from '@prisma/client';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { AdminAuthController } from './controllers/admin/adminAuthController';
import { AdminUserController } from './controllers/admin/adminUserController';

export class Container {
  private static instance: Container;
  
  public prisma: PrismaClient;
  
  // Repositories
  public userRepository: UserRepository;
  
  // Services
  public authService: AuthService;
  public userService: UserService;
  
  // Controllers
  public adminAuthController: AdminAuthController;
  public adminUserController: AdminUserController;

  private constructor() {
    // Initialize Prisma
    this.prisma = new PrismaClient();

    // Initialize Repositories
    this.userRepository = new UserRepository(this.prisma);

    // Initialize Services
    this.authService = new AuthService(this.userRepository);
    this.userService = new UserService(this.userRepository, this.authService);

    // Initialize Controllers
    this.adminAuthController = new AdminAuthController(this.authService);
    this.adminUserController = new AdminUserController(this.userService);
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
```

#### Step 1.10: Update Routes

**File: `backend/src/routes/admin/auth.ts`**
```typescript
import express from 'express';
import { Container } from '../../container';
import { authenticateAdmin } from '../../middlewares/adminAuth';

const router = express.Router();
const container = Container.getInstance();
const controller = container.adminAuthController;

// Public routes
router.post('/login', controller.login);
router.post('/refresh-token', controller.refreshToken);

// Protected routes
router.use(authenticateAdmin);
router.post('/logout', controller.logout);
router.get('/profile', controller.getProfile);
router.post('/change-password', controller.changePassword);

export default router;
```

---

## ✅ Benefits After Refactoring

### Before (Fat Controller):
```typescript
// adminAuthController.ts - 427 lines
export const adminLogin = async (req, res) => {
  // Validation logic (50 lines)
  // Database queries (30 lines)
  // Business logic (100 lines)
  // Error handling (50 lines)
  // Response formatting (20 lines)
  // ...
}
```

### After (Clean Architecture):
```typescript
// Controller - 10 lines
export class AdminAuthController {
  login = asyncHandler(async (req, res) => {
    const result = await this.authService.login(...);
    return ResponseUtil.success(res, result);
  });
}

// Service - Business logic
export class AuthService {
  async login(...) {
    // All business logic here
  }
}

// Repository - Data access
export class UserRepository {
  async findByEmail(...) {
    // Database operations
  }
}
```

---

## 📋 Migration Checklist

### Week 1: Foundation
- [ ] Create error classes
- [ ] Create response utilities
- [ ] Set up logger (Winston)
- [ ] Create base repository
- [ ] Create user repository
- [ ] Install winston

### Week 2: Services
- [ ] Create auth service
- [ ] Create user service
- [ ] Create dependency injection container
- [ ] Refactor admin auth controller
- [ ] Refactor admin user controller
- [ ] Update routes to use controllers from container

### Week 3: Additional Features
- [ ] Create exam service
- [ ] Create material service
- [ ] Create notification service
- [ ] Create email service
- [ ] Refactor remaining controllers

### Week 4: Testing & Documentation
- [ ] Write unit tests for services
- [ ] Write integration tests
- [ ] Add API documentation (Swagger)
- [ ] Add JSDoc comments
- [ ] Performance testing

---

## 🚀 Next Steps

1. Start with error classes and utilities
2. Create repositories layer
3. Create services layer
4. Refactor controllers to be thin
5. Add comprehensive testing
6. Document everything

---

**Remember:** This refactoring will make your codebase **testable**, **maintainable**, and **scalable**!
