# Exam System API Reference

Complete API documentation for the Comprehensive Exam System.

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Exam Management APIs

### 1. Create Exam

Create a new exam with or without questions.

**Endpoint**: `POST /exams`

**Authorization**: Teacher, Admin

**Request Body**:
```json
{
  "title": "Mathematics Mid-Term Exam",
  "description": "Covers chapters 1-5",
  "subjectId": "clxxx123",
  "classId": "clxxx456",
  "batchId": "clxxx789",
  "type": "MIDTERM",
  "startTime": "2025-12-01T10:00:00Z",
  "endTime": "2025-12-01T12:00:00Z",
  "duration": 120,
  "totalMarks": 50,
  "passingMarks": 20,
  "instructions": "Read all questions carefully. Answer in Nepali or English.",
  "allowLateSubmission": false,
  "shuffleQuestions": false,
  "showResultsImmediately": false,
  "allowReview": true,
  "maxAttempts": 1,
  "questions": [
    {
      "questionText": "50 जना विद्यार्थीहरूको एक समूहमा...",
      "questionType": "FILE_UPLOAD",
      "marks": 10,
      "negativeMarks": 0,
      "maxFiles": 5,
      "acceptedFileTypes": "image/jpeg,image/png,application/pdf",
      "maxFileSizeMB": 10
    },
    {
      "questionText": "What is the value of π?",
      "questionType": "MULTIPLE_CHOICE",
      "marks": 5,
      "options": [
        { "optionText": "3.14", "isCorrect": true },
        { "optionText": "3.41", "isCorrect": false },
        { "optionText": "4.13", "isCorrect": false },
        { "optionText": "1.34", "isCorrect": false }
      ]
    }
  ]
}
```

**Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Exam created successfully",
  "data": {
    "id": "clxxx999",
    "title": "Mathematics Mid-Term Exam",
    "status": "UPCOMING",
    "subject": { "id": "clxxx123", "name": "Mathematics" },
    "class": { "id": "clxxx456", "name": "Class 10" },
    "createdByUser": {
      "id": "clxxx000",
      "name": "John Teacher",
      "email": "teacher@lms.com"
    },
    "startTime": "2025-12-01T10:00:00Z",
    "endTime": "2025-12-01T12:00:00Z",
    "totalMarks": 50,
    "passingMarks": 20
  }
}
```

---

### 2. Get All Exams

Get list of all exams with optional filters.

**Endpoint**: `GET /exams`

**Authorization**: All authenticated users

**Query Parameters**:
- `subjectId` (optional): Filter by subject
- `classId` (optional): Filter by class
- `status` (optional): Filter by status (UPCOMING, ACTIVE, COMPLETED, CANCELLED)
- `type` (optional): Filter by type (MIDTERM, FINAL, QUIZ, ASSIGNMENT, PROJECT)

**Example**: `GET /exams?subjectId=clxxx123&status=UPCOMING`

**Success Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx999",
      "title": "Mathematics Mid-Term Exam",
      "description": "Covers chapters 1-5",
      "status": "UPCOMING",
      "type": "MIDTERM",
      "startTime": "2025-12-01T10:00:00Z",
      "endTime": "2025-12-01T12:00:00Z",
      "totalMarks": 50,
      "passingMarks": 20,
      "subject": { "id": "clxxx123", "name": "Mathematics" },
      "class": { "id": "clxxx456", "name": "Class 10" },
      "createdByUser": {
        "id": "clxxx000",
        "name": "John Teacher"
      },
      "_count": {
        "questions": 25,
        "attempts": 15
      }
    }
  ]
}
```

---

### 3. Get Exam by ID

Get detailed information about a specific exam including all questions.

**Endpoint**: `GET /exams/:id`

**Authorization**: All authenticated users

**Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx999",
    "title": "Mathematics Mid-Term Exam",
    "description": "Covers chapters 1-5",
    "instructions": "Read all questions carefully...",
    "status": "UPCOMING",
    "type": "MIDTERM",
    "startTime": "2025-12-01T10:00:00Z",
    "endTime": "2025-12-01T12:00:00Z",
    "duration": 120,
    "totalMarks": 50,
    "passingMarks": 20,
    "allowLateSubmission": false,
    "shuffleQuestions": false,
    "showResultsImmediately": false,
    "allowReview": true,
    "maxAttempts": 1,
    "subject": { "id": "clxxx123", "name": "Mathematics" },
    "class": { "id": "clxxx456", "name": "Class 10" },
    "questions": [
      {
        "id": "clxxx111",
        "orderIndex": 0,
        "marks": 10,
        "question": {
          "id": "clxxx222",
          "questionText": "50 जना विद्यार्थीहरूको...",
          "questionType": "FILE_UPLOAD",
          "marks": 10,
          "maxFiles": 5,
          "acceptedFileTypes": "image/jpeg,image/png",
          "explanation": "Use set theory..."
        }
      },
      {
        "id": "clxxx112",
        "orderIndex": 1,
        "marks": 5,
        "question": {
          "id": "clxxx223",
          "questionText": "यदि M र S ले क्रमश:...",
          "questionType": "MULTIPLE_CHOICE",
          "marks": 5,
          "options": [
            { "id": "clxxx301", "optionText": "28", "isCorrect": true, "orderIndex": 0 },
            { "id": "clxxx302", "optionText": "18", "isCorrect": false, "orderIndex": 1 },
            { "id": "clxxx303", "optionText": "20", "isCorrect": false, "orderIndex": 2 },
            { "id": "clxxx304", "optionText": "26", "isCorrect": false, "orderIndex": 3 }
          ]
        }
      }
    ],
    "studentAttempt": null,
    "_count": {
      "attempts": 0
    }
  }
}
```

---

### 4. Update Exam

Update exam details.

**Endpoint**: `PUT /exams/:id`

**Authorization**: Teacher (own exams), Admin

**Request Body**: (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "startTime": "2025-12-02T10:00:00Z",
  "endTime": "2025-12-02T12:00:00Z",
  "status": "ACTIVE",
  "allowLateSubmission": true
}
```

**Success Response**: `200 OK`

---

### 5. Delete Exam

Delete an exam and all associated data.

**Endpoint**: `DELETE /exams/:id`

**Authorization**: Teacher (own exams), Admin

**Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Exam deleted successfully"
}
```

---

## Question Management APIs

### 6. Add Question to Exam

Add a new question to an existing exam.

**Endpoint**: `POST /exams/:id/questions`

**Authorization**: Teacher, Admin

**Request Body for MCQ**:
```json
{
  "questionText": "यदि M र S ले क्रमश: गणित र विज्ञान मन पराउने विद्यार्थीहरूको समूह जनाउने भए no(M) को मान कति होला।",
  "questionType": "MULTIPLE_CHOICE",
  "marks": 5,
  "negativeMarks": 0,
  "options": [
    { "optionText": "28", "isCorrect": true },
    { "optionText": "18", "isCorrect": false },
    { "optionText": "20", "isCorrect": false },
    { "optionText": "26", "isCorrect": false }
  ],
  "orderIndex": 0,
  "isOptional": false,
  "sectionName": "Section A"
}
```

**Request Body for File Upload Question**:
```json
{
  "questionText": "50 जना विद्यार्थीहरूको एक समूहमा 20 जनाले गणित मात्र...",
  "questionType": "FILE_UPLOAD",
  "marks": 10,
  "allowMultipleFiles": true,
  "maxFiles": 5,
  "acceptedFileTypes": "image/jpeg,image/png,application/pdf",
  "maxFileSizeMB": 10,
  "explanation": "Use set theory principles",
  "orderIndex": 1
}
```

**Success Response**: `201 Created`

---

### 7. Update Question

Update an existing question in an exam.

**Endpoint**: `PUT /exams/:examId/questions/:questionId`

**Authorization**: Teacher, Admin

**Request Body**:
```json
{
  "questionText": "Updated question text",
  "marks": 8,
  "options": [
    { "optionText": "New Option 1", "isCorrect": true },
    { "optionText": "New Option 2", "isCorrect": false }
  ]
}
```

**Success Response**: `200 OK`

---

### 8. Remove Question

Remove a question from an exam.

**Endpoint**: `DELETE /exams/:examId/questions/:questionId`

**Authorization**: Teacher, Admin

**Success Response**: `200 OK`

---

## Student Exam Taking APIs

### 9. Start Exam Attempt

Start a new exam attempt for a student.

**Endpoint**: `POST /exams/:id/start`

**Authorization**: Student only

**Request Body**:
```json
{
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "deviceInfo": "Chrome 120 on Windows 10"
}
```

**Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Exam attempt started successfully",
  "data": {
    "attempt": {
      "id": "clxxx444",
      "examId": "clxxx999",
      "studentId": "clxxx555",
      "attemptNumber": 1,
      "startedAt": "2025-12-01T10:05:00Z",
      "isCompleted": false
    },
    "exam": {
      "id": "clxxx999",
      "title": "Mathematics Mid-Term Exam",
      "duration": 120,
      "questions": [...]
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Exam not started yet / Exam has ended / Maximum attempts reached
- `404 Not Found`: Exam not found

---

### 10. Submit Answer

Submit or update an answer for a specific question.

**Endpoint**: `POST /exams/:examId/attempts/:attemptId/answer`

**Authorization**: Student only

**Request Body for MCQ**:
```json
{
  "questionId": "clxxx223",
  "selectedOptionId": "clxxx301"
}
```

**Request Body for File Upload**:
```json
{
  "questionId": "clxxx222",
  "uploadedFiles": [
    "/api/v1/upload/exam-files/uuid1-timestamp.jpg",
    "/api/v1/upload/exam-files/uuid2-timestamp.jpg"
  ]
}
```

**Request Body for Text Answer**:
```json
{
  "questionId": "clxxx224",
  "textAnswer": "The compound interest formula is A = P(1 + r/n)^(nt)"
}
```

**Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Answer saved successfully",
  "data": {
    "id": "clxxx666",
    "attemptId": "clxxx444",
    "questionId": "clxxx223",
    "selectedOptionId": "clxxx301",
    "isCorrect": true,
    "marksAwarded": 5,
    "answeredAt": "2025-12-01T10:15:00Z"
  }
}
```

