# Notice & Announcement CRUD System - Testing Guide

## ✅ Completed Implementation

### Backend (7 API Endpoints)
- ✅ `POST /api/notices` - Create notice
- ✅ `GET /api/notices` - Get all notices (with filters)
- ✅ `GET /api/notices/:id` - Get single notice
- ✅ `PUT /api/notices/:id` - Update notice
- ✅ `DELETE /api/notices/:id` - Delete notice
- ✅ `POST /api/notices/:id/read` - Mark as read
- ✅ `GET /api/notices/unread-count` - Get unread count

### Frontend Components
- ✅ **NoticeForm** (489 lines) - Comprehensive create/edit form with validation
- ✅ **NoticeCard** - Display card with Edit/Delete buttons
- ✅ **NoticeBoard** - Listing with filters, search, and role-based actions
- ✅ **NoticeDetailModal** - Full notice view modal
- ✅ **NoticeBell** - Unread count indicator

### Admin Pages
- ✅ `/admin/notifications` - Main listing page
- ✅ `/admin/notifications/create` - Create notice page
- ✅ `/admin/notifications/[id]/edit` - Edit notice page

### Features Implemented
- ✅ Form validation with Zod schema
- ✅ Role-based permissions (ADMIN, TEACHER, STUDENT)
- ✅ Edit/Delete buttons with permission checks
- ✅ Optimistic UI updates on delete
- ✅ Toast notifications for all actions
- ✅ Loading states and error handling
- ✅ SSR-safe authentication
- ✅ Multi-token support (adminToken, teacher_token, student_token)

---

## 🧪 Testing Checklist

### 1. Create Notice Flow

**Pre-requisites:**
- Login as Admin user
- Navigate to `/admin/notifications`

**Test Steps:**

1. **Navigate to Create Page**
   ```
   ✓ Click "Create Notice" button
   ✓ Verify redirect to /admin/notifications/create
   ✓ Verify AdminLayout (sidebar + header visible)
   ✓ Verify form renders with all fields
   ```

2. **Test Form Validation**
   ```
   ✓ Submit empty form → Should show "Title is required"
   ✓ Enter title less than 3 chars → Should show "Title must be at least 3 characters"
   ✓ Enter content less than 10 chars → Should show "Content must be at least 10 characters"
   ✓ Enter invalid URL in attachment → Should show "Please enter a valid URL"
   ✓ All error messages should be red below respective fields
   ```

3. **Create Valid Notice**
   ```
   ✓ Fill in all required fields:
     - Title: "Test Notice 123"
     - Content: "This is a test notice content for validation"
     - Category: Select "GENERAL"
     - Priority: Select "MEDIUM"
   ✓ Optional fields:
     - Attachment URL: "https://example.com/file.pdf"
     - Expires At: Select future date
     - Target Class: Select any (if available)
     - Target Role: Select "ALL"
     - Toggle "Published" ON
     - Toggle "Pinned" ON
   ✓ Click "Create Notice" button
   ✓ Verify loading state (button shows "Creating...")
   ✓ Verify success toast: "Notice created successfully"
   ✓ Verify redirect to /admin/notifications
   ✓ Verify new notice appears in the list
   ✓ Verify pinned notice has pin icon
   ```

---

### 2. Read/View Notice Flow

**Test Steps:**

1. **View in Card Grid**
   ```
   ✓ Verify notices display in 3-column grid (desktop)
   ✓ Verify each card shows:
     - Title
     - Category badge (with icon)
     - Priority badge (colored)
     - Pin icon (if pinned)
     - Unread dot (if unread)
     - Content preview (truncated)
     - Author name and avatar
     - Created date
     - Edit/Delete buttons (for admin)
   ```

2. **View Detail Modal**
   ```
   ✓ Click on any notice card
   ✓ Verify modal opens with full details:
     - Full title
     - Full content (not truncated)
     - Category and Priority badges
     - Author info with avatar
     - Created date and time
     - Attachment link (if present)
     - Expiry date (if set)
     - Target info (class/batch/module/role)
   ✓ Verify "Mark as Read" button appears (if unread)
   ✓ Click "Mark as Read" → Should show success toast
   ✓ Verify unread count decreases in NoticeBell
   ✓ Close modal with X button or outside click
   ```

3. **Test Filters**
   ```
   ✓ Click "Filters" button → Panel should expand
   ✓ Search by keyword → Results should filter in real-time
   ✓ Filter by Category (EXAM) → Only exam notices shown
   ✓ Filter by Priority (URGENT) → Only urgent notices shown
   ✓ Click "Unread Only" → Only unread notices shown
   ✓ Click "Pinned Only" → Only pinned notices shown
   ✓ Verify filter count badge updates
   ✓ Click "Clear All Filters" → All notices shown again
   ```

---

### 3. Update/Edit Notice Flow

