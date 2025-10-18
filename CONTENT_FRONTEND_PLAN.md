# Student Content Access - Frontend Implementation Plan

## 🎯 Project Overview

**Objective**: Enable students to access enrolled module content (Topics → Lessons) with progress tracking and professional UI using #2563eb color scheme.

**Current Status**:
- ✅ Backend: Fully functional (APIs, services, database)
- ✅ Student Dashboard: Shows enrolled modules
- ❌ **MISSING**: Content access pages (module detail, lesson viewer)

---

## 📐 Architecture Design

### Content Hierarchy
```
Module (Course)
├── Topic 1 (Section/Chapter)
│   ├── Lesson 1.1 (VIDEO)
│   ├── Lesson 1.2 (TEXT)
│   └── Lesson 1.3 (PDF)
├── Topic 2
│   ├── Lesson 2.1 (YOUTUBE_LIVE)
│   ├── Lesson 2.2 (QUIZ)
│   └── Lesson 2.3 (ASSIGNMENT)
└── Topic 3
    └── ...
```

### Page Structure
```
/modules/[slug]                    → Module Detail (Topic List)
/modules/[slug]/lessons/[lessonId] → Lesson Viewer
```

---

## 🏗️ PHASE 1: Module Detail Page

### **File**: `frontend/app/modules/[slug]/page.tsx`

### Purpose
Display module overview with collapsible topic list and lesson items. Students can see all content and navigate to lessons.

### Components Structure

```typescript
ModuleDetailPage
├── ModuleHeader
│   ├── Breadcrumb (Home > Modules > [Module Name])
│   ├── Module Title & Description
│   ├── Progress Circle (X% complete)
│   ├── Module Meta (Topics, Lessons, Duration)
│   └── Continue Learning Button
├── TopicAccordion (foreach topic)
│   ├── Topic Header
│   │   ├── Topic Title
│   │   ├── Lesson Count
│   │   └── Topic Progress Bar
│   └── LessonList (when expanded)
│       └── LessonItem (foreach lesson)
│           ├── Completion Checkmark
│           ├── Lesson Icon (by type)
│           ├── Lesson Title
│           ├── Duration
│           └── Lock/Current Indicator
└── ModuleSidebar (optional)
    ├── Instructor Info
    ├── Module Stats
    └── Quick Actions
```

### Data Flow

```typescript
// 1. Fetch module with enrollment data
const { slug } = useParams();
const [module, setModule] = useState<Module | null>(null);
const [topics, setTopics] = useState<Topic[]>([]);
const [enrollment, setEnrollment] = useState<ModuleEnrollment | null>(null);

useEffect(() => {
  // Fetch module details
  const moduleData = await moduleApiService.getModuleById(slug, true);
  
  // Fetch topics with lessons
  const topicsData = await moduleApiService.getTopicsByModule(moduleData.id);
  
  // Get enrollment (for progress)
  const enrollments = await studentApiService.getMyEnrollments();
  const currentEnrollment = enrollments.find(e => e.moduleId === moduleData.id);
  
  // Fetch lesson progress
  const progress = await moduleApiService.getModuleProgress(currentEnrollment.id);
}, [slug]);
```

### UI Design

```
┌─────────────────────────────────────────────────────────────┐
│ Home > Modules > Advanced React Development                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  ADVANCED REACT DEVELOPMENT                  │
│                                                              │
│  Master modern React patterns, hooks, and best practices    │
│                                                              │
│  Progress: ●●●●●●●○○○ 68% (17/25 lessons)                  │
│                                                              │
│  📚 5 Topics  •  📝 25 Lessons  •  ⏱️ 8 hours               │
│                                                              │
│  [Continue Learning: Topic 3, Lesson 4 →]                   │
│                                                              │
│  Created by: John Doe  •  Last updated: Oct 15, 2025        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ▼ 1. Introduction to React                    ●●●● 100%    │
├─────────────────────────────────────────────────────────────┤
│  ✓ 🎬 What is React?                          10 min       │
│  ✓ 📄 React Ecosystem Overview                5 min        │
│  ✓ 🎬 Setting up Development Environment      15 min       │
│  ✓ 📝 Quiz: React Basics                      10 min       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ▼ 2. Components & Props                       ●●●○ 75%     │
├─────────────────────────────────────────────────────────────┤
│  ✓ 🎬 Function Components                     12 min       │
│  ✓ 🎬 Props and Data Flow                     18 min       │
│  ● 📄 Component Composition                   8 min ← NOW  │
│  🔒 💻 Assignment: Build a Card Component     30 min       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ▶ 3. Hooks Deep Dive                          ●○○○ 25%     │
│   (8 lessons)                                               │
└─────────────────────────────────────────────────────────────┘
```

