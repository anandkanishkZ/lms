# 🎨 Base Components - Quick Visual Reference

## Component Gallery

### 1️⃣ Badge Component
```
┌─────────────────────────────────────────┐
│ Variants (23 total)                     │
├─────────────────────────────────────────┤
│ [Default] [Success] [Warning] [Error]   │
│ [Info] [Secondary] [Outline]            │
│                                          │
│ Module Status:                           │
│ [Draft] [Under Review] [Approved]       │
│ [Published] [Archived]                   │
│                                          │
│ Lesson Types:                            │
│ [📹 Video] [📄 PDF] [📝 Text]           │
│ [✅ Quiz] [📋 Assignment] [🔗 Link]      │
│ [🔴 Live]                                │
├─────────────────────────────────────────┤
│ Sizes: sm | md | lg                     │
│ Features: icon, pulse, removable        │
└─────────────────────────────────────────┘
```

### 2️⃣ Button Component
```
┌─────────────────────────────────────────┐
│ Variants (9 total)                      │
├─────────────────────────────────────────┤
│ [Primary Button]  ← default             │
│ [Secondary Button] ← secondary          │
│ [Success Button]   ← success            │
│ [Warning Button]   ← warning            │
│ [Error Button]     ← error              │
│ [Outline Button]   ← outline            │
│ [Ghost Button]     ← ghost              │
│ [Link Button]      ← link               │
│ [Gradient Button]  ← gradient           │
├─────────────────────────────────────────┤
│ Sizes: sm | md | lg | xl | icon         │
│ States: loading, disabled               │
│ Icons: left, right                      │
├─────────────────────────────────────────┤
│ Specialized Buttons:                    │
│ • Action: Save, Cancel, Delete, Edit    │
│ • Module: Enroll, Start, Continue       │
│ • Social: Google, GitHub                │
└─────────────────────────────────────────┘
```

### 3️⃣ Input Component
```
┌─────────────────────────────────────────┐
│ Base Input                              │
├─────────────────────────────────────────┤
│ Label                             [*]   │
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Placeholder text...           X │ │
│ └─────────────────────────────────────┘ │
│ Helper text or error message            │
├─────────────────────────────────────────┤
│ Specialized Inputs:                     │
│ • 🔒 Password (with strength meter)     │
│ • 🔍 Search (with clear button)         │
│ • 🔢 Number (with +/- controls)         │
│ • ✉️ Email (with email icon)            │
│ • 📱 Phone (with phone icon)            │
│ • 🔗 URL (with link icon)               │
├─────────────────────────────────────────┤
│ Variants: default, error, success       │
│ Sizes: sm | md | lg                     │
└─────────────────────────────────────────┘
```

### 4️⃣ Card Component
```
┌─────────────────────────────────────────┐
│ Card Header                        🏷️  │
│ ─────────────────────────────────────── │
│                                          │
│ Card Content Area                       │
│                                          │
│ • Can contain any content               │
│ • Title and description                 │
│ • Images, text, components              │
│                                          │
│ ─────────────────────────────────────── │
│ Card Footer                    [Action] │
└─────────────────────────────────────────┘

Specialized Cards:

┌─────────────────────┐  ┌──────────────────┐
│ [Module Image]      │  │ 📹 Lesson Title  │
│                     │  │ Duration: 10 min │
│ Module Title        │  │            ✓     │
│ by Instructor       │  └──────────────────┘
│                     │   Lesson Card
│ Description text... │
│                     │  ┌──────────────────┐
│ ████████░░ 80%      │  │ Total Modules    │
│                     │  │     24        📚 │
│ ⏱️ 5h  📚 20 lessons│  │ ↑ 12%            │
└─────────────────────┘  └──────────────────┘
Module Card             Stats Card
```

### 5️⃣ Progress Component
```
Linear Progress:
┌─────────────────────────────────────────┐
│ Progress              75%               │
│ ████████████████░░░░░░░░                │
└─────────────────────────────────────────┘

Circular Progress:
        ╭─────╮
       ╱       ╲
      │   75%   │
       ╲       ╱
        ╰─────╯

Multi-Step Progress:
┌───┐─────┌───┐─────┌───┐─────┌───┐
│ ✓ │━━━━━│ 2 │─────│ 3 │─────│ 4 │
└───┘     └───┘     └───┘     └───┘
 Step 1    Step 2   Step 3   Step 4
```

### 6️⃣ Skeleton Component
```
Loading States:

Text:     ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░
Title:    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░
Circle:   ⬤ (pulsing)
Avatar:   ⬤ (larger)

Card Skeleton:
┌─────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│                     │
│▓▓▓▓▓▓▓▓░░░░░░░░░░│
│▓▓▓▓▓▓▓░░░░░░░░░░░│
│▓▓▓▓▓▓▓▓▓▓░░░░░░░│
│                     │
│▓▓▓▓░░  ▓▓▓▓▓▓▓░│
└─────────────────────┘

Profile Skeleton:
⬤  ▓▓▓▓▓▓▓▓▓░░░░░
   ▓▓▓▓▓▓░░░░░░░░
   ▓▓▓▓▓▓▓░░░░░░░
   ▓▓▓▓░ ▓▓▓▓░
```

