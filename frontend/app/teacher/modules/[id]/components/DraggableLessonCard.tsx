'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { LessonCard } from './LessonCard';

interface DraggableLessonCardProps {
  lesson: any;
  index: number;
  onEdit: (lesson: any) => void;
  onDelete: (lessonId: string) => void;
  onTogglePublish: (lessonId: string) => void;
}

export function DraggableLessonCard({
  lesson,
  index,
  onEdit,
  onDelete,
  onTogglePublish,
}: DraggableLessonCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative flex items-center group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 rounded hover:bg-gray-100 transition-colors mr-2 opacity-0 group-hover:opacity-100"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Lesson Card */}
      <div className="flex-1">
        <LessonCard
          lesson={lesson}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePublish={onTogglePublish}
        />
      </div>
    </div>
  );
}
