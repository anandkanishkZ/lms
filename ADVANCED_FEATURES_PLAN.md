# Advanced Features Implementation Plan

**Date**: October 19, 2025  
**Project**: LMS Platform - Teacher Content Management Enhancement

---

## ✅ PHASE 1: RICH TEXT EDITOR (COMPLETED)

### Status: ✅ DONE

### What Was Built:

1. **RichTextEditor Component** (`frontend/src/components/RichTextEditor/RichTextEditor.tsx`)
   - Full-featured WYSIWYG editor with TipTap
   - 30+ toolbar buttons
   - All formatting options (bold, italic, headings, lists, etc.)
   - Image insertion, link management
   - Text colors and highlighting
   - Undo/Redo functionality

2. **RichTextViewer Component** (`frontend/src/components/RichTextEditor/RichTextViewer.tsx`)
   - Read-only content display
   - Matches editor styling
   - Opens links in new tabs

3. **Custom Styling** (`RichTextEditor.css`)
   - Professional typography
   - Responsive design
   - Clean visual hierarchy

4. **Documentation** (`RICH_TEXT_EDITOR_DOCS.md`)
   - Complete usage guide
   - 8 use cases
   - Code examples
   - API reference

### Packages Installed:
```bash
✅ @tiptap/react
✅ @tiptap/starter-kit
✅ @tiptap/extension-image
✅ @tiptap/extension-link
✅ @tiptap/extension-text-align
✅ @tiptap/extension-underline
✅ @tiptap/extension-color
✅ @tiptap/extension-text-style
✅ @tiptap/extension-highlight
```

### Next Action:
Integrate RichTextEditor into existing forms (LessonFormModal, TopicFormModal, etc.)

---

## 🔄 PHASE 2: DRAG-AND-DROP REORDERING

### Status: ⏳ PENDING

### Objective:
Enable teachers to reorder Topics and Lessons via drag-and-drop interface.

### Implementation Steps:

#### Step 1: Install Dependencies
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### Step 2: Create Draggable Topic List
**File**: `frontend/app/teacher/modules/[id]/components/DraggableTopicList.tsx`

Features:
- Drag handle icon
- Visual feedback during drag
- Auto-scroll when dragging near edges
- Smooth animations
- Touch support for mobile

#### Step 3: Create Draggable Lesson List
**File**: `frontend/app/teacher/modules/[id]/components/DraggableLessonList.tsx`

Features:
- Nested dragging (within topic)
- Prevent dropping in wrong locations
- Visual placeholder

#### Step 4: Backend API Enhancement
**Files**: 
- `backend/src/controllers/topicController.ts` (add bulk reorder endpoint)
- `backend/src/controllers/lessonController.ts` (add bulk reorder endpoint)

**New Endpoints**:
```typescript
// POST /api/topics/reorder
// Body: { topicIds: string[] }

// POST /api/topics/:topicId/lessons/reorder
// Body: { lessonIds: string[] }
```

#### Step 5: Integration
- Replace current TopicCard list with DraggableTopicList
- Replace current LessonList with DraggableLessonList
- Add optimistic updates for instant feedback
- Handle API errors gracefully

### Estimated Time: 4-6 hours

---

## 📄 PHASE 3: FILE UPLOAD COMPONENTS

### Status: ⏳ PENDING

### Objective:
Create robust file upload components for PDF documents and video files.

### Implementation Steps:

#### Step 1: Install Dependencies
```bash
npm install react-dropzone
```

#### Step 2: Create Base FileUpload Component
**File**: `frontend/src/components/FileUpload/FileUpload.tsx`

Features:
- Drag & drop area
- Click to browse
- File type validation
- File size validation
- Upload progress bar
- Cancel upload
- Preview thumbnails
- Error handling

#### Step 3: Create PDF Upload Component
**File**: `frontend/src/components/FileUpload/PDFUpload.tsx`

Features:
- PDF-specific validation
- PDF preview (first page)
- Max size: 50MB
- Supported: .pdf only

#### Step 4: Create Video Upload Component
**File**: `frontend/src/components/FileUpload/VideoUpload.tsx`