### Color Scheme (#2563eb)

```css
/* Primary Actions */
.continue-button {
  background: #2563eb;
  hover: #1d4ed8;
}

/* Progress Bars */
.topic-progress-fill {
  background: #2563eb;
}

/* Current Lesson Indicator */
.current-lesson-marker {
  border-left: 4px solid #2563eb;
  background: #2563eb10; /* 10% opacity */
}

/* Completed Checkmarks */
.completed-icon {
  color: #10b981; /* Green */
}

/* Locked Icons */
.locked-icon {
  color: #9ca3af; /* Gray */
}
```

### Features Checklist

- [ ] Module header with gradient background (#2563eb)
- [ ] Progress circle showing completion percentage
- [ ] Topic accordion (expand/collapse)
- [ ] Lesson items with type icons
- [ ] Completion checkmarks for finished lessons
- [ ] Current lesson highlight
- [ ] Lock indicators for sequential access (optional)
- [ ] Continue learning button (jumps to last/next lesson)
- [ ] Responsive design (mobile-first)
- [ ] Loading skeletons while fetching data
- [ ] Empty state if no topics/lessons

### Code Example

```typescript
// frontend/app/modules/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  PlayCircle,
  FileText,
  CheckCircle,
  Lock,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { moduleApiService } from '@/src/services/module-api.service';
import { studentApiService } from '@/src/services/student-api.service';

export default function ModuleDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [module, setModule] = useState(null);
  const [topics, setTopics] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModuleData();
  }, [slug]);

  const fetchModuleData = async () => {
    try {
      // Get module
      const moduleData = await moduleApiService.getModuleById(slug);
      setModule(moduleData);

      // Get topics with lessons
      const topicsData = await moduleApiService.getTopicsByModule(moduleData.id);
      setTopics(topicsData);

      // Get enrollment
      const enrollments = await studentApiService.getMyEnrollments();
      const currentEnrollment = enrollments.find(e => e.moduleId === moduleData.id);
      setEnrollment(currentEnrollment);

      // Expand first topic by default
      if (topicsData.length > 0) {
        setExpandedTopics([topicsData[0].id]);
      }
    } catch (error) {
      console.error('Failed to fetch module:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/modules/${slug}/lessons/${lessonId}`);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <PlayCircle className="w-5 h-5" />;
      case 'TEXT': return <FileText className="w-5 h-5" />;
      case 'PDF': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-4">{module.title}</h1>
          <p className="text-white/90 text-lg mb-6">{module.description}</p>
          
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span>Your Progress</span>
              <span className="font-bold">{Math.round(enrollment?.progress || 0)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${enrollment?.progress || 0}%` }}
                className="bg-white h-full rounded-full"
              />
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-6 text-sm text-white/80">
            <span>📚 {topics.length} Topics</span>
            <span>📝 {module.totalLessons} Lessons</span>
            <span>⏱️ {module.duration} min</span>
          </div>
        </div>
      </div>

      {/* Topics & Lessons */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {topics.map((topic, index) => (
          <div key={topic.id} className="bg-white rounded-lg shadow-sm mb-4">
            {/* Topic Header */}
            <button
              onClick={() => toggleTopic(topic.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                {expandedTopics.includes(topic.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <div className="text-left">
                  <h3 className="font-bold text-lg">
                    {index + 1}. {topic.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {topic.totalLessons} lessons
                  </p>
                </div>
              </div>
              {/* Topic progress bar */}
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-[#2563eb] rounded-full"
                  style={{ width: `${topic.progress || 0}%` }}
                />
              </div>
            </button>

            {/* Lesson List */}
            {expandedTopics.includes(topic.id) && (
              <div className="border-t">
                {topic.lessons?.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 border-b last:border-b-0 transition"
                  >
                    {/* Completion status */}
                    {lesson.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : lesson.isLocked ? (
                      <Lock className="w-5 h-5 text-gray-400" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}

                    {/* Lesson icon */}
                    <div className="text-[#2563eb]">
                      {getLessonIcon(lesson.type)}
                    </div>

                    {/* Lesson title */}
                    <div className="flex-1 text-left">
                      <p className="font-medium">{lesson.title}</p>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration} min</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎬 PHASE 2: Lesson Viewer Page

### **File**: `frontend/app/modules/[slug]/lessons/[lessonId]/page.tsx`

### Purpose
Display individual lesson content with type-specific player/renderer and progress tracking.

### Layout Design

```
┌────────────────────────────────────────────────────────────┐
│ [Header] Module > Topic > Lesson                          │
└────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────────┐
│                      │  SIDEBAR (30%)                       │
│                      │  ─────────────────────────────       │
│  CONTENT AREA (70%)  │  Module: Advanced React              │
│                      │                                      │
│  [Video Player]      │  ▼ Topic 1                           │
│  [Text Content]      │    ✓ Lesson 1                        │
│  [PDF Viewer]        │    ● Lesson 2 ← You are here        │
│  [Quiz Interface]    │    🔒 Lesson 3                        │
│                      │  ▶ Topic 2                           │
│                      │                                      │
│                      │  Progress: 45%                       │
│                      │  ████████░░ 12/27 lessons           │
└──────────────────────┴──────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Attachments: [📄 Slides.pdf] [💾 Code.zip]                 │
│ ────────────────────────────────────────────────────────   │
│ Notes (auto-save):                                         │
│ [Your notes here...]                                       │
│ ────────────────────────────────────────────────────────   │
│ [✓ Mark Complete]  [← Previous]  [Next Lesson →]          │
└────────────────────────────────────────────────────────────┘
```

### Lesson Type Implementations

#### 1. VIDEO Lesson
```typescript
import ReactPlayer from 'react-player';

<ReactPlayer
  url={lesson.videoUrl}
  controls
  width="100%"
  height="500px"
  playing={false}
  onProgress={handleProgress}
  onEnded={handleVideoEnd}
  config={{
    file: {
      attributes: {
        controlsList: 'nodownload'
      }
    }
  }}
/>
```

#### 2. TEXT Lesson
```typescript
<div className="prose prose-lg max-w-none">
  <ReactMarkdown>{lesson.content}</ReactMarkdown>
</div>
```

#### 3. PDF Lesson
```typescript
import { Document, Page } from 'react-pdf';

<Document file={lesson.pdfUrl}>
  <Page pageNumber={currentPage} />
</Document>
```

#### 4. YOUTUBE_LIVE Lesson
```typescript
<iframe
  src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}`}
  width="100%"
  height="500px"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

### Progress Tracking Logic

```typescript
// On lesson view (page load)
useEffect(() => {
  trackLessonView();
}, [lessonId]);