---

### 11. Submit Exam

Submit the completed exam attempt.

**Endpoint**: `POST /exams/:examId/attempts/:attemptId/submit`

**Authorization**: Student only

**Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Exam submitted successfully",
  "data": {
    "id": "clxxx444",
    "examId": "clxxx999",
    "studentId": "clxxx555",
    "attemptNumber": 1,
    "startedAt": "2025-12-01T10:05:00Z",
    "submittedAt": "2025-12-01T11:30:00Z",
    "isCompleted": true,
    "isLate": false,
    "timeSpentSeconds": 5100,
    "totalScore": 42,
    "maxScore": 50,
    "percentage": 84,
    "isGraded": false,
    "answers": [...]
  }
}
```

---

### 12. Get My Exam Result

Get the student's exam result.

**Endpoint**: `GET /exams/:id/my-result`

**Authorization**: Student only

**Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx444",
    "examId": "clxxx999",
    "attemptNumber": 1,
    "startedAt": "2025-12-01T10:05:00Z",
    "submittedAt": "2025-12-01T11:30:00Z",
    "timeSpentSeconds": 5100,
    "totalScore": 42,
    "maxScore": 50,
    "percentage": 84,
    "grade": "A",
    "isPassed": true,
    "isGraded": true,
    "gradedAt": "2025-12-02T09:00:00Z",
    "exam": {
      "title": "Mathematics Mid-Term Exam",
      "totalMarks": 50,
      "passingMarks": 20
    },
    "answers": [
      {
        "id": "clxxx666",
        "question": {
          "questionText": "यदि M र S ले...",
          "questionType": "MULTIPLE_CHOICE",
          "marks": 5,
          "explanation": "Set theory solution...",
          "options": [...]
        },
        "selectedOption": {
          "id": "clxxx301",
          "optionText": "28",
          "isCorrect": true
        },
        "isCorrect": true,
        "marksAwarded": 5,
        "feedback": null
      }
    ]
  }
}
```

---

## Grading APIs

### 13. Get Exam Attempts for Grading

Get all completed attempts for an exam (for teachers to grade).

**Endpoint**: `GET /exams/:id/attempts`

**Authorization**: Teacher, Admin

