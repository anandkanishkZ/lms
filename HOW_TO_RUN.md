# 🚀 How to Run the LMS Project

Complete step-by-step guide to get the Smart School LMS running on your local machine.

---

## 📋 Prerequisites

Before starting, ensure you have these installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (for version control) - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Verify Installation

```powershell
# Check Node.js version
node --version  # Should show v18+

# Check npm version
npm --version   # Should show v8+

# Check PostgreSQL
psql --version  # Should show v14+
```

---

## 🗂️ Project Structure

```
lms/
├── backend/          # Express.js API (Port 5000)
│   ├── src/
│   ├── prisma/
│   ├── uploads/
│   └── package.json
├── frontend/         # Next.js 15 App (Port 3000)
│   ├── app/
│   ├── src/
│   └── package.json
└── README.md
```

---

## 📦 Step 1: Clone & Navigate

```powershell
# Navigate to your project (already cloned)
cd "d:\Natraj Technology\Website Client\Pankaj Sharma\lms"
```

---

## 🗄️ Step 2: Setup Database

### 2.1 Start PostgreSQL

```powershell
# Windows: Start PostgreSQL service
# Search "Services" → Find "postgresql-x64-XX" → Start

# Or using command line:
net start postgresql-x64-14
```

### 2.2 Create Database

```powershell
# Open PostgreSQL command line
psql -U postgres

# Inside psql:
CREATE DATABASE smart_school_db;

# Grant permissions (optional)
GRANT ALL PRIVILEGES ON DATABASE smart_school_db TO postgres;

# Exit psql
\q
```

### 2.3 Verify Database

```powershell
# List databases
psql -U postgres -l

# Should see "smart_school_db" in the list
```

---

## 🔧 Step 3: Backend Setup

### 3.1 Navigate to Backend

```powershell
cd backend
```

### 3.2 Install Dependencies

```powershell
# Install all backend packages
npm install

# This installs:
# - Express.js, Prisma, JWT, Bcrypt
# - Nodemailer, Multer, etc.
```

### 3.3 Configure Environment Variables

```powershell
# Copy example env file
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

**Update these critical values in `.env`:**

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smart_school_db"

# JWT (REQUIRED)
JWT_SECRET="change-this-to-a-random-secure-string"
JWT_EXPIRES_IN="7d"

# Email (REQUIRED for notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"  # Get from Google Account settings
EMAIL_FROM="Smart School <noreply@smartschool.com>"

# Backend (DEFAULT - OK to keep)
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# File Upload (DEFAULT - OK to keep)
UPLOAD_DIR="uploads"
MAX_FILE_SIZE="10MB"

# CORS (DEFAULT - OK to keep)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Optional (can leave empty for now)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
YOUTUBE_API_KEY=""
FIREBASE_PROJECT_ID=""
```

**To get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate password for "Mail"
5. Copy 16-character password to `EMAIL_PASS`

### 3.4 Setup Prisma Database

```powershell
# Generate Prisma Client
npm run prisma:generate

# Check migration status (all migrations should already be applied)
npx prisma migrate status

# If migrations are up to date, you're good! ✅
# If not, apply migrations:
npx prisma migrate deploy

# Seed initial data (IMPORTANT - Creates admin, teacher, student accounts)
npm run seed
```

### 3.5 Verify Backend Setup

```powershell
# Check for syntax errors
npm run type-check

# Should show "No errors found"
```

### 3.6 Create Admin User

```powershell
# Run the admin creation script
npx ts-node create-admin.ts

# OR manually create admin in database:
# Email: admin@school.com
# Password: admin123 (will be hashed)
```

---

## 🎨 Step 4: Frontend Setup

### 4.1 Navigate to Frontend (New Terminal)

```powershell
# Open NEW PowerShell terminal
cd "d:\Natraj Technology\Website Client\Pankaj Sharma\lms\frontend"
```

### 4.2 Install Dependencies

