# Student Portal - Visual Flow Guide

## 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STUDENT PORTAL FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   1. LOGIN PAGE      │
│  /student/login      │
└──────────────────────┘
         │
         │ Enter symbol number/email + password
         │ Click "Sign In"
         ▼
┌──────────────────────┐
│   Authentication     │
│   POST /api/auth/    │
│        login         │
└──────────────────────┘
         │
         │ JWT Token Generated
         │ Stored in localStorage
         ▼
┌──────────────────────┐
│  2. DASHBOARD PAGE   │
│ /student/dashboard   │
└──────────────────────┘
         │
         ├─────────────────────────┬─────────────────────┐
         │                         │                     │
         ▼                         ▼                     ▼
┌──────────────────┐    ┌──────────────────┐   ┌──────────────┐
│ View Stats       │    │ Quick Actions    │   │ View Activity│
│ - Courses: 6     │    │ - Profile        │   │ - New course │
│ - Classes: 3     │    │ - Courses        │   │ - Live class │
│ - Assignments: 8 │    │ - Schedule       │   │ - Grade      │
│ - Grade: 85%     │    │ - Grades         │   │   updated    │
└──────────────────┘    └──────────────────┘   └──────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │ Click "Manage Profile" or   │
                 │ "Profile" quick action      │
                 ▼
        ┌──────────────────────┐
        │  3. PROFILE PAGE     │
        │  /student/profile    │
        └──────────────────────┘
                 │
                 ├─────────────────────┬──────────────────────┐
                 │                     │                      │
                 ▼                     ▼                      ▼
    ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
    │ View Profile     │   │ Edit Profile     │   │ Change Password  │
    │ - Name           │   │ Click "Edit"     │   │ Click "Change    │
    │ - Symbol No      │   │ Modify fields    │   │  Password"       │
    │ - Email          │   │ Click "Save"     │   │ Enter passwords  │
    │ - Phone          │   │                  │   │ Click "Change"   │
    │ - School         │   │ PUT /api/auth/   │   │                  │
    │                  │   │     profile      │   │ POST /api/auth/  │
    │                  │   │                  │   │  change-password │
    └──────────────────┘   └──────────────────┘   └──────────────────┘
                                     │                      │
                                     │ Success!             │ Success!
                                     ▼                      ▼
                            ┌──────────────────────────────────┐
                            │  Toast Notification              │
                            │  ✅ Profile updated successfully! │
                            │  ✅ Password changed successfully!│
                            └──────────────────────────────────┘
```

---

## 🎯 Page-by-Page Breakdown

### 1️⃣ LOGIN PAGE (`/student/login`)

```
┌────────────────────────────────────────────────────────────────┐
│                        STUDENT LOGIN                            │
├────────────────────────┬───────────────────────────────────────┤
│                        │                                        │
│  FREE EDUCATION        │          Welcome Back! 👋              │
│   IN NEPAL             │                                        │
│                        │     Sign in to your account            │
│  🎓 Access Courses     │                                        │
│  📹 Live Classes       │  ┌──────────────────────────────────┐ │
│  📊 Track Progress     │  │ Symbol Number or Email           │ │
│                        │  └──────────────────────────────────┘ │
│                        │                                        │
│                        │  ┌──────────────────────────────────┐ │
│                        │  │ Password                    👁️   │ │
│                        │  └──────────────────────────────────┘ │
│                        │                                        │
│                        │  ☐ Remember me                         │
│                        │                                        │
│                        │  ┌──────────────────────────────────┐ │
│                        │  │         Sign In                  │ │
│                        │  └──────────────────────────────────┘ │
│                        │                                        │
└────────────────────────┴───────────────────────────────────────┘

