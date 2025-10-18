# Project Architecture Analysis
**Date**: October 18, 2025
**Purpose**: Understanding existing structure before creating page templates

---

## 🏗️ Project Structure

### 1. **Tech Stack**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + Redux Persist
- **Animations**: Framer Motion
- **API**: REST (React Query 5.90.5 ready)
- **Notifications**: react-toastify

### 2. **Directory Architecture**

```
frontend/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # Root layout with Providers + ToastContainer
│   ├── page.tsx                 # Landing page
│   ├── admin/                   # Admin routes
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── login/               # Admin authentication
│   │   └── users/               # User management
│   └── student/                 # Student routes
│       ├── dashboard/           # Student dashboard (495 lines)
│       ├── login/               # Student authentication
│       └── profile/             # Student profile
│
├── src/
│   ├── features/                # Feature-based organization
│   │   ├── admin/               # Admin feature module
│   │   │   ├── components/      # AdminLayout, StatsCard, Charts, etc.
│   │   │   ├── hooks/           # useAdminAuth, useUsers, useAdminStats
│   │   │   ├── services/        # admin-api.service.ts
│   │   │   ├── store/           # admin-auth.store.ts (Zustand/Redux)
│   │   │   ├── types/           # TypeScript interfaces
│   │   │   └── index.ts         # Public API exports
│   │   │
│   │   ├── auth/                # Authentication feature
│   │   ├── common/              # Shared components
│   │   │   └── components/Providers.tsx
│   │   │
│   │   └── modules/             # LMS Modules feature
│   │       ├── components/
│   │       │   └── ui/          # ✅ ALL 24 UI COMPONENTS (9,260 lines)
│   │       ├── hooks/           # Custom hooks for modules
│   │       └── types/           # Module, Lesson, Topic types (587 lines)
│   │
│   ├── services/
│   │   └── student-api.service.ts  # Student API service
│   │
│   ├── store/
│   │   ├── index.ts             # Redux store setup
│   │   └── slices/
│   │       └── adminAuthSlice.ts
│   │
│   ├── config/
│   │   └── api.config.ts        # API configuration
│   │
│   └── utils/
│       └── toast.util.ts        # Toast notifications
│
└── backend/                     # Express + Prisma backend
    ├── src/
    │   ├── controllers/         # 68+ endpoints
    │   ├── routes/              # API routes
    │   ├── middlewares/         # Auth, upload, error handling
    │   └── services/
    └── prisma/
        └── schema.prisma        # Database schema
```

---

## 🎨 Current UI Components (Phase 1-3 Complete)

### **Base Components (8)** ✅
- utils/cn.ts, Badge, Skeleton, Progress, Tooltip, Button, Input, Card

### **Form Components (8)** ✅
- Select, Textarea, Checkbox, Radio, Switch, FileUpload, DatePicker, RichTextEditor

### **Complex Components (8)** ✅
- Modal, Tabs, Table, Pagination, Dropdown, Accordion, Avatar, Alert

**Total**: 24 components, ~9,260 lines, 111+ variants/helpers

---

## 🔌 API Integration Pattern

### **Backend API Structure**
```typescript
// Base URL: http://localhost:5000/api/v1
// Available Endpoints (68+):

Auth:
- POST /auth/login
- POST /auth/register
- POST /auth/logout
- GET /auth/profile

Admin:
- POST /admin/auth/login
- GET /admin/users
- POST /admin/users/student
- POST /admin/users/teacher
- PATCH /admin/users/:id
- DELETE /admin/users/:id

Courses/Modules:
- GET /modules
- POST /modules
- GET /modules/:id
- PATCH /modules/:id
- DELETE /modules/:id
- POST /modules/:id/enroll

Exams:
- GET /exams
- POST /exams
- POST /exams/:id/submit

Materials, Notices, Routines, Live Classes, Messages, etc.
```

