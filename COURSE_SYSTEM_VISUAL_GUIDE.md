# 🎨 COURSE SYSTEM - VISUAL DESIGN GUIDE

## UI/UX Specifications & Design System

**Date:** October 17, 2025  
**Purpose:** Visual reference for designers and developers

---

## 🎨 DESIGN SYSTEM

### **Color Palette**

```css
/* Primary Colors */
--primary-blue: #2563eb;      /* Main brand color */
--primary-blue-dark: #1d4ed8; /* Hover states */
--primary-blue-light: #3b82f6;/* Active states */

/* Success & Progress */
--success-green: #10b981;     /* Completed items */
--success-light: #d1fae5;     /* Success backgrounds */

/* Warning & Attention */
--warning-orange: #f59e0b;    /* Pending items */
--warning-light: #fef3c7;     /* Warning backgrounds */

/* Error States */
--error-red: #ef4444;         /* Errors, locked */
--error-light: #fee2e2;       /* Error backgrounds */

/* Neutral Colors */
--gray-50: #f9fafb;           /* Backgrounds */
--gray-100: #f3f4f6;          /* Cards */
--gray-200: #e5e7eb;          /* Borders */
--gray-300: #d1d5db;          /* Dividers */
--gray-400: #9ca3af;          /* Placeholders */
--gray-500: #6b7280;          /* Secondary text */
--gray-600: #4b5563;          /* Primary text */
--gray-700: #374151;          /* Headings */
--gray-800: #1f2937;          /* Strong headings */
--gray-900: #111827;          /* Darkest text */

/* White & Black */
--white: #ffffff;
--black: #000000;
```

### **Typography**

```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### **Spacing Scale**

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### **Border Radius**

```css
--radius-sm: 0.25rem;  /* 4px - Small elements */
--radius-md: 0.5rem;   /* 8px - Default */
--radius-lg: 0.75rem;  /* 12px - Cards */
--radius-xl: 1rem;     /* 16px - Large cards */
--radius-2xl: 1.5rem;  /* 24px - Hero sections */
--radius-full: 9999px; /* Fully rounded */
```

### **Shadows**

```css
/* Elevation System */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## 📱 COMPONENT LIBRARY

### **1. Course Card**

```
┌─────────────────────────────┐
│   [Course Thumbnail Image]  │
│         16:9 ratio          │
├─────────────────────────────┤
│ 📚 Subject Badge            │
│                             │
│ Course Title Here           │
│ (2 lines max, ellipsis)     │
│                             │
│ 👤 Instructor Name          │
│                             │
│ ⭐ 4.8 (123 reviews)       │
│ 👥 456 students             │
│ 📖 12 modules               │
│                             │
│ [Enroll Now Button] 🔵      │
└─────────────────────────────┘

Dimensions: 320px × 400px
Border Radius: 12px
Shadow: shadow-lg
Hover: scale(1.02) + shadow-xl
```

### **2. Progress Bar**

```
Progress: 45%  ▓▓▓▓▓░░░░░

HTML:
<div class="w-full bg-gray-200 rounded-full h-2">
  <div class="bg-blue-600 h-2 rounded-full" style="width: 45%"></div>
</div>

With Label:
45% Complete  [▓▓▓▓▓░░░░░]  12/26 Lessons
```

### **3. Module Accordion**

```
┌────────────────────────────────────────┐
│ ▼ Module 1: Introduction    ✓ 100%    │ ← Expanded
├────────────────────────────────────────┤
│   ✓ 📹 Lesson 1: Welcome       [5:30] │
│   ✓ 📹 Lesson 2: Overview      [8:45] │
│   ► 📄 Lesson 3: Resources    [Free]  │ ← Current
│   ○ ✏️ Lesson 4: Quiz          [10m]  │
├────────────────────────────────────────┤
│ ▶ Module 2: Core Concepts     ⏸ 25%  │ ← Collapsed
├────────────────────────────────────────┤
│ 🔒 Module 3: Advanced Topics   ○ 0%  │ ← Locked
└────────────────────────────────────────┘

Icons:
✓ = Completed (green)
► = In Progress (blue)
○ = Not Started (gray)
🔒 = Locked (gray)
```

### **4. Video Player**

```
┌─────────────────────────────────────────┐
│                                         │
│         [VIDEO CONTENT AREA]            │
│                                         │
│              16:9 Ratio                 │
│                                         │
├─────────────────────────────────────────┤
│ [▶️] ━━━━━━━●━━━━━━━━━━ 5:30 / 12:45  │
│  🔊 ━━●  ⚙️  📺  ⋮                    │
└─────────────────────────────────────────┘

Features:
- Play/Pause
- Progress bar with scrubbing
- Volume control
- Playback speed
- Fullscreen
- Settings (quality)
- Auto-save progress every 10s
```

### **5. Lesson Status Badge**

