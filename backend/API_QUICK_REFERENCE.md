# 🚀 API Quick Reference

## 📍 Base URLs

| Environment | URL |
|------------|-----|
| **Development** | `http://localhost:5000/api/v1` |
| **Documentation** | `http://localhost:5000/api/docs` |
| **Health Check** | `http://localhost:5000/api/health` |

---

## 🔐 Authentication Flow

```
1. POST /api/v1/auth/login
   Body: { "email": "user@lms.com", "password": "password123" }
   Response: { "token": "eyJhbGc..." }

2. Use token in headers:
   Authorization: Bearer eyJhbGc...
```

---

## 📚 Common Endpoints

### Authentication
```
POST   /auth/login              → Login user
POST   /auth/register           → Register user
GET    /auth/me                 → Get current user
PUT    /auth/profile            → Update profile
POST   /auth/upload-avatar      → Upload avatar
```

### Modules
```
GET    /modules                 → List all modules
GET    /modules/:id             → Get module details
POST   /modules                 → Create module (Teacher)
PUT    /modules/:id             → Update module
DELETE /modules/:id             → Delete module
POST   /modules/:id/submit      → Submit for approval
```

### Enrollments
```
GET    /enrollments/my          → My enrollments
POST   /enrollments             → Enroll in module
DELETE /enrollments/:id         → Unenroll
```

### Exams
```
GET    /exams                   → List exams
GET    /exams/:id               → Get exam details
POST   /exams                   → Create exam (Teacher)
POST   /exams/:id/submit        → Submit exam (Student)
GET    /exams/:id/result        → Get result
```

### Resources
```
GET    /resources                      → List resources
GET    /resources/modules/:moduleId    → Module resources
POST   /resources                      → Upload resource
GET    /resources/:id/download         → Download
```

---

## 👥 Default Accounts

### Admin
```
Email: admin@lms.com
Password: admin123
```

### Teacher
```
Email: teacher@lms.com
Password: teacher123
```

### Student
```
Email: student@lms.com
Password: student123
```

---

## 📊 Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

---

## 🔢 Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized (not logged in) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate entry) |
| `500` | Server Error |

---

## 🎯 Quick Testing

### 1. Using Swagger UI (Easiest)
```
1. Visit: http://localhost:5000/api/docs
2. Login via UI
3. Click "Authorize"
4. Test any endpoint with "Try it out"
```

### 2. Using cURL
```bash
# Login
TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@lms.com","password":"student123"}' \
  | jq -r '.token')

# Use token
curl -X GET http://localhost:5000/api/v1/modules \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Using JavaScript/Fetch
```javascript
// Login
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@lms.com',
    password: 'student123'
  })
});
const { token } = await response.json();

// Use token
const modules = await fetch('http://localhost:5000/api/v1/modules', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🔍 Query Parameters

```
?page=1              → Page number
?limit=10            → Items per page
?search=keyword      → Search term
?status=PUBLISHED    → Filter by status
?sort=createdAt      → Sort field
?order=desc          → Sort order (asc/desc)
```

### Example
```
GET /api/v1/modules?page=2&limit=20&search=math&status=PUBLISHED
```

---

## 📤 File Upload

### Avatar Upload
```bash
curl -X POST http://localhost:5000/api/v1/auth/upload-avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

### Resource Upload
```bash
curl -X POST http://localhost:5000/api/v1/resources \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=My Resource" \
  -F "moduleId=module-id" \
  -F "type=PDF" \
  -F "file=@/path/to/file.pdf"
```

---

## 🎓 Role-Based Access

| Endpoint | Admin | Teacher | Student |
|----------|-------|---------|---------|
| GET /modules | ✅ | ✅ | ✅ |
| POST /modules | ✅ | ✅ | ❌ |
| POST /modules/:id/approve | ✅ | ❌ | ❌ |
| POST /enrollments | ✅ | ✅ | ✅ |
| POST /exams | ✅ | ✅ | ❌ |
| GET /admin/analytics | ✅ | ❌ | ❌ |

---

## 🐛 Troubleshooting

### 401 Unauthorized
- Token expired → Re-login
- Missing token → Add Authorization header
- Invalid token → Check token format

### 403 Forbidden
- Insufficient permissions
- Check user role
- Verify endpoint access rights

### 404 Not Found
- Check endpoint URL
- Verify resource ID exists
- Ensure backend is running

### CORS Error
- Check ALLOWED_ORIGINS in .env
- Verify frontend URL is whitelisted
- Check CORS headers

---

## 📱 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lms

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🎨 Swagger UI Shortcuts

| Action | How |
|--------|-----|
| **Search** | Type in search box at top |
| **Collapse All** | Click category name |
| **Try Endpoint** | Click "Try it out" |
| **Copy cURL** | Available after execution |
| **Authorize** | Click 🔓 icon top-right |
| **Download Spec** | Visit /api/docs.json |

---

## 📞 Quick Links

- 📖 **Full Documentation**: http://localhost:5000/api/docs
- 📄 **API Spec (JSON)**: http://localhost:5000/api/docs.json
- 🏥 **Health Check**: http://localhost:5000/api/health
- 📚 **Detailed Guide**: `backend/API_DOCUMENTATION_GUIDE.md`
- 📖 **Main README**: `README.md`

---

**Need detailed examples?** Visit http://localhost:5000/api/docs for interactive documentation! 🚀