Features:
- Video-specific validation
- Video thumbnail extraction
- Max size: 500MB
- Supported: .mp4, .webm, .mov
- Duration display

#### Step 5: Backend Enhancement
**Files**:
- `backend/src/middlewares/upload.ts` (enhance for large files)
- `backend/src/controllers/materialController.ts` (add file metadata)

Features:
- Chunked upload support
- Progress tracking
- Cloud storage integration (optional)
- File compression (optional)

#### Step 6: Integration
- Add to LessonFormModal (for video lessons)
- Add to MaterialUploadModal
- Add to AssignmentBuilder
- Replace current simple file inputs

### Estimated Time: 6-8 hours

---

## 🧩 PHASE 4: QUIZ BUILDER

### Status: ⏳ PENDING

### Objective:
Create interactive quiz builder with multiple question types.

### Implementation Steps:

#### Step 1: Database Schema Update
**File**: `backend/prisma/schema.prisma`

Add models:
```prisma
model Quiz {
  id          String     @id @default(cuid())
  lessonId    String
  title       String
  description String?
  timeLimit   Int?       // minutes
  passingScore Int       // percentage
  questions   Question[]
  lesson      Lesson     @relation(fields: [lessonId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Question {
  id          String   @id @default(cuid())
  quizId      String
  type        String   // MCQ, TRUE_FALSE, SHORT_ANSWER
  text        String   @db.Text
  options     Json?    // For MCQ
  correctAnswer String @db.Text
  points      Int      @default(1)
  orderIndex  Int
  explanation String?  @db.Text
  quiz        Quiz     @relation(fields: [quizId], references: [id])
}
```

#### Step 2: Create QuizBuilder Component
**File**: `frontend/src/components/QuizBuilder/QuizBuilder.tsx`

Features:
- Add/remove questions
- Question type selector
- Rich text editor for question text
- MCQ option builder
- Correct answer marking
- Points assignment
- Drag-and-drop question reordering
- Preview mode

#### Step 3: Create Question Components

**Files**:
- `MCQQuestion.tsx` - Multiple choice
- `TrueFalseQuestion.tsx` - True/False
- `ShortAnswerQuestion.tsx` - Text input

Each with:
- Edit mode
- Preview mode
- Validation

#### Step 4: Backend API
**File**: `backend/src/controllers/quizController.ts`

**Endpoints**:
```typescript
POST   /api/quizzes          // Create quiz
GET    /api/quizzes/:id      // Get quiz
PUT    /api/quizzes/:id      // Update quiz
DELETE /api/quizzes/:id      // Delete quiz
POST   /api/quizzes/:id/questions  // Add question
PUT    /api/quizzes/:id/questions/:qid  // Update question
DELETE /api/quizzes/:id/questions/:qid  // Delete question
```

#### Step 5: Integration
- Add "Quiz" lesson type
- Integrate QuizBuilder in LessonFormModal
- Create student quiz-taking interface
- Build auto-grading system

### Estimated Time: 10-12 hours

---

## 📝 PHASE 5: ASSIGNMENT BUILDER

### Status: ⏳ PENDING

### Objective:
Create comprehensive assignment builder with submissions and grading.

### Implementation Steps:

#### Step 1: Database Schema Update
**File**: `backend/prisma/schema.prisma`

Add models:
```prisma
model Assignment {
  id              String              @id @default(cuid())
  lessonId        String
  title           String
  instructions    String              @db.Text
  dueDate         DateTime
  maxPoints       Int
  allowLateSubmission Boolean         @default(false)
  attachments     Json?               // File URLs
  rubric          Json?               // Grading criteria
  lesson          Lesson              @relation(fields: [lessonId], references: [id])
  submissions     Submission[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

model Submission {
  id            String     @id @default(cuid())
  assignmentId  String
  studentId     String
  content       String     @db.Text
  attachments   Json?      // File URLs
  submittedAt   DateTime   @default(now())
  grade         Int?
  feedback      String?    @db.Text
  gradedAt      DateTime?
  assignment    Assignment @relation(fields: [assignmentId], references: [id])
  student       User       @relation(fields: [studentId], references: [id])
}
```

