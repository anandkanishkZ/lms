# Rich Text Editor Component

## Overview
A comprehensive, reusable Rich Text Editor component built with TipTap that can be used across the LMS platform for various content creation needs.

## Features

### ✅ Text Formatting
- **Bold** (Ctrl+B)
- *Italic* (Ctrl+I)
- <u>Underline</u> (Ctrl+U)
- ~~Strikethrough~~
- `Code`

### ✅ Headings
- Heading 1 (H1)
- Heading 2 (H2)
- Heading 3 (H3)

### ✅ Lists
- Bullet lists
- Numbered lists

### ✅ Alignment
- Align left
- Align center
- Align right
- Justify

### ✅ Media & Links
- Insert images (via URL)
- Add hyperlinks
- Link management (edit/remove)

### ✅ Colors & Highlighting
- Text color customization
- Text highlighting with custom colors

### ✅ Other
- Blockquotes
- Horizontal rules
- Undo/Redo

## Installation

Already installed! The following packages are included:
```bash
@tiptap/react
@tiptap/starter-kit
@tiptap/extension-image
@tiptap/extension-link
@tiptap/extension-text-align
@tiptap/extension-underline
@tiptap/extension-color
@tiptap/extension-text-style
@tiptap/extension-highlight
```

## Usage

### 1. RichTextEditor (Editable)

```tsx
import { RichTextEditor } from '@/components/RichTextEditor';
import { useState } from 'react';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start typing..."
      editable={true}
      minHeight="200px"
      maxHeight="600px"
    />
  );
}
```

### 2. RichTextViewer (Read-only)

```tsx
import { RichTextViewer } from '@/components/RichTextEditor';

function MyComponent({ savedContent }) {
  return (
    <RichTextViewer
      content={savedContent}
      className="p-4"
    />
  );
}
```

## Props

### RichTextEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | - | HTML content of the editor (required) |
| `onChange` | `(content: string) => void` | - | Callback when content changes (required) |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text |
| `editable` | `boolean` | `true` | Whether editor is editable |
| `minHeight` | `string` | `'200px'` | Minimum editor height |
| `maxHeight` | `string` | `'600px'` | Maximum editor height |
| `className` | `string` | `''` | Additional CSS classes |

### RichTextViewer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | - | HTML content to display (required) |
| `className` | `string` | `''` | Additional CSS classes |

## Use Cases in LMS

### 1. ✅ Lesson Content (TEXT Type)
```tsx
// In LessonFormModal.tsx
<RichTextEditor
  content={lessonData.content}
  onChange={(html) => setLessonData({ ...lessonData, content: html })}
  placeholder="Write your lesson content here..."
  minHeight="400px"
/>
```

### 2. ✅ Topic Descriptions
```tsx
// In TopicFormModal.tsx
<RichTextEditor
  content={formData.description}
  onChange={(html) => setFormData({ ...formData, description: html })}
  placeholder="Describe this topic..."
  minHeight="150px"
/>
```

### 3. ✅ Assignment Instructions
```tsx
// In AssignmentBuilder.tsx
<RichTextEditor
  content={assignment.instructions}
  onChange={(html) => setAssignment({ ...assignment, instructions: html })}
  placeholder="Provide assignment instructions..."
  minHeight="300px"
/>
```

### 4. ✅ Exam Questions
```tsx
// In QuizBuilder.tsx
<RichTextEditor
  content={question.text}
  onChange={(html) => updateQuestion(question.id, { text: html })}
  placeholder="Enter question..."
  minHeight="200px"
/>
```

### 5. ✅ Announcements
```tsx
// In AnnouncementForm.tsx
<RichTextEditor
  content={announcement.message}
  onChange={(html) => setAnnouncement({ ...announcement, message: html })}
  placeholder="Write announcement..."
  minHeight="250px"
/>
```

### 6. ✅ Discussion Forum Posts
```tsx
// In ForumPostEditor.tsx
<RichTextEditor
  content={post.content}
  onChange={setPostContent}
  placeholder="Share your thoughts..."
  minHeight="300px"
/>
```

### 7. ✅ Student Submissions
```tsx
// In AssignmentSubmission.tsx
<RichTextEditor
  content={submission.answer}
  onChange={(html) => setSubmission({ ...submission, answer: html })}
  placeholder="Write your answer..."
  minHeight="400px"
/>
```