```
Completed:  [✓ Completed]  (Green background)
In Progress:[► In Progress] (Blue background)
Not Started:[○ Start]       (Gray background)
Locked:     [🔒 Locked]     (Gray, disabled)
```

### **6. Button Styles**

```css
/* Primary Button */
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: #2563eb;
  border: 2px solid #2563eb;
  padding: 12px 24px;
  border-radius: 8px;
}

/* Success Button */
.btn-success {
  background: #10b981;
  color: white;
}

/* Danger Button */
.btn-danger {
  background: #ef4444;
  color: white;
}
```

### **7. Input Fields**

```html
<!-- Text Input -->
<div class="form-group">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    Course Title *
  </label>
  <input 
    type="text"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg
           focus:ring-2 focus:ring-blue-500 focus:border-transparent
           transition-all"
    placeholder="Enter course title"
  />
  <p class="text-sm text-gray-500 mt-1">
    Make it clear and descriptive
  </p>
</div>

<!-- Textarea -->
<textarea 
  class="w-full px-4 py-3 border border-gray-300 rounded-lg
         focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[120px]"
  placeholder="Enter description..."
></textarea>

<!-- Select Dropdown -->
<select class="w-full px-4 py-3 border border-gray-300 rounded-lg
               focus:ring-2 focus:ring-blue-500 bg-white">
  <option>Select subject</option>
  <option>Mathematics</option>
  <option>Science</option>
</select>
```

---

## 📐 LAYOUT SPECIFICATIONS

### **Course Player Layout**

```
┌────────────────────────────────────────────────┐
│ [← Back]  Course Title      Progress: 45% ▓▓░░│ ← Header (64px)
├────────┬───────────────────────────────────────┤
│        │                                       │
│ Sidebar│           Main Content               │
│ 280px  │                                       │
│        │    [Video Player / Content]           │
│ Module │         (Flexible height)             │
│  List  │                                       │
│        │    ┌─────────────────────────────┐   │
│ Module1│    │ Tabs: Overview | Notes |    │   │
│ ✓ Lsn1 │    │       Discussion | Quiz     │   │
│ ✓ Lsn2 │    └─────────────────────────────┘   │
│ ► Lsn3 │                                       │
│        │    [Tab Content Area]                 │
│ Module2│                                       │
│   Lsn4 │                                       │
│   Lsn5 │                                       │
│        │                                       │
├────────┴───────────────────────────────────────┤
│ [← Previous] [Mark Complete] [Next →]         │ ← Footer (64px)
└────────────────────────────────────────────────┘

Breakpoints:
- Desktop: Sidebar visible (> 1024px)
- Tablet: Sidebar collapsible (768px - 1024px)
- Mobile: Sidebar hidden, hamburger menu (< 768px)
```

### **Course Browse Grid**

```
Desktop (1920px):
┌─────┬─────┬─────┬─────┐
│Card │Card │Card │Card │  4 columns
├─────┼─────┼─────┼─────┤
│Card │Card │Card │Card │
└─────┴─────┴─────┴─────┘

Tablet (768px):
┌─────┬─────┬─────┐
│Card │Card │Card │  3 columns
└─────┴─────┴─────┘

Mobile (375px):
┌─────────────┐
│    Card     │  1 column
├─────────────┤
│    Card     │
└─────────────┘

Gap: 24px between cards
Padding: 24px container padding
```

---

## 🎬 ANIMATIONS & TRANSITIONS

### **Standard Transitions**

```css
/* Default transition for interactive elements */
.transition-default {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  animation: spin 1s linear infinite;
}

/* Progress bar animation */
@keyframes progress {
  from { width: 0%; }
  to { width: var(--progress); }
}
```

### **Framer Motion Variants**

```typescript
// Card entrance animation
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Fade in/out
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile First Approach */

/* Extra small devices (phones, < 640px) */
@media (max-width: 639px) {
  /* Adjust for mobile */
}

/* Small devices (tablets, ≥ 640px) */
@media (min-width: 640px) {
  /* sm: prefix in Tailwind */
}

/* Medium devices (tablets, ≥ 768px) */
@media (min-width: 768px) {
  /* md: prefix - Show sidebar */
}

/* Large devices (desktops, ≥ 1024px) */
@media (min-width: 1024px) {
  /* lg: prefix - Full layout */
}

/* Extra large devices (large desktops, ≥ 1280px) */
@media (min-width: 1280px) {
  /* xl: prefix */
}

/* 2XL devices (≥ 1536px) */
@media (min-width: 1536px) {
  /* 2xl: prefix - Max width content */
}
```

---

## 🔤 CONTENT GUIDELINES

### **Text Limits**

