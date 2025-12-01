# Notice System - Quick Reference Guide

## 🚀 Quick Start

### Running the Application
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Open browser
http://localhost:3000/admin/notifications
```

### Test User Setup
```javascript
// Admin User - Full access
localStorage.setItem('adminToken', 'your-admin-jwt-token');

// Teacher User - Edit/delete own notices only
localStorage.setItem('teacher_token', 'your-teacher-jwt-token');

// Student User - Read only
localStorage.setItem('student_token', 'your-student-jwt-token');
```

---

## 📍 Routes

### Admin Pages
- **Listing:** `/admin/notifications` - View all notices with filters
- **Create:** `/admin/notifications/create` - Create new notice
- **Edit:** `/admin/notifications/[id]/edit` - Edit existing notice

### Teacher Pages (To Be Created)
- `/teacher/notifications` - View and manage own notices
- `/teacher/notifications/create` - Create new notice
- `/teacher/notifications/[id]/edit` - Edit own notice

### Student Pages (To Be Created)
- `/student/notifications` - View targeted notices (read-only)

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api/notices
```

### Endpoints

#### Create Notice
```http
POST /api/notices
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Important Exam Notice",
  "content": "The final exam will be held on...",
  "category": "EXAM",
  "priority": "HIGH",
  "classId": "uuid-optional",
  "batchId": "uuid-optional",
  "moduleId": "uuid-optional",
  "targetRole": "STUDENT",
  "attachmentUrl": "https://example.com/file.pdf",
  "expiresAt": "2024-12-31T23:59:59Z",
  "isPinned": true,
  "isPublished": true
}

Response: 201 Created
{
  "id": "uuid",
  "title": "Important Exam Notice",
  ...
}
```

#### Get All Notices
```http
GET /api/notices?category=EXAM&priority=HIGH&unreadOnly=true
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "Notice 1",
    "content": "...",
    "author": {
      "id": "uuid",
      "name": "John Doe"
    },
    "isRead": false,
    ...
  }
]
```

#### Get Single Notice
```http
GET /api/notices/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "title": "Notice Title",
  ...
}
```

#### Update Notice
```http
PUT /api/notices/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "priority": "URGENT"
}

Response: 200 OK
{
  "id": "uuid",
  "title": "Updated Title",
  ...
}
```

#### Delete Notice
```http
DELETE /api/notices/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Notice deleted successfully"
}
```

#### Mark as Read
```http
POST /api/notices/:id/read
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Notice marked as read"
}
```

#### Get Unread Count
```http
GET /api/notices/unread-count
Authorization: Bearer <token>

Response: 200 OK
{
  "count": 5
}
```

---

## 🎨 Component Props

### NoticeForm
```typescript
interface NoticeFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Notice>;
  onSuccess?: () => void;
}

// Usage
<NoticeForm mode="create" onSuccess={() => router.push('/admin/notifications')} />
<NoticeForm mode="edit" initialData={notice} onSuccess={() => router.push('/admin/notifications')} />
```

### NoticeCard
```typescript
interface NoticeCardProps {
  notice: Notice;
  onView: (notice: Notice) => void;
  onMarkAsRead: (noticeId: string) => void;
  showActions?: boolean;
  currentUserRole?: 'ADMIN' | 'TEACHER' | 'STUDENT' | null;
  onDelete?: (noticeId: string) => void;
}

// Usage
<NoticeCard
  notice={notice}
  onView={handleView}
  onMarkAsRead={handleMarkAsRead}
  showActions={true}
  currentUserRole="ADMIN"
  onDelete={handleDelete}
/>
```

### NoticeBoard
```typescript
interface NoticeBoardProps {
  classId?: string;
  batchId?: string;
  moduleId?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  limit?: number;
  title?: string;
  showActions?: boolean;
}

// Usage
<NoticeBoard
  showCreateButton={true}
  onCreateClick={() => router.push('/admin/notifications/create')}
  title="All Notices"
  showActions={true}
/>
```

### NoticeDetailModal
```typescript
interface NoticeDetailModalProps {
  notice: Notice;
  open: boolean;
  onClose: () => void;
  onMarkAsRead: (noticeId: string) => void;
}

// Usage
<NoticeDetailModal
  notice={selectedNotice}
  open={isModalOpen}
  onClose={() => setModalOpen(false)}
  onMarkAsRead={handleMarkAsRead}
/>
```

### NoticeBell
```typescript
interface NoticeBellProps {
  noticesPagePath?: string;
}

// Usage
<NoticeBell noticesPagePath="/admin/notifications" />
```

---

## 📊 Data Types

### Notice Interface
```typescript
interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  classId?: string;
  class?: { id: string; name: string };
  batchId?: string;
  batch?: { id: string; name: string };
  moduleId?: string;
  module?: { id: string; title: string };
  targetRole?: Role;
  attachmentUrl?: string;
  expiresAt?: string;
  isPinned: boolean;
  isPublished: boolean;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Enums
```typescript
enum NoticeCategory {
  EXAM = 'EXAM',
  EVENT = 'EVENT',
  HOLIDAY = 'HOLIDAY',
  GENERAL = 'GENERAL'
}

enum NoticePriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}
```

---

## 🔧 Common Tasks

### 1. Add a New Category
```typescript
// 1. Update Prisma schema
enum NoticeCategory {
  EXAM
  EVENT
  HOLIDAY
  GENERAL
  WORKSHOP  // Add new category
}

// 2. Run migration
npx prisma migrate dev --name add_workshop_category

// 3. Update frontend types in notice-api.service.ts
export type NoticeCategory = 'EXAM' | 'EVENT' | 'HOLIDAY' | 'GENERAL' | 'WORKSHOP';

