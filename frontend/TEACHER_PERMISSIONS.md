# Teacher Portal - Permissions & Access Control

## 🔐 Permission Model

### Teacher Permissions (Role-Based Access Control)

Teachers have **LIMITED** permissions compared to administrators. The system follows a **top-down authorization model** where administrators create and assign modules to teachers.

---

## 📋 What Teachers CAN Do

### ✅ Module Management (View & Edit Only)
1. **View Assigned Modules**
   - See all modules assigned to them by administrators
   - Filter by status (Draft, Pending, Approved, Published, etc.)
   - Filter by level (Beginner, Intermediate, Advanced)
   - Search modules by title/description
   - Switch between grid and list views

2. **Edit Module Content**
   - Update topics and lessons within assigned modules
   - Add/edit lesson content (text, video URLs, etc.)
   - Modify module descriptions and metadata
   - Upload/change thumbnails
   - Organize topic order

3. **Submit for Approval**
   - Submit draft modules for admin review
   - View approval status and feedback
   - Track module workflow (Draft → Pending → Approved → Published)

4. **View Module Analytics**
   - See enrollment counts
   - Check student engagement metrics
   - View ratings and reviews
   - Monitor view counts

### ✅ Student Management
- View enrolled students in their modules
- Track student progress
- Grade assignments and exams
- Provide feedback

### ✅ Class Management
- Conduct live classes for assigned modules
- Schedule new class sessions
- View upcoming class schedule
- Manage class recordings

### ✅ Assessment Management
- Create assignments within assigned modules
- Create exams and quizzes
- Grade student submissions
- Generate performance reports

### ✅ Communication
- Send messages to enrolled students
- Receive notifications
- View activity feed
- Respond to student queries

---

## ❌ What Teachers CANNOT Do

### Module Creation & Assignment
- ❌ **Cannot create new modules** - Only admins can create modules
- ❌ **Cannot delete modules** - Only admins have delete permissions
- ❌ **Cannot duplicate modules** - Restricted to prevent unauthorized content
- ❌ **Cannot assign modules to other teachers** - Admin-only function
- ❌ **Cannot publish modules directly** - Must go through admin approval

### System Administration
- ❌ **Cannot manage other teachers** - No access to teacher management
- ❌ **Cannot approve modules** - Approval workflow is admin-only
- ❌ **Cannot access system settings** - Configuration restricted to admins
- ❌ **Cannot manage user roles** - Role assignment is admin privilege
- ❌ **Cannot view/edit billing** - Financial data restricted

---

## 🔄 Module Workflow for Teachers

```
1. Admin Creates Module
   ↓
2. Admin Assigns Module to Teacher
   ↓
3. Teacher Receives Module (Status: DRAFT)
   ↓
4. Teacher Adds Content (Topics, Lessons)
   ↓
5. Teacher Submits for Approval (Status: PENDING_APPROVAL)
   ↓
6. Admin Reviews Module
   ↓
7a. Admin Approves (Status: APPROVED)
    ↓
    Admin Publishes (Status: PUBLISHED)
    
7b. Admin Rejects (Status: REJECTED)
    ↓
    Teacher Makes Changes
    ↓
    Teacher Resubmits
```

---

## 🎯 Module Status Explained

| Status | Description | Teacher Actions Available |
|--------|-------------|---------------------------|
| **DRAFT** | Initial state, being edited | Edit content, Submit for approval |
| **PENDING_APPROVAL** | Awaiting admin review | View only, cannot edit |
| **APPROVED** | Approved by admin | View only |
| **PUBLISHED** | Live and visible to students | View, Monitor analytics |
| **REJECTED** | Changes requested | Edit content, Resubmit |
| **ARCHIVED** | No longer active | View only |

---

## 🛡️ Backend API Permissions

### Endpoints Teachers CAN Access
```typescript
// Module Management
GET    /api/v1/modules                  // View modules (filtered by teacherId)
GET    /api/v1/modules/:id              // View specific module
PUT    /api/v1/modules/:id              // Edit assigned module
POST   /api/v1/modules/:id/submit       // Submit for approval
POST   /api/v1/modules/:id/view         // Increment view count

// Student Management
GET    /api/v1/teacher/students         // View enrolled students
GET    /api/v1/teacher/students/:id     // View student details

// Class Management
GET    /api/v1/teacher/classes          // View classes
POST   /api/v1/teacher/classes          // Schedule class
PUT    /api/v1/teacher/classes/:id      // Update class
DELETE /api/v1/teacher/classes/:id      // Cancel class

// Assessment Management
POST   /api/v1/teacher/assignments      // Create assignment
PUT    /api/v1/teacher/assignments/:id  // Update assignment
POST   /api/v1/teacher/exams            // Create exam
PUT    /api/v1/teacher/exams/:id        // Update exam
```

### Endpoints Teachers CANNOT Access
```typescript
// Module Administration (Admin Only)
POST   /api/v1/modules                  // Create module ❌
DELETE /api/v1/modules/:id              // Delete module ❌
POST   /api/v1/modules/:id/approve      // Approve module ❌
POST   /api/v1/modules/:id/publish      // Publish module ❌
POST   /api/v1/modules/:id/reject       // Reject module ❌

// User Management (Admin Only)
POST   /api/v1/admin/users              // Create user ❌
PUT    /api/v1/admin/users/:id          // Update user ❌
DELETE /api/v1/admin/users/:id          // Delete user ❌

// System Settings (Admin Only)
GET    /api/v1/admin/settings           // View settings ❌
PUT    /api/v1/admin/settings           // Update settings ❌
```

