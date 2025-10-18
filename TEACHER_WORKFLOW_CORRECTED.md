# Teacher Content Management - CORRECTED WORKFLOW

## 🚨 CRITICAL BUSINESS RULE

**ONLY ADMIN CAN CREATE MODULES**  
**TEACHERS CAN ONLY ADD CONTENT (TOPICS/LESSONS) TO ASSIGNED MODULES**

---

## 📋 Corrected Workflow

### **Admin Workflow** (Module Creation)

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN creates module                                        │
│ POST /api/modules                                           │
│ {                                                           │
│   title: "Web Development Bootcamp",                       │
│   slug: "web-dev-bootcamp",                                │
│   description: "Complete web development course",          │
│   subjectId: "subject_123",                                │
│   classId: "class_456",                                    │
│   teacherId: "teacher_789",  ← ADMIN assigns teacher       │
│   level: "BEGINNER",                                       │
│   thumbnailUrl: "https://...",                             │
│ }                                                           │
│ → Status: DRAFT                                            │
│ → Module assigned to Teacher ID: teacher_789               │
└─────────────────────────────────────────────────────────────┘
```

### **Teacher Workflow** (Content Creation)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Teacher logs in                                     │
│ → See list of modules assigned to them                     │
│ GET /api/modules?teacherId={myId}                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Teacher selects a module                            │
│ → Click "Add Content" button                               │
│ → Navigate to /teacher/modules/{id}/content                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Teacher adds Topics                                 │
│ POST /api/topics                                            │
│ {                                                           │
│   moduleId: "module_123",                                  │
│   title: "Introduction to HTML",                           │
│   description: "Learn HTML basics",                        │
│   orderIndex: 1,                                           │
│   duration: 120                                            │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Teacher adds Lessons to Topics                      │
│ POST /api/lessons                                           │
│ {                                                           │
│   topicId: "topic_456",                                    │
│   title: "HTML Elements",                                  │
│   type: "VIDEO",                                           │
│   videoUrl: "https://...",                                 │
│   duration: 30,                                            │
│   orderIndex: 1                                            │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Teacher adds Attachments (optional)                 │
│ POST /api/lessons/:id/attachments                           │
│ {                                                           │
│   title: "HTML Cheat Sheet",                               │
│   fileName: "html-cheatsheet.pdf",                         │
│   fileUrl: "https://...",                                  │
│   fileSize: 1024000                                        │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Teacher submits for Admin approval                  │
│ POST /api/modules/:id/submit                                │
│ → Status: PENDING_APPROVAL                                 │
│ → Notification sent to Admin                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ ADMIN APPROVAL (Admin Portal)                               │
│ → Admin reviews module content                             │
│ → POST /api/modules/:id/approve → Status: APPROVED         │
│ → POST /api/modules/:id/publish → Status: PUBLISHED        │
│       OR                                                    │
│ → POST /api/modules/:id/reject → Status: REJECTED          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Backend Changes Required

### **1. Update Module Routes** (CRITICAL)

**File**: `backend/src/routes/modules.ts`

**Current** (Line 27):
```typescript
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), createModule);
```

**Change to**:
```typescript
// ONLY ADMIN can create modules
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createModule);
```

**Current** (Line 28):
```typescript
router.put('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), updateModule);
```

**Keep as is** - Teachers need to update module status when submitting

**Current** (Line 29):
```typescript
router.delete('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), deleteModule);
```

**Change to**:
```typescript
// ONLY ADMIN can delete modules
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteModule);
```

### **2. Update Module Service** (Validation)

**File**: `backend/src/services/module.service.ts`

Add validation in `updateModule` method to ensure **teachers can only edit their own modules**:

```typescript
async updateModule(moduleId: string, data: any, userId: string) {
  const existingModule = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!existingModule) {
    throw new Error('Module not found');
  }

  // Get user role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // If user is TEACHER, check ownership
  if (user?.role === 'TEACHER' && existingModule.teacherId !== userId) {
    throw new Error('You can only edit modules assigned to you');
  }

  // If user is TEACHER, prevent changing certain fields
  if (user?.role === 'TEACHER') {
    // Teachers cannot change: teacherId, isFeatured, isPublic, status (except DRAFT)
    delete data.teacherId;
    delete data.isFeatured;
    delete data.isPublic;
    if (data.status && data.status !== 'DRAFT' && data.status !== 'PENDING_APPROVAL') {
      delete data.status;
    }
  }

  // Continue with update...
}
```

---

## 🎯 Corrected Teacher Frontend

### **What Teachers CAN Do:**

✅ View modules assigned to them  
✅ Add topics to their modules  
✅ Add lessons to topics  
✅ Add attachments to lessons  
✅ Edit topics and lessons  
✅ Delete topics and lessons  
✅ Reorder topics and lessons  
✅ Duplicate topics and lessons  
✅ Submit module for admin approval  
✅ Edit module basic info (title, description) - NOT teacher assignment  

### **What Teachers CANNOT Do:**

❌ Create new modules  
❌ Delete modules  
❌ Change module teacher assignment  
❌ Change module featured/public status  
❌ Approve modules  
❌ Publish modules  
❌ Reject modules  

---

## 📱 Updated Frontend Implementation

### **Teacher Dashboard - My Assigned Modules**

**File**: `frontend/app/teacher/modules/page.tsx` (Already exists)

**Changes Needed**:

1. **Remove** "Create New Module" button
2. **Show only** modules where `teacherId === currentTeacherId`
3. **Change** "Edit Module" to "Add Content"
4. **Add** "View Details" (read-only module info)

**Updated Header**:
```tsx
<div className="flex gap-3 mb-6">
  {/* REMOVE THIS */}
  {/* <Link href="/teacher/modules/create">
    <button>Create New Module</button>
  </Link> */}
  
  {/* SHOW THIS INSTEAD */}
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-sm text-blue-800">
      <strong>Note:</strong> Only admins can create modules. 
      You can add content to modules assigned to you.
    </p>
  </div>
