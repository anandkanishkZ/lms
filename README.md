# 🎓 Smart School Learning Management System (LMS)

A comprehensive, full-stack Learning Management System designed for educational institutions to manage courses, students, teachers, exams, and more. Built with modern technologies to provide a seamless learning experience.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Key Modules](#key-modules)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

The Smart School LMS is a modern, scalable learning management platform that facilitates digital education. It provides a comprehensive ecosystem for administrators, teachers, and students to manage educational content, track progress, conduct assessments, and communicate effectively.

### Key Highlights

- 🎯 **Multi-Role System**: Separate portals for Admin, Teacher, and Student
- 📚 **Module-Based Learning**: Organized curriculum with topics and lessons
- 📝 **Exam Management**: Create, conduct, and grade online examinations
- 🎥 **Live Classes**: YouTube Live integration for real-time teaching
- 📊 **Progress Tracking**: Real-time student progress monitoring
- 🔔 **Notifications**: System-wide notification management
- 📱 **Responsive Design**: Mobile-friendly interface
- 🌐 **Bilingual Support**: English and Nepali language support
- 🔒 **Secure Authentication**: JWT-based authentication system
- 📈 **Analytics Dashboard**: Comprehensive performance analytics

---

## ✨ Features

### For Administrators

- **User Management**: Create, edit, and manage users (teachers and students)
- **Batch Management**: Organize students into batches with graduation tracking
- **Class Management**: Create and manage classes with sections
- **Subject Management**: Define subjects and assign to classes
- **Module Approval**: Review and approve teacher-submitted modules
- **Notice Management**: Post system-wide announcements
- **Analytics**: View system-wide statistics and performance metrics
- **Graduation System**: Batch graduation with automatic archiving

### For Teachers

- **Module Creation**: Create comprehensive learning modules with topics and lessons
- **Content Management**: Upload resources (PDFs, videos, links, etc.)
- **Exam Creation**: Design various types of exams (multiple-choice, file upload, etc.)
- **Live Classes**: Schedule and conduct YouTube Live sessions
- **Student Progress**: Track individual student progress
- **Grading System**: Review and grade student submissions
- **Notifications**: Send targeted notifications to students
- **Profile Management**: Update personal information and avatar
- **Activity Logs**: View module approval/rejection history

### For Students

- **Course Enrollment**: Browse and enroll in available courses
- **Learning Dashboard**: Access enrolled modules and track progress
- **Lesson Viewing**: Access various lesson types (video, text, PDF, links)
- **Exam Taking**: Participate in online examinations
- **Progress Tracking**: Monitor personal learning progress
- **Live Classes**: Join scheduled live sessions
- **Resource Access**: Download learning materials
- **Notifications**: Receive updates and announcements
- **Profile Management**: Update personal information
- **Rating System**: Rate and review modules

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15.x (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Redux Toolkit, TanStack Query
- **Form Handling**: React Hook Form with Zod validation
- **Rich Text Editor**: TipTap
- **Charts**: Chart.js, React-ChartJS-2
- **UI Components**: Radix UI, Lucide Icons
- **Drag & Drop**: dnd-kit
- **Notifications**: React Toastify

### Backend

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **ORM**: Prisma (PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Joi, Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Compression**: Compression middleware
- **Logging**: Morgan
- **Password Hashing**: Bcrypt

### Database

- **Primary Database**: PostgreSQL
- **ORM**: Prisma
- **File Storage**: Local file system (uploads directory)

### Development Tools

- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint, TypeScript
- **API Testing**: Thunder Client / Postman

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Admin      │  │   Teacher    │  │   Student    │  │
│  │   Portal     │  │   Portal     │  │   Portal     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (Port 3000)                │
│  • Server-Side Rendering (SSR)                          │
│  • API Routes & Middleware                               │
│  • State Management (Redux/TanStack Query)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            Express.js Backend API (Port 5000)            │
│  • REST API Endpoints                                    │
│  • JWT Authentication                                    │
│  • Role-Based Authorization                              │
│  • File Upload Management                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Prisma ORM & PostgreSQL                     │
│  • Database Schema Management                            │
│  • Type-Safe Database Queries                            │
│  • Migration System                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anandkanishkZ/lms.git
   cd lms
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Backend Environment**
   Create a `.env` file in the `backend` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/lms_db"

   # Server
   PORT=5000
   NODE_ENV=development

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Setup Database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed database (optional)
   npm run seed
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

6. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

7. **Configure Frontend Environment**
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

8. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

### Default Credentials (After Seeding)

**Admin:**
- Email: admin@lms.com
- Password: admin123

**Teacher:**
- Email: teacher@lms.com
- Password: teacher123

**Student:**
- Email: student@lms.com
- Password: student123

---

## 📁 Project Structure

```
lms/
├── backend/                    # Backend API (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts           # Database seeding script
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Request handlers
│   │   ├── middlewares/      # Express middlewares
│   │   ├── models/           # Data models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   └── server.ts         # Entry point
│   ├── uploads/              # File uploads
│   │   ├── avatars/         # User avatars
│   │   ├── resources/       # Learning resources
│   │   └── exam-answers/    # Student exam submissions
│   └── package.json
│
├── frontend/                  # Frontend (Next.js + React)
│   ├── app/                  # Next.js App Router
│   │   ├── admin/           # Admin portal
│   │   ├── teacher/         # Teacher portal
│   │   ├── student/         # Student portal
│   │   ├── modules/         # Public module pages
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── features/        # Feature-specific code
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Library code
│   ├── store/               # Redux store
│   ├── public/              # Static assets
│   └── package.json
│
└── README.md                 # This file
```

---

## 👥 User Roles

### 1. Admin
- Full system access
- User and content management
- Module approval workflow
- System analytics
- Graduation management

### 2. Teacher
- Module creation and management
- Content upload (resources, lessons)
- Exam creation and grading
- Student progress monitoring
- Live class scheduling
- Notification management

### 3. Student
- Course enrollment and learning
- Lesson access (videos, PDFs, links)
- Exam participation
- Progress tracking
- Live class attendance
- Resource downloads

---

## 📚 Key Modules

### 1. Module System
- **Modules/Subjects**: Container for course content
- **Topics**: Organized sections within modules
- **Lessons**: Individual learning units (video, text, PDF, YouTube Live, etc.)
- **Resources**: Supplementary materials
- **Enrollments**: Student course registrations
- **Progress Tracking**: Lesson completion monitoring

### 2. Exam System
- **Exam Types**: Midterm, Final, Quiz, Assignment, Project
- **Question Types**: Multiple Choice, File Upload, Short Answer, Long Answer
- **Exam Status**: Upcoming, Active, Completed, Cancelled
- **Grading**: Automated and manual grading
- **Result Generation**: Detailed result reports

### 3. Live Class System
- **YouTube Live Integration**: Real-time streaming
- **Scheduling**: Date and time management
- **Status Tracking**: Scheduled, Live, Completed, Cancelled
- **Student Notifications**: Automatic reminders

### 4. Notice/Notification System
- **Notice Board**: System-wide announcements
- **Categories**: Exam, Event, Holiday, General
- **Targeted Notifications**: Role-based notifications
- **Teacher Restrictions**: Module-specific notices

### 5. Batch & Class Management
- **Batch System**: Academic year grouping
- **Class Management**: Grade/standard organization
- **Graduation**: Batch completion with archiving
- **Section Management**: Class division

### 6. Resource Management
- **File Types**: PDF, Document, Video, Audio, Image, Code, etc.
- **Categories**: Lecture Notes, Assignments, Reference Materials, etc.
- **Access Control**: Published, Hidden, Archived
- **Download Tracking**: Usage analytics

### 7. User Management
- **Profile Management**: Avatar, bio, contact info
- **Authentication**: Secure JWT-based auth
- **Authorization**: Role-based access control
- **Password Management**: Secure hashing

---

## 🔌 API Documentation

### 📖 Interactive API Documentation (Swagger UI)

We provide **production-ready, interactive API documentation** using **Swagger UI** integrated directly into the backend server.

**🌐 Access Documentation**:
- **Development**: http://localhost:5000/api/docs
- **JSON Spec**: http://localhost:5000/api/docs.json

**✨ Features**:
- 60+ documented endpoints with Try-it-out functionality
- Real-time API testing directly from browser
- JWT authentication support
- Request/response examples
- Schema definitions
- Search and filter capabilities

**🚀 Quick Start**:
1. Start backend server: `cd backend && npm run dev`
2. Open browser: http://localhost:5000/api/docs
3. Login via `/auth/login` to get JWT token
4. Click "Authorize" and enter: `Bearer <your-token>`
5. Test any endpoint with "Try it out" button

📄 **Complete Guide**: See `backend/API_DOCUMENTATION_GUIDE.md` for detailed instructions.

### Base URL
```
http://localhost:5000/api/v1
```

### Quick Reference - Authentication Endpoints

```
POST   /auth/register            # Register new user
POST   /auth/login               # Login user
POST   /auth/logout              # Logout user
GET    /auth/me                  # Get current user
PUT    /auth/profile             # Update profile
POST   /auth/change-password     # Change password
POST   /auth/upload-avatar       # Upload avatar
GET    /auth/avatars/:filename   # Get avatar
```

### Module Endpoints

```
GET    /modules                  # Get all modules
GET    /modules/:id              # Get module by ID
GET    /modules/slug/:slug       # Get module by slug
POST   /modules                  # Create module (Teacher)
PUT    /modules/:id              # Update module (Teacher)
DELETE /modules/:id              # Delete module (Teacher)
POST   /modules/:id/submit       # Submit for approval
POST   /modules/:id/approve      # Approve module (Admin)
POST   /modules/:id/reject       # Reject module (Admin)
POST   /modules/:id/publish      # Publish module (Admin)
```

### Topic & Lesson Endpoints

```
GET    /topics                      # Get all topics
POST   /topics                      # Create topic
GET    /topics/:id                  # Get topic by ID
PUT    /topics/:id                  # Update topic
DELETE /topics/:id                  # Delete topic
GET    /topics/modules/:moduleId    # Get topics by module

POST   /lessons                     # Create lesson
GET    /lessons/:id                 # Get lesson by ID
PUT    /lessons/:id                 # Update lesson
DELETE /lessons/:id                 # Delete lesson
GET    /lessons/topics/:topicId     # Get lessons by topic
```

### Exam Endpoints

```
GET    /exams                    # Get all exams
GET    /exams/:id                # Get exam by ID
POST   /exams                    # Create exam (Teacher)
PUT    /exams/:id                # Update exam (Teacher)
DELETE /exams/:id                # Delete exam (Teacher)
POST   /exams/:id/submit         # Submit exam (Student)
GET    /exams/:id/result         # Get exam result
POST   /exams/:id/grade          # Grade exam (Teacher)
```

### Enrollment & Progress Endpoints

```
GET    /enrollments              # Get all enrollments
POST   /enrollments              # Enroll in module
GET    /enrollments/my           # Get my enrollments
DELETE /enrollments/:id          # Unenroll from module

GET    /progress/modules/:id     # Get module progress
POST   /progress/lessons/:id     # Mark lesson complete
```

### Resource Endpoints

```
GET    /resources                # Get all resources
GET    /resources/modules/:moduleId  # Get module resources
POST   /resources                # Upload resource (Teacher)
DELETE /resources/:id            # Delete resource (Teacher)
GET    /resources/:id/download   # Download resource
```

### Live Class Endpoints

```
GET    /live-classes             # Get all live classes
POST   /live-classes             # Create live class
GET    /live-classes/:id         # Get live class details
PUT    /live-classes/:id         # Update live class
DELETE /live-classes/:id         # Delete live class
```

### Notice Endpoints

```
GET    /notices                  # Get all notices
GET    /notices/:id              # Get notice by ID
POST   /notices                  # Create notice
PUT    /notices/:id              # Update notice
DELETE /notices/:id              # Delete notice
```

### Admin Endpoints

```
GET    /admin/users              # Get all users
POST   /admin/users              # Create user
PUT    /admin/users/:id          # Update user
DELETE /admin/users/:id          # Delete user

GET    /admin/batches            # Get all batches
POST   /admin/batches            # Create batch
PUT    /admin/batches/:id        # Update batch
POST   /admin/batches/:id/graduate  # Graduate batch

GET    /admin/analytics          # Get system analytics
GET    /admin/classes            # Get all classes
POST   /admin/classes            # Create class
GET    /admin/subjects           # Get all subjects
POST   /admin/subjects           # Create subject
```

### Notification Endpoints

```
GET    /notifications            # Get user notifications
POST   /notifications            # Create notification (Admin/Teacher)
PUT    /notifications/:id/read   # Mark as read
DELETE /notifications/:id        # Delete notification
```

---

## 🧪 Testing APIs

### Using Swagger UI (Recommended)

1. **Start Backend**: `cd backend && npm run dev`
2. **Open Swagger UI**: http://localhost:5000/api/docs
3. **Authenticate**:
   - Click on `POST /auth/login`
   - Click "Try it out"
   - Enter credentials and execute
   - Copy the token from response
   - Click "Authorize" (🔓 button top-right)
   - Enter: `Bearer <your-token>`
   - Click "Authorize" then "Close"
4. **Test Endpoints**:
   - Browse through categories
   - Click any endpoint
   - Click "Try it out"
   - Fill parameters/body
   - Click "Execute"
   - View response

### Using Postman/Thunder Client

1. Import the OpenAPI spec from: http://localhost:5000/api/docs.json
2. Or manually test endpoints with base URL: `http://localhost:5000/api/v1`

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@lms.com","password":"student123"}'

# Get modules (with token)
curl -X GET http://localhost:5000/api/v1/modules \
  -H "Authorization: Bearer <your-token>"
```

For complete API documentation with examples and testing, visit: **http://localhost:5000/api/docs**

---

## 💻 Development

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Database Operations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Seed database
npm run seed
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

---

## 🌐 Deployment

### Backend Deployment (Example: Railway/Heroku)

1. Set environment variables in your hosting platform
2. Build the application: `npm run build`
3. Start: `npm start`
4. Ensure database is migrated: `npx prisma migrate deploy`

### Frontend Deployment (Example: Vercel)

1. Connect your GitHub repository
2. Set environment variables (`NEXT_PUBLIC_API_URL`)
3. Deploy with automatic builds

### Database Hosting

- **Recommended**: Railway, Supabase, or Neon (PostgreSQL)
- Ensure connection pooling is enabled for production

---

## 📊 Current Status

### ✅ Completed Features

- User authentication and authorization
- Admin dashboard with analytics
- Teacher portal (module creation, exam management)
- Student portal (course enrollment, exam taking)
- Module system with topics and lessons
- Exam system with multiple question types
- Live class integration (YouTube)
- Notice and notification system
- Resource management
- Progress tracking
- Batch and class management
- Profile management with avatars
- Graduation system

### 🚧 Under Development

- Advanced analytics dashboard
- Mobile application
- Video conferencing integration
- Certificate generation
- Payment integration
- Discussion forums
- Assignment submission improvements
- Real-time chat system

### 🔮 Planned Features

- AI-powered recommendations
- Gamification system
- Parent portal
- Library management
- Transport management
- Fee management
- Attendance system (biometric integration)
- SMS/Email notifications

---

## ⚠️ Important Notes

### Development Status
This system is currently **under active development**. Some features may not be fully functional, and you may encounter bugs or errors. We are continuously working to improve the platform and add new features.

यो प्रणाली हाल सक्रिय विकासमा छ। केही सुविधाहरू पूर्ण रूपमा काम नगर्न सक्छन्, र तपाईंले बगहरू वा त्रुटिहरू अनुभव गर्न सक्नुहुन्छ।

### Security Considerations

- Change default JWT secret in production
- Use strong passwords for admin accounts
- Enable HTTPS in production
- Configure CORS properly
- Set up rate limiting
- Regular database backups
- Keep dependencies updated

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new features
- Follow the existing code style

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Development Team

**Smart School Team**
- Project Type: Educational LMS Platform
- Repository: [github.com/anandkanishkZ/lms](https://github.com/anandkanishkZ/lms)

---

## 📧 Support

For support, email support@smartschool.com or create an issue in the GitHub repository.

---

## 🙏 Acknowledgments

- Next.js Team for the amazing framework
- Prisma Team for the excellent ORM
- All open-source contributors
- Educational institutions providing feedback

---

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Teacher Portal
![Teacher Portal](screenshots/teacher-portal.png)

### Student Dashboard
![Student Dashboard](screenshots/student-dashboard.png)

### Module Details
![Module Details](screenshots/module-details.png)

### Exam Interface
![Exam Interface](screenshots/exam-interface.png)

---

**Made with ❤️ for Education**

---

## 🔄 Version History

### Version 1.0.0 (Current)
- Initial release
- Core LMS functionality
- Multi-role system
- Module and exam management
- Basic analytics

---

## 📌 Quick Links

- [GitHub Repository](https://github.com/anandkanishkZ/lms)
- [API Documentation](docs/API.md)
- [User Guide](docs/USER_GUIDE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

**Last Updated**: December 6, 2025
