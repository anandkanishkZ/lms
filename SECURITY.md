# 🔐 Security Implementation Guide

## Overview

This document outlines all security measures implemented in the LMS application to protect against common web vulnerabilities and attacks.

---

## ✅ Implemented Security Features

### 1. **HTTPS Enforcement**

**Location:** `backend/src/server.ts`

**Implementation:**
- Automatic HTTP to HTTPS redirect in production
- Strict Transport Security (HSTS) headers with 1-year max-age
- Includes subdomains and preload directive

**Configuration:**
```typescript
if (process.env.NODE_ENV === 'production') {
  // Force HTTPS redirect
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

---

### 2. **Comprehensive Security Headers**

**Location:** `backend/src/server.ts`, `frontend/next.config.js`

**Headers Implemented:**
- **Content-Security-Policy:** Restricts resource loading
- **X-Frame-Options:** Prevents clickjacking (DENY)
- **X-Content-Type-Options:** Prevents MIME sniffing (nosniff)
- **X-XSS-Protection:** Enables browser XSS filter
- **Strict-Transport-Security:** Enforces HTTPS
- **Referrer-Policy:** Controls referrer information
- **Permissions-Policy:** Restricts browser features

---

### 3. **Input Validation**

**Location:** `backend/src/middlewares/validator.ts`

**Features:**
- Email validation and normalization
- Password complexity requirements (8+ chars, uppercase, lowercase, numbers, special characters)
- Common password detection
- Input length limits
- XSS prevention through escaping
- Path traversal prevention

**Usage:**
```typescript
import { validateLogin, validateRegistration } from './middlewares/validator';

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
```

---

### 4. **XSS Protection**

**Location:** `frontend/src/utils/sanitize.ts`

**Implementation:**
- DOMPurify for HTML sanitization
- Whitelist-based approach for allowed tags and attributes
- URL sanitization to block javascript: and data: protocols
- Applied to all user-generated content, especially Rich Text Editor

**Usage:**
```typescript
import { sanitizeHTML } from '@/utils/sanitize';

const sanitizedContent = sanitizeHTML(userInput);
```

---

### 5. **Secure File Uploads**

**Location:** `backend/src/config/upload.config.ts`

**Security Measures:**
- File type validation (MIME type + extension)
- File signature (magic number) verification
- Cryptographically secure filename generation
- File size limits (2MB avatars, 10MB documents)
- Path traversal prevention
- Separate directories for different file types

**Features:**
- Validates file signatures match MIME types
- Prevents disguised files
- Automatic file deletion on validation failure

---

### 6. **Password Security**

**Implementation:**
- Bcrypt hashing with salt rounds
- Password complexity requirements
- Common password blocking
- Secure password reset tokens (SHA-256 hashed)
- Token expiration (1 hour)
- Timing-safe comparison for token verification

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Not in common passwords list

---

### 7. **Secure Logging**

**Location:** `backend/src/utils/logger.ts`

**Features:**
- Automatic redaction of sensitive fields (passwords, tokens, API keys)
- Winston logger with file rotation
- Separate error and combined logs
- Log file size limits (5MB per file, 5 files retained)
- Environment-based log levels

**Redacted Fields:**
- password, token, secret, apiKey, creditCard, ssn, authorization, etc.

---

### 8. **Audit Logging**

**Location:** `backend/src/middlewares/auditLog.ts`

**Tracks:**
- User ID and IP address
- HTTP method and path
- Status code and response time
- User agent and request ID
- Timestamp

**Security Events Logged:**
- Failed authentication attempts (401)
- Permission denied (403)
- Rate limit violations (429)
- Suspicious patterns (path traversal attempts)

**Database Schema:**
```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  userId TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  resourceId TEXT,
  ipAddress TEXT NOT NULL,
  userAgent TEXT,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  statusCode INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  requestId TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

### 9. **Rate Limiting**

**Location:** `backend/src/middlewares/rateLimiter.ts`, `backend/src/server.ts`

**Layers:**
1. **Global API Rate Limiting:** 1000 requests per 15 minutes
2. **Development Rate Limiting:** 1000 requests per minute
3. **Notice Creation:** 20 notices per 15 minutes per user
4. **Notice Updates:** 30 updates per 5 minutes per user
5. **Notice API Calls:** 100 requests per minute per user