### 7️⃣ Tooltip Component
```
       ╭─────────╮
       │ Tooltip │
       ╰────┬────╯
            │
       [🛈 Hover Me]

Positions:
   Top      Bottom    Left     Right
    ▲          ▼        ◄        ►

Rich Tooltip:
╭─────────────────╮
│ ⓘ Feature Name  │
│ ─────────────── │
│ Description of  │
│ the feature...  │
╰─────────────────╯

Keyboard Shortcut:
╭─────────────────╮
│ Save changes    │
│ [Ctrl] + [S]    │
╰─────────────────╯
```

---

## 🎨 Color System

```
┌─────────────────────────────────────────┐
│ Color Palette                           │
├─────────────────────────────────────────┤
│ 🔵 Default   - Blue    (Primary)        │
│ ⚪ Secondary - Gray    (Neutral)        │
│ 🟢 Success   - Green   (Positive)       │
│ 🟡 Warning   - Yellow  (Caution)        │
│ 🔴 Error     - Red     (Negative)       │
│ 🔵 Info      - Blue    (Information)    │
│ 🌈 Gradient  - Blue→Purple (Premium)    │
└─────────────────────────────────────────┘
```

---

## 📏 Size System

```
┌─────────────────────────────────────────┐
│ Size Scale                              │
├─────────────────────────────────────────┤
│ sm  - Small     (Compact, dense)        │
│ md  - Medium    (Default, balanced)     │
│ lg  - Large     (Emphasis, spacious)    │
│ xl  - X-Large   (Hero, prominent)       │
└─────────────────────────────────────────┘
```

---

## 🔧 Common Patterns

### Form Layout
```tsx
<form className="space-y-4">
  <Input label="Name" required />
  <EmailInput label="Email" />
  <PasswordInput label="Password" showStrengthIndicator />
  <ButtonGroup className="justify-end">
    <CancelButton />
    <SubmitButton />
  </ButtonGroup>
</form>
```

### Module Grid
```tsx
<div className="grid grid-cols-3 gap-6">
  {modules.map(module => (
    <ModuleCard {...module} />
  ))}
</div>
```

### Loading State
```tsx
{isLoading ? (
  <SkeletonCard />
) : (
  <ModuleCard {...data} />
)}
```

### Dashboard Stats
```tsx
<div className="grid grid-cols-4 gap-4">
  <StatsCard title="Total" value={100} />
  <StatsCard title="Active" value={85} />
  <StatsCard title="Completed" value={75} />
  <StatsCard title="Pending" value={25} />
</div>
```

---

## ♿ Accessibility Quick Reference

### Keyboard Navigation
```
Tab         - Move focus
Enter/Space - Activate button/link
Escape      - Close modal/tooltip
Arrow Keys  - Navigate lists/menus
```

### ARIA Attributes
```tsx
// Button
<button aria-label="Close dialog">×</button>

// Input
<input aria-invalid={hasError} aria-describedby="error-id" />

// Progress
<div role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100} />

// Tooltip
<div role="tooltip">Help text</div>
```

---

## 🎯 Component Composition Examples

### Advanced Module Card
```tsx
<ModuleCard
  title="Advanced React Patterns"
  description="Master advanced React patterns..."
  imageUrl="/module-image.jpg"
  duration="8 hours"
  lessonsCount={24}
  progress={65}
  instructor="John Doe"
  difficulty="advanced"
  badge={<LiveBadge />}
  onClick={handleClick}
/>
```

### Interactive Lesson List
```tsx
<div className="space-y-2">
  <LessonCard
    title="Introduction to React"
    type="video"
    duration="15 min"
    completed
  />
  <LessonCard
    title="Components Deep Dive"
    type="video"
    duration="25 min"
  />
  <LessonCard
    title="Quiz: React Basics"
    type="quiz"
    duration="10 min"
    locked
  />
</div>
```

### Dashboard with Progress
```tsx
<Card>
  <CardHeader divided>
    <div className="flex items-center justify-between">
      <CardTitle>Course Progress</CardTitle>
      <CompletionBadge percentage={75} />
    </div>
  </CardHeader>
  <CardContent className="flex justify-center py-8">
    <CircularProgress value={75} size={200} variant="success" />
  </CardContent>
  <CardFooter divided>
    <ModuleProgress completedLessons={18} totalLessons={24} />
  </CardFooter>
</Card>
```

---

## 📦 Import Cheat Sheet

```tsx
// Common imports
import {
  Button, IconButton, ButtonGroup,
  Input, PasswordInput, SearchInput,
  Card, CardHeader, CardTitle, CardContent,
  Badge, ModuleStatusBadge, LiveBadge,
  Progress, CircularProgress, ModuleProgress,
  Skeleton, SkeletonCard, SkeletonTable,
  Tooltip, RichTooltip, KeyboardTooltip,
  ModuleCard, LessonCard, StatsCard,
} from '@/features/modules/components/ui';

// Utilities
import { cn } from '@/lib/utils';
```

---

**Quick Reference Created**: October 18, 2025  
**Components**: 70+ components across 8 files  
**Status**: ✅ All components production-ready
