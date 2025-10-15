# Smart School Management System

A comprehensive, full-stack school management platform built with modern technologies. This system provides separate dashboards for Administrators, Teachers, and Students with role-based access control and real-time features.

## 🧠 Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **Zustand** for state management
- **React Hook Form** for form handling

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for backend development
- **Prisma ORM** with **PostgreSQL** database
- **JWT Authentication** with **Bcrypt** password hashing
- **Role-Based Access Control** (Admin, Teacher, Student)

### Services & Integrations
- **Nodemailer** for email notifications
- **Twilio** for SMS notifications
- **OneSignal/Firebase** for push notifications
- **PDFKit/Puppeteer** for certificate generation
- **YouTube API** for live class integration

## 🏗️ System Features

### Authentication Module
- JWT-based login/logout system
- Login via email, phone, or Symbol Number
- Password hashing with bcrypt
- Email OTP password reset
- Role-based redirection

### Live Class Module
- YouTube Live integration
- Countdown timer for upcoming classes
- Auto-attendance tracking
- Teacher-moderated chat
- SMS/Email notifications

### Study Materials Module
- Upload PDF, DOCX, PPT, Video links
- Filter by Subject → Chapter → Resource Type
- Download tracking per student
- Access logs and analytics

### Routine System
- Dynamic weekly timetable
- Color-coded subjects
- Push notifications for changes
- Google Calendar sync option

### Notice Board Module
- Categorized notices (Exam, Event, Holiday, General)
- Priority-based sorting
- File attachments support
- Desktop/Mobile alerts

### Exam Module
- Google Form integration
- Internal exam system ready
- Automatic expiration
- Submission tracking

### Result & Certificate Module
- CSV import for marks
- Auto-calculation of grades
- PDF certificate generation
- Performance analytics with charts

### Notification & Messaging
- Automatic SMS/Email triggers
- In-dashboard notification center
- Teacher ↔ Student chat
- Push notification integration

### Analytics & Reports
- Student performance graphs
- Attendance reports
- Resource engagement analytics
- System usage overview

## 📁 Project Structure

```
smart-school-management/
├── frontend/                 # Next.js 15 Frontend
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Helper functions
├── backend/                 # Express.js Backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Express middlewares
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper utilities
│   │   └── types/           # TypeScript types
│   ├── prisma/              # Database schema & migrations
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seed file
│   ├── uploads/             # File uploads
│   ├── .env                 # Environment variables
│   └── dist/                # Compiled TypeScript
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-school-management
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your database and service credentials
   
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed database with sample data
   npm run prisma:seed
   
   # Start development server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Create environment file
   cp .env.example .env.local
   # Configure your API URL and other settings
   
   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Prisma Studio: http://localhost:5555

### 🔑 Default Login Credentials
After seeding the database, you can use these default accounts:

- **Admin**: admin@smartschool.com / admin123
- **Teacher**: teacher@smartschool.com / teacher123
- **Student**: student@smartschool.com / student123

### Environment Configuration

Copy `.env.example` to `.env` in the backend directory and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smart_school_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Email (Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"

# Additional configurations...
```

## 🔧 Development Commands

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run prisma:studio # Open Prisma Studio
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Type checking
```

## 🎭 User Roles & Permissions

### Admin Dashboard
- Manage teachers and students
- Create/update/delete all content
- View system analytics
- Assign teachers to subjects/classes
- Generate reports

### Teacher Dashboard
- View assigned classes & subjects
- Upload study materials
- Create live class links
- View student performance
- Manage class communications

### Student Dashboard
- Access study materials
- Join live classes
- View exam results
- Check routine and notices
- Track academic progress

## 🔐 Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting middleware
- CORS protection
- Input validation and sanitization
- Secure file upload handling

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Dark mode support
- Touch-friendly interfaces
- Progressive Web App ready

## 🛠️ API Documentation

API endpoints are organized by modules:

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/live-classes` - Live class management
- `/api/materials` - Study materials
- `/api/routines` - Class schedules
- `/api/notices` - Notice board
- `/api/exams` - Examination system
- `/api/results` - Results and certificates
- `/api/notifications` - Notification system
- `/api/messages` - Messaging system
- `/api/analytics` - Analytics and reports

## 🔄 Database Schema

The system uses PostgreSQL with Prisma ORM. Key entities include:

- Users (Admin, Teacher, Student)
- Classes and Subjects
- Live Classes and Attendance
- Study Materials and Access Logs
- Notices and Announcements
- Exams and Results
- Notifications and Messages
- Certificates and Analytics

## 📊 Analytics & Reporting

- Real-time dashboard statistics
- Student performance tracking
- Attendance analytics
- Resource usage reports
- System health monitoring
- Custom report generation

## 🚢 Deployment

The application is containerization-ready:

1. **Production Build**
   ```bash
   # Backend
   cd backend && npm run build
   
   # Frontend
   cd frontend && npm run build
   ```

2. **Environment Setup**
   - Configure production environment variables
   - Set up PostgreSQL database
   - Configure email and SMS services

3. **Database Migration**
   ```bash
   npm run prisma:migrate
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🔮 Future Enhancements

- Mobile application (React Native)
- Offline mode support
- Advanced analytics with AI insights
- Integration with learning management systems
- Multi-language support
- Advanced certificate templates
- Integration with payment gateways
- Parent portal and communication
- Advanced scheduling with conflicts detection
- Automated backup and disaster recovery

---

**Made with ❤️ by the Smart School Team**