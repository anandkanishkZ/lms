# 🗺️ COURSE SYSTEM - USER FLOW DIAGRAMS

## Visual Guide to Understanding How the System Works

**Date:** October 17, 2025  
**Purpose:** Visualize user journeys and system interactions

---

## 👨‍🎓 STUDENT USER FLOW

### **Flow 1: Browsing & Enrolling in a Course**

```
START
  ↓
[Student Dashboard]
  ↓
[Click "Browse Courses"]
  ↓
[Course Catalog Page]
  |
  ├─→ [Search/Filter Courses]
  ├─→ [View Course Categories]
  └─→ [View Featured Courses]
  ↓
[Click on Course Card]
  ↓
[Course Detail Page]
  |
  ├─→ [View Course Overview]
  ├─→ [Check Curriculum]
  ├─→ [Read Reviews]
  └─→ [See Instructor Info]
  ↓
[Click "Enroll Now" Button]
  ↓
[Enrollment Confirmation]
  ↓
✅ Enrolled Successfully!
  ↓
[Redirect to "My Courses"]
  ↓
END
```

---

### **Flow 2: Taking a Course (Learning Journey)**

```
START
  ↓
[My Courses Page]
  ↓
[Select Course to Study]
  ↓
[Course Player Interface]
  |
  ├─ LEFT SIDEBAR ─┐
  │  - Module List  │
  │  - Lesson List  │
  │  - Progress Bar │
  └─────────────────┘
  |
  ├─ MAIN AREA ────┐
  │  - Video Player │
  │  OR            │
  │  - PDF Viewer  │
  │  OR            │
  │  - Text Content│
  │  - Attachments │
  └────────────────┘
  |
  ├─ TABS ─────────┐
  │  - Overview    │
  │  - Notes       │
  │  - Discussion  │
  │  - Quiz        │
  └────────────────┘
  ↓
[Watch/Read Lesson]
  ↓
[Take Notes (Optional)]
  ↓
[Ask Questions (Optional)]
  ↓
[Download Materials (Optional)]
  ↓
[Complete Lesson]
  |
  ├─ Has Quiz? ────→ [Take Quiz] ──→ [Pass?] ─Yes→ [Continue]
  │                                     │
  │                                    No
  │                                     ↓
  │                                 [Retry Quiz]
  │
  ↓
[Auto-Save Progress]
  ↓
[Move to Next Lesson]
  ↓
[Repeat Until Course Complete]
  ↓
[Course 100% Complete]
  ↓
[Certificate Generated]
  ↓
✅ [Download Certificate]
  ↓
END
```

---

### **Flow 3: Engaging with Content**

```
[During Lesson]
  ↓
┌─────────────────────────────────────┐
│                                     │
│  Action Options:                    │
│                                     │
│  ① Take Notes                       │
│     ↓                               │
│     [Click "Notes" Tab]             │
│     ↓                               │
│     [Type Notes]                    │
│     ↓                               │
│     [Save (Auto-saved)]             │
│                                     │
│  ② Ask Question                     │
│     ↓                               │
│     [Click "Discussion" Tab]        │
│     ↓                               │
│     [Write Question]                │
│     ↓                               │
│     [Submit]                        │
│     ↓                               │
│     [Teacher/Peers Reply]           │
│                                     │
│  ③ Download Materials               │
│     ↓                               │
│     [View Attachments Section]      │
│     ↓                               │
│     [Click Download Button]         │
│     ↓                               │
│     [File Downloads]                │
│                                     │
│  ④ Mark Complete                    │
│     ↓                               │
│     [Click "Mark Complete"]         │
│     ↓                               │
│     [Progress Updated]              │
│     ↓                               │
│     [Next Lesson Unlocked]          │
│                                     │
└─────────────────────────────────────┘
```

---

## 👨‍🏫 TEACHER USER FLOW

### **Flow 1: Creating a New Course**

