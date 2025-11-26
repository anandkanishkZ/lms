# Comprehensive Exam System Documentation

## Overview

The exam system is a fully-featured online examination platform that supports multiple question types, automatic grading, manual grading, file uploads for answers, and comprehensive analytics. It's designed to handle exams in multiple languages including Nepali Unicode.

## Features

### For Teachers/Admins

1. **Exam Creation & Management**
   - Create exams with title, description, scheduling
   - Set exam duration, total marks, passing marks
   - Add detailed instructions (supports Nepali text)
   - Configure exam settings (late submission, shuffle questions, show results immediately, etc.)
   - Set maximum attempts per student

2. **Question Management**
   - **Multiple Choice Questions (MCQ)**: Up to 4 options, single correct answer
   - **File Upload Questions**: Students upload answer images/PDFs (up to 5 files per question)
   - **Short Answer Questions**: Text input for brief answers
   - **Long Answer Questions**: Textarea for detailed responses
   - Support for Nepali Unicode in questions and options
   - Rich text support for formatted questions
   - Set marks and negative marks per question
   - Add explanations/solutions
   - Organize questions into sections

3. **Grading System**
   - **Auto-grading** for MCQ questions
   - **Manual grading** interface for file uploads and descriptive answers
   - View all submitted attempts
   - Review uploaded answer files
   - Provide feedback for each answer
   - Automatic score calculation
   - Grade publishing workflow

4. **Analytics & Reports**
   - Submission statistics
   - Average scores
   - Question-wise performance analysis
   - Student performance tracking

### For Students

1. **Exam Taking**
   - View scheduled, active, and completed exams
   - Read exam instructions before starting
   - Built-in timer with auto-submit
   - Question navigation
   - Answer MCQ questions by selecting options
   - Upload answer images/photos (up to 5 per question)
   - Type short/long answers
   - Auto-save functionality
   - Review answers before submission
   - Cannot edit after submission

2. **Results & Review**
   - View exam results after grading
   - See correct answers (if enabled by teacher)
   - View feedback from teachers
   - Track performance history

## Database Schema

### Main Tables

1. **Exam**
   - Basic info, scheduling, settings
   - Links to subject, class, batch
   - Total/passing marks configuration

2. **Question**
   - Question text (with Nepali support)
   - Question type (MCQ, FILE_UPLOAD, SHORT_ANSWER, LONG_ANSWER)
   - Marks, negative marks
   - File upload settings (max files, accepted types, size limits)
   - Explanation/solution

3. **QuestionOption**
   - For MCQ questions
   - Option text (with Nepali support)
   - Correct answer flag

4. **ExamQuestion**
   - Junction table linking exams to questions
   - Order/sequence of questions
   - Section grouping
   - Optional questions flag

5. **StudentExamAttempt**
   - Student's attempt record
   - Start/submit timestamps
   - Time spent tracking
   - Score calculation
   - Grading status
   - Late submission flag

6. **StudentAnswer**
   - Student's answer for each question
   - Selected option (for MCQ)
   - Text answer (for short/long answer)
   - Uploaded files array (for file upload questions)
   - Marks awarded
   - Teacher feedback

## API Endpoints

### Exam Management (Teacher/Admin)

```
POST   /api/v1/exams                          - Create exam
GET    /api/v1/exams                          - Get all exams (with filters)
GET    /api/v1/exams/:id                      - Get exam details
PUT    /api/v1/exams/:id                      - Update exam
DELETE /api/v1/exams/:id                      - Delete exam
```

### Question Management (Teacher/Admin)

```
POST   /api/v1/exams/:id/questions            - Add question to exam
PUT    /api/v1/exams/:examId/questions/:questionId  - Update question
DELETE /api/v1/exams/:examId/questions/:questionId  - Remove question
```

### Student Exam Taking

```
POST   /api/v1/exams/:id/start                - Start exam attempt
POST   /api/v1/exams/:examId/attempts/:attemptId/answer  - Submit answer
POST   /api/v1/exams/:examId/attempts/:attemptId/submit  - Submit exam
GET    /api/v1/exams/:id/my-result            - Get student's result
```

### Grading (Teacher/Admin)

```
GET    /api/v1/exams/:id/attempts             - Get all attempts for grading
PUT    /api/v1/exams/answers/:answerId/grade  - Grade an answer
```

### File Upload

```
POST   /api/v1/upload/exam-answer             - Upload answer files (up to 5)
GET    /api/v1/upload/exam-files/:filename    - Get uploaded answer file
```

## Request/Response Examples

