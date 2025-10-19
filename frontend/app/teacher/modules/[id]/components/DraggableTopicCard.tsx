'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TopicCard } from './TopicCard';

interface DraggableTopicCardProps {
  topic: any;
  onEdit: (topic: any) => void;
  onDelete: (topicId: string) => void;
  onDuplicate: (topicId: string) => void;
  onToggleExpand: () => void;
  onAddLesson: (topicId: string) => void;
  onEditLesson: (lesson: any) => void;
  onDeleteLesson: (lessonId: string) => void;
  onTogglePublishLesson: (lessonId: string) => void;
  onReorderLessons?: (topicId: string, lessons: { id: string; orderIndex: number }[]) => Promise<void>;
  isExpanded: boolean;
}

export function DraggableTopicCard({
  topic,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleExpand,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onTogglePublishLesson,
  onReorderLessons,
  isExpanded,
}: DraggableTopicCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-6 cursor-grab active:cursor-grabbing z-10 p-1 rounded hover:bg-gray-100 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>

      {/* Topic Card with left padding for drag handle */}
      <div className="pl-8">
        <TopicCard
          topic={topic}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onToggleExpand={onToggleExpand}
          onAddLesson={onAddLesson}
          onEditLesson={onEditLesson}
          onDeleteLesson={onDeleteLesson}
          onTogglePublishLesson={onTogglePublishLesson}
          onReorderLessons={onReorderLessons}
          isExpanded={isExpanded}
        />
      </div>
    </div>
  );
}
