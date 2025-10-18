# Module Content/Resource Material Management System - Analysis & Implementation Plan

## Executive Summary
**Date:** October 18, 2025  
**Analyst:** Senior Project Manager & Software Developer  
**Project:** LMS - Module Content & Resource Management Enhancement

---

## 1. CURRENT SYSTEM ANALYSIS

### 1.1 Existing Module Structure
```
Module (Course Container)
  ├── Topics (Sections/Chapters)
  │   └── Lessons (Individual Learning Units)
  │       └── LessonAttachments (Current basic attachment system)
  └── Enrollments (Student Access Management)
```

### 1.2 Current Database Schema Analysis

#### **Existing Models:**
1. **Module** - Main course container
   - Status workflow: DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → ARCHIVED
   - Teacher-created, Admin-approved
   - Tracks: subjects, classes, topics, enrollments

2. **Topic** - Section/Chapter within module
   - Ordered content sections
   - Contains multiple lessons
   - Progress tracking enabled

3. **Lesson** - Individual learning unit
   - Types: VIDEO, YOUTUBE_LIVE, PDF, TEXT, QUIZ, ASSIGNMENT, EXTERNAL_LINK
   - Has basic `LessonAttachment` model
   - View tracking, progress monitoring

4. **LessonAttachment** (Current Implementation)
   - Limited to lesson-level attachments only
   - Basic file metadata (title, URL, size, type)
   - Download tracking
   - ❌ **LIMITATIONS:**
     - No visibility control (hide/unhide)
     - No status management
     - Cannot be shared across lessons
     - No admin/student view segregation
     - No categorization or tagging

5. **Material** (Separate System)
   - Subject-level materials (not integrated with modules)
   - Public/private visibility
   - Access logging
   - ❌ **PROBLEM:** Disconnected from module system

### 1.3 Current Permission Structure
- **ADMIN:** Full system control
- **TEACHER:** Can create/edit assigned modules
- **STUDENT:** View enrolled modules only

### 1.4 Identified Gaps
1. ❌ No comprehensive resource management at module/topic level
2. ❌ No hide/unhide functionality for resources
3. ❌ No role-based visibility (Teacher vs Admin vs Student)
4. ❌ No resource categorization/organization
5. ❌ Resources cannot be shared across topics/lessons
6. ❌ No bulk resource management
7. ❌ No resource versioning or updates tracking
8. ❌ Limited metadata and search capabilities

---

## 2. PROPOSED SOLUTION: ENHANCED CONTENT RESOURCE SYSTEM

### 2.1 New Database Model: `ModuleResource`

#### Design Philosophy
- **Flexible Attachment Point:** Can attach to Module, Topic, or Lesson
- **Rich Metadata:** Categories, tags, descriptions
- **Visibility Control:** Hide/Unhide, Role-based access
- **Status Management:** Draft, Published, Archived
- **Audit Trail:** Created by, updated by, accessed by logs

#### Schema Design
```prisma
enum ResourceType {
  PDF
  DOCUMENT    // DOCX, DOC
  PRESENTATION // PPT, PPTX
  SPREADSHEET // XLS, XLSX
  VIDEO
  AUDIO
  IMAGE
  LINK
  YOUTUBE
  ARCHIVE     // ZIP, RAR
  CODE        // Code files
  OTHER
}

enum ResourceStatus {
  DRAFT
  PUBLISHED
  HIDDEN
  ARCHIVED
}

enum ResourceCategory {
  LECTURE_NOTE
  ASSIGNMENT
  REFERENCE_MATERIAL
  SAMPLE_CODE
  PRACTICE_QUESTION
  SOLUTION
  READING_MATERIAL
  SUPPLEMENTARY
  EXTERNAL_LINK
  OTHER
}

model ModuleResource {
  id            String           @id @default(cuid())
  
  // Content Details
  title         String
  description   String?
  category      ResourceCategory @default(OTHER)
  tags          String[]         // Searchable tags
  
  // File Information
  type          ResourceType
  fileUrl       String?
  fileName      String?
  fileSize      Int?            // in bytes
  mimeType      String?
  externalUrl   String?         // For links, YouTube URLs
  
  // Attachment Points (Flexible - can attach to multiple levels)
  moduleId      String?
  topicId       String?
  lessonId      String?
  
  // Access Control
  status        ResourceStatus   @default(PUBLISHED)
  isHidden      Boolean         @default(false)
  visibleToRoles String[]       // ["STUDENT", "TEACHER", "ADMIN"]
  
  // Metadata
  orderIndex    Int             @default(0)
  version       Int             @default(1)
  isPinned      Boolean         @default(false)
  isMandatory   Boolean         @default(false)
  
  // Analytics
  viewCount     Int             @default(0)
  downloadCount Int             @default(0)
  
  // Audit Trail
  uploadedBy    String
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  publishedAt   DateTime?
  archivedAt    DateTime?
  
  // Relations
  module        Module?         @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  topic         Topic?          @relation(fields: [topicId], references: [id], onDelete: Cascade)
  lesson        Lesson?         @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  uploader      User            @relation("ResourceUploader", fields: [uploadedBy], references: [id])
  accessLogs    ResourceAccessLog[]
  
  @@index([moduleId])
  @@index([topicId])
  @@index([lessonId])
  @@index([status])
  @@index([category])
  @@index([uploadedBy])
  @@map("module_resources")
}

model ResourceAccessLog {
  id           String         @id @default(cuid())
  resourceId   String
  userId       String
  action       String         // VIEW, DOWNLOAD, EDIT, DELETE
  ipAddress    String?
  userAgent    String?
  metadata     Json?
  timestamp    DateTime       @default(now())
  
  // Relations
  resource     ModuleResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  user         User           @relation("ResourceAccess", fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([resourceId])
  @@index([userId])
  @@index([timestamp])
  @@map("resource_access_logs")
}
```