```powershell
# Install all frontend packages
npm install

# This installs:
# - Next.js 15, React 18, TypeScript
# - Tailwind CSS, Framer Motion
# - Redux Toolkit, React Query
# - All 32 UI components we built
```

### 4.3 Configure Frontend Environment

Create `.env.local` file:

```powershell
# Create env file
notepad .env.local
```

Add this content:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Settings
NEXT_PUBLIC_APP_NAME="Smart School LMS"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics, etc.
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=""
```

### 4.4 Verify Frontend Setup

```powershell
# Type check
npm run type-check

# Should show "No errors found" ✅
```

---

## 🚀 Step 5: Run the Application

### 5.1 Start Backend (Terminal 1)

```powershell
# In backend directory
cd "d:\Natraj Technology\Website Client\Pankaj Sharma\lms\backend"

# Start development server with hot reload
npm run dev

# You should see:
# ✓ Server running on http://localhost:5000
# ✓ Database connected
# ✓ Prisma client ready
```

**Backend will be running on:** `http://localhost:5000`

### 5.2 Start Frontend (Terminal 2)

```powershell
# In frontend directory (NEW terminal)
cd "d:\Natraj Technology\Website Client\Pankaj Sharma\lms\frontend"

# Start Next.js development server
npm run dev

# You should see:
# ✓ Ready in 3.2s
# ✓ Local: http://localhost:3000
# ✓ Network: http://192.168.x.x:3000
```

**Frontend will be running on:** `http://localhost:3000`

---

## 🌐 Step 6: Access the Application

### Open in Browser

```
http://localhost:3000
```

### Default Login Credentials

#### Admin Dashboard
```
URL: http://localhost:3000/admin/login
Email: admin@school.com
Password: admin123
```

#### Student Dashboard
```
URL: http://localhost:3000/student/login
Email: student@school.com
Password: student123
```

*(Create users in admin panel after first login)*

---

## 🔍 Step 7: Verify Everything Works

### 7.1 Check Backend API

```powershell
# In new terminal, test API
curl http://localhost:5000/api/health

# Should return: {"status":"ok","database":"connected"}
```

Or open in browser: `http://localhost:5000/api/health`

### 7.2 Check Database Connection

```powershell
# Open Prisma Studio (Visual Database Editor)
cd backend
npm run prisma:studio

# Opens browser at: http://localhost:5555
# You can view/edit database records here
```

### 7.3 Test Frontend Pages

Visit these URLs:
- ✅ Homepage: `http://localhost:3000`
- ✅ Admin Login: `http://localhost:3000/admin/login`
- ✅ Student Login: `http://localhost:3000/student/login`
- ✅ Admin Dashboard: `http://localhost:3000/admin/dashboard`
- ✅ Student Dashboard: `http://localhost:3000/student/dashboard`

---

## 🛠️ Common Commands

### Backend Commands

```powershell
# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Database migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run seed

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Frontend Commands

```powershell
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

---

## 📊 Database Management

### View Database

```powershell
# Option 1: Prisma Studio (Recommended)
cd backend
npm run prisma:studio

# Option 2: PostgreSQL CLI
psql -U postgres -d smart_school_db

# Inside psql:
\dt              # List all tables
\d users         # Describe users table
SELECT * FROM users;  # Query users
\q               # Exit
```

### Reset Database

```powershell
cd backend

# Reset and migrate
npx prisma migrate reset

# Or drop and recreate
npx prisma db push --force-reset
```

### Backup Database

```powershell
# Backup to SQL file
pg_dump -U postgres smart_school_db > backup.sql

# Restore from backup
psql -U postgres smart_school_db < backup.sql
```

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Backend (Port 5000):**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

**Frontend (Port 3000):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Or run on different port
npm run dev -- -p 3001
```

### Issue: Database Connection Failed

```powershell
# Check PostgreSQL is running
net start postgresql-x64-14

# Verify credentials in backend/.env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smart_school_db"

