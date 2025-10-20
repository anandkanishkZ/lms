# File Access Token Issue - Debugging Guide

## 🔍 Issue
Student portal shows "Access token required" error when trying to view/download uploaded files.

## 📊 Debugging Steps Added

### 1. **Enhanced Console Logging**

#### **FileAttachment Component**
```typescript
// View Button Click
console.log('🔑 Token check:', {
  teacherToken: teacherToken ? 'EXISTS' : 'NOT FOUND',
  studentToken: studentToken ? 'EXISTS' : 'NOT FOUND',
  adminToken: adminToken ? 'EXISTS' : 'NOT FOUND',
  url: url
});

// Download Button Click
console.log('⬇️ Download attempt:', {
  hasToken: !!token,
  url: url
});
```

#### **ImageNodeView Component**
```typescript
console.log('🖼️ ImageNodeView loading:', { src });
console.log('🔑 Image token check:', {
  teacherToken: teacherToken ? 'EXISTS' : 'NOT FOUND',
  studentToken: studentToken ? 'EXISTS' : 'NOT FOUND',
  adminToken: adminToken ? 'EXISTS' : 'NOT FOUND',
  hasToken: !!token
});
```

---

## 🧪 Testing Instructions

### **Step 1: Login as Student**
1. Open browser console (F12)
2. Go to `http://localhost:3000/student/login`
3. Login with student credentials
4. After login, check console for any errors
5. Check localStorage:
   ```javascript
   localStorage.getItem('student_token')
   ```
   - Should return a JWT token string
   - If NULL, login is not saving the token

### **Step 2: Navigate to Lesson**
1. Go to a module/lesson with uploaded PDF
2. Check console logs:
   ```
   🎯 FileAttachment rendering: { url, fileName, fileSize, fileType, isEditable }
   ```
   - `isEditable` should be `false` (student mode)
   - `url` should be `/api/v1/upload/files/{filename}`

### **Step 3: Click View Button**
1. Click the "View" (eye icon) button on PDF
2. Check console logs:
   ```
   🔑 Token check: {
     teacherToken: 'NOT FOUND',
     studentToken: 'EXISTS' or 'NOT FOUND',
     adminToken: 'NOT FOUND',
     url: '/api/v1/upload/files/...'
   }
   ```
3. If studentToken shows 'NOT FOUND':
   - ❌ **TOKEN NOT IN LOCALSTORAGE**
   - Issue is with login not saving token
   - Check student login service

4. If studentToken shows 'EXISTS':
   - Check next log:
   ```
   ✅ Opening authenticated URL: http://localhost:5000/api/v1/upload/files/...?token=...
   ```
   - Copy this URL
   - Open in new tab manually
   - Check if it works

### **Step 4: Check Backend**
1. If frontend has token but backend still says "Access token required":
   - Check backend logs
   - Check if authenticateToken middleware is receiving the token
   - Add backend logging:
   ```typescript
   // In auth.ts middleware
   console.log('🔐 Auth middleware:', {
     headerToken: authHeader?.split(' ')[1],
     queryToken: req.query.token,
     finalToken: token
   });
   ```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Token Not in localStorage**
**Symptoms:**
- Console shows: `studentToken: 'NOT FOUND'`
- Error: "Authentication token not found. Please log in again."

**Solution:**
1. Check student login API response:
   ```typescript
   // In student-api.service.ts login method
   console.log('Login response:', response.data);
   ```
2. Verify response structure:
   ```json
   {
     "success": true,
     "data": {
       "token": "JWT_TOKEN_HERE",
       "user": { ... }
     }
   }
   ```
3. Check if `setToken()` is being called:
   ```typescript
   if (response.data.success && response.data.data) {
     console.log('Saving token:', response.data.data.token);
     this.setToken(response.data.data.token);
   }
   ```

### **Issue 2: Token Exists But Not Sent to Backend**
**Symptoms:**
- Console shows: `studentToken: 'EXISTS'`
- Backend still returns: "Access token required"

**Solution:**
1. Check if token is being appended to URL:
   ```javascript
   // Should see in console
   ✅ Opening authenticated URL: http://localhost:5000/api/v1/upload/files/abc.pdf?token=eyJhbGc...
   ```