**Pre-requisites:**
- At least one notice exists in the system
- Login as Admin or Teacher (who created the notice)

**Test Steps:**

1. **Access Edit Page**
   ```
   ✓ Hover over any notice card
   ✓ Verify Edit button appears (pencil icon)
   ✓ Click Edit button
   ✓ Verify redirect to /admin/notifications/[id]/edit
   ✓ Verify loading state shows while fetching
   ✓ Verify form pre-populates with existing values:
     - Title field shows current title
     - Content field shows current content
     - Category dropdown shows current category
     - Priority dropdown shows current priority
     - Checkboxes reflect current published/pinned state
   ```

2. **Test Permission Checks**
   ```
   ✓ As ADMIN: Edit button should appear on all notices
   ✓ As TEACHER: Edit button should appear only on own notices
   ✓ As STUDENT: Edit button should NOT appear on any notice
   ```

3. **Update Notice**
   ```
   ✓ Modify title: "Updated Test Notice"
   ✓ Modify content: "This content has been updated"
   ✓ Change category to "EVENT"
   ✓ Change priority to "HIGH"
   ✓ Toggle "Pinned" OFF (if was ON)
   ✓ Click "Update Notice" button
   ✓ Verify loading state (button shows "Updating...")
   ✓ Verify success toast: "Notice updated successfully"
   ✓ Verify redirect to /admin/notifications
   ✓ Verify updated notice reflects all changes:
     - Title changed
     - Category badge changed
     - Priority badge changed (now HIGH/orange)
     - Pin icon removed
   ```

4. **Test Error Handling**
   ```
   ✓ Navigate to edit page with invalid ID: /admin/notifications/invalid-id/edit
   ✓ Verify error state displays: "Failed to load notice"
   ✓ Verify "Go Back" button works
   ✓ Test network error (disconnect internet during update)
   ✓ Verify error toast shows: "Failed to update notice"
   ✓ Verify form remains editable (data not lost)
   ```

---

### 4. Delete Notice Flow

**Pre-requisites:**
- At least one notice exists in the system
- Login as Admin or Teacher (who created the notice)

**Test Steps:**

1. **Access Delete Button**
   ```
   ✓ Hover over any notice card
   ✓ Verify Delete button appears (trash icon, red color)
   ✓ Verify button only shows for authorized users (same logic as Edit)
   ```

2. **Delete with Confirmation**
   ```
   ✓ Click Delete button (trash icon)
   ✓ Verify confirmation dialog appears
   ✓ Verify dialog shows:
     - Title: "Are you sure?"
     - Message: "This will permanently delete the notice '[Notice Title]'"
     - Cancel button
     - Confirm button (red, "Delete")
   ✓ Click Cancel → Dialog closes, notice remains
   ✓ Click Delete button again
   ✓ Click Confirm in dialog
   ✓ Verify loading state during deletion
   ✓ Verify success toast: "Notice deleted successfully"
   ✓ Verify notice immediately disappears from list (optimistic UI)
   ✓ Verify if modal was open for that notice, it closes
   ```

3. **Test Permission Checks**
   ```
   ✓ As ADMIN: Delete button should appear on all notices
   ✓ As TEACHER: Delete button should appear only on own notices
   ✓ As STUDENT: Delete button should NOT appear on any notice
   ✓ Test deleting notice that doesn't exist → Should show error toast
   ```

4. **Test Click Event Handling**
   ```
   ✓ Click Edit button → Should NOT open detail modal
   ✓ Click Delete button → Should NOT open detail modal
   ✓ Click anywhere else on card → Should open detail modal
   ✓ Verify event propagation is properly stopped for action buttons
   ```

---

## 🔍 Role-Based Access Testing

### Admin User Tests
```
✓ Can view all notices
✓ Can create new notices
✓ Can edit any notice (regardless of author)
✓ Can delete any notice (regardless of author)
✓ Edit/Delete buttons appear on ALL notice cards
✓ Can access /admin/notifications pages
```

### Teacher User Tests
```
✓ Can view all notices
✓ Can create new notices
✓ Can edit ONLY own notices
✓ Can delete ONLY own notices
✓ Edit/Delete buttons appear ONLY on notices they created
✓ Cannot edit/delete notices created by other teachers or admin
✓ Should eventually have /teacher/notifications pages
```

### Student User Tests
```
✓ Can view all notices targeted to them
✓ Cannot create notices
✓ Cannot edit any notices
✓ Cannot delete any notices
✓ No Edit/Delete buttons appear on any notice cards
✓ Can mark notices as read
✓ Can view notice details
✓ Can use filters and search
```

---

## 🐛 Known Issues & Limitations

### Currently Missing (To Be Implemented)

1. **Targeting Dropdowns Not Functional**
   - Class, Batch, Module dropdowns are disabled
   - Need to implement API calls to fetch these options
   - Required endpoints:
     - GET /api/classes
     - GET /api/batches  
     - GET /api/modules