# Test connection
psql -U postgres -d smart_school_db
```

### Issue: Prisma Client Not Generated

```powershell
cd backend
npx prisma generate
npm run prisma:push
```

### Issue: Frontend API Calls Failing

1. Check backend is running: `http://localhost:5000`
2. Verify `.env.local` has correct API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
3. Check CORS settings in `backend/.env`:
   ```
   ALLOWED_ORIGINS="http://localhost:3000"
   ```

### Issue: TypeScript Errors

```powershell
# Backend
cd backend
npm run type-check

# Frontend
cd frontend
npm run type-check

# If errors persist, delete node_modules and reinstall
rm -r node_modules
npm install
```

### Issue: Module Not Found

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -r node_modules
rm package-lock.json

# Reinstall
npm install
```

---

## 🔐 Security Setup

### Change Default Passwords

After first login, **immediately change**:

1. Admin password in admin panel
2. Database password in `.env`
3. JWT_SECRET in `.env`

### Generate Secure JWT Secret

```powershell
# Generate random 64-character string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output to JWT_SECRET in .env
```

---

## 📁 Important File Locations

### Backend
- API Routes: `backend/src/routes/`
- Controllers: `backend/src/controllers/`
- Database Schema: `backend/prisma/schema.prisma`
- Environment: `backend/.env`
- Uploads: `backend/uploads/avatars/`

### Frontend
- Pages: `frontend/app/`
- UI Components: `frontend/src/features/modules/components/ui/`
- Templates: `frontend/src/features/modules/components/templates/`
- Redux Store: `frontend/src/store/`
- API Services: `frontend/src/services/`
- Environment: `frontend/.env.local`

---

## 🧪 Testing the Application

### Test Backend API

```powershell
# Health check
curl http://localhost:5000/api/health

# Login test
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@school.com\",\"password\":\"admin123\"}"
```

### Test Frontend

1. **Login Flow**
   - Visit: `http://localhost:3000/admin/login`
   - Enter credentials
   - Should redirect to dashboard

2. **Course Browsing**
   - Visit: `http://localhost:3000/courses`
   - Should see course listing with filters

3. **Dashboard**
   - Visit: `http://localhost:3000/admin/dashboard`
   - Should see stats, charts, widgets

---

## 📦 Production Build

### Build Backend

```powershell
cd backend

# Build TypeScript
npm run build

# Output in: dist/

# Start production
npm start
```

### Build Frontend

```powershell
cd frontend

# Build Next.js
npm run build

# Output in: .next/

# Start production
npm start
```

---

## 🎯 Quick Start (Summary)

```powershell
# Terminal 1: Backend
cd "d:\Natraj Technology\Website Client\Pankaj Sharma\lms\backend"
npm install
copy .env.example .env
# Edit .env with your database credentials
npm run prisma:generate
npm run prisma:push
npm run dev

# Terminal 2: Frontend
cd "d:\Natraj Technology\Website Client\Pankaj Sharma\lms\frontend"
npm install
# Create .env.local with API URL
npm run dev

# Browser
# Open: http://localhost:3000
# Login: admin@school.com / admin123
```

---

## 📞 Support & Documentation

- **Backend API Docs**: `http://localhost:5000/api-docs` (if Swagger enabled)
- **Prisma Studio**: `http://localhost:5555` (run `npm run prisma:studio`)
- **Component Library**: See `frontend/src/features/modules/components/templates/README.md`
- **Architecture**: See `frontend/PROJECT_ARCHITECTURE_ANALYSIS.md`

---

## ✅ Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Node.js v18+ installed
- [ ] Database `smart_school_db` created
- [ ] Backend `.env` configured
- [ ] Backend dependencies installed
- [ ] Prisma client generated
- [ ] Database migrated/pushed
- [ ] Backend running on port 5000
- [ ] Frontend `.env.local` configured
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 3000
- [ ] Can access `http://localhost:3000`
- [ ] Can login with admin credentials
- [ ] API health check returns OK

---

**🎉 You're all set! Happy coding!**

For issues, check the Troubleshooting section or review error logs in the terminal.