#### Step 2: Create AssignmentBuilder Component
**File**: `frontend/src/components/AssignmentBuilder/AssignmentBuilder.tsx`

Features:
- Rich text instructions (using RichTextEditor)
- Due date picker
- Points configuration
- Late submission toggle
- File attachments (teacher resources)
- Grading rubric builder
- Preview mode

#### Step 3: Create Rubric Builder
**File**: `frontend/src/components/AssignmentBuilder/RubricBuilder.tsx`

Features:
- Criteria list (add/remove)
- Points per criterion
- Description fields
- Total points calculation

#### Step 4: Create Submission Interface (Student)
**File**: `frontend/app/student/assignments/[id]/SubmitAssignment.tsx`

Features:
- Rich text answer editor
- File upload
- Due date display
- Submission confirmation
- Edit before due date

#### Step 5: Create Grading Interface (Teacher)
**File**: `frontend/app/teacher/assignments/[id]/GradeSubmissions.tsx`

Features:
- Submission list
- Student details
- View submission content
- Download attachments
- Grade input
- Rich text feedback
- Rubric scoring
- Save draft / Publish grade

#### Step 6: Backend API
**File**: `backend/src/controllers/assignmentController.ts`

**Endpoints**:
```typescript
POST   /api/assignments                    // Create
GET    /api/assignments/:id                // Get
PUT    /api/assignments/:id                // Update
DELETE /api/assignments/:id                // Delete
POST   /api/assignments/:id/submit         // Student submit
GET    /api/assignments/:id/submissions    // Get all submissions
PUT    /api/assignments/:id/submissions/:sid/grade  // Grade
```

#### Step 7: Integration
- Add "Assignment" lesson type
- Integrate in LessonFormModal
- Add to student dashboard
- Email notifications (due dates, grades)

### Estimated Time: 12-15 hours

---

## 📊 SUMMARY & TIMELINE

| Phase | Feature | Status | Time Estimate | Priority |
|-------|---------|--------|---------------|----------|
| 1 | Rich Text Editor | ✅ DONE | - | HIGH |
| 2 | Drag-and-Drop | ⏳ PENDING | 4-6 hours | HIGH |
| 3 | File Uploads | ⏳ PENDING | 6-8 hours | MEDIUM |
| 4 | Quiz Builder | ⏳ PENDING | 10-12 hours | MEDIUM |
| 5 | Assignment Builder | ⏳ PENDING | 12-15 hours | MEDIUM |

**Total Remaining Time**: 32-41 hours (4-5 working days)

---

## 🎯 RECOMMENDED ORDER

1. **✅ Rich Text Editor** - DONE
2. **⏳ Drag-and-Drop** - Next (improves UX immediately)
3. **⏳ File Uploads** - Required for materials
4. **⏳ Quiz Builder** - Assessment feature
5. **⏳ Assignment Builder** - Complete assessment suite

---

## 🔧 CURRENT TECHNICAL STACK

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- TipTap (Rich Text)
- @dnd-kit (Drag & Drop) - to be added

### Backend
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

### File Storage
- Local uploads (current)
- AWS S3 / Cloudinary (future)

---

## 📝 NOTES

### Current Lesson Types
- TEXT (uses RichTextEditor)
- VIDEO (URL or upload)
- QUIZ (to be built)
- ASSIGNMENT (to be built)

### Integration Points
- LessonFormModal (main form for all lesson types)
- TopicFormModal (descriptions)
- MaterialUploadModal (file handling)
- Student Dashboard (viewing content)
- Teacher Dashboard (content management)

### Future Enhancements
- 📹 Video recording in browser
- 🎨 Drawing/whiteboard tool
- 🗣️ Audio lectures
- 📊 Analytics dashboard
- 🔔 Push notifications
- 💬 Live chat support

---

**Created**: October 19, 2025  
**Status**: Phase 1 Complete, Planning Phase 2-5  
**Next Action**: Begin Drag-and-Drop implementation
