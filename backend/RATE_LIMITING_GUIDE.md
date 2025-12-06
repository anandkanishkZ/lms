# 🛡️ Rate Limiting Configuration Guide

## Overview

The LMS backend implements comprehensive rate limiting to protect against abuse, DDoS attacks, and spam. All rate limiting configurations are now **fully controllable via environment variables**.

---

## 📊 Rate Limiting Layers

### 1. **Global API Rate Limiting**

Protects all API endpoints from excessive requests.

#### Environment Variables:

**Production:**
```env
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes (in milliseconds)
RATE_LIMIT_MAX_REQUESTS=1000         # Max 1000 requests per 15 minutes per IP
```

**Development:**
```env
DEV_RATE_LIMIT_WINDOW_MS=60000       # 1 minute (in milliseconds)
DEV_RATE_LIMIT_MAX_REQUESTS=1000     # Max 1000 requests per minute (lenient)
```

#### Behavior:
- **Production:** Strict rate limiting applied
- **Development:** More lenient limits for testing
- **OPTIONS requests:** Automatically skipped (CORS preflight)

#### Response on Rate Limit:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later.",
  "error": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900
}
```

---

### 2. **Notice Creation Rate Limiting**

Prevents spam creation of notices by limiting how many notices a user can create.

#### Environment Variables:
```env
NOTICE_CREATION_WINDOW_MS=900000     # 15 minutes
NOTICE_CREATION_MAX_REQUESTS=20      # Max 20 notices per window per user
```

#### Features:
- ✅ **User-based tracking:** Uses `userId` from JWT token
- ✅ **IP fallback:** Uses IP address if user not authenticated
- ✅ **Admin bypass:** Admins are automatically exempted
- ✅ **Per-user limits:** Each user has independent quota

#### Response on Rate Limit:
```json
{
  "success": false,
  "message": "Too many notices created. Please try again after 15 minutes."
}
```

---

### 3. **Notice Update Rate Limiting**

Prevents excessive updates to notices.

#### Environment Variables:
```env
NOTICE_UPDATE_WINDOW_MS=300000       # 5 minutes
NOTICE_UPDATE_MAX_REQUESTS=30        # Max 30 updates per window per user
```

#### Features:
- ✅ User-based tracking with IP fallback
- ✅ Shorter window for more granular control
- ✅ Higher limit than creation (updates are less resource-intensive)

#### Response on Rate Limit:
```json
{
  "success": false,
  "message": "Too many update requests. Please try again later."
}
```

---

### 4. **Notice API Rate Limiting**

General protection for all notice-related API endpoints (read operations).

#### Environment Variables:
```env
NOTICE_API_WINDOW_MS=60000           # 1 minute
NOTICE_API_MAX_REQUESTS=100          # Max 100 requests per minute per user
```

#### Features:
- ✅ Shortest window for real-time protection
- ✅ Highest limit for read-heavy operations
- ✅ User-based tracking

#### Response on Rate Limit:
```json
{
  "success": false,
  "message": "Too many requests. Please slow down."
}
```

---

## 🚀 Production Recommendations

### Conservative Production Settings:

```env
# Global API (Stricter)
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100          # 100 requests per 15 min (strict)

# Notice Creation (Prevent spam)
NOTICE_CREATION_WINDOW_MS=900000     # 15 minutes
NOTICE_CREATION_MAX_REQUESTS=10      # Max 10 notices per 15 min

# Notice Updates
NOTICE_UPDATE_WINDOW_MS=300000       # 5 minutes
NOTICE_UPDATE_MAX_REQUESTS=20        # Max 20 updates per 5 min

# Notice API
NOTICE_API_WINDOW_MS=60000           # 1 minute
NOTICE_API_MAX_REQUESTS=100          # 100 requests per minute
```

### High-Traffic Production Settings:

```env
# Global API (Balanced)
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=500          # 500 requests per 15 min

# Notice Creation
NOTICE_CREATION_WINDOW_MS=600000     # 10 minutes
NOTICE_CREATION_MAX_REQUESTS=15      # Max 15 notices per 10 min

# Notice Updates
NOTICE_UPDATE_WINDOW_MS=300000       # 5 minutes
NOTICE_UPDATE_MAX_REQUESTS=30        # Max 30 updates per 5 min