---

## 3. PERMISSION MATRIX

### 3.1 Role-Based Access Control

| Action | Teacher | Admin | Student |
|--------|---------|-------|---------|
| **Create Resource** | ✅ (Own modules) | ✅ (All modules) | ❌ |
| **Edit Resource** | ✅ (Own modules) | ✅ (All modules) | ❌ |
| **Delete Resource** | ✅ (Own modules) | ✅ (All modules) | ❌ |
| **Hide/Unhide Resource** | ✅ (Own modules) | ✅ (All modules) | ❌ |
| **View Hidden Resources** | ✅ (Own modules) | ✅ (All modules) | ❌ |
| **View Published Resources** | ✅ | ✅ | ✅ (If enrolled) |
| **Download Resources** | ✅ | ✅ | ✅ (If enrolled & published) |
| **View Analytics** | ✅ (Own modules) | ✅ (All modules) | ❌ |
| **Bulk Operations** | ✅ (Own modules) | ✅ (All modules) | ❌ |

### 3.2 Visibility Rules
1. **DRAFT:** Only visible to creator and admins
2. **PUBLISHED:** Visible to all enrolled students
3. **HIDDEN:** Visible to teachers and admins only
4. **ARCHIVED:** Only visible to admins

---

## 4. API ENDPOINTS DESIGN

### 4.1 Resource CRUD Operations

#### **Create Resource**
```
POST /api/modules/:moduleId/resources
POST /api/topics/:topicId/resources
POST /api/lessons/:lessonId/resources

Body: {
  title: string
  description?: string
  category: ResourceCategory
  tags?: string[]
  type: ResourceType
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  externalUrl?: string
  status?: ResourceStatus
  isHidden?: boolean
  isPinned?: boolean
  isMandatory?: boolean
}

Response: {
  success: boolean
  message: string
  data: ModuleResource
}
```

#### **Get Resources (with filters)**
```
GET /api/modules/:moduleId/resources
GET /api/topics/:topicId/resources
GET /api/lessons/:lessonId/resources

Query Params:
  - category?: ResourceCategory
  - type?: ResourceType
  - status?: ResourceStatus
  - includeHidden?: boolean (teacher/admin only)
  - search?: string
  - tags?: string[]
  - orderBy?: 'orderIndex' | 'createdAt' | 'title'
  - page?: number
  - limit?: number

Response: {
  success: boolean
  data: {
    resources: ModuleResource[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}
```

#### **Get Single Resource**
```
GET /api/resources/:id

Response: {
  success: boolean
  data: ModuleResource & {
    module?: { id, title }
    topic?: { id, title }
    lesson?: { id, title }
    uploader: { id, name, email }
    accessStats: {
      totalViews: number
      totalDownloads: number
      recentAccess: ResourceAccessLog[]
    }
  }
}
```

#### **Update Resource**
```
PUT /api/resources/:id

Body: Partial<{
  title: string
  description: string
  category: ResourceCategory
  tags: string[]
  status: ResourceStatus
  isHidden: boolean
  isPinned: boolean
  isMandatory: boolean
  orderIndex: number
}>

Response: {
  success: boolean
  message: string
  data: ModuleResource
}
```

#### **Delete Resource**
```
DELETE /api/resources/:id

Response: {
  success: boolean
  message: string
}
```

### 4.2 Special Operations