### 1. Create Exam with Questions

```json
POST /api/v1/exams

{
  "title": "Mathematics Mid-Term Exam",
  "description": "Set theory and compound interest questions",
  "subjectId": "subject-id-here",
  "classId": "class-id-here",
  "type": "MIDTERM",
  "startTime": "2025-12-01T10:00:00Z",
  "endTime": "2025-12-01T12:00:00Z",
  "duration": 120,
  "totalMarks": 50,
  "passingMarks": 20,
  "instructions": "उटा नगरपालिकाको चुनावमा...",
  "allowLateSubmission": false,
  "shuffleQuestions": false,
  "showResultsImmediately": false,
  "maxAttempts": 1,
  "questions": [
    {
      "questionText": "50 जना विद्यार्थीहरूको एक समूहमा 20 जनाले गणित मात्र...",
      "questionTextHtml": "<p>50 जना विद्यार्थीहरूको एक समूहमा...</p>",
      "questionType": "FILE_UPLOAD",
      "marks": 5,
      "negativeMarks": 0,
      "maxFiles": 5,
      "acceptedFileTypes": "image/jpeg,image/png,application/pdf",
      "maxFileSizeMB": 10
    },
    {
      "questionText": "यदि M र S ले क्रमश: गणित र विज्ञान मन पराउने विद्यार्थीहरूको समूह जनाउने भए no(M) को मान कति होला।",
      "questionType": "MULTIPLE_CHOICE",
      "marks": 5,
      "options": [
        { "optionText": "28", "isCorrect": true },
        { "optionText": "18", "isCorrect": false },
        { "optionText": "20", "isCorrect": false },
        { "optionText": "26", "isCorrect": false }
      ]
    }
  ]
}
```

### 2. Start Exam Attempt (Student)

```json
POST /api/v1/exams/exam-id/start

{
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "deviceInfo": "Chrome on Windows"
}

Response:
{
  "success": true,
  "message": "Exam attempt started successfully",
  "data": {
    "attempt": {
      "id": "attempt-id",
      "examId": "exam-id",
      "studentId": "student-id",
      "attemptNumber": 1,
      "startedAt": "2025-12-01T10:00:00Z",
      "isCompleted": false
    },
    "exam": {
      "title": "Mathematics Mid-Term Exam",
      "questions": [...]
    }
  }
}
```

### 3. Submit Answer (Student)

```json
POST /api/v1/exams/exam-id/attempts/attempt-id/answer

// For MCQ
{
  "questionId": "question-id",
  "selectedOptionId": "option-id"
}

// For File Upload
{
  "questionId": "question-id",
  "uploadedFiles": [
    "/api/v1/upload/exam-files/file1.jpg",
    "/api/v1/upload/exam-files/file2.jpg"
  ]
}

// For Text Answer
{
  "questionId": "question-id",
  "textAnswer": "The answer is 28"
}
```

### 4. Upload Answer Files

```
POST /api/v1/upload/exam-answer
Content-Type: multipart/form-data

files: [file1, file2, file3]

Response:
{
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "data": [
    {
      "url": "/api/v1/upload/exam-files/uuid-timestamp.jpg",
      "filename": "uuid-timestamp.jpg",
      "originalName": "answer1.jpg",
      "size": 245678,
      "mimetype": "image/jpeg"
    },
    ...
  ]
}
```

### 5. Grade Answer (Teacher)

```json
PUT /api/v1/exams/answers/answer-id/grade

{
  "marksAwarded": 4,
  "feedback": "Good answer but missing one step",
  "isCorrect": true
}
```

## Frontend Implementation Guide

### Teacher Exam Creation Flow

1. **Exam List Page** (`/teacher/exams`)
   - Display all exams created by teacher
   - Filter by subject, class, status
   - Create new exam button

2. **Create/Edit Exam Page** (`/teacher/exams/create` or `/teacher/exams/:id/edit`)
   - Form with exam details (title, description, dates, marks)
   - Date-time picker for start/end times
   - Exam settings checkboxes
   - Question builder section:
     - Add MCQ with Nepali text support
     - Add file upload question
     - Add short/long answer question
     - Drag to reorder questions
     - Set marks per question
   - Preview mode
   - Save/Publish button

3. **Grading Interface** (`/teacher/exams/:id/grade`)
   - List of student attempts
   - Filter: all/graded/pending
   - For each student:
     - View all answers
     - For file upload questions: display uploaded images
     - Input marks
     - Add feedback
     - Save grades
   - Publish results button

### Student Exam Flow