# Notice API
NOTICE_API_WINDOW_MS=60000           # 1 minute
NOTICE_API_MAX_REQUESTS=200          # 200 requests per minute
```

---

## 📝 Configuration Examples

### Example 1: Development (Current Default)

```env
# .env (Development)
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
DEV_RATE_LIMIT_WINDOW_MS=60000
DEV_RATE_LIMIT_MAX_REQUESTS=1000
NOTICE_CREATION_MAX_REQUESTS=20
NOTICE_UPDATE_MAX_REQUESTS=30
NOTICE_API_MAX_REQUESTS=100
```

**Result:** Very lenient limits for development and testing.

---

### Example 2: Small Production Deployment

```env
# .env (Production - Small)
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
NOTICE_CREATION_WINDOW_MS=900000
NOTICE_CREATION_MAX_REQUESTS=10
NOTICE_UPDATE_WINDOW_MS=300000
NOTICE_UPDATE_MAX_REQUESTS=20
NOTICE_API_WINDOW_MS=60000
NOTICE_API_MAX_REQUESTS=100
```

**Result:** Moderate limits suitable for 100-1000 active users.

---

### Example 3: Large Production Deployment

```env
# .env (Production - Large)
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
NOTICE_CREATION_WINDOW_MS=600000
NOTICE_CREATION_MAX_REQUESTS=25
NOTICE_UPDATE_WINDOW_MS=300000
NOTICE_UPDATE_MAX_REQUESTS=50
NOTICE_API_WINDOW_MS=60000
NOTICE_API_MAX_REQUESTS=300
```

**Result:** Higher limits suitable for 1000+ active users.

---

## 🔍 Monitoring & Debugging

### Check Current Rate Limit Status

Rate limit headers are automatically included in responses:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1638360000
```

### Log Rate Limit Events

All rate limit violations are logged with:
- IP address
- User ID (if authenticated)
- Endpoint accessed
- Timestamp

### Testing Rate Limits

```bash
# Test global API rate limit
for i in {1..1010}; do 
  curl http://localhost:5000/api/v1/health
done

# Test notice creation rate limit (requires auth token)
for i in {1..25}; do 
  curl -X POST http://localhost:5000/api/v1/notices \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test","content":"Test"}'
done
```

---

## 🛠️ Customization Guide

### Adding a New Rate Limiter

1. **Define in `rateLimiter.ts`:**

```typescript
export const customLimiter = rateLimit({
  windowMs: parseInt(process.env.CUSTOM_WINDOW_MS || '60000'),
  max: parseInt(process.env.CUSTOM_MAX_REQUESTS || '50'),
  message: {
    success: false,
    message: 'Custom rate limit exceeded',
  },
  keyGenerator: (req: any) => req.user?.userId || req.ip,
});
```

2. **Add to `.env.example`:**

```env
CUSTOM_WINDOW_MS=60000
CUSTOM_MAX_REQUESTS=50
```

3. **Apply to routes:**

```typescript
import { customLimiter } from './middlewares/rateLimiter';

router.post('/custom-endpoint', customLimiter, yourController);
```

---

## 🎯 Best Practices

### ✅ DO:
- Use user-based rate limiting for authenticated endpoints
- Implement different limits for read vs write operations
- Bypass rate limits for admins when appropriate
- Monitor rate limit hits in production
- Adjust limits based on actual usage patterns
- Use shorter windows for write-heavy operations

### ❌ DON'T:
- Set limits too low (impacts user experience)
- Use only IP-based limiting for authenticated APIs
- Ignore rate limit violations in logs
- Use same limits for all endpoints
- Deploy without testing rate limits first

---

## 📊 Time Conversion Reference

```
1 second   = 1000 milliseconds
1 minute   = 60000 milliseconds
5 minutes  = 300000 milliseconds
10 minutes = 600000 milliseconds
15 minutes = 900000 milliseconds
1 hour     = 3600000 milliseconds
```

---

## 🆘 Troubleshooting

### Issue: Users hitting rate limits too often

**Solution:** Increase `MAX_REQUESTS` or `WINDOW_MS`

```env
# Before
RATE_LIMIT_MAX_REQUESTS=100

# After
RATE_LIMIT_MAX_REQUESTS=200
```

### Issue: Spam/abuse not being prevented

**Solution:** Decrease `MAX_REQUESTS` or `WINDOW_MS`

```env
# Before
NOTICE_CREATION_MAX_REQUESTS=20

# After
NOTICE_CREATION_MAX_REQUESTS=10
```

### Issue: Development testing is slow

**Solution:** Increase development limits

```env
DEV_RATE_LIMIT_MAX_REQUESTS=5000
```

### Issue: Rate limits not working

**Checklist:**
1. Check `NODE_ENV` is set correctly
2. Verify environment variables are loaded
3. Check rate limiter middleware is applied
4. Ensure Express app uses the middleware
5. Test with actual requests (not just browser)

---

## 📚 Additional Resources

- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [Rate Limiting Best Practices](https://blog.logrocket.com/rate-limiting-node-js/)
- [OWASP Rate Limiting Guide](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)

---

**All rate limiting is now fully configurable via environment variables! 🎉**