#### **Hide/Unhide Resource**
```
PATCH /api/resources/:id/visibility

Body: {
  isHidden: boolean
  reason?: string
}

Response: {
  success: boolean
  message: string
  data: { isHidden: boolean }
}
```

#### **Bulk Operations**
```
POST /api/resources/bulk

Body: {
  action: 'hide' | 'unhide' | 'publish' | 'archive' | 'delete'
  resourceIds: string[]
  reason?: string
}

Response: {
  success: boolean
  message: string
  data: {
    processed: number
    failed: number
    errors?: string[]
  }
}
```

#### **Track Resource Access**
```
POST /api/resources/:id/track

Body: {
  action: 'VIEW' | 'DOWNLOAD'
}

Response: {
  success: boolean
  data: {
    viewCount: number
    downloadCount: number
  }
}
```

#### **Reorder Resources**
```
PATCH /api/modules/:moduleId/resources/reorder
PATCH /api/topics/:topicId/resources/reorder
PATCH /api/lessons/:lessonId/resources/reorder

Body: {
  resourceOrders: Array<{
    resourceId: string
    orderIndex: number
  }>
}

Response: {
  success: boolean
  message: string
}
```

---

## 5. BUSINESS LOGIC & VALIDATIONS

### 5.1 Teacher Operations
- ✅ Can only manage resources in their assigned modules
- ✅ Can create resources in DRAFT or PUBLISHED status
- ✅ Can hide/unhide their own resources
- ✅ Cannot delete resources being used by students
- ✅ Cannot modify resources in modules with status ARCHIVED

### 5.2 Admin Operations
- ✅ Full access to all module resources
- ✅ Can override teacher permissions
- ✅ Can archive/restore resources
- ✅ Can view all access logs
- ✅ Can perform bulk operations

### 5.3 Student Operations
- ✅ Can only view PUBLISHED and non-hidden resources
- ✅ Can only access resources in enrolled modules
- ✅ Downloads are logged for analytics
- ✅ Cannot see DRAFT, HIDDEN, or ARCHIVED resources

### 5.4 Data Validations
```typescript
// File size limits
MAX_FILE_SIZE = 100MB (admin can override)

// Supported file types
PDF: ['application/pdf']
DOCUMENT: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
PRESENTATION: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
VIDEO: ['video/mp4', 'video/mpeg', 'video/webm']
IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// URL validation for external links
External URLs must be valid HTTPS URLs
YouTube URLs must match pattern: youtube.com/watch?v= or youtu.be/
```

---

## 6. INTEGRATION POINTS

### 6.1 Module System Integration
- Resources automatically inherit module's subject and class
- When module is archived, all resources are hidden from students
- Module deletion cascades to all resources
- Resources count shown in module overview

### 6.2 Enrollment System Integration
- Only enrolled students can access resources
- Resource availability checked against enrollment status
- Enrollment expiry affects resource access

### 6.3 Progress Tracking Integration
- Track which resources students have viewed
- Mark resources as "completed" or "downloaded"
- Include resource access in activity history

### 6.4 Notification System Integration
- Notify students when new resources are published
- Alert teachers when resources hit download milestones
- Admin alerts for suspicious access patterns

---

## 7. FRONTEND REQUIREMENTS

### 7.1 Teacher Interface
**Resource Management Dashboard:**
- List view with filters (category, type, status)
- Drag-and-drop reordering
- Bulk actions toolbar
- Upload modal with metadata form
- Hide/Unhide toggle switches
- Analytics panel (views, downloads per resource)

**Features:**
- Multi-file upload with progress
- Preview before publishing
- Duplicate resource functionality
- Quick edit inline
- Search and filter

### 7.2 Admin Interface
**Resource Overview:**
- All modules' resources in one view
- Advanced filters (by teacher, module, date range)
- Access logs viewer
- Bulk moderation tools
- Storage analytics

### 7.3 Student Interface
**Resource Library:**
- Categorized resource list
- Search functionality
- Download buttons with tracking
- "New" badges for recent uploads
- Mandatory resources highlighted
- Mobile-responsive cards

---

## 8. IMPLEMENTATION PHASES

### Phase 1: Database & Schema (Day 1)
- [ ] Add ModuleResource model to schema
- [ ] Add ResourceAccessLog model
- [ ] Create migration files
- [ ] Update User model relations
- [ ] Run migrations

### Phase 2: Backend Services (Day 1-2)
- [ ] Create resource.service.ts
- [ ] Implement CRUD operations
- [ ] Add permission checks
- [ ] Create access logging service
- [ ] Add validation middleware