2. **Teacher Portal Pages**
   - `/teacher/notifications` page doesn't exist yet
   - `/teacher/notifications/create` page doesn't exist yet
   - `/teacher/notifications/[id]/edit` page doesn't exist yet
   - Teachers currently use admin pages (but with restricted permissions)

3. **Student Portal Pages**
   - `/student/notifications` page doesn't exist yet
   - Students need read-only view of their notices

4. **File Upload**
   - Attachment URL is text input (manual URL entry)
   - Should implement file upload component
   - Need backend endpoint: POST /api/upload
   - Store files in uploads/attachments/

5. **Rich Text Editor**
   - Content field is plain textarea
   - Consider integrating TipTap or Quill editor
   - Would allow formatting, lists, links, images

6. **Real-Time Updates**
   - After CRUD operations, list updates manually
   - Consider WebSocket integration for live updates
   - Or implement polling for unread count

7. **Bulk Operations**
   - No bulk delete
   - No bulk mark as read
   - No bulk publish/unpublish

---

## 🎯 Testing Recommendations

### Manual Testing Priority
1. **High Priority** (Test First):
   - Create → Edit → Delete flow for one notice
   - Permission checks (admin vs teacher vs student)
   - Form validation (empty fields, invalid data)
   - Success/error toast notifications

2. **Medium Priority**:
   - All filter combinations
   - Search functionality
   - Mark as read functionality
   - Modal interactions
   - Click event handling (buttons vs card)

3. **Low Priority**:
   - UI responsiveness (mobile/tablet)
   - Loading states
   - Empty states
   - Error states

### Automated Testing (Future)
```javascript
// Suggested test files to create:
// - NoticeForm.test.tsx (validation, submission)
// - NoticeCard.test.tsx (rendering, permissions, actions)
// - NoticeBoard.test.tsx (filtering, searching)
// - notice-api.service.test.ts (API calls, error handling)
```

---

## 📊 Success Criteria

**The CRUD system is considered fully working when:**

✅ Admin can create, read, update, and delete ANY notice
✅ Teacher can create, read, update/delete OWN notices
✅ Student can read notices only (no edit/delete)
✅ All forms validate correctly with proper error messages
✅ All success/error operations show appropriate toast notifications
✅ Deleted notices disappear immediately from the list
✅ Updated notices reflect changes without page refresh
✅ Filters and search work correctly
✅ Modal opens/closes properly
✅ No console errors or TypeScript warnings
✅ Edit/Delete buttons only appear for authorized users
✅ Loading states appear during async operations

---

## 🚀 Quick Start Testing Commands

```bash
# Start backend
cd backend
npm run dev

# Start frontend (separate terminal)
cd frontend
npm run dev

# Open browser
http://localhost:3000/admin/notifications

# Test user tokens in localStorage:
# Admin: adminToken = "your-admin-jwt"
# Teacher: teacher_token = "your-teacher-jwt"
# Student: student_token = "your-student-jwt"
```

---

## 📝 Test Report Template

```markdown
## Test Session Report

**Date:** [Date]
**Tester:** [Name]
**Build:** [Commit/Version]

### Create Flow
- [ ] Form loads correctly
- [ ] Validation works
- [ ] Notice created successfully
- [ ] Issues found: [List any issues]

### Edit Flow
- [ ] Edit page loads with data
- [ ] Form pre-populates correctly
- [ ] Changes save successfully
- [ ] Issues found: [List any issues]

### Delete Flow
- [ ] Confirmation dialog appears
- [ ] Notice deletes successfully
- [ ] UI updates optimistically
- [ ] Issues found: [List any issues]

### Permissions
- [ ] Admin can edit/delete all
- [ ] Teacher can edit/delete own
- [ ] Student sees no action buttons
- [ ] Issues found: [List any issues]

### Overall Status
- [ ] PASS - All tests passed
- [ ] FAIL - [List failing tests]
- [ ] BLOCKED - [List blocking issues]
```

---

## 🔧 Debugging Tips

**If Edit/Delete buttons don't appear:**
1. Check localStorage for correct token key (adminToken, teacher_token, student_token)
2. Verify NoticeBoard passes `showActions={true}`
3. Check notice.authorId matches current user ID
4. Console.log `currentUserRole` in NoticeCard

**If form validation fails:**
1. Check Zod schema in NoticeForm
2. Verify all required fields have values
3. Check field name spelling matches schema

**If API calls fail:**
1. Check backend is running on correct port
2. Verify token is valid (not expired)
3. Check network tab for request/response
4. Verify CORS settings if needed

**If optimistic delete doesn't work:**
1. Check handleDeleteNotice in NoticeBoard
2. Verify onDelete callback is passed to NoticeCard
3. Check state update logic (filter by ID)

---

**Last Updated:** [Current Date]
**Status:** ✅ CRUD Implementation Complete - Ready for Testing
