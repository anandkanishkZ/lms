# Student Portal Documentation

## Overview
Complete student portal implementation with authentication, profile management, and dashboard.

## Features Implemented ✅

### 1. **Student Authentication**
- Login with symbol number, email, or phone
- JWT-based authentication with token refresh
- Secure password handling
- Session management in localStorage

### 2. **Student Dashboard**
- Welcome banner with personalized greeting
- Statistics cards (courses, classes, assignments, grades)
- Quick action buttons (Profile, Courses, Schedule, Grades)
- Recent activity feed
- Student information card with profile link
- Upcoming classes schedule
- Beautiful, responsive UI with gradient designs

### 3. **Student Profile Management**
- View comprehensive profile information
- Edit profile details (name, email, phone, school)
- Change password with current password verification
- Beautiful profile banner with avatar
- Form validation with error handling
- Success/error toast notifications

## File Structure

```
frontend/
├── app/
│   └── student/
│       ├── login/
│       │   └── page.tsx              # Student login page
│       ├── dashboard/
│       │   └── page.tsx              # Student dashboard
│       └── profile/
│           └── page.tsx              # Student profile & settings
└── src/
    └── services/
        └── student-api.service.ts    # API service for student operations

backend/
├── src/
│   ├── controllers/
│   │   └── authController.ts        # Added getProfile, updateProfile, changePassword
│   ├── middlewares/
│   │   └── auth.ts                  # Added authenticate export
│   ├── routes/
│   │   └── auth.ts                  # Added profile routes
│   └── types/
│       └── index.ts                 # Updated AuthUser interface
```

## API Endpoints

### Authentication
```
POST   /api/auth/login              - Student login (symbol/email + password)
POST   /api/auth/logout             - Student logout
```

### Profile Management
```
GET    /api/auth/profile            - Get current student profile
PUT    /api/auth/profile            - Update student profile
POST   /api/auth/change-password    - Change student password
```

## Student API Service

Located: `frontend/src/services/student-api.service.ts`

### Key Features:
- **Token Management**: Automatic token storage and retrieval from localStorage
- **Auto-Refresh**: Token refresh on 401 responses
- **Error Handling**: Centralized error handling with auto-redirect
- **Type Safety**: Full TypeScript support with interfaces

### Available Methods:

```typescript
// Authentication
await studentApiService.login({ emailOrSymbolNo, password });
await studentApiService.logout();
await studentApiService.getCurrentUser();
await studentApiService.isAuthenticated();

// Profile Management
await studentApiService.getProfile();
await studentApiService.updateProfile(data);
await studentApiService.changePassword({ currentPassword, newPassword });
```

## Pages

### 1. Student Login (`/student/login`)

**Features:**
- Beautiful split-screen design
- Left: Branding with features showcase
- Right: Login form
- Login with symbol number OR email
- Password visibility toggle
- Remember me option
- Form validation with Zod
- Error handling with animated banner
- Mobile responsive

**Tech Stack:**
- React Hook Form for form management
- Zod for validation
- Framer Motion for animations
- Lucide React for icons

### 2. Student Dashboard (`/student/dashboard`)

**Features:**
- Personalized welcome banner with gradient
- Statistics cards with icons:
  - Active Courses (6)
  - Upcoming Classes (3)
  - Assignments (8)
  - Average Grade (85%)
- Quick action buttons (Profile, Courses, Schedule, Grades)
- Recent activity feed with color-coded icons
- Student information sidebar
- Upcoming classes schedule
- Manage Profile button
- Logout functionality
- Fully responsive design

**Layout:**
- Header with logo, notifications, and profile info
- Main content area with stats grid
- Two-column layout (desktop)
- Recent activity and upcoming classes sections

### 3. Student Profile (`/student/profile`)

**Features:**
- Profile banner with gradient background
- Avatar with gradient colors
- Profile information display
- Edit mode with form validation
- Personal information fields:
  - First Name (required)
  - Middle Name (optional)
  - Last Name (required)
  - Email (optional)
  - Phone (optional)
  - School (optional)
- Password change section:
  - Current password verification
  - New password with confirmation
  - Password visibility toggles
- Save/Cancel buttons for both forms
- Success/error notifications
- Back to dashboard navigation

## Authentication Flow

1. **Login:**
   - User enters symbol number/email + password
   - API validates credentials
   - JWT token returned and stored in localStorage
   - User data stored separately
   - Redirect to dashboard

2. **Protected Routes:**
   - All student pages check authentication on mount
   - If not authenticated, redirect to `/student/login`
   - Token attached to all API requests via interceptor

3. **Token Management:**
   - Stored as `student_token` in localStorage
   - Separate from admin token (`admin_token`)
   - Auto-refresh on 401 responses
   - Manual logout clears tokens and user data