```
START
  ↓
[Teacher Dashboard]
  ↓
[Click "Create Course"]
  ↓
┌─────────────────────────────────────┐
│ STEP 1: Basic Information          │
│ ────────────────────────────────── │
│ - Course Title                      │
│ - Description                       │
│ - Subject Selection                 │
│ - Class Selection                   │
│ - Level (Beginner/Intermediate)     │
│ - Upload Thumbnail                  │
│ ────────────────────────────────── │
│ [Save & Continue]                   │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ STEP 2: Add Modules                 │
│ ────────────────────────────────── │
│ [+ Add Module]                      │
│   ↓                                 │
│   - Module Title                    │
│   - Description                     │
│   - Order/Sequence                  │
│   [Save Module]                     │
│ ────────────────────────────────── │
│ Repeat for each module...           │
│ ────────────────────────────────── │
│ [Save & Continue]                   │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ STEP 3: Add Lessons to Each Module  │
│ ────────────────────────────────── │
│ [Select Module]                     │
│   ↓                                 │
│ [+ Add Lesson]                      │
│   ↓                                 │
│   Choose Content Type:              │
│   ├─→ [Video] ────→ [YouTube URL]   │
│   ├─→ [PDF] ──────→ [Upload File]   │
│   ├─→ [Text] ─────→ [Rich Editor]   │
│   ├─→ [Quiz] ─────→ [Link Exam]     │
│   └─→ [External] ─→ [Add Link]      │
│   ↓                                 │
│   - Lesson Title                    │
│   - Description                     │
│   - Duration (optional)             │
│   - Is Preview? (Free access)       │
│   ↓                                 │
│   [Add Attachments] (optional)      │
│   ├─→ [Upload PDF]                  │
│   ├─→ [Upload PPT]                  │
│   └─→ [Upload DOC]                  │
│   ↓                                 │
│   [Save Lesson]                     │
│ ────────────────────────────────── │
│ Repeat for all lessons...           │
│ ────────────────────────────────── │
│ [Save & Continue]                   │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ STEP 4: Review & Publish            │
│ ────────────────────────────────── │
│ [Preview Course Structure]          │
│ - View all modules                  │
│ - View all lessons                  │
│ - Check content links               │
│ ────────────────────────────────── │
│ Options:                            │
│ ├─→ [Save as Draft] (for later)    │
│ └─→ [Publish Course] (go live!)    │
└─────────────────────────────────────┘
  ↓
✅ Course Published!
  ↓
[View on Course Catalog]
  ↓
[Students Can Now Enroll]
  ↓
END
```

---

### **Flow 2: Managing Existing Course**

```
START
  ↓
[My Courses Page]
  ↓
[Select Course to Manage]
  ↓
┌─────────────────────────────────────┐
│ Course Management Dashboard         │
│ ────────────────────────────────── │
│                                     │
│ TABS:                               │
│                                     │
│ ① [Edit Content]                    │
│    ├─→ Add/Edit Modules             │
│    ├─→ Add/Edit Lessons             │
│    ├─→ Reorder Content              │
│    └─→ Update Materials             │
│                                     │
│ ② [Enrolled Students]               │
│    ├─→ View Student List            │
│    ├─→ Track Progress               │
│    ├─→ View Completion Rates        │
│    └─→ Message Students             │
│                                     │
│ ③ [Discussions]                     │
│    ├─→ View Questions               │
│    ├─→ Reply to Students            │
│    ├─→ Pin Important Threads        │
│    └─→ Mark as Resolved             │
│                                     │
│ ④ [Analytics]                       │
│    ├─→ Enrollment Stats             │
│    ├─→ Completion Rates             │
│    ├─→ Average Ratings              │
│    ├─→ Popular Lessons              │
│    └─→ Drop-off Points              │
│                                     │
│ ⑤ [Settings]                        │
│    ├─→ Course Visibility            │
│    ├─→ Enrollment Options           │
│    ├─→ Certificate Settings         │
│    └─→ Delete Course                │
│                                     │
└─────────────────────────────────────┘
  ↓
[Make Updates as Needed]
  ↓
END
```

---

## 👤 ADMIN USER FLOW

### **Flow 1: Course Approval Process**