### Phase 3: API Endpoints (Day 2)
- [ ] Create resourceController.ts
- [ ] Define all routes in resources.ts
- [ ] Add middleware for file uploads
- [ ] Implement bulk operations
- [ ] Add analytics endpoints

### Phase 4: Frontend Components (Day 3-4)
- [ ] Teacher resource management panel
- [ ] Admin resource oversight dashboard
- [ ] Student resource library
- [ ] Upload component with progress
- [ ] Bulk action modals

### Phase 5: Testing & Deployment (Day 5)
- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] Permission testing
- [ ] Load testing for file uploads
- [ ] Documentation

---

## 9. MIGRATION STRATEGY

### 9.1 Existing LessonAttachment Migration
```sql
-- Convert existing LessonAttachment to ModuleResource
INSERT INTO module_resources (
  id, title, fileUrl, fileName, fileSize, type, lessonId,
  status, uploadedBy, createdAt
)
SELECT 
  id, title, fileUrl, fileName, fileSize, 
  'DOCUMENT', lessonId, 'PUBLISHED', 
  -- Need to determine uploader from lesson's topic->module->teacher
  (SELECT teacherId FROM modules WHERE id = (
    SELECT moduleId FROM topics WHERE id = (
      SELECT topicId FROM lessons WHERE id = lessonId
    )
  )),
  createdAt
FROM lesson_attachments;
```

### 9.2 Material System Integration (Optional)
- Keep current Material model for backward compatibility
- Gradually migrate materials to ModuleResource
- Update frontend to use unified resource interface

---

## 10. SECURITY CONSIDERATIONS

### 10.1 File Upload Security
- Virus scanning before storage
- File type validation (whitelist approach)
- File size limits enforced
- Unique file naming to prevent conflicts
- Secure file storage (AWS S3 or similar)

### 10.2 Access Control
- Row-level security checks in database queries
- JWT token validation on all endpoints
- Role verification middleware
- Rate limiting on download endpoints
- IP-based access logging

### 10.3 Data Privacy
- Student access logs encrypted
- GDPR compliance for data retention
- Personal data anonymization in analytics
- Secure deletion (soft delete with audit trail)

---

## 11. PERFORMANCE OPTIMIZATION

### 11.1 Database Optimization
- Indexes on frequently queried columns
- Pagination for large resource lists
- Eager loading of relations where needed
- Query result caching for public resources

### 11.2 File Delivery
- CDN integration for file serving
- Presigned URLs for secure downloads
- Lazy loading of resource metadata
- Thumbnail generation for images/videos

---

## 12. SUCCESS METRICS

### 12.1 KPIs
- Resource upload time < 5 seconds (for files < 10MB)
- API response time < 200ms
- 99.9% uptime for resource access
- Zero unauthorized access incidents
- 100% audit trail coverage

### 12.2 User Adoption
- Teachers using resource system: Target 90%
- Average resources per module: Target 10+
- Student engagement (views/downloads): Track weekly
- Resource organization satisfaction: Target 4.5/5

---

## 13. TECHNICAL STACK

### Backend
- **Framework:** Express.js + TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **File Storage:** AWS S3 / Local (configurable)
- **Validation:** Zod / Joi
- **Authentication:** JWT

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **State:** React Query / Zustand
- **Forms:** React Hook Form
- **File Upload:** react-dropzone

---

## 14. RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Large file uploads fail | High | Medium | Implement chunked uploads, resume capability |
| Storage costs escalate | Medium | High | Set file size limits, implement cleanup policy |
| Unauthorized access | Critical | Low | Multi-layer security, regular audits |
| Performance degradation | High | Medium | Caching, CDN, database optimization |
| Data loss | Critical | Low | Automated backups, redundant storage |

---

## 15. CONCLUSION

This comprehensive Content/Resource Management System will:

✅ **Solve Current Limitations:** Provides granular control over educational resources  
✅ **Enhance User Experience:** Teachers, admins, and students each get tailored interfaces  
✅ **Improve Content Organization:** Categorization, tagging, and flexible attachment points  
✅ **Ensure Security:** Role-based access, audit trails, and secure file handling  
✅ **Enable Analytics:** Track usage, engagement, and resource effectiveness  
✅ **Support Scalability:** Built to handle thousands of resources across hundreds of modules  

**Estimated Timeline:** 5 working days  
**Team Required:** 1 Full-stack Developer + 1 QA Engineer  
**Budget Impact:** Minimal (existing infrastructure)  

---

**Next Steps:**
1. Review and approve this analysis
2. Begin Phase 1 implementation
3. Set up development environment
4. Create feature branch in Git
5. Start coding! 🚀