### **Frontend API Services**
```typescript
// src/services/student-api.service.ts
class StudentApiService {
  isAuthenticated()
  login(email, password)
  register(data)
  logout()
  getCurrentUser()
  updateProfile(data)
  getAvatarUrl(filename)
}

// src/features/admin/services/admin-api.service.ts
class AdminApiService {
  login(credentials)
  getUsers(params)
  getUserDetail(id)
  createStudent(data)
  blockUser(id, data)
  // ... more methods
}
```

---

## 🎯 Existing Pages Analysis

### **1. Admin Dashboard** (`app/admin/dashboard/page.tsx`)
**Current Implementation**:
- ✅ Uses AdminLayout wrapper
- ✅ StatsCard components (Total Students, Teachers, Courses, Live Classes)
- ✅ Charts (Enrollment, Course Distribution, Activity)
- ✅ ActivityFeed + QuickActions
- ✅ Framer Motion animations
- ❌ **Not using our new UI components** (uses old feature-specific components)

### **2. Student Dashboard** (`app/student/dashboard/page.tsx`)
**Current Implementation** (495 lines):
- ✅ Authentication check with studentApiService
- ✅ Profile data loading
- ✅ Avatar with dropdown menu (custom implementation)
- ✅ Course cards, upcoming classes, progress tracking
- ✅ Quick stats (Enrolled Courses, Completed Lessons, etc.)
- ❌ **Not using our new UI components** (custom cards and layouts)

### **3. Authentication Pages**
- Admin Login: `/app/admin/login/page.tsx`
- Student Login: `/app/student/login/page.tsx`
- ❌ **Need to check if they use our new Form components**

---

## 📊 Data Types Available

### **Module System Types** (`src/features/modules/types/index.ts` - 587 lines)
```typescript
// Enums
LessonType: VIDEO, YOUTUBE_LIVE, PDF, TEXT, QUIZ, ASSIGNMENT, EXTERNAL_LINK
ModuleStatus: DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED, ARCHIVED
ActivityType: MODULE_ENROLLED, LESSON_STARTED, LESSON_COMPLETED, etc.

// Interfaces
Module: id, title, description, thumbnail, teacherId, subjectId, classId, duration, level, status, isFeatured
Lesson: id, title, type, content, duration, moduleId, order, isPublished
Topic: id, title, description, lessonId, videoUrl, pdfUrl, content, duration, order
Progress: studentId, moduleId, lessonId, topicId, completionPercentage, lastAccessedAt
Enrollment: studentId, moduleId, enrolledAt, completedAt, certificateUrl
```

### **Admin Types** (`src/features/admin/types/`)
```typescript
AdminUser, LoginCredentials, LoginResponse
UserItem, UsersListResponse, CreateStudentData, CreateTeacherData
UpdateUserData, BlockUserData, AuditTrailItem, AuditTrailResponse
Pagination
```

---

## 🎨 Design System Status

### **Theme Configuration**
- ✅ Tailwind CSS configured
- ✅ Dark mode support in all components
- ✅ Color palette: primary (blue), success (green), warning (yellow), error (red)
- ✅ Responsive breakpoints: sm, md, lg, xl, 2xl

### **Animation System**
- ✅ Framer Motion for page transitions
- ✅ Tailwind transitions for component states
- ✅ Custom animations in complex components (Modal, Tabs, Alert)

### **Accessibility**
- ✅ WCAG 2.1 AA compliant components
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Focus management

---

## 🔄 State Management

### **Redux Store** (`src/store/index.ts`)
```typescript
// Redux Toolkit + Redux Persist
// Current Slices:
- adminAuthSlice: Admin authentication state

// Storage: localStorage (with SSR fallback)
// Persisted: adminAuth slice only
```

### **React Query** (Ready but not implemented)
- ✅ Package installed: @tanstack/react-query@5.90.5
- ❌ QueryClient not yet configured
- ❌ No queries/mutations implemented yet

---

## 🎯 Page Templates Needed

