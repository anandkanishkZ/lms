# 🚀 Quick Start Guide - Teacher Resource Management

## ✅ System Status

- ✅ Backend server running on `http://localhost:5000`
- ✅ Frontend server running on `http://localhost:3000`
- ✅ Database seeded with test accounts
- ✅ Resource management system fully implemented

---

## 🎯 Test Now (5 Minutes)

### Step 1: Login as Teacher

1. **Open**: `http://localhost:3000`
2. **Click**: "Login As Teacher" (green card)
3. **Credentials**:
   ```
   Email: teacher@smartschool.com
   Password: teacher123
   ```
4. **Click**: "Login"

### Step 2: Navigate to Module

1. **Click**: "My Modules" in left sidebar
2. **Find**: "Medical Science" module card
3. **Click**: Menu icon (⋮) on the card
4. **Select**: "View Details"

### Step 3: Add a Resource

1. **Click**: "Resources" tab (if not already active)
2. **Click**: "Add Resource" button (blue button, top right)
3. **Fill Form**:
   - **Title**: "Chapter 1 - Introduction"
   - **Description**: "Basic concepts and overview"
   - **Type**: Select "PDF"
   - **Category**: Select "Lecture Note"
   - **Upload File**: Choose any PDF from your computer
   - ✅ Check "Pin to top"
4. **Click**: "Add Resource" button
5. ✅ **Verify**: Resource appears in the list with file info

### Step 4: Test Hide/Unhide

1. **Find**: The resource you just added
2. **Click**: Menu icon (⋮) on resource card
3. **Select**: "Hide from Students"
4. ✅ **Verify**: Resource shows orange background with "Hidden" badge
5. **Click**: Menu icon (⋮) again
6. **Select**: "Make Visible"
7. ✅ **Verify**: Orange background removed, "Hidden" badge gone

### Step 5: Test Search & Filter

1. **Type**: Part of resource title in search box
2. ✅ **Verify**: Filtered results appear
3. **Change**: "Status" dropdown to "Hidden"
4. ✅ **Verify**: Only hidden resources shown
5. **Change**: "Type" dropdown to "PDF"
6. ✅ **Verify**: Only PDF resources shown

### Step 6: Test Delete

1. **Click**: Menu (⋮) on any resource
2. **Select**: "Delete"
3. **Confirm**: Click "OK" in confirmation dialog
4. ✅ **Verify**: Resource removed from list

---

## 🎨 What You Should See

### Module Detail Page