1. **Exam List Page** (`/student/exams`)
   - Three tabs: Scheduled, Active, Completed
   - Display exam cards with title, subject, date, time

2. **Exam Instructions Page** (`/student/exams/:id`)
   - Display exam details
   - Show instructions
   - Show start time, duration, total marks
   - "Start Exam" button (only if exam is active)

3. **Exam Taking Page** (`/student/exams/:id/take`)
   - Timer display (countdown)
   - Progress indicator (X/Y questions answered)
   - Question navigation sidebar
   - Question display:
     - For MCQ: Radio buttons with options (support Nepali text)
     - For file upload: File upload zone (up to 5 files)
     - For text: Input/Textarea
   - Previous/Next buttons
   - Auto-save on answer change
   - "Submit Exam" button
   - Confirmation dialog before submit

4. **Results Page** (`/student/exams/:id/result`)
   - Overall score, percentage, grade
   - Question-wise breakdown
   - Show correct answers (if enabled)
   - Teacher feedback
   - Time spent

## Key Implementation Notes

### Nepali Unicode Support

- All question and option text fields use `@db.Text` for unlimited length
- Frontend should use UTF-8 encoding
- Test with actual Nepali characters: गणित, विज्ञान, etc.
- Use appropriate fonts that support Devanagari script

### File Upload Security

- Only authenticated users can upload/access files
- File path includes UUID to prevent guessing
- Validate file types on both client and server
- Limit file sizes (10MB per file)
- Store files outside public directory
- Serve files through authenticated API endpoint

### Timer Implementation

- Start timer when attempt starts
- Store start time in database
- Calculate time spent on submit
- Implement auto-submit when time expires
- Show warning when 5 minutes remaining
- Use `setInterval` with 1-second updates
- Consider using Web Workers for accuracy

### Auto-Save

- Save answer after 2 seconds of inactivity
- Show "Saving..." indicator
- Show "Saved" checkmark when complete
- Use debouncing to prevent excessive API calls
- Handle offline scenarios gracefully

### Grading Workflow

- Auto-grade MCQ immediately upon submission
- Manual grading required for file uploads and text answers
- Teachers can grade in any order
- System calculates total score after all questions graded
- Results only visible to students after published

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: 
   - Teachers can only access their own exams
   - Students can only access their own attempts
   - Admins have full access
3. **Exam Access Control**:
   - Check exam start/end times
   - Verify max attempts not exceeded
   - Prevent editing after submission
4. **File Security**:
   - Validate file types and sizes
   - Prevent directory traversal
   - Store files with unique names
   - Require authentication to access files

## Testing Checklist

### Backend Testing

- [ ] Create exam with all question types
- [ ] Start exam attempt with validations
- [ ] Submit MCQ answer and verify auto-grading
- [ ] Upload multiple files (up to 5)
- [ ] Submit exam and verify score calculation
- [ ] Grade file upload question manually
- [ ] Verify late submission handling
- [ ] Test max attempts limit
- [ ] Test Nepali Unicode storage and retrieval

### Frontend Testing

- [ ] Create exam with Nepali text
- [ ] Date-time picker works correctly
- [ ] Question reordering works
- [ ] Timer counts down accurately
- [ ] Auto-save works
- [ ] File upload shows preview
- [ ] Multiple file upload works (up to 5)
- [ ] Cannot upload more than 5 files
- [ ] Submit confirmation works
- [ ] Results display correctly
- [ ] Grading interface works

## Performance Optimization

1. **Database Indexing**: Already indexed on key fields (examId, studentId, etc.)
2. **Pagination**: Implement for exam lists and attempt lists
3. **Caching**: Cache exam details, subject/class data
4. **File Optimization**: 
   - Compress images before upload
   - Generate thumbnails for preview
   - Use lazy loading for images
5. **Query Optimization**: Use `include` selectively to avoid over-fetching

## Future Enhancements

1. **Question Bank**: Reusable question library
2. **Random Question Selection**: Generate exams from question bank
3. **Proctoring**: Camera monitoring, tab switching detection
4. **Advanced Analytics**: Performance trends, difficulty analysis
5. **Exam Templates**: Save and reuse exam configurations
6. **Bulk Grading**: Grade multiple students at once
7. **Export**: Export results to Excel/PDF
8. **Notifications**: Email/SMS reminders for upcoming exams
9. **Mobile App**: Native mobile app for better exam experience
10. **Offline Support**: Take exams offline and sync when online

## Support

For issues or questions, refer to the main project documentation or contact the development team.

---

**Last Updated**: November 26, 2025
**Version**: 1.0.0