Key Features:
✅ Login with symbol number OR email
✅ Password visibility toggle
✅ Beautiful split-screen design
✅ Mobile responsive
✅ Form validation with error messages
```

---

### 2️⃣ DASHBOARD PAGE (`/student/dashboard`)

```
┌────────────────────────────────────────────────────────────────┐
│  🎓 Student Portal    Free Education In Nepal    🔔 [Profile] │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Welcome back, Ramesh! 👋          Today: Jan 14, 2025   │  │
│  │ Ready to continue your learning journey?                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │
│  │  📚       │ │  🎥       │ │  📝       │ │  📈       │    │
│  │  6        │ │  3        │ │  8        │ │  85%      │    │
│  │ Courses   │ │ Classes   │ │Assignments│ │Avg. Grade │    │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘    │
│                                                                 │
│  ┌─────────────────────────────────┐ ┌─────────────────────┐ │
│  │  Quick Actions                  │ │  Student Info       │ │
│  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐          │ │  Name: Ramesh       │ │
│  │  │👤│ │📚│ │📅│ │🏆│          │ │  Symbol: 2024001    │ │
│  │  └──┘ └──┘ └──┘ └──┘          │ │  School: ABC School │ │
│  │                                 │ │                     │ │
│  │  Recent Activity                │ │  ┌───────────────┐ │ │
│  │  📚 New course material         │ │  │Manage Profile │ │ │
│  │  🎥 Live class scheduled        │ │  └───────────────┘ │ │
│  │  🏆 Grade updated               │ │  ┌───────────────┐ │ │
│  │                                 │ │  │   Logout      │ │ │
│  └─────────────────────────────────┘ │  └───────────────┘ │ │
│                                       │                     │ │
│                                       │  Upcoming Classes   │ │
│                                       │  • Math - 2:00 PM   │ │
│                                       │  • Physics - 10 AM  │ │
│                                       └─────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

Key Features:
✅ Personalized welcome banner
✅ Statistics cards with icons
✅ Quick action buttons
✅ Recent activity feed
✅ Student info sidebar
✅ Upcoming schedule
✅ Logout functionality
```

---

### 3️⃣ PROFILE PAGE (`/student/profile`)

```
┌────────────────────────────────────────────────────────────────┐
│  ← 🎓 My Profile - Manage your personal information            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │             [Gradient Banner]                           │  │
│  │                                                         │  │
│  │  ┌─────┐                                                │  │
│  │  │ 👤  │  Ramesh Sharma                    ┌──────────┐│  │
│  │  └─────┘  Symbol No: 2024001               │Edit      ││  │
│  │                                             │Profile   ││  │
│  │                                             └──────────┘│  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Personal Information                                   │  │
│  │                                                         │  │
│  │  First Name *         Middle Name                      │  │
│  │  ┌─────────────┐      ┌─────────────┐                 │  │
│  │  │ Ramesh      │      │             │                 │  │
│  │  └─────────────┘      └─────────────┘                 │  │
│  │                                                         │  │
│  │  Last Name *          Email                            │  │
│  │  ┌─────────────┐      ┌─────────────────────────────┐ │  │
│  │  │ Sharma      │      │ ramesh@example.com          │ │  │
│  │  └─────────────┘      └─────────────────────────────┘ │  │
│  │                                                         │  │
│  │  Phone                School                           │  │
│  │  ┌─────────────┐      ┌─────────────────────────────┐ │  │
│  │  │ 9801234567  │      │ ABC School                  │ │  │
│  │  └─────────────┘      └─────────────────────────────┘ │  │
│  │                                                         │  │
│  │  ┌──────────────┐  ┌──────────┐                       │  │
│  │  │ Save Changes │  │  Cancel  │                       │  │
│  │  └──────────────┘  └──────────┘                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Security                         ┌──────────────────┐  │  │
│  │                                   │ Change Password  │  │  │
│  │                                   └──────────────────┘  │  │
│  │  Keep your account secure...                          │  │
│  │                                                         │  │
│  │  [When "Change Password" clicked:]                     │  │
│  │                                                         │  │
│  │  Current Password *                                     │  │
│  │  ┌─────────────────────────────────┐                   │  │
│  │  │                            👁️   │                   │  │
│  │  └─────────────────────────────────┘                   │  │
│  │                                                         │  │
│  │  New Password *                                         │  │
│  │  ┌─────────────────────────────────┐                   │  │
│  │  │                            👁️   │                   │  │
│  │  └─────────────────────────────────┘                   │  │
│  │                                                         │  │
│  │  Confirm New Password *                                 │  │
│  │  ┌─────────────────────────────────┐                   │  │
│  │  │                            👁️   │                   │  │
│  │  └─────────────────────────────────┘                   │  │
│  │                                                         │  │
│  │  ┌─────────────────┐  ┌──────────┐                     │  │
│  │  │ Change Password │  │  Cancel  │                     │  │
│  │  └─────────────────┘  └──────────┘                     │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

