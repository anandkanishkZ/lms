# Quick Reference - Topics & Lessons System

## 🎯 One-Page Cheat Sheet

### 🚀 Quick Start (3 Steps)

```bash
# 1. Start Backend
cd backend && npm run dev

# 2. Start Frontend  
cd frontend && npm run dev

# 3. Open Browser
http://localhost:3000/teacher/login
→ Modules → Select module → "Topics & Lessons" tab
```

---

## 📁 File Locations

```
frontend/
├── src/services/
│   ├── topic-api.service.ts      ← Topic API calls
│   └── lesson-api.service.ts     ← Lesson API calls
│
└── app/teacher/modules/[id]/components/
    ├── TopicsLessonsTab.tsx      ← Main container
    ├── TopicCard.tsx             ← Topic display
    ├── LessonCard.tsx            ← Lesson display
    ├── TopicFormModal.tsx        ← Create/edit topic
    └── LessonFormModal.tsx       ← Create/edit lesson
```

---

## 🎨 Lesson Types Quick Reference

| Icon | Type | Fields Required | Status |
|------|------|----------------|--------|
| 🎬 | VIDEO | videoUrl | ✅ Ready |
| ▶️ | YOUTUBE_LIVE | youtubeVideoId | ✅ Ready |
| 📄 | PDF | (upload coming) | 🚧 Placeholder |
| 📖 | TEXT | content | ✅ Ready |
| ☑️ | QUIZ | (builder coming) | 🚧 Placeholder |
| 📋 | ASSIGNMENT | (builder coming) | 🚧 Placeholder |
| 🔗 | EXTERNAL_LINK | videoUrl (as URL) | ✅ Ready |

---

## ⌨️ Common Tasks

### Create Topic
```
1. Click "Add Topic"
2. Enter: Title, Description
3. Check ☑ "Publish this topic immediately"
4. Click "Create Topic"
```

### Add Video Lesson
```
1. Click ➕ on topic
2. Select "Video" type
3. Enter: Title, Video URL, Duration
4. Check ☑ "Publish this lesson immediately"
5. Click "Create Lesson"
```

### Add Text Lesson
```
1. Click ➕ on topic
2. Select "Text Content" type
3. Enter: Title, Content
4. Click "Create Lesson"
```

### Toggle Publish
```
Hover over lesson → Click 👁 icon
```

### Edit Lesson
```
Hover over lesson → Click ✏ icon
```

### Delete Lesson
```
Hover over lesson → Click 🗑 icon → Confirm
```

---

## 🐛 Common Errors & Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| "Failed to load topics" | Start backend, check login |
| "Cannot find module" | Restart VS Code / TypeScript server |
| Modal won't close | Check console for errors, refresh page |
| Lessons not showing | Click ▶ to expand topic |
| Empty stats | Create some topics/lessons first |

---

## 🔧 Debug Commands

```bash
# Check backend is running
curl http://localhost:5000/api/v1/health

# Check frontend build
cd frontend && npm run build

# Check database
cd backend && npx prisma studio

# View logs
# Backend: Check terminal output
# Frontend: Check browser console (F12)
```

---

## 📊 Component Props Quick Reference

### TopicsLessonsTab
```typescript
<TopicsLessonsTab 
  moduleId={string}
  moduleName={string}
/>
```

### TopicCard
```typescript
<TopicCard
  topic={Topic}
  isExpanded={boolean}
  onToggleExpand={() => void}
  onEdit={(topic) => void}
  onDelete={(topicId) => void}
  onDuplicate={(topicId) => void}
  onAddLesson={(topicId) => void}
  onEditLesson={(lesson) => void}
  onDeleteLesson={(lessonId) => void}
  onTogglePublishLesson={(lessonId) => void}
/>
```

### LessonCard
```typescript
<LessonCard
  lesson={Lesson}
  index={number}
  onEdit={(lesson) => void}
  onDelete={(lessonId) => void}
  onTogglePublish={(lessonId) => void}
/>
```

---

## 🌐 API Endpoints

### Topics
```
GET    /api/v1/topics/modules/:moduleId
POST   /api/v1/topics
GET    /api/v1/topics/:id
PUT    /api/v1/topics/:id
DELETE /api/v1/topics/:id
POST   /api/v1/topics/:id/duplicate
PATCH  /api/v1/topics/modules/:moduleId/reorder
```

### Lessons
```
GET    /api/v1/lessons/topics/:topicId/lessons
POST   /api/v1/lessons
GET    /api/v1/lessons/:id
PUT    /api/v1/lessons/:id
DELETE /api/v1/lessons/:id
POST   /api/v1/lessons/:id/duplicate
PATCH  /api/v1/lessons/topics/:topicId/reorder
PATCH  /api/v1/lessons/:id/publish
POST   /api/v1/lessons/topics/:topicId/bulk
```

---

## 🎯 Testing Checklist

Quick tests to verify everything works:

- [ ] Create topic → Appears in list
- [ ] Edit topic → Changes saved
- [ ] Delete topic → Removed
- [ ] Create VIDEO lesson → Appears
- [ ] Create TEXT lesson → Appears
- [ ] Toggle publish → Status changes
- [ ] Expand topic → Lessons load
- [ ] Stats update → Numbers correct
- [ ] Empty state → Shows when no topics
- [ ] Loading state → Shows during API calls

---

## 📱 Keyboard Shortcuts (Future)

Coming in Phase 3:
- `N` → New Topic
- `L` → New Lesson  
- `E` → Edit
- `Delete` → Delete
- `Space` → Expand/Collapse
- `P` → Toggle Publish

---

## 🆘 Emergency Reset

If everything breaks:

```bash
# 1. Stop servers (Ctrl+C)

# 2. Clear caches
cd backend && rm -rf dist node_modules/.cache
cd ../frontend && rm -rf .next node_modules/.cache

# 3. Restart
cd ../backend && npm run dev
# (new terminal)
cd ../frontend && npm run dev

# 4. Hard refresh browser (Ctrl+Shift+R)

# 5. Re-login
```

---

## 📖 Documentation Index

| Document | Purpose |
|----------|---------|
| `PHASE_2_FRONTEND_COMPLETE.md` | Full technical docs |
| `QUICK_START_TOPICS_LESSONS.md` | User guide |
| `TESTING_GUIDE_PHASE_2.md` | Testing procedures |
| `COMMON_ERRORS_FIXES.md` | Error reference |
| `PHASE_2_FINAL_SUMMARY.md` | Project summary |
| `QUICK_REFERENCE.md` | This file! |

---

## 💡 Pro Tips

1. **Always** publish intro lessons as "Free" to attract students
2. **Group** related lessons in one topic (5-10 lessons max)
3. **Test** lesson playback before publishing
4. **Use** TEXT lessons for quick announcements
5. **Set** accurate durations for better UX
6. **Write** clear descriptions for SEO
7. **Order** topics logically (beginner → advanced)

---

## 🎉 You're Ready!

Bookmark this page for quick reference while building course content!

**Need more details?** Check the full documentation files above.

**Happy Teaching!** 📚✨