2. If URL doesn't have `?token=`, check the code:
   ```typescript
   const authenticatedUrl = `http://localhost:5000${url}?token=${token}`;
   ```
3. Copy the URL from console and test in browser

### **Issue 3: Backend Not Reading Query Parameter Token**
**Symptoms:**
- Token in URL: `...?token=xyz`
- Backend logs show: "No token received"

**Solution:**
1. Add logging to backend auth middleware:
   ```typescript
   // backend/src/middlewares/auth.ts
   export const authenticateToken = async (req, res, next) => {
     const authHeader = req.headers['authorization'];
     let token = authHeader && authHeader.split(' ')[1];
     
     console.log('🔐 Header token:', token ? 'EXISTS' : 'NOT FOUND');
     console.log('🔐 Query token:', req.query.token ? 'EXISTS' : 'NOT FOUND');
     
     if (!token && req.query.token) {
       token = req.query.token as string;
       console.log('✅ Using query parameter token');
     }
     
     console.log('🔐 Final token:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');
   };
   ```

2. Rebuild backend:
   ```bash
   cd backend
   npm run build
   ```

3. Restart backend server

### **Issue 4: Token Valid But User Not Found**
**Symptoms:**
- Token exists and is sent
- Backend returns: "Invalid token - user not found"

**Solution:**
1. Check if token is for correct user role
2. Verify JWT payload:
   ```javascript
   // In browser console
   const token = localStorage.getItem('student_token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Token payload:', payload);
   ```
3. Check userId in payload matches database

### **Issue 5: CORS Error**
**Symptoms:**
- Console error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solution:**
1. Check backend CORS configuration
2. Verify frontend URL is allowed
3. For file requests, ensure credentials are included

---

## 📝 Manual Testing Commands

### **Check Token in Browser Console**
```javascript
// Check if token exists
localStorage.getItem('student_token')

// Decode token payload
const token = localStorage.getItem('student_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Expires at:', new Date(payload.exp * 1000));
}

// Check all tokens
console.log({
  student: localStorage.getItem('student_token'),
  teacher: localStorage.getItem('teacher_token'),
  admin: localStorage.getItem('adminToken')
});
```

### **Test File URL Manually**
```javascript
// Get file URL with token
const token = localStorage.getItem('student_token');
const fileUrl = '/api/v1/upload/files/YOUR_FILENAME.pdf';
const authenticatedUrl = `http://localhost:5000${fileUrl}?token=${token}`;
console.log('Test this URL:', authenticatedUrl);
// Copy and paste in new tab
```

### **Test Fetch with Token**
```javascript
const token = localStorage.getItem('student_token');
const fileUrl = '/api/v1/upload/files/YOUR_FILENAME.pdf';

fetch(`http://localhost:5000${fileUrl}?token=${token}`)
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    return response.text();
  })
  .then(text => console.log('Response:', text))
  .catch(err => console.error('Error:', err));
```

---

## 🔧 Quick Fixes

### **Fix 1: Force Re-login**
```javascript
// Clear all auth data and re-login
localStorage.clear();
// Then login again
```

### **Fix 2: Check Token Expiry**
```javascript
const token = localStorage.getItem('student_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const exp = new Date(payload.exp * 1000);
  const now = new Date();
  console.log('Token expired?', now > exp);
}
```

### **Fix 3: Bypass Authentication (Testing Only)**
```typescript
// TEMPORARY - for testing only
// In backend/src/routes/upload.ts
router.get('/files/:filename', 
  // authenticateToken,  // Comment this out temporarily
  async (req, res) => {
    // ... rest of code
  }
);
```
**Note:** Remove this after testing!

---

## 📋 Checklist

Before reporting issue:
- [ ] Checked browser console for logs
- [ ] Verified token exists in localStorage
- [ ] Checked token expiry
- [ ] Tested file URL manually in browser
- [ ] Checked backend logs
- [ ] Verified backend server is running
- [ ] Verified frontend is using correct API URL

---

## 🎯 Expected Console Output (Success)

### **When viewing file:**
```
🎯 FileAttachment rendering: {
  url: '/api/v1/upload/files/abc-123.pdf',
  fileName: 'document.pdf',
  fileSize: 74420,
  fileType: 'application/pdf',
  isEditable: false
}

🔑 Token check: {
  teacherToken: 'NOT FOUND',
  studentToken: 'EXISTS',
  adminToken: 'NOT FOUND',
  url: '/api/v1/upload/files/abc-123.pdf'
}

✅ Opening authenticated URL: http://localhost:5000/api/v1/upload/files/abc-123.pdf?token=eyJhbGc...
```

### **When image loads:**
```
🖼️ ImageNodeView loading: {
  src: '/api/v1/upload/files/image-456.png'
}

🔑 Image token check: {
  teacherToken: 'NOT FOUND',
  studentToken: 'EXISTS',
  adminToken: 'NOT FOUND',
  hasToken: true
}

✅ Authenticated image URL: http://localhost:5000/api/v1/upload/files/image-456.png?token=eyJhbGc...
```

---

## 📞 Next Steps

1. **Open browser console** (F12)
2. **Login as student**
3. **Navigate to lesson** with uploaded file
4. **Check console logs** as described above
5. **Report findings** with:
   - Screenshots of console logs
   - Token existence status
   - Exact error message
   - Network tab showing request/response

---

**With these debug logs, we can pinpoint exactly where the issue occurs in the authentication flow!**