### **Priority 1: Course Pages** (Most Critical)
1. **Course Listing Page** (`/student/courses`)
   - Grid/list view toggle
   - Search and filters
   - Course cards with enrollment status
   - Pagination

2. **Course Detail Page** (`/student/courses/[id]`)
   - Course header (title, instructor, rating)
   - Tabs: Overview, Curriculum, Reviews
   - Accordion for modules/lessons
   - Enrollment button
   - Progress bar (if enrolled)

3. **Lesson Viewer Page** (`/student/courses/[courseId]/lessons/[lessonId]`)
   - Video player / PDF viewer / Content display
   - Sidebar with module navigation
   - Progress tracking
   - Previous/Next lesson navigation
   - Notes section

### **Priority 2: Dashboard Enhancements**
4. **Student Dashboard Upgrade** (Refactor existing)
   - Use our new Card, Progress, Avatar components
   - Modern stats cards
   - Course progress widgets
   - Upcoming classes table

5. **Admin Dashboard Upgrade** (Refactor existing)
   - Use our new Table, Modal, Dropdown components
   - User management table
   - Quick action modals
   - Statistics charts

### **Priority 3: Management Pages**
6. **User Profile Page** (`/student/profile`)
   - Avatar upload (using FileUpload component)
   - Profile form (using form components)
   - Activity history (using Table)
   - Settings tabs

7. **Course Management Page** (`/admin/courses`)
   - Create/Edit course modal
   - Course list with actions dropdown
   - Status badges
   - Bulk actions

8. **Exam/Quiz Interface** (`/student/exams/[id]`)
   - Question navigation
   - Timer component
   - Submit confirmation modal
   - Results display with charts

---

## 📋 Component Usage Strategy

### **Recommended Component Mappings**

| Use Case | Components to Use |
|----------|------------------|
| Course Cards | Card, Badge, Progress, Button, Avatar |
| Course Filters | Select, Checkbox, Input, Button |
| Module Navigation | Accordion, Tabs, Progress |
| Video/Content Viewer | Card, Button, Progress, Tabs |
| User Menu | Dropdown (UserMenu), Avatar |
| Data Tables | Table, Pagination, Dropdown (actions) |
| Forms | Input, Select, Textarea, Checkbox, Radio, Switch, FileUpload, DatePicker, Button |
| Notifications | Alert, Toast |
| Confirmations | Modal (ConfirmModal, AlertModal) |
| Stats Display | Card, Progress, Badge |

---

## 🚀 Next Steps

### **Phase 2 Step 4/4: Page Templates** (CURRENT)

1. ✅ **Analysis Complete** - This document
2. 🎯 **Create Template Components** (Next):
   - CourseCard template
   - CourseListTemplate
   - CourseDetailTemplate
   - LessonViewerTemplate
   - DashboardWidget templates

3. 🎯 **Refactor Existing Pages**:
   - Update student dashboard to use new components
   - Update admin dashboard to use new components
   - Create reusable layouts

4. 🎯 **Create New Pages**:
   - Course listing and detail pages
   - Lesson viewer
   - Profile pages with new components

---

## 💡 Key Insights

### **Strengths**
✅ Solid backend with 68+ endpoints
✅ Comprehensive type definitions (587 lines)
✅ Feature-based architecture
✅ Complete UI component library (24 components)
✅ Authentication system in place
✅ SSR-safe state management

### **Gaps to Fill**
❌ Existing pages not using new UI components
❌ React Query not configured
❌ Missing course browsing/viewing pages
❌ Limited reusable page templates
❌ No lesson content viewer

### **Opportunities**
🎯 Refactor existing pages to use new components
🎯 Create reusable page templates
🎯 Build complete course viewing experience
🎯 Implement React Query for data fetching
🎯 Create comprehensive LMS features

---

**Analysis Status**: ✅ Complete
**Ready for**: Page Template Development
**Estimated Components Needed**: 8-10 page templates
**Estimated LOC**: ~3,000-4,000 lines