---

## 🖥️ UI Changes Implemented

### Teacher Modules Page (`/teacher/modules`)
**Before:**
- ✅ "Create Module" button visible
- ✅ "Delete" option in menu
- ✅ "Duplicate" option in menu

**After (Current):**
- ❌ "Create Module" button removed
- ❌ "Delete" option removed
- ❌ "Duplicate" option removed
- ✅ "Edit Content" renamed (clarifies they edit content, not create)
- ✅ Info message: "Contact your administrator" for new modules
- ✅ Empty state: "No modules assigned yet" (not "Create your first module")

### Teacher Dashboard (`/teacher/dashboard`)
**Before:**
- ✅ "Create Module" button in header

**After (Current):**
- ❌ "Create Module" button removed
- ✅ "View My Modules" button added
- ✅ "Schedule Class" button retained

### Navigation Menu
- ✅ "My Modules" (emphasizes ownership, not creation)
- ✅ All other menu items unchanged

---

## 🎨 Color Scheme Update

All teacher portal pages now use **#2563eb** (blue-600) as the primary color:
- Login page gradients
- Button colors
- Active navigation states
- Badge colors
- Focus rings
- Links and CTAs

**Before:** Purple/Blue gradient mix
**After:** Consistent blue theme (#2563eb)

---

## 💡 User Experience Considerations

### For Teachers
1. **Clear Expectations**: Teachers understand they receive modules from admins
2. **No Confusion**: No create buttons that would fail with permission errors
3. **Guided Workflow**: Clear messaging about contacting administrators
4. **Focused Experience**: Teachers focus on content creation, not module management

### For Administrators
1. **Full Control**: Admins maintain oversight of module creation
2. **Quality Assurance**: All modules go through approval process
3. **Teacher Assignment**: Admins can assign best teachers to specific modules
4. **Content Standards**: Ensures consistency across platform

---

## 🔧 Backend Authorization Middleware

The backend uses role-based middleware:

```typescript
// Module routes (backend/src/routes/modules.ts)
router.post('/', 
  authenticateToken, 
  authorizeRoles('ADMIN'),           // ← Only ADMIN can create
  createModule
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('TEACHER', 'ADMIN'), // ← Teachers can edit assigned modules
  updateModule
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN'),           // ← Only ADMIN can delete
  deleteModule
);
```

---

## 📊 Database Level

The Module model includes ownership tracking:

```prisma
model Module {
  id          String   @id @default(cuid())
  teacherId   String   // ← Links module to teacher
  // ... other fields
  
  teacher     User     @relation("ModuleTeacher", fields: [teacherId], references: [id])
}
```

- **teacherId**: Set by admin during module creation
- **Validation**: Backend checks if teacher matches assigned teacherId before allowing edits

---

## ✅ Testing Checklist

### Teacher Login
- [ ] Teacher can login successfully
- [ ] Redirects to dashboard after login
- [ ] Blue (#2563eb) theme applied throughout

### Teacher Modules Page
- [ ] Can view assigned modules
- [ ] Can filter by status and level
- [ ] Can search modules
- [ ] Grid and list views work
- [ ] "Edit Content" button opens edit page
- [ ] "Submit for Approval" works for DRAFT modules
- [ ] NO "Create Module" button visible
- [ ] NO "Delete" option in dropdown
- [ ] NO "Duplicate" option in dropdown
- [ ] Empty state shows appropriate message

### Teacher Dashboard
- [ ] Stats display correctly
- [ ] "View My Modules" button works
- [ ] NO "Create Module" button
- [ ] Blue color scheme consistent

### Permissions
- [ ] Teacher cannot access create module route
- [ ] Teacher cannot delete modules via API
- [ ] Teacher can only edit assigned modules
- [ ] Teacher can submit for approval

---

## 🚀 Future Enhancements

### Planned Features
1. **Module Request System**: Teachers can request new modules from admins
2. **Collaboration**: Multiple teachers can be assigned to one module
3. **Templates**: Admins can create module templates for teachers
4. **Analytics Dashboard**: Enhanced analytics for teacher performance
5. **Content Suggestions**: AI-powered content recommendations

---

## 📞 Support

### For Teachers
- **Need a new module?** Contact your administrator
- **Module questions?** Use the Help section in navigation
- **Technical issues?** Message support team

### For Administrators
- **Module management** available in Admin Portal
- **Teacher assignment** done during module creation
- **Approval workflow** managed in admin dashboard

---

## 🎓 Summary

**Key Principle**: Teachers are **content creators**, not **module managers**.

- ✅ Teachers focus on creating great content within assigned modules
- ✅ Admins maintain control over module creation and structure
- ✅ Clear separation of responsibilities improves content quality
- ✅ Approval workflow ensures platform standards are met

This model ensures high-quality, consistent educational content while empowering teachers to focus on what they do best: teaching! 🎉