### 8. ✅ Module Descriptions
```tsx
// In ModuleForm.tsx
<RichTextEditor
  content={moduleData.description}
  onChange={(html) => setModuleData({ ...moduleData, description: html })}
  placeholder="Describe this module..."
  minHeight="200px"
/>
```

## Displaying Content (Read-only)

Use `RichTextViewer` to display saved content:

```tsx
// Student viewing lesson
<RichTextViewer
  content={lesson.content}
  className="lesson-content"
/>

// Displaying assignment instructions
<RichTextViewer
  content={assignment.instructions}
/>
```

## Keyboard Shortcuts

- **Bold**: Ctrl+B / Cmd+B
- **Italic**: Ctrl+I / Cmd+I
- **Underline**: Ctrl+U / Cmd+U
- **Undo**: Ctrl+Z / Cmd+Z
- **Redo**: Ctrl+Y / Cmd+Shift+Z
- **Select All**: Ctrl+A / Cmd+A

## Styling

The editor comes with pre-configured styles in `RichTextEditor.css`:
- Professional typography
- Responsive images
- Syntax-highlighted code blocks
- Styled lists, quotes, and tables
- Clean color palette

## Data Storage

Content is stored as **HTML strings** in the database:

```typescript
// Backend Prisma Schema
model Lesson {
  id      String  @id @default(cuid())
  title   String
  content String  @db.Text  // Rich HTML content
  type    String  // 'TEXT', 'VIDEO', etc.
}
```

## Advanced Features (Future)

### File Upload (Coming Soon)
- Drag & drop images
- Upload to cloud storage
- Automatic image optimization

### Collaboration (Coming Soon)
- Real-time collaborative editing
- Multiple cursors
- Change tracking

### Templates (Coming Soon)
- Pre-designed content templates
- Reusable content blocks

## Performance Optimization

✅ **Lazy Loading**: Editor only loads when needed
✅ **Debounced Updates**: Content changes are debounced
✅ **Memoization**: Component re-renders optimized
✅ **Code Splitting**: TipTap extensions loaded separately

## Browser Support

✅ Chrome (Latest)
✅ Firefox (Latest)
✅ Safari (Latest)
✅ Edge (Latest)

## Troubleshooting

### Issue: Editor not appearing
**Solution**: Make sure the parent component is a Client Component (`'use client'`)

### Issue: Content not updating
**Solution**: Ensure `onChange` callback is properly updating state

### Issue: Toolbar buttons not working
**Solution**: Check that `editable={true}` prop is set

## Examples

### Example 1: Basic Usage
```tsx
'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function BlogPost() {
  const [content, setContent] = useState('<p>Hello world!</p>');

  return (
    <div>
      <h1>Create Blog Post</h1>
      <RichTextEditor
        content={content}
        onChange={setContent}
      />
    </div>
  );
}
```

### Example 2: With Form
```tsx
'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function LessonForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save formData to backend
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Lesson Title"
      />
      
      <RichTextEditor
        content={formData.content}
        onChange={(html) => setFormData({ ...formData, content: html })}
        placeholder="Write lesson content..."
      />
      
      <button type="submit">Save Lesson</button>
    </form>
  );
}
```

### Example 3: Read-only Display
```tsx
'use client';

import { RichTextViewer } from '@/components/RichTextEditor';

export default function LessonDisplay({ lesson }) {
  return (
    <div className="lesson-container">
      <h1>{lesson.title}</h1>
      <RichTextViewer content={lesson.content} />
    </div>
  );
}
```

## Component Structure

```
frontend/src/components/RichTextEditor/
├── RichTextEditor.tsx      # Main editable component
├── RichTextViewer.tsx      # Read-only viewer
├── RichTextEditor.css      # Styling
└── index.ts                # Exports
```

## Next Steps

1. ✅ Rich Text Editor created
2. ⏳ Integrate into LessonFormModal
3. ⏳ Integrate into TopicFormModal
4. ⏳ Add file upload capability
5. ⏳ Create Quiz Builder with RTE
6. ⏳ Create Assignment Builder with RTE

---

**Created**: October 19, 2025
**Status**: ✅ Ready to Use
**Location**: `frontend/src/components/RichTextEditor/`