```
START
  ↓
[Admin Dashboard]
  ↓
[Navigate to "Courses"]
  ↓
[View "Pending Approval" Tab]
  ↓
[List of Courses Awaiting Approval]
  ↓
[Select Course to Review]
  ↓
┌─────────────────────────────────────┐
│ Course Review Screen                │
│ ────────────────────────────────── │
│ - View Course Details               │
│ - Check Content Quality             │
│ - Review Modules & Lessons          │
│ - Preview Content                   │
│ - Check for Inappropriate Content   │
│ ────────────────────────────────── │
│ Decision:                           │
│                                     │
│ ① [Approve] ───→ [Course Goes Live] │
│                                     │
│ ② [Reject] ────→ [Add Reason]       │
│                  ↓                  │
│                  [Notify Teacher]   │
│                  ↓                  │
│                  [Teacher Fixes]    │
│                  ↓                  │
│                  [Resubmit]         │
│                                     │
│ ③ [Request Changes] → [Feedback]    │
│                       ↓             │
│                       [Teacher Edits]│
│                                     │
└─────────────────────────────────────┘
  ↓
END
```

---

### **Flow 2: Managing Course System**

```
START
  ↓
[Admin Dashboard]
  ↓
┌─────────────────────────────────────┐
│ Course Management Options           │
│ ────────────────────────────────── │
│                                     │
│ ① View All Courses                  │
│    ├─→ Published Courses            │
│    ├─→ Draft Courses                │
│    ├─→ Pending Approval             │
│    └─→ Archived Courses             │
│                                     │
│ ② Featured Courses                  │
│    ├─→ Mark as Featured             │
│    ├─→ Remove from Featured         │
│    └─→ Reorder Featured List        │
│                                     │
│ ③ Categories/Subjects               │
│    ├─→ Add New Subject              │
│    ├─→ Edit Subject                 │
│    └─→ Manage Subject Colors        │
│                                     │
│ ④ System Analytics                  │
│    ├─→ Total Courses                │
│    ├─→ Total Enrollments            │
│    ├─→ Most Popular Courses         │
│    ├─→ Completion Rates             │
│    └─→ Revenue (if applicable)      │
│                                     │
│ ⑤ User Management                   │
│    ├─→ Active Teachers              │
│    ├─→ Active Students              │
│    ├─→ Enrollment Reports           │
│    └─→ Certificate Reports          │
│                                     │
└─────────────────────────────────────┘
  ↓
END
```

---

## 📊 SYSTEM DATA FLOW

### **How Data Moves Through the System**

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTIONS                         │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (Next.js)                      │
│ ────────────────────────────────────────────────────── │
│ • React Components                                      │
│ • Zustand State Management                             │
│ • API Service Layer                                     │
│ • Form Validation (Zod)                                │
└─────────────────┬───────────────────────────────────────┘
                  ↓
              [HTTP REQUEST]
                  ↓
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Express.js)                    │
│ ────────────────────────────────────────────────────── │
│ • Authentication Middleware (JWT)                       │
│ • Request Validation (Zod)                             │
│ • Controllers (Handle Requests)                         │
│ • Services (Business Logic)                            │
│ • Repositories (Database Queries)                      │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│                DATABASE (PostgreSQL + Prisma)           │
│ ────────────────────────────────────────────────────── │
│ Tables:                                                 │
│ • courses                                               │
│ • modules                                               │
│ • lessons                                               │
│ • enrollments                                           │
│ • progress tracking                                     │
│ • discussions                                           │
│ • reviews                                               │
│ • certificates                                          │
└─────────────────┬───────────────────────────────────────┘
                  ↓
              [RESPONSE]
                  ↓
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND UPDATES                        │
│ ────────────────────────────────────────────────────── │
│ • Update UI Components                                  │
│ • Update State (Zustand)                               │
│ • Show Success/Error Messages                          │
│ • Navigate to Next Screen                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 PROGRESS TRACKING FLOW

### **How Progress is Tracked and Updated**

