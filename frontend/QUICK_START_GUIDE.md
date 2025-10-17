# 🚀 Quick Start Guide - Refactored Frontend

## How to Use the New Architecture

### 1. **Importing from Feature Modules**

#### ✅ CORRECT - Import from feature module public API:
```tsx
import {
  AdminLayout,
  StatsCard,
  useAdminAuth,
  useUsers,
  adminApiService,
  type AdminUser,
} from '@/src/features/admin';
```

#### ❌ WRONG - Don't import from internal paths:
```tsx
import AdminLayout from '@/src/features/admin/components/layout/AdminLayout';
import { useAdminAuth } from '@/src/features/admin/hooks/useAdminAuth';
```

---

### 2. **Creating a New Page**

```tsx
'use client';

import { AdminLayout } from '@/src/features/admin';

export default function MyPage() {
  return (
    <AdminLayout 
      title="My Page"
      description="Page description"
    >
      <div className="p-6">
        {/* Your content */}
      </div>
    </AdminLayout>
  );
}
```

---

### 3. **Using Admin Hooks**

#### **Authentication:**
```tsx
import { useAdminAuth } from '@/src/features/admin';

function MyComponent() {
  const { login, logout, isLoading, error } = useAdminAuth();
  
  const handleLogin = async () => {
    await login({ email, password, rememberMe: true });
  };
  
  return (/* ... */);
}
```

#### **User Management:**
```tsx
import { useUsers, useCreateStudent } from '@/src/features/admin';

function UsersPage() {
  // Fetch users
  const { data: users, isLoading } = useUsers({
    page: 1,
    limit: 10,
    role: 'STUDENT',
  });
  
  // Create student mutation
  const createStudent = useCreateStudent();
  
  const handleCreate = async () => {
    await createStudent.mutateAsync({
      firstName: 'John',
      lastName: 'Doe',
      // ...
    });
  };
  
  return (/* ... */);
}
```

#### **Dashboard Stats:**
```tsx
import { useAdminStats } from '@/src/features/admin';

function Dashboard() {
  const { data: stats, isLoading } = useAdminStats();
  
  return (
    <div>
      <p>Total Students: {stats?.totalStudents}</p>
      <p>Total Teachers: {stats?.totalTeachers}</p>
    </div>
  );
}
```

---

### 4. **Using Admin Store (Zustand)**

```tsx
import { useAdminAuthStore } from '@/src/features/admin';

function MyComponent() {
  const { user, accessToken, isAuthenticated } = useAdminAuthStore();
  
  // Use auth data
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome, {user?.name}!</div>;
}
```

---

### 5. **Direct API Calls (When Needed)**

```tsx
import { adminApiService } from '@/src/features/admin';

async function someFunction() {
  try {
    const response = await adminApiService.login({
      email: 'admin@example.com',
      password: 'password',
    });
    console.log('Login successful:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

---

### 6. **Using UI Components**

```tsx
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button variant="default">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

---

### 7. **TypeScript Types**

```tsx
import type { 
  AdminUser, 
  CreateStudentData,
  LoginResponse,
  ApiResponse 
} from '@/src/features/admin';

function processUser(user: AdminUser) {
  console.log(user.name, user.email);
}
```

---

## 🎯 Common Patterns

### **Pattern 1: Authenticated Page**
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout, useAdminAuthStore } from '@/src/features/admin';

export default function MyProtectedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) return null;
  
  return (
    <AdminLayout title="Protected Page">
      {/* Content */}
    </AdminLayout>
  );
}
```

### **Pattern 2: Data Fetching with Loading State**
```tsx
import { useUsers } from '@/src/features/admin';

function UsersList() {
  const { data, isLoading, error } = useUsers({ page: 1, limit: 10 });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### **Pattern 3: Form with Mutation**
```tsx
import { useForm } from 'react-hook-form';
import { useCreateStudent } from '@/src/features/admin';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

function CreateStudentForm() {
  const { register, handleSubmit } = useForm();
  const createStudent = useCreateStudent();
  
  const onSubmit = async (data) => {
    try {
      await createStudent.mutateAsync(data);
      showSuccessToast('Student created successfully!');
    } catch (error) {
      showErrorToast('Failed to create student');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## 📁 File Locations

### **Where to put new files:**

| File Type | Location | Example |
|-----------|----------|---------|
| Feature Component | `src/features/{feature}/components/` | `src/features/admin/components/dashboard/` |
| Feature Hook | `src/features/{feature}/hooks/` | `src/features/admin/hooks/useAdminAuth.ts` |
| Feature Service | `src/features/{feature}/services/` | `src/features/admin/services/admin-api.service.ts` |
| Feature Store | `src/features/{feature}/store/` | `src/features/admin/store/admin-auth.store.ts` |
| Feature Types | `src/features/{feature}/types/` | `src/features/admin/types/index.ts` |
| Shared UI Component | `src/components/ui/` | `src/components/ui/button.tsx` |
| Shared Hook | `src/hooks/` | `src/hooks/useWindowSize.ts` |
| Utility Function | `src/utils/` | `src/utils/format.util.ts` |
| App Router Page | `app/{route}/` | `app/admin/dashboard/page.tsx` |

---

## 🚀 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🎨 Component Examples

### **Dashboard Card:**
```tsx
import { StatsCard } from '@/src/features/admin';
import { Users } from 'lucide-react';

<StatsCard
  title="Total Students"
  value={1234}
  change={{ value: 12.5, type: 'increase' }}
  icon={Users}
  color="blue"
  description="Active learners this month"
/>
```

### **Chart:**
```tsx
import { EnrollmentChart, CourseDistributionChart } from '@/src/features/admin';

<div className="grid grid-cols-2 gap-6">
  <EnrollmentChart />
  <CourseDistributionChart />
</div>
```

---

## 🔍 Debugging Tips

### **React Query DevTools:**
- Open in development mode (bottom right corner)
- View all queries and their cached data
- Manually trigger refetch
- Clear cache for testing

### **Check Auth State:**
```tsx
import { useAdminAuthStore } from '@/src/features/admin';

// In your component or console:
const store = useAdminAuthStore.getState();
console.log('Auth State:', {
  isAuthenticated: store.isAuthenticated,
  user: store.user,
  token: store.accessToken,
});
```

### **Network Requests:**
- All API calls go through `src/lib/api-client.ts`
- Check browser DevTools > Network tab
- Authorization header is automatically added
- Token refresh happens automatically on 401

---

## ✅ Best Practices

1. **Always import from feature module public API** (`@/src/features/admin`)
2. **Use hooks for data fetching** (don't call API directly)
3. **Use React Query for server state**
4. **Use Zustand for client state**
5. **Keep components thin** (logic in hooks)
6. **Use TypeScript types** (import from feature module)
7. **Handle loading and error states**
8. **Show user feedback** (toast notifications)

---

## 🎯 Next Steps

1. Start the dev server: `npm run dev`
2. Test admin login at `/admin/login`
3. Test dashboard at `/admin/dashboard`
4. Test users page at `/admin/users`
5. Check React Query DevTools in browser

---

*Happy coding! 🚀*