**Features:**
- User-based tracking (userId + IP fallback)
- Admin bypass for notice operations
- Proper rate limit headers (RateLimit-Limit, RateLimit-Remaining, Retry-After)
- Environment variable configuration

---

### 10. **Password Reset Security**

**Location:** `backend/src/services/passwordReset.service.ts`

**Implementation:**
- Cryptographically secure token generation (32 random bytes)
- SHA-256 hashing before database storage
- Timing-safe comparison to prevent timing attacks
- 1-hour token expiration
- One-time use tokens

---

### 11. **Request Size Limits**

**Location:** `backend/src/server.ts`

**Limits:**
- JSON body: 10MB
- URL-encoded body: 10MB
- Request entity monitoring middleware
- 413 (Payload Too Large) response for oversized requests

---

### 12. **CORS Configuration**

**Location:** `backend/src/server.ts`

**Settings:**
- Origin whitelist from environment variables
- Credentials support
- Specific HTTP methods allowed
- Controlled headers
- Preflight request handling

---

### 13. **Error Handling**

**Location:** `backend/src/server.ts`

**Implementation:**
- Global uncaught exception handler
- Unhandled promise rejection handler
- Graceful shutdown on SIGINT/SIGTERM
- No sensitive data in error responses
- Proper HTTP status codes

---

## 🚨 Security Best Practices

### Environment Variables

**CRITICAL - Never commit these to Git:**

```env
# Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="CHANGE_THIS_64_CHAR_RANDOM_STRING"
DATABASE_URL="postgresql://user:password@localhost:5432/db"
```

### Database Security

1. **Connection Pooling:** Configured via DATABASE_URL
2. **Prepared Statements:** Prisma uses parameterized queries by default
3. **Input Sanitization:** All user inputs validated before database operations

### Session Security

1. **JWT Tokens:** Stored in HTTP-only cookies (recommended) or secure storage
2. **Token Expiration:** 7 days default (configurable)
3. **Refresh Token Rotation:** Implement for enhanced security

### File Storage Security

1. **Separate Directories:** avatars/, documents/, images/
2. **Access Control:** Authenticated endpoints for sensitive files
3. **Public Access:** Only avatars directory served statically

---

## 📋 Security Checklist

Before deploying to production:

- [ ] Change all default secrets (JWT_SECRET, DATABASE_URL)
- [ ] Enable HTTPS/TLS certificates
- [ ] Configure CORS for production domains only
- [ ] Set NODE_ENV=production
- [ ] Review and adjust rate limiting for expected traffic
- [ ] Enable audit logging
- [ ] Set up log monitoring and alerting
- [ ] Configure backup and disaster recovery
- [ ] Run security vulnerability scan (npm audit)
- [ ] Test authentication and authorization
- [ ] Verify file upload restrictions
- [ ] Test XSS and CSRF protection
- [ ] Review security headers
- [ ] Document incident response plan

---

## 🔍 Monitoring & Alerts

### What to Monitor:

1. **Failed Login Attempts:** Multiple failures from same IP
2. **Rate Limit Violations:** Unusual spike in 429 responses
3. **403 Forbidden Responses:** Unauthorized access attempts
4. **File Upload Failures:** Potential malicious file uploads
5. **Unusual Traffic Patterns:** DDoS indicators
6. **Database Query Performance:** Potential SQL injection attempts
7. **Error Rates:** Sudden increase in 5xx errors

### Log Files:

- `logs/error.log` - Error-level logs only
- `logs/combined.log` - All logs
- `database: audit_logs table` - Security events

---

## 🛠️ Testing Security

### Manual Tests:

```bash
# Test rate limiting
for i in {1..1010}; do 
  curl http://localhost:5000/api/v1/health
done

# Test XSS protection
curl -X POST http://localhost:5000/api/v1/notices \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>","content":"test"}'

# Test file upload
curl -X POST http://localhost:5000/api/v1/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@malicious.exe"
```

### Automated Tests:

```bash
# Run security audit
npm audit

# Check for outdated packages
npm outdated

# Run linter
npm run lint
```

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25 Most Dangerous Software Weaknesses](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## 📞 Security Contact

For security vulnerabilities, contact: **security@freeeducationinnepal.com.np**

**Response Time:** Within 48 hours

---

**Last Updated:** December 6, 2025
**Version:** 1.0.0