Key Features:
✅ Beautiful profile banner with avatar
✅ View all profile information
✅ Edit mode with form validation
✅ Password change with verification
✅ Password visibility toggles
✅ Save/Cancel buttons
✅ Success notifications
```

---

## 🔐 Authentication Flow Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  User    │──────▶│ Frontend │──────▶│ Backend  │
│          │       │          │       │          │
└──────────┘       └──────────┘       └──────────┘
     │                  │                   │
     │ 1. Enter creds   │                   │
     │─────────────────▶│                   │
     │                  │ 2. POST /login    │
     │                  │──────────────────▶│
     │                  │                   │ 3. Validate
     │                  │                   │    & Hash
     │                  │                   │
     │                  │ 4. JWT Token      │
     │                  │◀──────────────────│
     │ 5. Success!      │                   │
     │◀─────────────────│                   │
     │                  │ 6. Store token    │
     │                  │    localStorage   │
     │                  │                   │
     │ 7. Redirect      │                   │
     │    /dashboard    │                   │
     │◀─────────────────│                   │
     │                  │                   │
     │                  │ 8. GET /profile   │
     │                  │    + Bearer token │
     │                  │──────────────────▶│
     │                  │                   │ 9. Verify
     │                  │                   │    token
     │                  │ 10. User data     │
     │                  │◀──────────────────│
     │ 11. Show data    │                   │
     │◀─────────────────│                   │
```

---

## 🎨 Color Palette

```
Primary Colors:
├─ Blue 600:   #2563eb  ████████
├─ Purple 600: #9333ea  ████████
└─ Gradients:  Blue → Purple

Secondary Colors:
├─ Green 600:  #16a34a  ████████ (Success)
├─ Orange 600: #ea580c  ████████ (Warning)
└─ Red 600:    #dc2626  ████████ (Danger)

Neutral Colors:
├─ Gray 50:    #f9fafb  ████████ (Background)
├─ Gray 100:   #f3f4f6  ████████ (Light)
├─ Gray 600:   #4b5563  ████████ (Text)
└─ Gray 900:   #111827  ████████ (Heading)
```

---

## 📊 Data Flow

```
Frontend Component ─────▶ API Service ─────▶ Backend API
      │                       │                    │
      │ User Action          │ Axios Request      │ Express
      │ (Click button)       │ + JWT Token        │ Controller
      │                       │                    │
      ▼                       ▼                    ▼
   React Hook Form      Token from           Prisma ORM
   + Zod Validation     localStorage              │
      │                       │                    │
      │                       │                    ▼
      │                       │              PostgreSQL
      │                       │              Database
      │                       │                    │
      │                       │                    │
      │                       │ Response Data      │
      │                       │◀───────────────────│
      │ Update UI            │                    
      │◀─────────────────────│                    
      │                                            
      ▼                                            
   Display with                                    
   Toast/Success                                   
```

---

## 🎯 Key Interactions

### Login Flow:
```
1. User opens /student/login
2. Enter symbol number/email + password
3. Click "Sign In"
4. API validates credentials
5. JWT token generated & returned
6. Token stored in localStorage
7. Redirect to /student/dashboard
```

### Profile Update Flow:
```
1. User opens /student/profile
2. Click "Edit Profile"
3. Modify fields (email, phone, etc.)
4. Click "Save Changes"
5. API validates & checks uniqueness
6. Database updated
7. Success toast shown
8. Form exits edit mode
```

### Password Change Flow:
```
1. Click "Change Password"
2. Enter current password
3. Enter new password (min 6 chars)
4. Confirm new password (must match)
5. Click "Change Password"
6. API verifies current password
7. Hash new password & update DB
8. Success toast shown
9. Form clears & exits change mode
```

---

## 🚀 Getting Started

### 1. Start Backend:
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 2. Start Frontend:
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### 3. Access Portal:
```
Login: http://localhost:3000/student/login
```

---

**Built with ❤️ by the LMS Development Team**
**For: Free Education In Nepal**
