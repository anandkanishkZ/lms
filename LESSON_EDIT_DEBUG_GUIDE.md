# Lesson Edit Debugging Guide

**Date**: October 19, 2025  
**Issue**: Verifying lesson edit functionality  
**Status**: 🔍 DEBUGGING IN PROGRESS

---

## 🎯 What to Test

### Test Case 1: Click Edit Button
1. Open browser console (F12)
2. Navigate to a module with lessons
3. Expand a topic
4. Hover over a lesson (buttons should appear)
5. Click the **Edit button** (✏️)

**Expected Console Logs**:
```
🔍 handleEditLesson called with: {id: "xxx", title: "...", ...}
📝 Topic ID: xxx
✅ Modal state set
🎨 LessonFormModal rendered with: {topicId: "xxx", lesson: "xxx", lessonTitle: "..."}
🔄 useEffect triggered, lesson: xxx
✏️ Editing mode - populating form with: [lesson title]
```

**Expected UI Behavior**:
- ✅ Modal should open
- ✅ Modal title should say "Edit Lesson" (not "Add New Lesson")
- ✅ All form fields should be populated with lesson data
- ✅ Lesson type should be pre-selected (cannot change when editing)
- ✅ For TEXT lessons: Rich Text Editor should show content

---

## 🐛 Possible Issues & Solutions

### Issue 1: Console shows "handleEditLesson called" but no modal

**Diagnosis**: Modal rendering condition failing

**Check**:
```typescript
// Modal only renders when BOTH are true:
showLessonModal && selectedTopicForLesson
```

**Solution**: Verify both states are being set in handleEditLesson

---

### Issue 2: Modal opens but form is empty

**Diagnosis**: Lesson data not being passed or useEffect not running

**Check Console For**:
- `🎨 LessonFormModal rendered with:` - should show lesson ID
- `✏️ Editing mode - populating form with:` - should show lesson title

**Solution**: Check if `lesson` prop is undefined

---

### Issue 3: Modal shows but Rich Text Editor is empty (for TEXT lessons)

**Diagnosis**: Content not syncing to TipTap editor

**Check**:
- `formData.content` has value
- TipTap useEffect runs: `if (editor && content !== editor.getHTML())`

**Solution**: Add more logging to RichTextEditor component

---

### Issue 4: Edit button doesn't do anything (no console logs)

**Diagnosis**: onClick handler not connected

**Check**:
- LessonCard: `<button onClick={() => onEdit(lesson)}>`
- TopicCard: `<LessonCard onEdit={onEditLesson} />`
- TopicsLessonsTab: `<TopicCard onEditLesson={handleEditLesson} />`

**Solution**: Verify prop drilling is correct

---

### Issue 5: Buttons don't appear on hover

**Diagnosis**: `isHovered` state not working

**Check**:
```tsx
{isHovered && (
  <div className="flex items-center gap-1">
    <button onClick={() => onEdit(lesson)}>...</button>
  </div>
)}
```

**Solution**: Remove hover condition temporarily for testing

---

## 🔧 Quick Debugging Commands

### Check if lesson data is available
```javascript
// In browser console, after clicking lesson
console.log('Lesson data:', selectedLesson);
```

### Check modal visibility
```javascript
// Should be true when modal is open
console.log('Show modal:', showLessonModal);
console.log('Selected topic:', selectedTopicForLesson);
```

### Check form data
```javascript
// In LessonFormModal
console.log('Form data:', formData);
console.log('Selected type:', selectedType);
```

---

## 📊 Debug Checklist

- [ ] Console shows "🔍 handleEditLesson called"
- [ ] Console shows lesson ID and title
- [ ] Console shows "✅ Modal state set"
- [ ] Console shows "🎨 LessonFormModal rendered"
- [ ] Console shows "✏️ Editing mode - populating form"
- [ ] Modal appears on screen
- [ ] Modal title is "Edit Lesson"
- [ ] Title field is populated
- [ ] Description field is populated (if exists)
- [ ] Duration field is populated (if exists)
- [ ] Type-specific fields are populated
- [ ] Rich Text Editor shows content (for TEXT lessons)
- [ ] Can make changes to form
- [ ] Can save changes successfully