const trackLessonView = async () => {
  await moduleApiService.trackLessonView(lessonId);
};

// On video progress (every 10 seconds)
const handleProgress = (state) => {
  if (state.playedSeconds % 10 === 0) {
    updateProgress({
      lastPosition: state.playedSeconds,
      timeSpent: state.playedSeconds
    });
  }
  
  // Auto-complete at 90% watched
  if (state.played >= 0.9 && !lesson.isCompleted) {
    markAsComplete();
  }
};

// Manual complete button
const markAsComplete = async () => {
  await moduleApiService.updateLessonProgress(enrollmentId, lessonId, {
    isCompleted: true,
    completedAt: new Date().toISOString()
  });
  
  // Refresh lesson data
  fetchLesson();
};

// Navigate to next lesson
const goToNextLesson = () => {
  const nextLesson = getNextLesson();
  if (nextLesson) {
    router.push(`/modules/${slug}/lessons/${nextLesson.id}`);
  }
};
```

### Features Checklist

- [ ] Lesson header (module > topic > lesson breadcrumb)
- [ ] VIDEO player with React Player
- [ ] TEXT content renderer (Markdown)
- [ ] PDF viewer integration
- [ ] YOUTUBE_LIVE embed
- [ ] Sidebar navigation (lesson list)
- [ ] Progress tracking on video watch
- [ ] Auto-complete on 90% watched
- [ ] Manual "Mark as Complete" button
- [ ] Previous/Next navigation buttons
- [ ] Attachments download section
- [ ] Notes panel with auto-save
- [ ] Resume from last position
- [ ] Loading states
- [ ] Error handling

---

## 🎨 UI Components Library

### LessonTypeIcon Component
```typescript
const getLessonIcon = (type: LessonType) => {
  const icons = {
    VIDEO: <PlayCircle className="w-5 h-5" />,
    TEXT: <FileText className="w-5 h-5" />,
    PDF: <FileText className="w-5 h-5" />,
    YOUTUBE_LIVE: <Youtube className="w-5 h-5" />,
    QUIZ: <HelpCircle className="w-5 h-5" />,
    ASSIGNMENT: <CheckSquare className="w-5 h-5" />,
    EXTERNAL_LINK: <ExternalLink className="w-5 h-5" />
  };
  return icons[type] || <BookOpen className="w-5 h-5" />;
};
```

### ProgressCircle Component
```typescript
interface ProgressCircleProps {
  percentage: number;
  size?: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ percentage, size = 120 }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2563eb"
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="text-2xl font-bold"
      >
        {percentage}%
      </text>
    </svg>
  );
};
```

---

## 📦 Dependencies to Install

```bash
cd frontend

