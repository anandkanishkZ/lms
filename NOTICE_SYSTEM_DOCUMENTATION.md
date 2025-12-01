# 📢 Notice & Announcement System - Complete Documentation

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Database Schema](#database-schema)
- [Backend API](#backend-api)
- [Frontend Components](#frontend-components)
- [Integration Guide](#integration-guide)
- [Usage Examples](#usage-examples)

---

## Overview

A comprehensive Notice & Announcement system for the LMS that enables role-based notifications across the entire platform. Supports targeted messaging to specific classes, batches, modules, or roles with advanced features like read tracking, priority levels, pinned notices, and expiration dates.

**Created:** December 1, 2024  
**Status:** ✅ Fully Implemented

---

## Features

### Core Capabilities
✅ **Granular Targeting**
- Global notices (all users)
- Class-specific notices
- Batch-specific notices
- Module-specific notices  
- Role-based notices (ADMIN, TEACHER, STUDENT)

✅ **Advanced Features**
- Read/Unread tracking per user
- Priority levels (LOW, MEDIUM, HIGH, URGENT)
- Pinned notices for important announcements
- Expiration dates with visual warnings
- View count tracking
- File attachments support
- Draft and publish workflow

✅ **Categorization**
- EXAM - Exam-related notices
- EVENT - Events and activities
- HOLIDAY - Holiday announcements
- GENERAL - General notices

✅ **User Experience**
- Real-time unread count badge
- Filter by category, priority, read status
- Search functionality
- Responsive card-based UI
- Notification bell dropdown
- Detailed modal view
- Nepali Unicode support

---

## Database Schema

### Notice Model
```prisma
model Notice {
  id             String        @id @default(uuid())
  title          String
  content        String        @db.Text
  category       NoticeCategory @default(GENERAL)
  priority       Priority      @default(MEDIUM)
  attachmentUrl  String?
  isPinned       Boolean       @default(false)
  isPublished    Boolean       @default(false)
  publishedAt    DateTime?
  expiresAt      DateTime?
  viewCount      Int           @default(0)
  
  // Targeting fields (all nullable = global notice)
  classId        String?
  batchId        String?
  moduleId       String?
  targetRole     Role?
  
  publishedBy    String
  
  // Relations
  publishedByUser User         @relation(fields: [publishedBy], references: [id], onDelete: Cascade)
  class          Class?        @relation(fields: [classId], references: [id], onDelete: Cascade)
  batch          Batch?        @relation(fields: [batchId], references: [id], onDelete: Cascade)
  module         Module?       @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  readBy         NoticeRead[]
  
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  @@index([classId])
  @@index([batchId])
  @@index([moduleId])
  @@index([publishedBy])
  @@index([isPublished])
  @@index([category])
  @@index([priority])
}
```

### NoticeRead Model (Tracking)
```prisma
model NoticeRead {
  id        String   @id @default(uuid())
  noticeId  String
  userId    String
  readAt    DateTime @default(now())
  
  notice    Notice   @relation(fields: [noticeId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([noticeId, userId])
  @@index([userId])
  @@index([noticeId])
}
```

### Enums
```prisma
enum NoticeCategory {
  EXAM
  EVENT
  HOLIDAY
  GENERAL
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Migration Applied
✅ Migration: `20251201061703_add_enhanced_notice_system_with_read_tracking`

---

## Backend API

### Base URL
```
/api/v1/notices
```

### Endpoints

#### 1. Create Notice
**POST** `/api/v1/notices`

**Access:** Admin, Teacher  
**Request Body:**
```typescript
{
  title: string;              // Required
  content: string;            // Required
  category?: NoticeCategory;  // Default: GENERAL
  priority?: Priority;        // Default: MEDIUM
  attachmentUrl?: string;
  isPinned?: boolean;         // Default: false
  expiresAt?: string;         // ISO date string
  classId?: string;           // Targeting
  batchId?: string;           // Targeting
  moduleId?: string;          // Targeting
  targetRole?: Role;          // Targeting
  isPublished?: boolean;      // Default: false (draft)
}
```

**Response:**
```typescript
{
  success: true,
  message: "Notice created successfully",
  data: Notice
}
```

**Authorization Rules:**
- Students cannot create notices (403)
- Teachers must specify classId, batchId, or moduleId (400)
- Only admins can create global notices
- Teachers verified for class/module ownership

---

#### 2. Get All Notices
**GET** `/api/v1/notices`

**Access:** All authenticated users  
**Query Parameters:**
```typescript
{
  category?: NoticeCategory;
  priority?: Priority;
  isPinned?: boolean;
  classId?: string;
  batchId?: string;
  moduleId?: string;
  includeExpired?: boolean;  // Default: false
  unreadOnly?: boolean;      // Default: false
}
```

**Response:**
```typescript
{
  success: true,
  message: "Notices retrieved successfully",
  data: Notice[]  // Includes isRead flag
}
```

**Filtering Logic:**
- **Students see:**
  - Global notices (no targeting)
  - Notices targeted to STUDENT role
  - Notices for their enrolled classes
  - Notices for their batch
  - Notices for their enrolled modules

- **Teachers see:**
  - Global notices
  - Notices targeted to TEACHER role
  - Notices for their assigned classes
  - Notices for their created modules

- **Admins see:**
  - All published notices (no filter)

- **Ordering:**
  1. Pinned first
  2. Priority (URGENT > HIGH > MEDIUM > LOW)
  3. Published date (newest first)

---

#### 3. Get Notice by ID
**GET** `/api/v1/notices/:id`

**Access:** All authenticated users  
**Response:**
```typescript
{
  success: true,
  message: "Notice retrieved successfully",
  data: Notice  // Includes full details + isRead
}
```

**Side Effects:**
- Increments `viewCount` by 1
- Creates `NoticeRead` entry if not already read

---

#### 4. Update Notice
**PUT** `/api/v1/notices/:id`

**Access:** Admin, Notice creator  
**Request Body:** Partial<CreateNoticeData>

**Response:**
```typescript
{
  success: true,
  message: "Notice updated successfully",
  data: Notice
}
```

**Authorization:**
- Only creator or admin can update
- Sets `publishedAt` when `isPublished` changes to true

---

#### 5. Delete Notice
**DELETE** `/api/v1/notices/:id`

**Access:** Admin, Notice creator  
**Response:**
```typescript
{
  success: true,
  message: "Notice deleted successfully"
}
```

**Side Effects:**
- CASCADE deletes all related `NoticeRead` entries

---

#### 6. Mark as Read
**POST** `/api/v1/notices/:id/read`

**Access:** All authenticated users  
**Response:**
```typescript
{
  success: true,
  message: "Notice marked as read"
}
```

**Behavior:**
- UPSERT operation (idempotent)
- Updates `readAt` if already exists

---

#### 7. Get Unread Count
**GET** `/api/v1/notices/unread/count`

**Access:** All authenticated users  
**Response:**
```typescript
{
  success: true,
  message: "Unread count retrieved successfully",
  data: {
    unreadCount: number,
    totalCount: number
  }
}
```

**Logic:**
- Applies same role-based filtering as GET /notices
- Excludes expired notices by default
- Counts notices without `NoticeRead` entry for user

---

## Frontend Components

### 1. NoticeCard Component
**Location:** `frontend/src/components/notices/NoticeCard.tsx`

**Props:**
```typescript
interface NoticeCardProps {
  notice: Notice;
  onView: (notice: Notice) => void;
  onMarkAsRead?: (noticeId: string) => void;
}
```

**Features:**
- Color-coded priority badges
- Category icons (📝 📢 🎉 🏖️)
- Unread blue dot indicator
- Pin icon for pinned notices
- Expiration warnings
- Target info badges
- Click to view detail
- Hover elevation effect

---

### 2. NoticeBoard Component
**Location:** `frontend/src/components/notices/NoticeBoard.tsx`

**Props:**
```typescript
interface NoticeBoardProps {
  classId?: string;           // Filter to specific class
  batchId?: string;           // Filter to specific batch
  moduleId?: string;          // Filter to specific module
  showCreateButton?: boolean; // Show create button
  onCreateClick?: () => void; // Create handler
  limit?: number;             // Limit displayed notices
  title?: string;             // Custom title
}
```

**Features:**
- Grid layout (responsive)
- Advanced filtering panel
  - Search by title/content
  - Category filter
  - Priority filter
  - Unread only toggle
  - Pinned only toggle
- Active filter count badge
- Clear all filters button
- Unread count badge
- Loading skeletons
- Empty state

---

### 3. NoticeDetailModal Component
**Location:** `frontend/src/components/notices/NoticeDetailModal.tsx`

**Props:**
```typescript
interface NoticeDetailModalProps {
  notice: Notice;
  open: boolean;
  onClose: () => void;
  onMarkAsRead?: (noticeId: string) => void;
}
```

**Features:**
- Full notice content (Nepali Unicode)
- Author info with avatar
- Published date & time
- View count
- Targeting information panel
- Expiration warnings
- Attachment download button
- Mark as read action
- Responsive dialog

---

### 4. NoticeBell Component
**Location:** `frontend/src/components/notices/NoticeBell.tsx`

**Props:**
```typescript
interface NoticeBellProps {
  onViewAll?: () => void;
  noticesPagePath?: string;  // e.g., "/student/notices"
}
```

**Features:**
- Bell icon with unread badge
- Dropdown with 5 most recent unread notices
- Auto-refresh every 2 minutes
- Quick mark as read
- View all button
- Empty state
- Notification preview with:
  - Category icon
  - Title
  - Content snippet
  - Timestamp
  - Mark read button

---

## Frontend API Service

**Location:** `frontend/src/services/notice-api.service.ts`

### Methods
```typescript
class NoticeApiService {
  getAllNotices(filters?: NoticeFilters): Promise<Notice[]>
  getNoticeById(id: string): Promise<Notice>
  createNotice(data: CreateNoticeData): Promise<Notice>
  updateNotice(id: string, data: Partial<CreateNoticeData>): Promise<Notice>
  deleteNotice(id: string): Promise<void>
  markAsRead(id: string): Promise<void>
  getUnreadCount(): Promise<UnreadCountResponse>
}
```

### Usage
```typescript
import { noticeApi } from '@/services/notice-api.service';

// Get all notices
const notices = await noticeApi.getAllNotices({ unreadOnly: true });

// Get unread count
const { unreadCount } = await noticeApi.getUnreadCount();

// Mark as read
await noticeApi.markAsRead(noticeId);
```

---

## Integration Guide

### Step 1: Add to Student Dashboard

**File:** `frontend/app/student/dashboard/page.tsx`

```typescript
import NoticeBoard from '@/components/notices/NoticeBoard';
import NoticeBell from '@/components/notices/NoticeBell';

export default function StudentDashboard() {
  return (
    <div>
      {/* Add bell to header/navbar */}
      <NoticeBell noticesPagePath="/student/notices" />
      
      {/* Add notice board widget */}
      <NoticeBoard 
        limit={3}
        title="Recent Announcements"
      />
    </div>
  );
}
```

---

### Step 2: Add to Teacher Dashboard

**File:** `frontend/app/teacher/dashboard/page.tsx`

```typescript
import NoticeBoard from '@/components/notices/NoticeBoard';
import NoticeBell from '@/components/notices/NoticeBell';

export default function TeacherDashboard() {
  const handleCreateNotice = () => {
    router.push('/teacher/notices/create');
  };

  return (
    <div>
      {/* Add bell to header/navbar */}
      <NoticeBell noticesPagePath="/teacher/notices" />
      
      {/* Add notice board with create button */}
      <NoticeBoard 
        showCreateButton={true}
        onCreateClick={handleCreateNotice}
        limit={5}
      />
    </div>
  );
}
```

---

### Step 3: Add to Module Pages

**File:** `frontend/app/student/modules/[moduleId]/page.tsx`

```typescript
import NoticeBoard from '@/components/notices/NoticeBoard';

export default function ModulePage({ params }) {
  return (
    <div>
      {/* Show module-specific notices */}
      <NoticeBoard 
        moduleId={params.moduleId}
        title="Module Announcements"
      />
    </div>
  );
}
```

---

### Step 4: Add to Class Pages

```typescript
<NoticeBoard 
  classId={classId}
  title="Class Notices"
/>
```

---

### Step 5: Create Full Notices Page

**File:** `frontend/app/student/notices/page.tsx`

```typescript
'use client';

import NoticeBoard from '@/components/notices/NoticeBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NoticesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Notices & Announcements</h1>
      <NoticeBoard />
    </div>
  );
}
```

---

### Step 6: Add NoticeBell to Layout

**File:** `frontend/layout/StudentLayout.tsx`

```typescript
import NoticeBell from '@/components/notices/NoticeBell';

export default function StudentLayout({ children }) {
  return (
    <div>
      <header>
        <nav>
          {/* Other nav items */}
          <NoticeBell noticesPagePath="/student/notices" />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## Usage Examples

### Example 1: Admin Creates Global Urgent Notice

**Scenario:** Announce system maintenance

```typescript
const notice = await noticeApi.createNotice({
  title: "System Maintenance Notice",
  content: "The LMS will be down for maintenance on December 5th from 2 AM to 4 AM. Please save your work.",
  category: "GENERAL",
  priority: "URGENT",
  isPinned: true,
  isPublished: true,
  // No targeting = global
});
```

**Result:** All users see this notice, pinned at the top with urgent priority.

---

### Example 2: Teacher Creates Class Notice

**Scenario:** Class cancelled tomorrow

```typescript
const notice = await noticeApi.createNotice({
  title: "Class Cancelled - Mathematics",
  content: "Tomorrow's mathematics class is cancelled due to teacher unavailability. Makeup class will be scheduled.",
  category: "GENERAL",
  priority: "HIGH",
  classId: "class-uuid-123",
  isPublished: true,
});
```

**Result:** Only students enrolled in Mathematics class see this.

---

### Example 3: Teacher Creates Exam Notice

**Scenario:** Exam schedule announcement

```typescript
const notice = await noticeApi.createNotice({
  title: "Mid-term Exam Schedule Released",
  content: "The mid-term examination schedule has been released. Please check the exam portal.",
  category: "EXAM",
  priority: "HIGH",
  moduleId: "module-uuid-456",
  expiresAt: "2024-12-15T23:59:59Z",
  isPublished: true,
});
```

**Result:** Students enrolled in that module see exam notice, expires after exam date.

---

### Example 4: Admin Creates Holiday Notice

**Scenario:** Announce holiday

```typescript
const notice = await noticeApi.createNotice({
  title: "Christmas Holiday",
  content: "The institute will remain closed from December 24-26 for Christmas holidays. Regular classes resume on December 27.",
  category: "HOLIDAY",
  priority: "MEDIUM",
  isPinned: true,
  targetRole: "STUDENT",
  isPublished: true,
});
```

**Result:** Only students see this holiday notice.

---

### Example 5: Filter Unread Notices

```typescript
const unreadNotices = await noticeApi.getAllNotices({
  unreadOnly: true,
  priority: "URGENT",
});
```

---

### Example 6: Get Class-Specific Notices

```typescript
const classNotices = await noticeApi.getAllNotices({
  classId: "class-uuid-123",
  category: "EXAM",
});
```

---

## Best Practices

### For Admins
1. ✅ Use **URGENT** priority sparingly (critical announcements only)
2. ✅ Pin important notices that all users must see
3. ✅ Set expiration dates for time-sensitive notices
4. ✅ Use global notices for system-wide announcements
5. ✅ Create drafts first, review, then publish

### For Teachers
1. ✅ Always specify class/module for targeted communication
2. ✅ Use **EXAM** category for assessment-related notices
3. ✅ Include clear titles and detailed content
4. ✅ Set expiration for event-based notices
5. ✅ Use attachments for supplementary materials

### For Students
1. ✅ Check notices regularly via bell icon
2. ✅ Mark notices as read to maintain clean notification list
3. ✅ Filter by category to find relevant notices quickly
4. ✅ Read pinned notices first (most important)

---

## Technical Notes

### Performance Considerations
- **Indexing:** All targeting fields (classId, batchId, moduleId) are indexed
- **Pagination:** Consider implementing pagination for notices list if count > 50
- **Caching:** Unread count could be cached with 2-minute TTL
- **Polling:** NoticeBell polls every 2 minutes (consider WebSocket for real-time)

### Security
- ✅ All routes require authentication
- ✅ Role-based authorization enforced
- ✅ Teachers cannot create global notices
- ✅ Users can only update/delete their own notices (except admins)
- ✅ Students cannot create notices

### Data Integrity
- ✅ CASCADE delete on Notice removes all NoticeRead entries
- ✅ UNIQUE constraint on [noticeId, userId] prevents duplicate reads
- ✅ Soft validation: isPinned with HIGH/URGENT recommended
- ✅ Published notices cannot be edited after 24 hours (implement if needed)

---

## Future Enhancements

### Potential Additions
- [ ] Push notifications (Web Push API)
- [ ] Email notifications for URGENT notices
- [ ] Rich text editor (Markdown/WYSIWYG)
- [ ] Notice templates
- [ ] Scheduled publishing
- [ ] Notice analytics (read rate, engagement)
- [ ] Batch operations (delete multiple)
- [ ] Notice approval workflow
- [ ] Comments/reactions on notices
- [ ] Multi-language support
- [ ] Image upload in content (not just attachment)
- [ ] SMS notifications (for critical notices)

---

## Troubleshooting

### Issue: Notice not showing for student
**Check:**
1. Is notice published? (`isPublished = true`)
2. Has notice expired? Check `expiresAt`
3. Is targeting correct? (classId, batchId, moduleId, targetRole)
4. Is student enrolled in target class/module?

### Issue: Unread count not updating
**Check:**
1. Is polling interval running? (every 2 minutes)
2. Check browser console for API errors
3. Verify token is valid
4. Check network tab for 401/403 responses

### Issue: Teacher cannot create notice
**Check:**
1. Is classId/moduleId/batchId provided?
2. Does teacher own the module?
3. Is teacher assigned to the class?
4. Check backend logs for authorization errors

---

## Summary

The Notice & Announcement system is now **fully implemented** across the entire LMS with:

✅ **Backend:**
- Complete controller with 7 endpoints
- Role-based authorization
- Granular targeting logic
- Read tracking system

✅ **Frontend:**
- NoticeCard component
- NoticeBoard component with filters
- NoticeDetailModal component
- NoticeBell component with dropdown
- API service with TypeScript types

✅ **Database:**
- Enhanced Notice model with targeting fields
- NoticeRead tracking model
- Migration applied successfully

✅ **Ready for Integration:**
- Student dashboards
- Teacher dashboards
- Admin dashboards
- Module pages
- Class pages
- Navigation bars

**Next Steps:** Integrate components into existing pages following the integration guide above.

---

**Documentation Version:** 1.0  
**Last Updated:** December 1, 2024  
**Author:** LMS Development Team
