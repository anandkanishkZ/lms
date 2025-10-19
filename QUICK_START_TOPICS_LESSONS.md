# Quick Start Guide - Topics & Lessons Management

## 🚀 Getting Started

### Starting the Application

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

---

## 📍 Navigation

1. Login as teacher: `http://localhost:3000/teacher/login`
2. Go to Modules: `http://localhost:3000/teacher/modules`
3. Click on any module
4. Click "Topics & Lessons" tab

---

## 🎯 Common Tasks

### 1️⃣ Create Your First Topic

```
Step 1: Click "Add Topic" button (top right)
Step 2: Fill the form:
        ┌──────────────────────────────────┐
        │ Topic Title *                    │
        │ Introduction to React            │
        │                                  │
        │ Description                      │
        │ Learn React fundamentals...      │
        │                                  │
        │ ☑ Publish this topic immediately │
        └──────────────────────────────────┘
Step 3: Click "Create Topic"
Step 4: ✅ Topic appears in list!
```

---

### 2️⃣ Add a Video Lesson

```
Step 1: Click the ➕ icon on your topic
Step 2: Select "Video" type
Step 3: Fill the form:
        ┌──────────────────────────────────┐
        │ Lesson Title *                   │
        │ What is React?                   │
        │                                  │
        │ Description                      │
        │ Introduction to React library... │
        │                                  │
        │ Duration (minutes)               │
        │ 15                               │
        │                                  │
        │ Video URL *                      │
        │ https://cdn.example.com/vid.mp4  │
        │                                  │
        │ ☑ Free preview lesson            │
        │ ☑ Publish this lesson immediately│
        └──────────────────────────────────┘
Step 4: Click "Create Lesson"
Step 5: ✅ Lesson appears under topic!
```

---

### 3️⃣ Add a Text Lesson

```
Step 1: Click ➕ on topic
Step 2: Select "Text Content" type
Step 3: Fill the form:
        ┌──────────────────────────────────┐
        │ Lesson Title *                   │
        │ React Components Overview        │
        │                                  │
        │ Content                          │
        │ ┌──────────────────────────────┐ │
        │ │ React components are the     │ │
        │ │ building blocks of any React │ │
        │ │ application...               │ │
        │ └──────────────────────────────┘ │
        └──────────────────────────────────┘
Step 4: Click "Create Lesson"
```

---

### 4️⃣ Manage Lessons

**View Lessons:**
- Click the ▶ icon next to topic title
- Lessons expand below topic

**Edit Lesson:**
- Hover over lesson card
- Click ✏ (Edit) icon
- Update fields
- Click "Update Lesson"

**Toggle Publish Status:**
- Hover over lesson card
- Click 👁 (Eye) icon
- Instantly published/unpublished!

**Delete Lesson:**
- Hover over lesson card
- Click 🗑 (Trash) icon
- Confirm deletion
- Lesson removed

---

### 5️⃣ Manage Topics

**Edit Topic:**
- Hover over topic card
- Click ✏ (Edit) icon
- Update title/description
- Click "Update Topic"

**Duplicate Topic:**
- Hover over topic card
- Click 📋 (Copy) icon
- Copy created with " (Copy)" suffix
- All lessons duplicated!

**Delete Topic:**
- Hover over topic card
- Click 🗑 (Trash) icon
- Confirm deletion
- Topic and ALL lessons removed!

---

## 🎨 Lesson Types Reference

| Type | Icon | Use Case | Required Fields |
|------|------|----------|----------------|
| **Video** | 🎬 | Upload/link video files | Title, Video URL |
| **YouTube Live** | ▶️ | Embed YouTube videos | Title, YouTube Video ID |
| **PDF** | 📄 | Upload PDF documents | Title (upload coming soon) |
| **Text** | 📖 | Rich text content | Title, Content |
| **Quiz** | ☑️ | Interactive quizzes | Title (builder coming soon) |
| **Assignment** | 📋 | Student submissions | Title (builder coming soon) |
| **External Link** | 🔗 | Link to resources | Title, URL |

---

## 📊 Understanding the Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Topics & Lessons                      [Add Topic]      │
│  Manage course content for Module Name                  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┐              │
│ │ Topics  │ Lessons │Duration │Completion│              │
│ │   10    │   45    │  12h    │    0%   │              │
│ │8 pub.   │         │  30m    │         │              │
│ └─────────┴─────────┴─────────┴─────────┘              │
└─────────────────────────────────────────────────────────┘

