import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { secureLog } from '../utils/logger';

const prisma = new PrismaClient();

export interface AuditLogData {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress: string;
  userAgent?: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  requestId?: string;
}

/**
 * Audit logging middleware - logs all API requests
 */
export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Generate or use existing request ID
  const requestId = (req as any).id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = requestId;
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to capture response
  res.end = function(this: Response, chunk?: any, encoding?: any, callback?: any) {
    const duration = Date.now() - startTime;
    
    // Prepare audit log data
    const auditData: AuditLogData = {
      userId: (req as any).user?.userId,
      action: `${req.method} ${req.path}`,
      resource: extractResourceFromPath(req.path),
      resourceId: extractResourceId(req),
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      requestId
    };
    
    // Log to database asynchronously (don't block response)
    saveAuditLog(auditData).catch(err => {
      secureLog.error('Failed to save audit log', err);
    });
    
    // Log security-relevant events
    if (shouldLogSecurityEvent(req, res.statusCode)) {
      secureLog.warn('Security event detected', {
        requestId,
        userId: auditData.userId,
        action: auditData.action,
        statusCode: res.statusCode,
        ipAddress: auditData.ipAddress
      });
    }
    
    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  } as any;
  
  next();
};

/**
 * Save audit log to database
 */
async function saveAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.$executeRaw`
      INSERT INTO "AuditLog" (
        "userId", "action", "resource", "resourceId", 
        "ipAddress", "userAgent", "method", "path",
        "statusCode", "duration", "requestId", "timestamp"
      ) VALUES (
        ${data.userId || null},
        ${data.action},
        ${data.resource || null},
        ${data.resourceId || null},
        ${data.ipAddress},
        ${data.userAgent || null},
        ${data.method},
        ${data.path},
        ${data.statusCode},
        ${data.duration},
        ${data.requestId || null},
        NOW()
      )
    `;
  } catch (error) {
    // If audit log table doesn't exist, just log to console
    secureLog.debug('Audit log save failed (table may not exist)', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Extract resource type from URL path
 */
function extractResourceFromPath(path: string): string | undefined {
  const match = path.match(/\/api\/v\d+\/([^\/]+)/);
  return match ? match[1] : undefined;
}

/**
 * Extract resource ID from request
 */
function extractResourceId(req: Request): string | undefined {
  // Try to get ID from params
  if (req.params.id) return req.params.id;
  
  // Try to get ID from URL
  const match = req.path.match(/\/([a-zA-Z0-9-_]{20,})\/?$/);
  return match ? match[1] : undefined;
}

/**
 * Determine if event should trigger security alert
 */
function shouldLogSecurityEvent(req: Request, statusCode: number): boolean {
  // Log failed authentication attempts
  if (statusCode === 401 && req.path.includes('auth')) {
    return true;
  }
  
  // Log forbidden access attempts
  if (statusCode === 403) {
    return true;
  }
  
  // Log rate limit violations
  if (statusCode === 429) {
    return true;
  }
  
  // Log suspicious patterns
  if (req.path.includes('..') || req.path.includes('etc/passwd')) {
    return true;
  }
  
  return false;
}

/**
 * Log specific security events
 */
export const logSecurityEvent = async (
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PASSWORD_RESET' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY',
  req: Request,
  details?: any
) => {
  const data: AuditLogData = {
    userId: (req as any).user?.userId,
    action: type,
    ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'],
    method: req.method,
    path: req.path,
    statusCode: 0,
    duration: 0,
    requestId: (req as any).id
  };
  
  await saveAuditLog(data);
  
  secureLog.warn(`Security event: ${type}`, {
    ...data,
    details
  });
};
