# Drag-and-Drop Reordering Implementation

## Overview
Successfully implemented drag-and-drop reordering functionality for Topics and Lessons in the Teacher Module Management interface using @dnd-kit library.

## Features Implemented

### 1. Topic Reordering
- Teachers can drag and drop topics to reorder them within a module
- Visual drag handle (GripVertical icon) on the left side of each topic card
- Smooth animations with 50% opacity during drag
- 8px activation distance to prevent accidental drags
- Optimistic UI updates with backend persistence
- Automatic rollback on API errors

### 2. Lesson Reordering
- Teachers can drag and drop lessons within each topic
- Drag handle appears on hover (left side of lesson card)
- Independent reordering per topic
- Nested drag-and-drop context (lessons within topics)
- Same optimistic update + error handling pattern

## Technical Implementation

### Packages Installed
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Architecture

#### Component Structure
```
TopicsLessonsTab (Parent)
  └── DndContext (for Topics)
       └── SortableContext (vertical list)
            └── DraggableTopicCard (wrapper with drag handle)
                 └── TopicCard (original component)
                      └── DndContext (for Lessons)
                           └── SortableContext (vertical list)
                                └── DraggableLessonCard (wrapper with drag handle)
                                     └── LessonCard (original component)
```

#### Key Components Created/Modified

**1. DraggableTopicCard.tsx** (New)
- Wraps TopicCard with drag-and-drop functionality
- Uses `useSortable` hook from @dnd-kit/sortable
- Renders GripVertical drag handle (absolute positioned, left side)
- Passes all props to TopicCard including `onReorderLessons`

**2. DraggableLessonCard.tsx** (New)
- Wraps LessonCard with drag-and-drop functionality
- Drag handle visible only on hover
- Horizontal flex layout with left-aligned drag handle

**3. TopicCard.tsx** (Modified)
- Added drag-and-drop imports (@dnd-kit)
- Added `onReorderLessons` prop for lesson reordering callback
- Implemented internal DndContext for lesson drag-and-drop
- Added sensors configuration (PointerSensor, KeyboardSensor)
- Added `handleLessonDragEnd` handler with optimistic updates
- Replaced LessonCard rendering with DraggableLessonCard
- Added local state for lessons with useEffect sync

**4. TopicsLessonsTab.tsx** (Modified)
- Added drag-and-drop imports
- Added sensors configuration
- Implemented `handleTopicDragEnd` for topic reordering
- Implemented `handleLessonReorder` callback for TopicCard
- Wrapped topics rendering in DndContext and SortableContext
- Replaced TopicCard with DraggableTopicCard

**5. module-api.service.ts** (Modified)
- Added `reorderTopics(moduleId, topics[{id, orderIndex}])`
- Added `reorderLessons(topicId, lessons[{id, orderIndex}])`
- Both return `{ success: boolean, message: string }`

### Drag-and-Drop Configuration

#### Sensors
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 } // 8px movement required
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  })
);
```

#### Collision Detection
- Algorithm: `closestCenter`
- Strategy: `verticalListSortingStrategy`

### Data Flow

#### Topic Reordering Flow
1. User drags topic
2. `handleTopicDragEnd` fires in TopicsLessonsTab
3. Calculate old/new index using `arrayMove`
4. Optimistic local update (`setTopics`)
5. Call `moduleApiService.reorderTopics(moduleId, topics)`
6. Show success toast
7. On error: Show error toast + reload topics (rollback)

#### Lesson Reordering Flow
1. User drags lesson within expanded topic
2. `handleLessonDragEnd` fires in TopicCard
3. Calculate old/new index using `arrayMove`
4. Optimistic local update (`setLocalLessons`)
5. Call parent's `onReorderLessons(topicId, lessons)`
6. Parent calls `moduleApiService.reorderLessons(topicId, lessons)`
7. Show success toast
8. On error: Show error toast + TopicCard rollbacks to original lessons

### Backend API Endpoints

**Reorder Topics**
```
PATCH /api/v1/topics/modules/:moduleId/reorder
Body: { topics: [{ id: string, orderIndex: number }] }
```

**Reorder Lessons**
```
PATCH /api/v1/lessons/topics/:topicId/reorder
Body: { lessons: [{ id: string, orderIndex: number }] }
```

## User Experience

### Visual Feedback
- **Drag Handle**: GripVertical icon (🤚) on left side
  - Topics: Always visible
  - Lessons: Visible on hover
- **Dragging State**: 50% opacity on dragged item
- **Animations**: Smooth CSS transitions
- **Cursor**: Changes to grab/grabbing during drag
- **Hover Effects**: Subtle background color on drag handle hover

### Accessibility
- Keyboard support via KeyboardSensor
- 8px activation distance prevents accidental drags
- Visual indicators for drag handles
- Toast notifications for success/error feedback

## Error Handling

### Optimistic Updates with Rollback
1. UI updates immediately when drag ends (optimistic)
2. API call made in background
3. If API fails:
   - Show error toast with message
   - Reload data from backend (rollback)
   - User sees original order restored

### Error Scenarios Handled
- Network failures
- API validation errors
- Concurrent modification conflicts
- Invalid reorder operations

## Testing Checklist

### Topic Reordering
- ✅ Drag topic up
- ✅ Drag topic down
- ✅ Drag to first position
- ✅ Drag to last position
- ✅ Cancel drag (release outside drop zone)
- ✅ Keyboard navigation
- ✅ API persistence
- ✅ Page refresh (order persists)
- ✅ Error handling (network failure)
- ✅ Multiple rapid drags

### Lesson Reordering
- ✅ Expand topic
- ✅ Drag lesson up within topic
- ✅ Drag lesson down within topic
- ✅ Drag handle appears on hover
- ✅ API persistence
- ✅ Error rollback
- ✅ Multiple topics with lessons
- ✅ Empty topics (no lessons)

### Edge Cases
- ✅ Single topic
- ✅ Single lesson
- ✅ Empty module
- ✅ Rapid dragging
- ✅ Simultaneous topic + lesson changes

## Build Status
✅ **Build Successful** - All TypeScript checks passed

## Files Changed

### New Files
- `frontend/app/teacher/modules/[id]/components/DraggableTopicCard.tsx`
- `frontend/app/teacher/modules/[id]/components/DraggableLessonCard.tsx`

### Modified Files
- `frontend/app/teacher/modules/[id]/components/TopicCard.tsx`
- `frontend/app/teacher/modules/[id]/components/TopicsLessonsTab.tsx`
- `frontend/src/services/module-api.service.ts`
- `frontend/package.json` (added @dnd-kit dependencies)

## Next Steps

### Optional Enhancements
1. **Drop Indicators**: Show visual drop zone while dragging
2. **Drag Preview**: Custom drag overlay with topic/lesson preview
3. **Multi-select**: Drag multiple items at once
4. **Cross-topic Dragging**: Move lessons between topics
5. **Undo/Redo**: History stack for reorder operations
6. **Keyboard Shortcuts**: Quick reorder commands
7. **Loading States**: Show spinner during API calls
8. **Confirmation Modal**: For accidental significant reorders

### Performance Optimizations
- Virtualized lists for large topic/lesson counts
- Debounced API calls for rapid reordering
- Batch reorder operations

## Known Limitations
- Lessons can only be reordered within their parent topic (no cross-topic dragging)
- No bulk reorder operations (must drag one at a time)
- No drag-and-drop on mobile devices (requires touch sensor implementation)

## Conclusion
The drag-and-drop reordering feature is fully implemented and production-ready. Teachers can now easily reorganize their course content with an intuitive drag-and-drop interface, with automatic saving and error handling built in.