```
[Student Opens Lesson]
  ↓
[Backend Creates/Updates LessonProgress Record]
  - status: 'IN_PROGRESS'
  - startedAt: [Current Time]
  - lastAccessedAt: [Current Time]
  ↓
┌────────────────────────────────────┐
│ Content Type?                      │
├────────────────────────────────────┤
│                                    │
│ IF VIDEO:                          │
│ ├─→ Track playback time           │
│ ├─→ Update every 10 seconds       │
│ ├─→ Save video position           │
│ └─→ Resume from last position     │
│                                    │
│ IF PDF/TEXT:                       │
│ ├─→ Track time on page            │
│ └─→ Manual "Mark Complete"        │
│                                    │
│ IF QUIZ:                           │
│ ├─→ Record quiz attempts          │
│ ├─→ Record quiz score             │
│ └─→ Mark complete if passed       │
│                                    │
└────────────────────────────────────┘
  ↓
[Student Completes Lesson]
  ↓
[Click "Mark as Complete" or Auto-Complete]
  ↓
[Backend Updates]
  - status: 'COMPLETED'
  - completedAt: [Current Time]
  - isCompleted: true
  - progress: 100%
  ↓
[Calculate Module Progress]
  - Count completed lessons
  - Calculate percentage
  - Update ModuleProgress table
  ↓
[Calculate Course Progress]
  - Count completed modules
  - Calculate overall percentage
  - Update Enrollment table
  ↓
[Check if Course Complete]
  - If 100% complete:
    ├─→ Mark enrollment as completed
    ├─→ Generate certificate
    ├─→ Send notification
    └─→ Update student dashboard
  ↓
[Frontend Updates]
  - Update progress bars
  - Unlock next lesson
  - Show completion animation
  - Update "My Courses" page
  ↓
END
```

---

## 🎯 CONTENT CREATION FLOW

### **Teacher Creating Course Content**

```
[Teacher Creates Course Structure]
  ↓
┌────────────────────────────────────────┐
│ FOR EACH MODULE:                       │
│                                        │
│ Step 1: Create Module                 │
│   ↓                                    │
│   - Save to database (modules table)  │
│   - Generate unique ID                │
│   - Set order/sequence                │
│                                        │
│ Step 2: Add Lessons to Module         │
│   ↓                                    │
│   FOR EACH LESSON:                     │
│                                        │
│   Choose Content Type:                 │
│   ├─ VIDEO                             │
│   │   ├─→ Enter YouTube URL            │
│   │   ├─→ Extract video ID             │
│   │   └─→ Save lesson record           │
│   │                                    │
│   ├─ PDF                               │
│   │   ├─→ Upload file (Multer)         │
│   │   ├─→ Save to /uploads/courses/   │
│   │   ├─→ Generate secure URL          │
│   │   └─→ Save lesson record           │
│   │                                    │
│   ├─ TEXT                              │
│   │   ├─→ Use rich text editor         │
│   │   ├─→ Save HTML content            │
│   │   └─→ Save lesson record           │
│   │                                    │
│   └─ QUIZ                              │
│       ├─→ Link to existing Exam        │
│       └─→ Save lesson record           │
│                                        │
│   Add Attachments (Optional):         │
│   ├─→ Upload PDF                       │
│   ├─→ Upload PPT                       │
│   ├─→ Upload DOC                       │
│   └─→ Save to lesson_attachments      │
│                                        │
└────────────────────────────────────────┘
  ↓
[Review All Content]
  ↓
[Publish Course]
  ↓
[Course Goes Live]
  ↓
[Students Can Enroll]
  ↓
END
```

---

## 💾 DATABASE RELATIONSHIPS VISUAL

```
┌──────────────┐
│    USER      │
│  (Student)   │
└──────┬───────┘
       │ has many
       ↓
┌──────────────┐         ┌──────────────┐
│ ENROLLMENT   │──────→  │   COURSE     │
│              │ enrolls │              │
└──────┬───────┘         └──────┬───────┘
       │                        │ has many
       │ has many               ↓
       ↓                 ┌──────────────┐
┌──────────────┐         │   MODULE     │
│MODULE_PROGRESS│         └──────┬───────┘
└──────────────┘                │ has many
                                ↓
                         ┌──────────────┐
                         │   LESSON     │
                         └──────┬───────┘
                                │
                ┌───────────────┼───────────────┐
                ↓               ↓               ↓
         ┌──────────────┐ ┌──────────┐ ┌──────────────┐
         │LESSON_PROGRESS│ │   NOTE   │ │ ATTACHMENT   │
         └──────────────┘ └──────────┘ └──────────────┘
                ↓
         ┌──────────────┐
         │ DISCUSSION   │
         └──────────────┘
```

---

