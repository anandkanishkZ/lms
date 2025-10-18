# Admin Courses - Quick Reference Card

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: Current Session

---

## 📁 File Locations

### Pages (3 files)
```
frontend/app/admin/courses/
├── page.tsx                    # Listing page (150 lines)
├── [id]/page.tsx              # Detail page (223 lines)
└── create/page.tsx            # Create form (468 lines)
```

### API Service
```
frontend/src/services/module-api.service.ts (714 lines)
```

### UI Templates
```
frontend/src/features/modules/components/templates/
├── CourseListTemplate.tsx
└── CourseDetailTemplate.tsx
```

---

## 🔗 Routes & URLs

| Page | Route | Description |
|------|-------|-------------|
| **List** | `/admin/courses` | View all courses |
| **Detail** | `/admin/courses/:id` | View single course |
| **Create** | `/admin/courses/create` | Create new course |
| **Edit** | `/admin/courses/:id/edit` | ⏳ Not created yet |

---

## 🛠️ API Endpoints Used

### Module API (`moduleApi`)
```typescript
// READ - List all courses with filters
moduleApi.getModules(filters?: ModuleFilters)
  → Returns: { modules: Module[], total: number }

// READ - Get single course by ID
moduleApi.getModuleById(courseId: string, includeTopics: boolean)
  → Returns: Module (with topics if includeTopics=true)

// READ - Get topics for a course
moduleApi.getTopicsByModule(moduleId: string)
  → Returns: Topic[]

// READ - Get enrollments for a course
moduleApi.getModuleEnrollments(moduleId: string, filters?)
  → Returns: ModuleEnrollment[]

// CREATE - Create new course
moduleApi.createModule(data: CreateModuleData)
  → Returns: Module

// UPDATE - Update course (not implemented in UI yet)
moduleApi.updateModule(moduleId: string, data: UpdateModuleData)
  → Returns: Module

// DELETE - Delete course (handler exists, no confirmation modal)
moduleApi.deleteModule(moduleId: string)
  → Returns: void
```

---

## 📊 Data Types

### Course/Module Object
```typescript
{
  id: string
  title: string
  description: string
  thumbnail: string | null
  teacherId: string
  teacher: {
    id: string
    name: string
    avatar?: string
    bio?: string
    email?: string
  }
  subjectId: string
  subject: {
    id: string
    name: string
  }
  classId?: string
  duration: number  // in hours
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED'
  tags: string[]
  price: number
  discountPrice: number
  enrollmentCount: number
  avgRating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
  topics?: Topic[]  // if includeTopics=true
}
```

### Topic Object
```typescript
{
  id: string
  title: string
  description: string
  duration: number  // in minutes
  orderIndex: number
  moduleId: string
  totalLessons: number
  lessons?: Lesson[]
}
```

---

## 🎨 Components & Props

### CourseListTemplate
```typescript
<CourseListTemplate
  courses={Course[]}           // Array of courses
  loading={boolean}            // Show loading state
  onClick={(id) => {}}         // Handle course click
  onEnroll={(id) => {}}        // Handle enroll click
  onFilterChange={(filters) => {}}
  onSearch={(query) => {}}
  totalCourses={number}
  page={number}                // Current page
  pageSize={number}            // Items per page
  totalPages={number}
  onPageChange={(page) => {}}
  categories={Array}           // Filter options
  filters={object}
/>
```

### CourseDetailTemplate
```typescript
<CourseDetailTemplate
  course={CourseDetailData}
  onEnroll={() => {}}
  onLessonClick={(moduleId, lessonId) => {}}
  loading={boolean}
/>
```

---

## 🎯 Common Tasks

### 1. Add a Course
```typescript
const data = {
  title: 'Course Title',
  description: 'Course description',
  thumbnail: 'https://...',
  subjectId: 'subject-id',
  teacherId: 'teacher-id',
  classId: 'class-id',
  duration: 40,
  level: 'Beginner',
  status: 'DRAFT',
  tags: ['tag1', 'tag2'],
  price: 99.99,
  discountPrice: 79.99,
};

const newCourse = await moduleApi.createModule(data);
```

### 2. Load Course List
```typescript
const filters = {
  search: 'math',
  category: 'Mathematics',
  level: 'Beginner',
  status: 'PUBLISHED',
  page: 1,
  limit: 12,
};

const response = await moduleApi.getModules(filters);
// response.modules → Course[]
// response.total → number
```

### 3. Load Course Detail
```typescript
const courseId = 'course-id';
const course = await moduleApi.getModuleById(courseId, true);
const topics = await moduleApi.getTopicsByModule(courseId);
const enrollments = await moduleApi.getModuleEnrollments(courseId);
```

### 4. Navigate Programmatically
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// Go to listing
router.push('/admin/courses');

// Go to detail
router.push(`/admin/courses/${courseId}`);

// Go to create
router.push('/admin/courses/create');

