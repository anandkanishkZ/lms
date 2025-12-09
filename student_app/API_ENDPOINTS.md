# Student App API Endpoints

This document lists all the API endpoints used by the Flutter student mobile app.

## Base URL
```
Production: https://server.freeeducationinnepal.com/api/v1
Development: http://localhost:5005/api/v1
```

## Authentication Endpoints

### Login
- **POST** `/auth/login`
- Body: `{ "email": "string", "password": "string" }`
- Response: `{ "success": true, "data": { "accessToken": "...", "refreshToken": "...", "user": {...} } }`

### Register
- **POST** `/auth/register`
- Body: `{ "name": "string", "email": "string", "password": "string", "phone": "string?", "role": "STUDENT" }`
- Response: Same as login

### Logout
- **POST** `/auth/logout`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "message": "..." }`

### Get Profile
- **GET** `/auth/me` or `/auth/profile`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": { "user": {...} } }`

### Update Profile
- **PUT** `/auth/profile`
- Headers: `Authorization: Bearer {token}`
- Body: `{ "name": "string", "phone": "string?" }`
- Response: `{ "success": true, "data": { "user": {...} } }`

### Change Password
- **POST** `/auth/change-password`
- Headers: `Authorization: Bearer {token}`
- Body: `{ "currentPassword": "string", "newPassword": "string" }`
- Response: `{ "success": true, "message": "..." }`

## Module Endpoints

### Get All Modules
- **GET** `/modules`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

### Get Featured Modules
- **GET** `/modules/featured`
- Response: `{ "success": true, "data": [...] }`

### Get Module by ID
- **GET** `/modules/{id}`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

### Get Module by Slug
- **GET** `/modules/slug/{slug}`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

## Enrollment Endpoints

### Get Student Enrollments
- **GET** `/enrollments/students/{studentId}/enrollments`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

### Get Module Enrollments
- **GET** `/enrollments/modules/{moduleId}/enrollments`
- Headers: `Authorization: Bearer {token}`
- Required Role: ADMIN or TEACHER

## Topics Endpoints

### Get Topics by Module
- **GET** `/topics/modules/{moduleId}/topics`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

## Lesson Endpoints

### Get Lesson by ID
- **GET** `/lessons/{id}`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

### Get Lessons by Topic
- **GET** `/lessons/topics/{topicId}/lessons`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

### Track Lesson View
- **POST** `/lessons/{id}/view`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

## Progress Endpoints

### Get Module Progress
- **GET** `/progress/modules/{moduleId}`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

### Get Lesson Progress
- **GET** `/progress/lessons/{lessonId}`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

### Mark Lesson Complete
- **POST** `/progress/lessons/{lessonId}/complete`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

## Exam Endpoints

### Get All Exams
- **GET** `/exams`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

### Get Exam by ID
- **GET** `/exams/{id}`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

### Start Exam
- **POST** `/exams/{id}/start`
- Headers: `Authorization: Bearer {token}`
- Required Role: STUDENT
- Response: `{ "success": true, "data": { "attemptId": "..." } }`

### Submit Answer
- **POST** `/exams/{examId}/attempts/{attemptId}/answer`
- Headers: `Authorization: Bearer {token}`
- Body: `{ "questionId": "number", "answer": "string" }`
- Response: `{ "success": true, "data": {...} }`

### Submit Exam
- **POST** `/exams/{examId}/attempts/{attemptId}/submit`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": { "score": "...", "result": "..." } }`

### Get My Exam Result
- **GET** `/exams/{id}/my-result`
- Headers: `Authorization: Bearer {token}`
- Required Role: STUDENT
- Response: `{ "success": true, "data": {...} }`

## Notice Endpoints

### Get All Notices
- **GET** `/notices`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

### Get Notice by ID
- **GET** `/notices/{id}`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

### Mark Notice as Read
- **POST** `/notices/{id}/read`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

### Get Unread Count
- **GET** `/notices/unread/count`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": { "count": "number" } }`

## Dashboard Endpoints

### Get Student Dashboard
- **GET** `/analytics/student/dashboard`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

### Get Student Stats
- **GET** `/analytics/student/stats`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

## Notification Endpoints

### Get All Notifications
- **GET** `/notifications`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

### Mark Notification as Read
- **POST** `/notifications/{id}/read`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": {...} }`

## YouTube Live Endpoints

### Get Upcoming Live Sessions
- **GET** `/youtube-live/upcoming`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

### Get Current Live Sessions
- **GET** `/youtube-live/current`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

### Get Past Live Sessions
- **GET** `/youtube-live/past`
- Headers: `Authorization: Bearer {token}`
- Response: `{ "success": true, "data": [...] }`

## Test Credentials

For testing the app:
- **Email**: `student@lms.com`
- **Password**: `student123`

## Headers Format

All authenticated requests must include:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
```

## Response Format

All responses follow this structure:
```json
{
  "success": true/false,
  "message": "Optional message",
  "data": { ... } or [ ... ],
  "error": "Optional error message"
}
```

## Error Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized (invalid/expired token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error