**Success Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx444",
      "examId": "clxxx999",
      "attemptNumber": 1,
      "startedAt": "2025-12-01T10:05:00Z",
      "submittedAt": "2025-12-01T11:30:00Z",
      "isCompleted": true,
      "isGraded": false,
      "totalScore": null,
      "maxScore": 50,
      "student": {
        "id": "clxxx555",
        "name": "Jane Student",
        "email": "student@lms.com",
        "symbolNo": "STU001"
      },
      "answers": [
        {
          "id": "clxxx667",
          "questionId": "clxxx222",
          "uploadedFiles": [
            "/api/v1/upload/exam-files/uuid1.jpg",
            "/api/v1/upload/exam-files/uuid2.jpg"
          ],
          "isCorrect": null,
          "marksAwarded": null,
          "question": {
            "questionText": "50 जना विद्यार्थीहरूको...",
            "questionType": "FILE_UPLOAD",
            "marks": 10
          }
        }
      ]
    }
  ]
}
```

---

### 14. Grade an Answer

Grade a specific answer and provide feedback.

**Endpoint**: `PUT /exams/answers/:answerId/grade`

**Authorization**: Teacher, Admin

**Request Body**:
```json
{
  "marksAwarded": 8,
  "feedback": "Good answer, but missing the final step. -2 marks.",
  "isCorrect": false
}
```

**Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Answer graded successfully",
  "data": {
    "id": "clxxx667",
    "attemptId": "clxxx444",
    "questionId": "clxxx222",
    "marksAwarded": 8,
    "feedback": "Good answer, but missing the final step. -2 marks.",
    "isCorrect": false,
    "updatedAt": "2025-12-02T09:00:00Z"
  }
}
```

---

## File Upload APIs

### 15. Upload Exam Answer Files

Upload answer images/files for exam questions (up to 5 files).

**Endpoint**: `POST /upload/exam-answer`

**Authorization**: Student only

**Content-Type**: `multipart/form-data`

**Form Data**:
- `files`: Array of files (up to 5)

**Accepted File Types**:
- Image: JPEG, PNG, GIF, WEBP
- Document: PDF

**File Size Limit**: 10MB per file

**Example (using FormData)**:
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('files', file3);

const response = await fetch('/api/v1/upload/exam-answer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "data": [
    {
      "url": "/api/v1/upload/exam-files/uuid1-timestamp.jpg",
      "filename": "uuid1-timestamp.jpg",
      "originalName": "answer1.jpg",
      "size": 245678,
      "mimetype": "image/jpeg"
    },
    {
      "url": "/api/v1/upload/exam-files/uuid2-timestamp.jpg",
      "filename": "uuid2-timestamp.jpg",
      "originalName": "answer2.jpg",
      "size": 312456,
      "mimetype": "image/jpeg"
    },
    {
      "url": "/api/v1/upload/exam-files/uuid3-timestamp.pdf",
      "filename": "uuid3-timestamp.pdf",
      "originalName": "answer3.pdf",
      "size": 567890,
      "mimetype": "application/pdf"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid file type, no files provided
- `413 Payload Too Large`: File size exceeds 10MB

---

### 16. Get Exam Answer File

Retrieve an uploaded exam answer file.

**Endpoint**: `GET /upload/exam-files/:filename`

**Authorization**: All authenticated users

**Success Response**: File stream with appropriate headers

**Headers**:
```
Content-Type: image/jpeg (or appropriate mime type)
Content-Length: 245678
Content-Disposition: inline
Cache-Control: private, max-age=3600
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details here"
}
```

---

## Enums

### ExamType
- `MIDTERM`
- `FINAL`
- `QUIZ`
- `ASSIGNMENT`
- `PROJECT`

### ExamStatus
- `UPCOMING`
- `ACTIVE`
- `COMPLETED`
- `CANCELLED`

### QuestionType
- `MULTIPLE_CHOICE`
- `FILE_UPLOAD`
- `SHORT_ANSWER`
- `LONG_ANSWER`

### Grade
- `A_PLUS`
- `A`
- `B_PLUS`
- `B`
- `C_PLUS`
- `C`
- `D`
- `F`

---

## Rate Limiting

- Development: 1000 requests per minute
- Production: 100 requests per 15 minutes

---

## Notes

1. All dates are in ISO 8601 format (UTC)
2. File URLs are relative and require authentication
3. Nepali Unicode text is fully supported
4. Auto-save should be implemented on the client side
5. Exam status is automatically updated based on start/end times

---

**Last Updated**: November 26, 2025
**API Version**: 1.0.0