```
┌─────────────────────────────────────────────────────────────┐
│  ← Medical Science                          [PUBLISHED] [BEGINNER] │
│                                                             │
│  📊 Stats: [Students: 0] [Views: 0] [Topics: 0] [Lessons: 0]│
│                                                             │
│  [Overview] [Resources] [Topics & Lessons]                 │
├─────────────────────────────────────────────────────────────┤
│  Content Resources                    [+ Add Resource]     │
│                                                             │
│  [Search...] [All Types ▼] [All Status ▼]                 │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📄 Chapter 1 - Introduction      [Pinned] [⋮]        │ │
│  │ Basic concepts and overview                           │ │
│  │ 👁 0 views | 📥 0 downloads | 1.2 MB | Oct 18, 2025  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Add Resource Modal

```
┌─────────────────────────────────────┐
│  Add New Resource              [×]  │
├─────────────────────────────────────┤
│  Title *                            │
│  [_____________________________]    │
│                                     │
│  Description                        │
│  [_____________________________]    │
│  [_____________________________]    │
│                                     │
│  Type         Category              │
│  [PDF ▼]     [Lecture Note ▼]      │
│                                     │
│  Upload File                        │
│  ┌───────────────────────────────┐ │
│  │    📤                         │ │
│  │ Click to upload or drag & drop│ │
│  │   [Choose File]               │ │
│  └───────────────────────────────┘ │
│                                     │
│  External URL (optional)            │
│  [https://___________________]     │
│                                     │
│  ☐ Pin to top                       │
│  ☐ Mark as mandatory                │
│                                     │
│        [Cancel]  [✓ Add Resource]  │
└─────────────────────────────────────┘
```

---

## 🎬 Video Demo Script

If recording a demo video, follow this sequence:

1. **Show Login** (0:00-0:15)
   - Navigate to home page
   - Click "Login As Teacher"
   - Enter credentials
   - Show teacher dashboard

2. **Navigate to Module** (0:15-0:30)
   - Click "My Modules"
   - Show module card
   - Click menu → "View Details"

3. **Show Module Stats** (0:30-0:45)
   - Point out enrollment count
   - Point out view count
   - Show tabs (Overview, Resources, Topics)

4. **Add Resource** (0:45-1:30)
   - Click "Resources" tab
   - Click "Add Resource"
   - Fill form completely
   - Select file
   - Submit
   - Show resource in list

5. **Demonstrate Features** (1:30-2:30)
   - Hide resource (show orange background)
   - Unhide resource
   - Use search function
   - Use filters
   - Show pinned badge
   - Show file size and metadata

6. **Delete Resource** (2:30-2:45)
   - Click menu
   - Delete
   - Confirm
   - Show removed from list

7. **Summary** (2:45-3:00)
   - Recap features
   - Show documentation

---

## 📸 Screenshots to Take

For documentation purposes, capture:

1. ✅ **Login Page** - Teacher card selected
2. ✅ **Module List** - Showing "Medical Science"
3. ✅ **Module Detail** - Header with stats
4. ✅ **Resources Tab** - Empty state
5. ✅ **Add Resource Modal** - Filled form
6. ✅ **Resource Card** - With all badges (Pinned, Hidden)
7. ✅ **Resource Menu** - Actions dropdown
8. ✅ **Search & Filter** - In action
9. ✅ **Hidden Resource** - Orange background
10. ✅ **Success Toast** - Notification

---

## 🐛 Troubleshooting

### Issue: "Module Not Found"
**Solution**: Make sure you're logged in as teacher@smartschool.com and have the "Medical Science" module assigned.

### Issue: "Upload Failed"
**Check**:
- File size < 10MB
- File type is supported
- Backend server is running
- Check browser console for errors

### Issue: "Permission Denied"
**Solution**: Only the teacher assigned to the module can add resources. Verify you're logged in with correct credentials.

### Issue: Resource not appearing
**Check**:
- Reload the page
- Check if it's hidden (use "Hidden" filter)
- Verify it was created (check database or backend logs)

### Issue: CORS Error
**Solution**: 
- Backend `.env` has correct `ALLOWED_ORIGINS`
- Frontend is on `http://localhost:3000`
- Backend is on `http://localhost:5000`

---

## ✨ Key Features to Highlight

1. **Drag & Drop Upload** - Just drag file onto upload area
2. **Real-time Search** - Instant filtering as you type
3. **Smart Filtering** - Combine type and status filters
4. **Visual Indicators** - Color-coded badges and icons
5. **Quick Actions** - One-click hide/unhide/delete
6. **File Metadata** - Automatic size and type detection
7. **Responsive Design** - Works on mobile/tablet/desktop
8. **Permission Control** - Teachers can only manage their modules
9. **Analytics** - View and download tracking
10. **User-Friendly** - Clean, intuitive interface

---

## 📋 Test Checklist

Print this and check off as you test:

- [ ] Login as teacher successfully
- [ ] Navigate to module detail page
- [ ] See Resources tab
- [ ] Click "Add Resource" button
- [ ] Fill all form fields
- [ ] Upload a PDF file
- [ ] See file name preview
- [ ] Submit form successfully
- [ ] See success notification
- [ ] Resource appears in list
- [ ] Resource shows correct icon (PDF icon)
- [ ] File size displayed correctly
- [ ] Click hide button
- [ ] Resource shows orange background
- [ ] "Hidden" badge appears
- [ ] Click unhide button
- [ ] Orange background removed
- [ ] Type in search box
- [ ] Results filter correctly
- [ ] Change type dropdown
- [ ] See filtered results
- [ ] Change status dropdown
- [ ] See hidden/visible filtered
- [ ] Click delete button
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Resource removed from list
- [ ] Success notification shown

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Resources appear immediately after adding  
✅ File uploads show progress  
✅ Hide/unhide toggles work instantly  
✅ Search filters as you type  
✅ Badges update in real-time  
✅ Notifications appear for all actions  
✅ No console errors  
✅ Smooth animations and transitions  

---

## 📞 Need Help?

Check these resources:

1. **Full Documentation**: `TEACHER_RESOURCE_MANAGEMENT_COMPLETE.md`
2. **API Endpoints**: `backend/src/routes/resources.ts`
3. **Component Code**: `frontend/app/teacher/modules/[id]/page.tsx`
4. **Service Layer**: `backend/src/services/resource.service.ts`

---

**Ready to test? Start with Step 1 above! 🚀**

**Estimated Testing Time**: 5-10 minutes  
**Difficulty**: Easy  
**Prerequisites**: Both servers running, database seeded  

---

**Last Updated**: October 18, 2025  
**Version**: 1.0.0