## 🎨 UI COMPONENT HIERARCHY

```
CoursePlayerPage
├── CourseHeader
│   ├── CourseBreadcrumb
│   └── ProgressBar
├── CourseLayout
│   ├── LeftSidebar
│   │   ├── ModuleList
│   │   │   ├── ModuleItem
│   │   │   │   ├── LessonList
│   │   │   │   │   └── LessonItem
│   │   │   │   │       ├── LessonIcon
│   │   │   │   │       ├── LessonTitle
│   │   │   │   │       └── LessonDuration
│   │   │   │   └── ModuleProgress
│   │   │   └── ... more modules
│   │   └── CourseProgress
│   │
│   ├── MainContent
│   │   ├── LessonHeader
│   │   ├── ContentArea
│   │   │   ├── VideoPlayer (if video)
│   │   │   ├── PDFViewer (if pdf)
│   │   │   ├── TextContent (if text)
│   │   │   └── QuizEmbed (if quiz)
│   │   ├── AttachmentsSection
│   │   │   └── AttachmentList
│   │   │       └── AttachmentItem
│   │   ├── TabNavigation
│   │   │   ├── OverviewTab
│   │   │   ├── NotesTab
│   │   │   │   ├── NotesList
│   │   │   │   └── NoteEditor
│   │   │   ├── DiscussionTab
│   │   │   │   ├── DiscussionList
│   │   │   │   └── DiscussionForm
│   │   │   └── QuizTab
│   │   └── LessonNavigation
│   │       ├── PreviousButton
│   │       ├── CompleteButton
│   │       └── NextButton
│   │
│   └── RightSidebar (Optional)
│       ├── LessonInfo
│       ├── InstructorCard
│       └── RelatedLessons
│
└── Footer
```

---

## 🚀 DEPLOYMENT FLOW

```
[Development Complete]
  ↓
[Testing Phase]
  ├─→ Unit Tests
  ├─→ Integration Tests
  └─→ User Acceptance Testing
  ↓
[Code Review & Approval]
  ↓
[Database Migration]
  ├─→ Backup current database
  ├─→ Run Prisma migrations
  └─→ Verify migration success
  ↓
[Backend Deployment]
  ├─→ Build TypeScript
  ├─→ Deploy to server
  ├─→ Update environment variables
  └─→ Restart server
  ↓
[Frontend Deployment]
  ├─→ Build Next.js app
  ├─→ Deploy to hosting
  └─→ Update API endpoints
  ↓
[Post-Deployment Checks]
  ├─→ Test all endpoints
  ├─→ Verify file uploads
  ├─→ Check video playback
  └─→ Monitor error logs
  ↓
[Gradual Rollout]
  ├─→ Enable for admin (test)
  ├─→ Enable for teachers (beta)
  ├─→ Enable for students (pilot)
  └─→ Full launch
  ↓
✅ System Live!
  ↓
[Monitor & Maintain]
  ├─→ Track usage metrics
  ├─→ Gather user feedback
  ├─→ Fix bugs promptly
  └─→ Plan improvements
  ↓
END
```

---

## 📊 DECISION TREE

### **Choosing Content Type for Lessons**

```
                [Creating a Lesson]
                        ↓
            ┌───────────┴───────────┐
            │ What type of content? │
            └───────────┬───────────┘
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    [Lecture]       [Reading]       [Assessment]
        ↓               ↓               ↓
  Use VIDEO       Use PDF/TEXT      Use QUIZ
        ↓               ↓               ↓
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ YouTube?  │   │ PDF file? │   │ MCQ Quiz? │
    │ or Vimeo? │   │ or HTML?  │   │ or Essay? │
    └───────────┘   └───────────┘   └───────────┘
```

---

## 🎯 CONCLUSION

These visual flows demonstrate:

✅ **Clear User Journeys** - Everyone knows what to do  
✅ **Logical Progression** - Steps flow naturally  
✅ **Complete Coverage** - All scenarios handled  
✅ **Easy to Understand** - Visual representation helps  

Use these diagrams to:
- Train users
- Debug issues
- Plan features
- Communicate with stakeholders

---

*Created by: Senior Software Developer & UX Designer*  
*Date: October 17, 2025*  
*Version: 1.0*