</div>
```

### **Module Card Actions**

**Current**:
```tsx
<button onClick={() => router.push(`/teacher/modules/${module.id}/edit`)}>
  <Edit className="w-4 h-4" />
  Edit Module
</button>
```

**Change to**:
```tsx
{/* View Module Info (Read-only) */}
<button onClick={() => router.push(`/teacher/modules/${module.id}`)}>
  <Eye className="w-4 h-4" />
  View Details
</button>

{/* Add Content (Topics/Lessons) */}
<button onClick={() => router.push(`/teacher/modules/${module.id}/content`)}>
  <BookOpen className="w-4 h-4" />
  Manage Content
</button>
```

### **NEW: Module Details Page (Read-Only)**

**File**: `frontend/app/teacher/modules/[id]/page.tsx` (NEW)

**Purpose**: Show module info (read-only) with "Manage Content" button

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Web Development Bootcamp                    [Back]      │
│  Assigned to: You                                        │
│  Status: DRAFT                                           │
├──────────────────────────────────────────────────────────┤
│  Module Information (Read-Only)                          │
│  ────────────────────────────────────────────────────    │
│                                                          │
│  Title: Web Development Bootcamp                         │
│  Slug: web-development-bootcamp                          │
│  Subject: Computer Science                               │
│  Level: BEGINNER                                         │
│  Class: Grade 11 - Section A                            │
│  Description: Complete beginner-friendly course...       │
│                                                          │
│  Module Statistics                                       │
│  ────────────────────────────────────────────────────    │
│  Topics: 0 • Lessons: 0 • Duration: 0 min               │
│  Enrollments: 0 • Views: 0                              │
│                                                          │
│  [Manage Content (Add Topics/Lessons)]                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### **Content Management Page** (Main Teacher Interface)

**File**: `frontend/app/teacher/modules/[id]/content/page.tsx`

**Layout** (Same as before):
```
┌──────────────────────────────────────────────────────────┐
│  Web Development Bootcamp                    [Back]      │
│  Status: DRAFT • 0 Topics • 0 Lessons                    │
├──────────────────────────────────────────────────────────┤
│  [+ Add Topic]  [Preview Module]                         │
│                                                          │
│  Topics & Lessons List (Accordion)                       │
│  ...                                                     │
│                                                          │
│  [Save Draft]  [Submit for Approval]                     │
└──────────────────────────────────────────────────────────┘
```

**Features**:
- ✅ Add/Edit/Delete Topics
- ✅ Add/Edit/Delete Lessons
- ✅ Reorder Topics/Lessons
- ✅ Add Attachments
- ✅ Submit for Approval
- ❌ NO module creation
- ❌ NO teacher assignment change

---

## 🏗️ Updated File Structure

```
frontend/app/teacher/modules/
├── page.tsx                          (✅ EXISTS - Module list)
│                                     (MODIFY: Remove create button)
│
├── [id]/
│   ├── page.tsx                      (❌ NEW - Module details, read-only)
│   │
│   └── content/
│       └── page.tsx                  (❌ NEW - Topic/Lesson management)
│
├── [id]/topics/
│   └── [topicId]/
│       └── lessons/
│           ├── create/
│           │   └── page.tsx          (❌ NEW - Create lesson)
│           └── [lessonId]/
│               └── edit/
│                   └── page.tsx      (❌ NEW - Edit lesson)
```

**REMOVED**:
- ❌ `/teacher/modules/create/page.tsx` (teachers can't create modules)
- ❌ `/teacher/modules/[id]/edit/page.tsx` (module info is read-only)

**ADDED**:
- ✅ `/teacher/modules/[id]/page.tsx` (view module details)
- ✅ `/teacher/modules/[id]/content/page.tsx` (manage topics/lessons)

---

## 📊 Updated Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN WORKFLOW                           │
└─────────────────────────────────────────────────────────────┘

Admin Dashboard
    ↓
[Create New Module]
    ↓
Fill Module Form:
  - Title, slug, description
  - Subject, class, level
  - Thumbnail
  - Assign to Teacher ← IMPORTANT
    ↓
[Save Module] → Status: DRAFT
    ↓
Teacher is notified

┌─────────────────────────────────────────────────────────────┐
│                   TEACHER WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

Teacher Dashboard
    ↓
[My Assigned Modules] ← Shows modules where teacherId = me
    ↓
Select Module → [Manage Content]
    ↓
Add Topics:
  - Topic 1: Introduction
  - Topic 2: Fundamentals
  - Topic 3: Advanced
    ↓
Add Lessons to Each Topic:
  - Lesson 1.1: Video lesson
  - Lesson 1.2: Text lesson
  - Lesson 1.3: PDF lesson
    ↓
Add Attachments (optional)
    ↓
[Submit for Approval] → Status: PENDING_APPROVAL
    ↓
Admin reviews content
    ↓
Admin approves → Status: PUBLISHED
```