Stats Explained:
- Topics: Total topics (published count)
- Lessons: Total lessons across all topics
- Duration: Total content time
- Completion: Average student progress (future)
```

---

## 🎓 Best Practices

### Topic Organization
✅ **DO:**
- Use clear, descriptive topic titles
- Group related lessons together
- Order topics logically (beginner → advanced)
- Keep topics focused on one concept

❌ **DON'T:**
- Create too many topics (10-15 max per module)
- Mix unrelated content in one topic
- Leave topics without descriptions

### Lesson Creation
✅ **DO:**
- Write clear lesson titles (action-oriented)
- Add descriptions for context
- Set accurate durations
- Mark intro lessons as "Free preview"
- Start with TEXT or VIDEO lessons

❌ **DON'T:**
- Create lessons longer than 30 minutes
- Publish incomplete lessons
- Forget to add duration for videos
- Use all caps in titles

### Publishing Strategy
✅ **DO:**
- Draft all content first
- Review before publishing
- Publish in batches (topic by topic)
- Test lesson playback before publishing

❌ **DON'T:**
- Publish everything at once
- Publish without testing
- Leave half-empty topics published

---

## 🔧 Troubleshooting

### "Failed to load topics"
**Solution:**
1. Check backend is running (port 5000)
2. Check teacher_token in localStorage
3. Verify you're logged in as teacher
4. Check browser console for errors

### "Failed to create lesson"
**Solution:**
1. Check required fields are filled
2. For VIDEO: Ensure valid URL
3. For YOUTUBE_LIVE: Use video ID only (not full URL)
4. Check duration is a positive number

### Lessons not appearing
**Solution:**
1. Click the ▶ icon to expand topic
2. Wait for lessons to load (lazy loading)
3. Check if topic has any lessons
4. Refresh the page

### Can't see "Add Topic" button
**Solution:**
1. Verify you're on "Topics & Lessons" tab
2. Check you own this module
3. Verify teacher permissions

---

## 🎯 Example: Complete Topic Setup

**Goal:** Create "Introduction to React" topic with 5 lessons

**Step 1: Create Topic**
```
Title: Introduction to React
Description: Learn the fundamentals of React library
☑ Publish
```

**Step 2: Add Lessons**

**Lesson 1 (TEXT - Free Preview):**
```
Type: Text Content
Title: Welcome to React Course
Content: In this course, you'll learn...
☑ Free preview
☑ Publish
```

**Lesson 2 (YOUTUBE_LIVE - Free Preview):**
```
Type: YouTube Live
Title: What is React?
YouTube Video ID: abc123xyz
Duration: 10
☑ Free preview
☑ Publish
```

**Lesson 3 (VIDEO):**
```
Type: Video
Title: Setting Up React Environment
Video URL: https://cdn.example.com/setup.mp4
Duration: 15
□ Free preview (NOT free)
☑ Publish
```

**Lesson 4 (TEXT):**
```
Type: Text Content
Title: React Components Explained
Content: Components are the building blocks...
Duration: 20
□ Free preview
☑ Publish
```

**Lesson 5 (ASSIGNMENT):**
```
Type: Assignment
Title: Build Your First Component
Description: Create a simple React component
Duration: 30
□ Free preview
☑ Publish
(Builder coming soon - use placeholder)
```

**Step 3: Review**
- Expand topic
- Check all 5 lessons appear
- Verify 2 lessons have "Free" badge
- Check total duration is correct (75 min)

**Step 4: Test**
- Toggle publish on Lesson 4 (unpublish)
- Edit Lesson 2 (update duration)
- Duplicate Lesson 1
- Delete duplicate

**✅ Done!** Your topic is ready for students!

---

## 📱 Keyboard Shortcuts (Future)

Currently all mouse-based. Keyboard shortcuts planned for:
- `N` → New Topic
- `L` → New Lesson
- `E` → Edit selected
- `Delete` → Delete selected
- `Space` → Expand/Collapse
- `P` → Toggle Publish

---

## 🆘 Getting Help

**Common Questions:**

**Q: How many lessons can I add per topic?**
A: No hard limit, but recommend 5-10 for better UX

**Q: Can I reorder lessons?**
A: Drag-and-drop coming in Phase 3. Current order is by creation time.

**Q: Can I move a lesson to another topic?**
A: Not yet. Use duplicate + delete as workaround.

**Q: Can students see draft lessons?**
A: No, only published lessons are visible to students.

**Q: What's the max video duration?**
A: No technical limit, but recommend 30 min max for engagement.

---

## 🎉 You're Ready!

Start creating amazing course content! 🚀

Remember:
- Start with one topic
- Add lessons gradually
- Test before publishing
- Use free previews to attract students
- Keep content organized and focused

Happy teaching! 📚✨
