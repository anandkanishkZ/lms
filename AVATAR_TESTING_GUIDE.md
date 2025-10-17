# 🧪 Avatar Upload Testing Guide - Quick Start

## ✅ Pre-Test Checklist

Before testing, ensure:
- [x] Backend server is running (`cd backend && npm run dev`)
- [x] Frontend server is running (`cd frontend && npm run dev`)
- [x] PostgreSQL database is running
- [x] Student is logged in
- [x] `backend/uploads/avatars/` directory exists

---

## 🚀 Quick Test Procedure

### Test 1: Upload Avatar from Profile Page

1. **Login as Student**
   - Go to: `http://localhost:3000/student/login`
   - Login with symbol number: `2025443`
   - Password: (your student password)

2. **Navigate to Profile**
   - Click "Profile" button or
   - Go to: `http://localhost:3000/student/profile`

3. **Upload Avatar**
   - Hover over the circular avatar (gradient default)
   - Click anywhere on the avatar
   - Select an image file:
     - ✅ JPEG, JPG, PNG, GIF, or WEBP
     - ✅ Max 5MB size
   - Wait for upload to complete
   - See success message: "Profile picture updated successfully"

4. **Verify Upload**
   - Avatar should update immediately on profile page
   - Check `backend/uploads/avatars/` directory for new file
   - Check database: `profileImage` field should have value like `avatars/abc123-1234567890.jpg`

---

### Test 2: View Avatar in Dashboard

1. **Navigate to Dashboard**
   - Go to: `http://localhost:3000/student/dashboard`

2. **Check Avatar Display**
   - Look at top-right header
   - Avatar should show your uploaded photo
   - Click avatar to open dropdown menu

3. **Verify Dropdown**
   - Avatar appears in dropdown header
   - User info displays correctly
   - Menu items are visible

---

### Test 3: Delete Avatar

1. **Go Back to Profile**
   - `http://localhost:3000/student/profile`

2. **Delete Avatar**
   - Click the **X button** on the avatar (bottom-right corner)
   - Confirm deletion in popup
   - See success message: "Profile picture deleted successfully"

3. **Verify Deletion**
   - Avatar reverts to gradient default
   - File deleted from `backend/uploads/avatars/`
   - Database `profileImage` field is `null`

---

## 🔍 Testing Different Scenarios

### Scenario 1: Valid JPEG Upload
```
File: photo.jpg
Size: 2MB
Type: image/jpeg
Expected: ✅ Success
```

### Scenario 2: Valid PNG Upload
```
File: avatar.png
Size: 1.5MB
Type: image/png
Expected: ✅ Success
```

### Scenario 3: Invalid File Type
```
File: document.pdf
Size: 1MB
Type: application/pdf
Expected: ❌ Error - "Only image files are allowed"
```

### Scenario 4: File Too Large
```
File: large-image.jpg
Size: 10MB
Type: image/jpeg
Expected: ❌ Error - "File size should not exceed 5MB"
```

### Scenario 5: No File Selected
```
Action: Click upload but cancel file picker
Expected: ℹ️ Nothing happens (no error)
```

---

## 📊 Backend Testing with Postman/cURL

### Get JWT Token First
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "2025443",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

---

### Test Upload Avatar
```bash
curl -X POST http://localhost:5000/api/v1/auth/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/your/image.jpg"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Profile picture updated successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Anand KanishkZ",
      "profileImage": "avatars/abc123-1234567890.jpg",
      ...
    },
    "profileImage": "avatars/abc123-1234567890.jpg",
    "avatarUrl": "/uploads/avatars/abc123-1234567890.jpg"
  }
}
```

---

### Test Delete Avatar
```bash
curl -X DELETE http://localhost:5000/api/v1/auth/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Avatar deleted successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Anand KanishkZ",
      "profileImage": null,
      ...
    }
  }
}
```

---

### Test Access Avatar (No Auth Required)
```bash
# After upload, copy the avatarUrl from response
curl http://localhost:5000/uploads/avatars/abc123-1234567890.jpg --output avatar.jpg
```

or open in browser:
```
http://localhost:5000/uploads/avatars/abc123-1234567890.jpg
```

---

## 🛠️ Debugging Common Issues

### Issue 1: "Not authenticated" Error
**Problem:** JWT token missing or invalid
**Solution:**
- Check if you're logged in
- Check `localStorage.getItem('student_token')`
- Token might have expired - login again

---

### Issue 2: "Please upload an image file" Error
**Problem:** No file in request
**Solution:**
- Ensure field name is `avatar` (not `file` or `image`)
- Check FormData: `formData.append('avatar', file)`
- Verify `Content-Type: multipart/form-data` header

---