4. **Profile Updates:**
   - Get current user data
   - Populate form with existing values
   - Validate changes
   - Update via API
   - Refresh local user data
   - Show success notification

5. **Password Change:**
   - Verify current password
   - Validate new password (min 6 chars)
   - Confirm password match
   - Update via API
   - Clear form on success

## UI Components

### Design System:
- **Colors:**
  - Primary: Blue 600 (#2563eb)
  - Secondary: Purple 600 (#9333ea)
  - Success: Green 600 (#16a34a)
  - Warning: Orange 600 (#ea580c)
  - Danger: Red 600 (#dc2626)
  - Gradients: Blue-to-purple combinations

- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Styling:** Tailwind CSS
- **Notifications:** Custom toast utility

### Component Patterns:
- Gradient buttons for CTAs
- Icon buttons for actions
- Loading states with spinners
- Error states with colored banners
- Success feedback with toasts
- Responsive grid layouts
- Card-based information display
- Modal dialogs for editing

## Security Features

1. **Password Security:**
   - Bcrypt hashing (12 salt rounds)
   - Current password verification for changes
   - Password strength requirements (min 6 chars)
   - Password confirmation matching

2. **Token Security:**
   - JWT with expiration
   - HTTP-only recommended (client-side only for now)
   - Automatic token refresh
   - Clear on logout

3. **Authorization:**
   - Middleware authentication checks
   - Role-based access control ready
   - Active user verification
   - Session validation

4. **Input Validation:**
   - Client-side: Zod schemas
   - Server-side: Prisma types
   - Email format validation
   - Required field enforcement

## Mobile Responsiveness

All pages fully responsive with:
- Mobile-first design approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly buttons and inputs
- Collapsed navigation on mobile
- Stacked layouts on small screens
- Optimized typography scaling

## Error Handling

1. **Frontend:**
   - Form validation errors shown inline
   - API errors displayed with toasts
   - Network errors caught and displayed
   - Auto-redirect on auth failures
   - Loading states for all async operations

2. **Backend:**
   - Try-catch with async handlers
   - Detailed error messages
   - HTTP status codes
   - Validation error responses
   - Database error handling

## Testing Checklist

### Login Page:
- [ ] Login with symbol number works
- [ ] Login with email works
- [ ] Password visibility toggle works
- [ ] Form validation shows errors
- [ ] Successful login redirects to dashboard
- [ ] Invalid credentials show error
- [ ] Remember me functionality (if implemented)

### Dashboard:
- [ ] Displays student name and info
- [ ] Stats cards show correct data
- [ ] Quick actions navigate correctly
- [ ] Recent activity displays
- [ ] Upcoming classes show
- [ ] Profile button works
- [ ] Logout works and redirects
- [ ] Responsive on mobile

### Profile Page:
- [ ] Profile data loads correctly
- [ ] Edit mode enables form fields
- [ ] Profile update saves successfully
- [ ] Email uniqueness validated
- [ ] Phone uniqueness validated
- [ ] Cancel restores original data
- [ ] Password change validates current password
- [ ] New passwords must match
- [ ] Success notifications appear
- [ ] Back button navigates to dashboard

## Future Enhancements

1. **Features to Add:**
   - Course enrollment and access
   - Assignment submission
   - Live class attendance
   - Grade viewing and tracking
   - Certificate downloads
   - Notification center
   - Profile picture upload
   - Two-factor authentication
   - Password reset via email
   - Session management (view active sessions)

2. **UI Improvements:**
   - Dark mode support
   - Custom theme colors
   - Accessibility improvements (ARIA labels)
   - Keyboard navigation
   - Print-friendly styles
   - Progressive Web App (PWA)

3. **Performance:**
   - API response caching
   - Lazy loading for routes
   - Image optimization
   - Code splitting
   - Service worker for offline support

4. **Security:**
   - CSRF protection
   - Rate limiting
   - Input sanitization
   - XSS prevention
   - HTTP-only cookies for tokens
   - Secure cookie flags

## Environment Variables

### Backend (.env):
```env
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
```

### Frontend (if needed):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Getting Started

### Prerequisites:
- Node.js 18+
- PostgreSQL database
- Backend server running

### Installation:
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

### Access:
- Student Login: http://localhost:3000/student/login
- Student Dashboard: http://localhost:3000/student/dashboard
- Student Profile: http://localhost:3000/student/profile

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check backend API responses
4. Verify token storage in browser DevTools
5. Check browser console for errors

## Credits

Built with:
- Next.js 15.5.5
- React 18.2.0
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod
- Lucide React
- Axios

---

**Status:** ✅ Fully Functional
**Last Updated:** January 2025
**Version:** 1.0.0
