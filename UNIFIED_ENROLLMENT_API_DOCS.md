# Unified Enrollment System API Documentation

## Overview

The Unified Enrollment System API provides endpoints for managing student enrollments in subjects following the simplified relationship model from your photo diagram. This replaces the previous multiple enrollment mechanisms with a single, unified approach.

## Base URL
```
/api/unified-enrollment
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Enroll Student in Subject

**Endpoint**: `POST /api/unified-enrollment/enroll`

**Description**: Enroll a single student in a subject within a specific class and batch.

**Request Body**:
```json
{
  "studentId": "string (required)",
  "subjectId": "string (required)", 
  "classId": "string (required)",
  "batchId": "string (required)"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Student enrolled successfully",
  "data": {
    "id": "enrollment_uuid",
    "studentId": "student_uuid",
    "subjectId": "subject_uuid", 
    "classId": "class_uuid",
    "batchId": "batch_uuid",
    "enrolledBy": "admin_uuid",
    "enrolledAt": "2024-01-15T10:30:00Z",
    "isActive": true,
    "isCompleted": false,
    "student": {
      "id": "student_uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "subject": {
      "id": "subject_uuid", 
      "name": "Mathematics",
      "code": "MATH101"
    },
    "class": {
      "id": "class_uuid",
      "name": "Class 10",
      "section": "A"
    },
    "batch": {
      "id": "batch_uuid",
      "name": "Batch 2025",
      "startYear": 2023,
      "endYear": 2025
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `409 Conflict`: Student already enrolled
- `404 Not Found`: Student, subject, class, or batch not found
- `403 Forbidden`: Student not in specified batch or subject not taught in class

### 2. Bulk Enroll Students

**Endpoint**: `POST /api/unified-enrollment/bulk-enroll`

**Description**: Enroll multiple students in a subject simultaneously.

**Request Body**:
```json
{
  "studentIds": ["string"] (required, array),
  "subjectId": "string (required)",
  "classId": "string (required)", 
  "batchId": "string (required)"
}
```

**Response** (201 Created or 200 OK for partial success):
```json
{
  "success": true,
  "message": "Successfully enrolled 5 students",
  "data": {
    "newEnrollments": 5,
    "alreadyEnrolled": 2,
    "skipped": 0
  }
}
```

**Error Response** (409 Conflict):
```json
{
  "success": false,
  "message": "All students are already enrolled in this subject",
  "data": {
    "alreadyEnrolled": 7,
    "newEnrollments": 0
  }
}
```

### 3. Get Student Enrollments

**Endpoint**: `GET /api/unified-enrollment/student/{studentId}`

**Description**: Retrieve all active enrollments for a specific student with optional filters.

**Query Parameters**:
- `classId` (optional): Filter by class ID
- `subjectId` (optional): Filter by subject ID
- `batchId` (optional): Filter by batch ID
- `isCompleted` (optional): Filter by completion status (true/false)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Enrollments retrieved successfully", 
  "data": [
    {
      "id": "enrollment_uuid",
      "studentId": "student_uuid",
      "subjectId": "subject_uuid",
      "classId": "class_uuid", 
      "batchId": "batch_uuid",
      "enrolledAt": "2024-01-15T10:30:00Z",
      "isActive": true,
      "isCompleted": false,
      "grade": "A",
      "finalMarks": 85,
      "totalMarks": 100,
      "percentage": 85,
      "attendance": 92.5,
      "isPassed": true,
      "completedAt": "2024-06-15T14:20:00Z",
      "subject": {
        "id": "subject_uuid",
        "name": "Mathematics", 
        "code": "MATH101"
      },
      "class": {
        "id": "class_uuid",
        "name": "Class 10",
        "section": "A"
      },
      "batch": {
        "id": "batch_uuid",
        "name": "Batch 2025"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1
  }
}
```

### 4. Update Enrollment

**Endpoint**: `PUT /api/unified-enrollment/{enrollmentId}`

**Description**: Update enrollment details such as grades, marks, and completion status.

**Request Body** (all fields optional):
```json
{
  "grade": "A" | "B" | "C" | "D" | "F",
  "finalMarks": 85,
  "totalMarks": 100, 
  "attendance": 92.5,
  "isPassed": true,
  "notes": "Excellent performance"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Enrollment updated successfully",
  "data": {
    "id": "enrollment_uuid",
    "grade": "A",
    "finalMarks": 85,
    "totalMarks": 100,
    "percentage": 85,
    "attendance": 92.5, 
    "isPassed": true,
    "isCompleted": true,
    "completedAt": "2024-06-15T14:20:00Z",
    "updatedAt": "2024-06-15T14:20:00Z"
  }
}
```

**Notes**:
- `percentage` is automatically calculated from `finalMarks` and `totalMarks`
- Setting `isPassed: true` automatically sets `isCompleted: true` and `completedAt`
- Grade validation follows standard A-F grading system

### 5. Get Enrollment Statistics

**Endpoint**: `GET /api/unified-enrollment/statistics`

**Description**: Retrieve comprehensive statistics about enrollments.

**Query Parameters** (all optional):
- `batchId`: Filter statistics by batch
- `classId`: Filter statistics by class
- `subjectId`: Filter statistics by subject
- `isActive`: Filter by active status (true/false)
- `startDate`: Filter enrollments after date (ISO format)
- `endDate`: Filter enrollments before date (ISO format)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalEnrollments": 1250,
    "activeEnrollments": 1100,
    "completedEnrollments": 850,
    "passedEnrollments": 780,
    "uniqueStudents": 125,
    "uniqueSubjects": 15,
    "averageAttendance": 87.3,
    "completionRate": 68.0,
    "passRate": 91.76,
    "gradeDistribution": {
      "A": 245,
      "B": 298, 
      "C": 187,
      "D": 50,
      "F": 70
    }
  }
}
```

### 6. Deactivate Enrollment

**Endpoint**: `DELETE /api/unified-enrollment/{enrollmentId}`

**Description**: Deactivate (soft delete) an enrollment. The enrollment record remains but becomes inactive.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Enrollment deactivated successfully",
  "data": {
    "id": "enrollment_uuid",
    "studentId": "student_uuid", 
    "subjectId": "subject_uuid"
  }
}
```

## Data Models

### SubjectEnrollment Model
```typescript
interface SubjectEnrollment {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  batchId: string;
  enrolledBy: string;
  enrolledAt: Date;
  isActive: boolean;
  isCompleted: boolean;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  finalMarks?: number;
  totalMarks?: number;
  percentage?: number; // Auto-calculated
  attendance?: number;
  isPassed?: boolean;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  student: User;
  subject: Subject;
  class: Class;
  batch: Batch;
  enrolledByUser: User;
}
```

## Validation Rules

### Enrollment Creation
- `studentId`: Must be valid UUID of active student
- `subjectId`: Must be valid UUID of active subject  
- `classId`: Must be valid UUID of active class
- `batchId`: Must be valid UUID of active batch
- Student must belong to the specified batch
- Class must be linked to the specified batch
- Subject must be taught in the specified class
- Student cannot be already enrolled in same subject+class combination

### Enrollment Updates
- `grade`: Must be one of: A, B, C, D, F
- `finalMarks`: Must be non-negative number
- `totalMarks`: Must be positive number
- `attendance`: Must be between 0 and 100
- `percentage`: Auto-calculated, cannot be set manually

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": {
    // Additional error details when applicable
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request data validation failed
- `STUDENT_NOT_FOUND`: Student ID not found or inactive
- `SUBJECT_NOT_FOUND`: Subject ID not found or inactive  
- `CLASS_NOT_FOUND`: Class ID not found or inactive
- `BATCH_NOT_FOUND`: Batch ID not found or inactive
- `ENROLLMENT_EXISTS`: Student already enrolled in subject
- `ENROLLMENT_NOT_FOUND`: Enrollment ID not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RELATIONSHIP_ERROR`: Required relationships not found

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per user
- **Bulk operations**: 10 requests per minute per user
- **Statistics endpoint**: 20 requests per minute per user

## Webhooks (Future Implementation)

The system supports webhooks for enrollment events:

### Events
- `enrollment.created`: New enrollment created
- `enrollment.updated`: Enrollment updated (grades, completion)
- `enrollment.completed`: Student completed subject
- `enrollment.deactivated`: Enrollment deactivated

### Webhook Payload
```json
{
  "event": "enrollment.created",
  "timestamp": "2024-01-15T10:30:00Z", 
  "data": {
    "enrollment": {
      // Full enrollment object
    }
  }
}
```

## Migration from Legacy System

### Deprecated Endpoints
The following legacy endpoints are deprecated and will be removed in v2.0:
- `POST /api/student-class/enroll` → Use unified enrollment
- `POST /api/module-enrollment/enroll` → Use unified enrollment  
- `GET /api/class-enrollment/student/{id}` → Use unified enrollment

### Migration Guide
1. Update client applications to use new unified endpoints
2. Run data migration script to convert existing enrollments
3. Test thoroughly with new API structure
4. Monitor for any integration issues

## SDK and Client Libraries

### JavaScript/TypeScript
```bash
npm install @lms/enrollment-sdk
```

```typescript
import { EnrollmentClient } from '@lms/enrollment-sdk';

const client = new EnrollmentClient({
  baseUrl: 'https://api.lms.com',
  apiKey: 'your-api-key'
});

// Enroll student
const enrollment = await client.enrollStudent({
  studentId: 'student-123',
  subjectId: 'subject-456', 
  classId: 'class-789',
  batchId: 'batch-101'
});

// Get student enrollments
const enrollments = await client.getStudentEnrollments('student-123', {
  classId: 'class-789'
});
```

## Changelog

### v1.0.0 (Current)
- Initial release of unified enrollment system
- Support for single and bulk enrollment operations
- Comprehensive statistics and reporting
- Migration from legacy enrollment models

### Planned Features (v1.1.0)
- Advanced filtering and search capabilities
- Export functionality for enrollment data
- Real-time notifications via WebSockets
- Enhanced performance optimizations

---

For technical support or API questions, contact the development team or refer to the testing guide documentation.