// Go back
router.back();
```

---

## 🚨 Error Handling Pattern

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  try {
    setIsLoading(true);
    
    // Your API call
    const result = await moduleApi.someMethod();
    
    showSuccessToast('Success message');
    
    // Navigate or update state
    router.push('/admin/courses');
    
  } catch (error) {
    console.error('Error:', error);
    showErrorToast('Error message');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🎨 Styling Classes (Tailwind)

### Common Patterns
```tsx
{/* Page Container */}
<div className="p-6">

{/* Card */}
<div className="rounded-lg bg-white p-6 shadow-sm">

{/* Grid Layout */}
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">

{/* Button */}
<Button 
  variant="default|outline|ghost|destructive"
  className="flex items-center gap-2"
>
  <Icon className="h-4 w-4" />
  Label
</Button>

{/* Input */}
<Input 
  className="w-full"
  placeholder="Enter..."
/>

{/* Select */}
<select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">

{/* Textarea */}
<textarea className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" rows={4}>

{/* Label */}
<label className="mb-2 block text-sm font-medium">
  Label <span className="text-red-500">*</span>
</label>

{/* Tag Badge */}
<span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Backend (.env)
PORT=5000
DATABASE_URL=postgresql://...
```

### TypeScript Config
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/src/*": ["./src/*"]
    }
  }
}
```

---

## 📝 Form Fields Reference

### Create Course Form
| Field | Type | Required | Options |
|-------|------|----------|---------|
| Title | Text | ✅ Yes | - |
| Description | Textarea | ✅ Yes | - |
| Thumbnail | URL | ⬜ No | - |
| Subject | Select | ✅ Yes | From API |
| Class | Select | ⬜ No | From API |
| Teacher | Select | ✅ Yes | From API |
| Duration | Number | ⬜ No | Hours (min: 0) |
| Level | Select | ⬜ No | Beginner, Intermediate, Advanced |
| Status | Select | ⬜ No | DRAFT, PUBLISHED, SCHEDULED |
| Price | Number | ⬜ No | USD (min: 0) |
| Discount Price | Number | ⬜ No | USD (min: 0) |
| Tags | Array | ⬜ No | Add/remove dynamically |

---

## 🎭 User Flows

### Flow 1: Create Course
```
1. Admin Dashboard
   ↓ Click "Courses" in sidebar
2. Courses Listing (/admin/courses)
   ↓ Click "Create Course" button
3. Create Form (/admin/courses/create)
   ↓ Fill form + Click "Create Course"
4. Course Detail (/admin/courses/:id)
   ✅ Course created successfully
```

### Flow 2: View Course
```
1. Courses Listing (/admin/courses)
   ↓ Click course card
2. Course Detail (/admin/courses/:id)
   ↓ View all data (stats, topics, lessons)
   ↓ Click "Back to Courses"
3. Courses Listing
   ✅ Back to list
```

### Flow 3: Search & Filter
```
1. Courses Listing (/admin/courses)
   ↓ Type in search box
2. Results update (filtered by search)
   ↓ Select category filter
3. Results update (filtered by category)
   ↓ Clear filters
4. All courses shown
   ✅ Filters working
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Courses not loading | Check backend running, verify API URL |
| Form won't submit | Check required fields, console errors |
| TypeScript errors | Run `npm run type-check`, fix imports |
| 404 on detail page | Verify course ID exists in database |
| Dropdown empty | Check API endpoints for subjects/teachers |
| Tags not adding | Press Enter after typing tag |
| Image not showing | Verify URL is valid and accessible |

---

## 📞 Quick Commands

```bash
# Start development
cd backend && npm run dev &
cd frontend && npm run dev

# Type check
cd frontend && npm run type-check

# Build production
cd frontend && npm run build

# Database
cd backend && npx prisma studio  # View data
cd backend && npx prisma migrate dev  # Run migrations
```

---

## ✅ Checklist for New Features

When adding new course features:

- [ ] Add API method to `module-api.service.ts`
- [ ] Create page component in `app/admin/courses/`
- [ ] Add route to navigation if needed
- [ ] Implement loading state
- [ ] Add error handling with try/catch
- [ ] Show success/error toasts
- [ ] Add TypeScript types
- [ ] Test all edge cases
- [ ] Update this documentation
- [ ] Create testing guide

---

## 🎯 Performance Tips

1. **Lazy Load Images**: Use Next.js Image component
2. **Pagination**: Load only 12 courses at a time
3. **Debounce Search**: Wait 300ms before searching
4. **Cache API Calls**: Use React Query or SWR
5. **Optimize Bundles**: Code-split with dynamic imports

---

## 🔐 Security Notes

- ✅ Admin authentication required
- ✅ API validates user role (ADMIN/TEACHER)
- ✅ CSRF protection enabled
- ✅ Input sanitization on backend
- ⚠️ File upload needs validation (when implemented)
- ⚠️ Rate limiting recommended for API

---

## 📚 Related Docs

- `ADMIN_COURSES_CRUD_COMPLETE.md` - Full implementation guide
- `ADMIN_COURSES_TESTING_GUIDE.md` - Testing procedures
- `PROJECT_STATUS_LATEST.md` - Overall project status
- `README.md` - Project overview

---

*Keep this card handy for quick reference! 📌*  
*Last Updated: Current Session*