// 4. Update NoticeForm select options
<SelectItem value="WORKSHOP">🔧 Workshop</SelectItem>
```

### 2. Add a New Filter
```typescript
// In NoticeBoard.tsx

// 1. Add filter state
const [newFilter, setNewFilter] = useState<string>('all');

// 2. Add to applyFilters function
if (newFilter !== 'all') {
  filtered = filtered.filter((notice) => notice.someField === newFilter);
}

// 3. Add UI in filters panel
<Select value={newFilter} onValueChange={setNewFilter}>
  <SelectTrigger>
    <SelectValue placeholder="New Filter" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All</SelectItem>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### 3. Customize Permission Logic
```typescript
// In NoticeCard.tsx

// Current logic: ADMIN can edit all, TEACHER can edit own
const canEdit = currentUserRole === 'ADMIN' || 
  (currentUserRole === 'TEACHER' && notice.authorId === getCurrentUserId());

// Custom: Allow TEACHER to edit notices in their assigned classes
const canEdit = currentUserRole === 'ADMIN' || 
  (currentUserRole === 'TEACHER' && (
    notice.authorId === getCurrentUserId() ||
    isTeacherOfClass(notice.classId)
  ));
```

### 4. Add Real-Time Updates
```typescript
// In NoticeBoard.tsx

useEffect(() => {
  const interval = setInterval(() => {
    fetchNotices(); // Refresh every 30 seconds
  }, 30000);

  return () => clearInterval(interval);
}, []);

// Or use WebSocket
useEffect(() => {
  const ws = new WebSocket('ws://localhost:5000');
  
  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    if (notification.type === 'NEW_NOTICE') {
      setNotices(prev => [notification.data, ...prev]);
      toast.info('New notice received!');
    }
  };

  return () => ws.close();
}, []);
```

---

## 🐛 Debugging Checklist

### Edit/Delete Buttons Not Showing
- [ ] Check `showActions={true}` prop on NoticeBoard
- [ ] Verify token exists in localStorage (adminToken, teacher_token, student_token)
- [ ] Console.log `currentUserRole` in NoticeCard
- [ ] Check `notice.authorId` matches current user ID for teachers
- [ ] Verify NoticeBoard passes `currentUserRole` prop

### Form Validation Not Working
- [ ] Check Zod schema matches form fields
- [ ] Verify field names match schema keys
- [ ] Console.log form errors: `console.log(form.formState.errors)`
- [ ] Check if field is registered: `{...form.register('title')}`

### API Calls Failing
- [ ] Backend server running on correct port (5000)
- [ ] Token exists and is valid (not expired)
- [ ] Check network tab in browser DevTools
- [ ] Verify endpoint URL is correct
- [ ] Check request/response in console
- [ ] Verify CORS settings if cross-origin

### Notice Not Updating After Edit
- [ ] Check if success toast appears
- [ ] Verify API returns updated notice
- [ ] Check if redirect happens
- [ ] Try hard refresh (Ctrl+Shift+R)
- [ ] Check if NoticeBoard refetches on mount

### Optimistic Delete Not Working
- [ ] Verify `onDelete` callback passed to NoticeCard
- [ ] Check `handleDeleteNotice` in NoticeBoard
- [ ] Console.log notices state before/after delete
- [ ] Verify filter logic: `prev.filter(n => n.id !== deletedId)`

---

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.0",
  "@prisma/client": "^5.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3"
}
```

### Frontend
```json
{
  "next": "15.5.5",
  "react": "^19.0.0",
  "react-hook-form": "^7.48.0",
  "@hookform/resolvers": "^3.3.2",
  "zod": "^3.22.4",
  "sonner": "^1.2.0",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "lucide-react": "^0.294.0",
  "date-fns": "^2.30.0"
}
```

---

## 🎯 Best Practices

### 1. Always Validate User Input
```typescript
// Use Zod schema
const noticeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  // ...
});
```

### 2. Handle Errors Gracefully
```typescript
try {
  await noticeApi.createNotice(data);
  toast.success('Notice created successfully');
} catch (error: any) {
  toast.error(error.message || 'Failed to create notice');
  console.error('Create notice error:', error);
}
```

### 3. Show Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async (data) => {
  setLoading(true);
  try {
    await noticeApi.createNotice(data);
  } finally {
    setLoading(false);
  }
};

<Button disabled={loading}>
  {loading ? 'Creating...' : 'Create Notice'}
</Button>
```

### 4. Optimize Re-Renders
```typescript
// Use useMemo for expensive computations
const filteredNotices = useMemo(() => {
  return notices.filter(/* filter logic */);
}, [notices, filterDependencies]);

// Use useCallback for event handlers passed as props
const handleDelete = useCallback((id: string) => {
  // delete logic
}, [/* dependencies */]);
```

### 5. Type Everything
```typescript
// Always use TypeScript interfaces
interface Props {
  notice: Notice;
  onView: (notice: Notice) => void;
}

// Avoid 'any' type
// Bad: const data: any = await fetch(...)
// Good: const data: Notice[] = await fetch(...)
```

---

## 🚀 Performance Tips

1. **Pagination** - Load notices in batches instead of all at once
2. **Debounce Search** - Wait for user to stop typing before filtering
3. **Lazy Load Modal** - Only render when opened
4. **Optimize Images** - Compress avatars and attachments
5. **Cache API Calls** - Use React Query or SWR to cache responses
6. **Virtual Scrolling** - For very large lists (100+ items)
7. **Code Splitting** - Lazy load notice editor components

---

## 📚 Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma ORM](https://www.prisma.io/docs)

---

**Last Updated:** [Current Date]  
**Maintained By:** Development Team