# Video player
npm install react-player

# PDF viewer
npm install react-pdf

# Markdown renderer
npm install react-markdown

# State management (optional)
npm install @tanstack/react-query zustand
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Module detail data fetching
- [ ] Topic accordion expand/collapse
- [ ] Lesson navigation logic
- [ ] Progress calculation

### Integration Tests
- [ ] End-to-end lesson completion flow
- [ ] Progress persistence across sessions
- [ ] Video resume from last position

### Manual Testing
- [ ] All lesson types display correctly
- [ ] Progress updates in real-time
- [ ] Navigation works smoothly
- [ ] Responsive on mobile/tablet
- [ ] Error states handled gracefully

---

## 📈 Performance Optimization

1. **Lazy Loading**
   - Load lesson content on demand
   - Lazy load video player component

2. **Caching**
   - Cache module/topic data with React Query
   - LocalStorage for draft notes

3. **Code Splitting**
   - Separate bundles for each lesson type player

4. **Image Optimization**
   - Next.js Image component for thumbnails
   - Lazy load lesson thumbnails

---

## 🚀 Deployment Checklist

- [ ] Build frontend (`npm run build`)
- [ ] Test all lesson types
- [ ] Verify progress tracking
- [ ] Check responsive design
- [ ] Test on different browsers
- [ ] Validate API calls
- [ ] Monitor performance
- [ ] Enable analytics tracking

---

## 📝 Documentation

Create:
- [ ] User guide for students
- [ ] Component documentation
- [ ] API integration guide
- [ ] Troubleshooting guide

---

## ✅ Success Criteria

**Module Detail Page:**
- ✅ Students can view all topics and lessons
- ✅ Progress is clearly displayed
- ✅ Navigation is intuitive
- ✅ Responsive on all devices

**Lesson Viewer:**
- ✅ All 7 lesson types supported
- ✅ Progress tracked automatically
- ✅ Resume functionality works
- ✅ Smooth navigation between lessons

**Overall:**
- ✅ Professional design with #2563eb theme
- ✅ Fast loading times (< 2s)
- ✅ No critical bugs
- ✅ Positive user feedback

---

**Ready to implement! Let's start with Phase 1: Module Detail Page** 🚀