---

## 🎨 Visual Debugging

### What You Should See:

1. **Before Hover**:
   ```
   [1] [Icon] Lesson Title          [Type Badge]
                                     21 min  0 views
   ```

2. **On Hover**:
   ```
   [1] [Icon] Lesson Title          [Type Badge]  [👁️] [✏️] [🗑️]
                                     21 min  0 views
   ```

3. **After Clicking Edit**:
   ```
   [MODAL APPEARS]
   ┌─────────────────────────────────┐
   │ Edit Lesson                  [X]│
   ├─────────────────────────────────┤
   │ [Lesson type cannot be changed] │
   │                                 │
   │ Title: [Populated]              │
   │ Description: [Populated]        │
   │ Duration: [Populated]           │
   │ [Type-specific fields]          │
   │                                 │
   │         [Cancel]  [Save]        │
   └─────────────────────────────────┘
   ```

---

## 🚀 Quick Fix Options

### Option 1: Remove Hover Requirement (Testing)
```typescript
// In LessonCard.tsx
// BEFORE:
{isHovered && (
  <div>buttons</div>
)}

// AFTER (for testing):
<div>buttons</div>
```

### Option 2: Add Click Handler to Entire Card
```typescript
<div 
  onClick={() => onEdit(lesson)}
  className="cursor-pointer ..."
>
```

### Option 3: Always Show Buttons (No Hover)
```typescript
// Remove isHovered condition completely
<div className="flex items-center gap-1">
  {/* buttons always visible */}
</div>
```

---

## 📝 Test Results

### Test 1: Click Edit Button
- Date/Time: _______________
- Browser: _______________
- Console Logs Seen: _______________
- Modal Appeared: [ ] Yes [ ] No
- Form Populated: [ ] Yes [ ] No
- Issues Found: _______________

### Test 2: Edit TEXT Lesson
- Rich Text Editor Loaded: [ ] Yes [ ] No
- Content Displayed: [ ] Yes [ ] No
- Can Edit Content: [ ] Yes [ ] No
- Issues Found: _______________

### Test 3: Edit VIDEO Lesson
- Video URL Populated: [ ] Yes [ ] No
- Can Change URL: [ ] Yes [ ] No
- Can Save: [ ] Yes [ ] No
- Issues Found: _______________

---

## 🔍 Advanced Debugging

### Enable React DevTools
1. Install React DevTools extension
2. Open Components tab
3. Find `LessonFormModal`
4. Check props: `lesson`, `topicId`
5. Check state: `formData`, `selectedType`

### Check Network Tab
1. Open Network tab
2. Click Edit
3. Look for any failed API calls
4. Check if lesson data was fetched

### Check for JavaScript Errors
1. Open Console tab
2. Look for red errors
3. Common errors:
   - Cannot read property 'x' of undefined
   - Cannot find module
   - Unexpected token

---

## 💡 Common Solutions

### If modal doesn't open:
```typescript
// Add to handleEditLesson
const handleEditLesson = (lesson: Lesson) => {
  console.log('EDIT CLICKED', lesson);
  setTimeout(() => {
    setSelectedTopicForLesson(lesson.topicId);
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  }, 0);
};
```

### If form is empty:
```typescript
// Ensure lesson prop is passed correctly
<LessonFormModal
  key={selectedLesson?.id || `new-${Date.now()}`}  // Force remount
  lesson={selectedLesson}
  // ...
/>
```

### If Rich Text Editor is empty:
```typescript
// Add to RichTextEditor
useEffect(() => {
  console.log('RTE content changed:', content);
  if (editor && content !== editor.getHTML()) {
    console.log('Setting RTE content');
    editor.commands.setContent(content || '');
  }
}, [content, editor]);
```

---

## 📞 Next Steps

1. **Open browser console**
2. **Click edit button on any lesson**
3. **Share the console logs**
4. **Share screenshot of what happens (or doesn't happen)**
5. **Report any errors you see**

Then we can identify the exact issue and fix it!

---

**Status**: 🔍 AWAITING TEST RESULTS  
**Action Required**: User to test and share console logs