| Element | Character Limit | Lines |
|---------|----------------|-------|
| Course Title | 100 | 1-2 |
| Course Description | 500 | 3-5 |
| Module Title | 80 | 1 |
| Lesson Title | 80 | 1 |
| Review Text | 1000 | 5-8 |
| Discussion Post | 2000 | - |
| Note | 5000 | - |

### **Image Specifications**

| Image Type | Size | Format | Ratio |
|------------|------|--------|-------|
| Course Thumbnail | 1280×720 | JPG/PNG | 16:9 |
| Module Icon | 512×512 | PNG | 1:1 |
| Instructor Avatar | 256×256 | JPG/PNG | 1:1 |
| Course Banner | 1920×400 | JPG | 48:10 |

---

## ✨ SPECIAL EFFECTS

### **Glassmorphism (Optional)**

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### **Skeleton Loading**

```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 🎨 ICON LIBRARY

### **Course Icons** (Lucide React)

```typescript
import {
  BookOpen,        // Course/Reading
  PlayCircle,      // Video
  FileText,        // Document/PDF
  CheckCircle,     // Completed
  Circle,          // Not started
  Loader,          // Loading
  Lock,            // Locked
  Star,            // Rating
  Users,           // Students
  Clock,           // Duration
  Award,           // Certificate
  MessageCircle,   // Discussion
  Bookmark,        // Saved
  Download,        // Download
  Share2,          // Share
  Settings,        // Settings
  Search,          // Search
  Filter,          // Filter
  ChevronDown,     // Expand
  ChevronRight,    // Collapse
  ArrowLeft,       // Back
  ArrowRight,      // Next
  Upload,          // Upload
  Eye,             // Preview
  Edit,            // Edit
  Trash,           // Delete
  Plus,            // Add
} from 'lucide-react';
```

---

## 🎯 ACCESSIBILITY

### **WCAG 2.1 Level AA Compliance**

```css
/* Color Contrast Ratios */
Normal text: 4.5:1 minimum
Large text: 3:1 minimum

/* Focus States */
*:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### **Semantic HTML**

```html
<!-- Use proper heading hierarchy -->
<h1>Course Title</h1>
<h2>Module Title</h2>
<h3>Lesson Title</h3>

<!-- Use semantic elements -->
<nav>Navigation</nav>
<main>Main content</main>
<aside>Sidebar</aside>
<article>Course content</article>
<section>Content sections</section>

<!-- Proper form labels -->
<label for="course-title">Course Title</label>
<input id="course-title" type="text" />

<!-- Alt text for images -->
<img src="course.jpg" alt="Introduction to Mathematics" />

<!-- ARIA labels where needed -->
<button aria-label="Play video">▶️</button>
```

---

## 🎨 DESIGN TOKENS (CSS Variables)

```css
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Spacing */
  --spacing-unit: 8px;
  --spacing-xs: calc(var(--spacing-unit) * 1);   /* 8px */
  --spacing-sm: calc(var(--spacing-unit) * 2);   /* 16px */
  --spacing-md: calc(var(--spacing-unit) * 3);   /* 24px */
  --spacing-lg: calc(var(--spacing-unit) * 4);   /* 32px */
  --spacing-xl: calc(var(--spacing-unit) * 6);   /* 48px */
  
  /* Typography */
  --font-size-base: 16px;
  --font-size-small: 14px;
  --font-size-large: 18px;
  --font-size-h1: 36px;
  --font-size-h2: 30px;
  --font-size-h3: 24px;
  
  /* Layout */
  --header-height: 64px;
  --sidebar-width: 280px;
  --max-content-width: 1280px;
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
}
```

---

## 📸 EXAMPLE SCREENS

### **1. Course Card (Hover State)**
```
Normal State:
┌───────────────────┐
│  [Thumbnail]      │
│ Mathematics 101   │
│ ⭐ 4.8 (123)     │
│ [Enroll]          │
└───────────────────┘

Hover State:
┌═══════════════════┐ ← Lifted, stronger shadow
║  [Thumbnail]      ║ ← Slight scale up
║ Mathematics 101   ║
║ ⭐ 4.8 (123)     ║
║ [Enroll] ✨       ║ ← Button highlighted
└═══════════════════┘
```

### **2. Empty States**

```
No Courses Yet:

    📚
    
    No courses enrolled yet
    
    Browse our course catalog to
    start your learning journey!
    
    [Browse Courses]
```

---

## 🎉 SUMMARY

This design guide provides:

✅ **Complete color system** with accessibility  
✅ **Typography scale** for consistency  
✅ **Component specifications** for development  
✅ **Layout guidelines** for responsive design  
✅ **Animation standards** for smooth UX  
✅ **Icon library** for visual consistency  
✅ **Accessibility rules** for WCAG compliance  

Use these specifications to ensure a **consistent, professional, and accessible** user interface across the entire Course Management System.

---

*Visual Design Guide*  
*Created: October 17, 2025*  
*Version: 1.0*