### Issue 3: "Invalid file type" Error
**Problem:** File type not allowed
**Solution:**
- Only use: JPEG, JPG, PNG, GIF, WEBP
- Check file extension is correct
- Check MIME type matches extension

---

### Issue 4: "File too large" Error
**Problem:** File exceeds 5MB limit
**Solution:**
- Compress image before upload
- Use smaller image
- Check file size: `file.size` should be < 5,242,880 bytes

---

### Issue 5: Avatar Not Displaying
**Problem:** URL incorrect or CORS issue
**Solution:**
- Check avatar URL format: `http://localhost:5000/uploads/avatars/filename.jpg`
- Verify file exists in `backend/uploads/avatars/`
- Check browser console for errors
- Verify CORS settings in `server.ts`

---

### Issue 6: Old Avatar Not Deleted
**Problem:** File still exists after new upload
**Solution:**
- Check console logs for deletion errors
- Verify file permissions on `uploads/avatars/` directory
- Check `process.cwd()` points to correct directory

---

## 📸 Expected Visual Results

### Before Upload:
```
Profile Page:
┌──────────────┐
│              │
│  [Gradient   │
│   + User     │
│    Icon]     │
│              │
└──────────────┘
(Purple-blue gradient)
```

### After Upload:
```
Profile Page:
┌──────────────┐
│              │
│  [Your       │
│   Photo]  [X]│  ← Delete button
│              │
│              │
└──────────────┘
(Actual photo displayed)
```

### Dashboard Header:
```
Before:
[🎓 Student Portal] ... [🔔] [Gradient Avatar ▼] Name

After:
[🎓 Student Portal] ... [🔔] [Your Photo ▼] Name
                                  ↓
                          [Dropdown Menu]
                          with photo inside
```

---

## ✅ Success Criteria

### Upload Test Passes If:
- ✅ File uploads without errors
- ✅ Success toast appears
- ✅ Avatar updates immediately on page
- ✅ File appears in `backend/uploads/avatars/`
- ✅ Database `profileImage` field updated
- ✅ Old avatar deleted (if existed)
- ✅ Avatar visible in dashboard

### Delete Test Passes If:
- ✅ Delete confirmation appears
- ✅ File removed from `backend/uploads/avatars/`
- ✅ Database `profileImage` set to `null`
- ✅ Avatar reverts to gradient default
- ✅ Success toast appears

---

## 📝 Test Results Template

```markdown
## Avatar Upload Test Results

**Date:** October 17, 2025
**Tester:** [Your Name]

### Test 1: Upload JPEG
- Status: ✅ PASS / ❌ FAIL
- File: photo.jpg (2MB)
- Notes: _______________

### Test 2: Upload PNG
- Status: ✅ PASS / ❌ FAIL
- File: avatar.png (1.5MB)
- Notes: _______________

### Test 3: Invalid Type
- Status: ✅ PASS / ❌ FAIL
- File: document.pdf
- Expected Error: ✅ Shown / ❌ Not shown
- Notes: _______________

### Test 4: File Too Large
- Status: ✅ PASS / ❌ FAIL
- File: large.jpg (10MB)
- Expected Error: ✅ Shown / ❌ Not shown
- Notes: _______________

### Test 5: Delete Avatar
- Status: ✅ PASS / ❌ FAIL
- Notes: _______________

### Test 6: Dashboard Display
- Status: ✅ PASS / ❌ FAIL
- Notes: _______________

### Overall Result: ✅ PASS / ❌ FAIL
```

---

## 🎯 Next Steps After Testing

1. ✅ If all tests pass: System is ready!
2. ❌ If any test fails: Check debugging section
3. 📊 Document test results
4. 🚀 Deploy to production (optional)
5. 📸 Take screenshots for documentation

---

## 💡 Pro Tips

1. **Clear Browser Cache**: If avatar doesn't update, clear cache
2. **Check Network Tab**: Use browser DevTools to see API calls
3. **Monitor Console**: Watch for JavaScript errors
4. **Check Backend Logs**: Terminal shows file upload activity
5. **Use Small Images**: Faster uploads, easier testing
6. **Test Different Formats**: Try JPEG, PNG, GIF, WEBP
7. **Test Edge Cases**: 0 bytes file, corrupted file, etc.

---

## 📞 Need Help?

If you encounter issues:
1. Check `MULTER_AVATAR_IMPLEMENTATION.md` for detailed docs
2. Review backend logs in terminal
3. Check browser console for errors
4. Verify database connection
5. Ensure all dependencies installed

---

## 🎉 Ready to Test!

Follow the steps above to thoroughly test the avatar upload system. All components are properly configured with Multer and ready for testing!

**Happy Testing! 🚀**