---

## 🔧 Backend Changes Summary

### **File 1**: `backend/src/routes/modules.ts`

```typescript
// Line 27: CHANGE
// FROM:
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), createModule);
// TO:
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createModule);

// Line 29: CHANGE
// FROM:
router.delete('/:id', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), deleteModule);
// TO:
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteModule);
```

### **File 2**: `backend/src/services/module.service.ts`

Add ownership validation in `updateModule` method (as shown above).

---

## ✅ Updated Success Criteria

### **Teacher Can:**
- [x] View modules assigned to them
- [x] View module details (read-only)
- [x] Add topics to their modules
- [x] Add lessons to topics
- [x] Edit topics and lessons
- [x] Delete topics and lessons
- [x] Reorder topics and lessons
- [x] Add attachments to lessons
- [x] Submit module for approval
- [x] See module status updates

### **Teacher Cannot:**
- [x] Create new modules (ADMIN only)
- [x] Delete modules (ADMIN only)
- [x] Edit modules not assigned to them
- [x] Change teacher assignment
- [x] Change featured/public status
- [x] Approve/publish modules

---

## 🚀 Next Steps (Updated)

1. **Backend Changes** (CRITICAL - Do this first)
   - Update `backend/src/routes/modules.ts` (2 lines)
   - Update `backend/src/services/module.service.ts` (add ownership check)
   - Test API with Postman/Thunder Client

2. **Frontend Implementation**
   - Modify `frontend/app/teacher/modules/page.tsx` (remove create button)
   - Create `frontend/app/teacher/modules/[id]/page.tsx` (read-only details)
   - Create `frontend/app/teacher/modules/[id]/content/page.tsx` (topic/lesson management)
   - Create lesson editors (VIDEO, TEXT, PDF, etc.)

3. **Admin Portal** (Separate task)
   - Create admin interface to create modules
   - Create admin interface to assign teachers
   - Create admin interface to approve/publish modules

---

## 📝 Summary

**KEY CHANGE**: **Teachers are CONTENT CREATORS, not MODULE CREATORS**

- **Admin**: Creates module shell, assigns teacher
- **Teacher**: Fills module with topics, lessons, attachments
- **Admin**: Reviews and publishes completed module

This is a **better separation of concerns** and **prevents unauthorized module creation**.

---

**Status**: Workflow corrected ✅  
**Backend Changes**: 2 files (routes + service)  
**Frontend Changes**: Remove create button, add content management UI  
**Timeline**: Same (4-6 weeks), but skip module create form

**Ready to proceed with corrected implementation!** 🚀
