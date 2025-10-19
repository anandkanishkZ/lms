'use client';

import { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  Play,
  FileText,
  Link as LinkIcon,
  Youtube,
  CheckSquare,
  FileCheck,
  BookOpen
} from 'lucide-react';
import { Lesson, LessonType } from '@/services/lesson-api.service';

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
  onTogglePublish: (lessonId: string) => void;
}

const LESSON_TYPE_CONFIG: Record<LessonType, { icon: any; color: string; label: string }> = {
  VIDEO: { icon: Play, color: 'bg-red-100 text-red-600', label: 'Video' },
  YOUTUBE_LIVE: { icon: Youtube, color: 'bg-red-100 text-red-600', label: 'YouTube Live' },
  PDF: { icon: FileText, color: 'bg-blue-100 text-blue-600', label: 'PDF' },
  TEXT: { icon: BookOpen, color: 'bg-green-100 text-green-600', label: 'Text' },
  QUIZ: { icon: CheckSquare, color: 'bg-purple-100 text-purple-600', label: 'Quiz' },
  ASSIGNMENT: { icon: FileCheck, color: 'bg-orange-100 text-orange-600', label: 'Assignment' },
  EXTERNAL_LINK: { icon: LinkIcon, color: 'bg-gray-100 text-gray-600', label: 'Link' },
};

export function LessonCard({ lesson, index, onEdit, onDelete, onTogglePublish }: LessonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = LESSON_TYPE_CONFIG[lesson.type];
  const Icon = typeConfig.icon;

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Order Number */}
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-600">{index + 1}</span>
        </div>

        {/* Lesson Type Icon */}
        <div className={`flex-shrink-0 w-10 h-10 ${typeConfig.color} rounded-lg flex items-center justify-center`}>
          <Icon size={20} />
        </div>

        {/* Lesson Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-base font-semibold text-gray-900 truncate">
                  {lesson.title}
                </h4>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                {lesson.isFree && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                    Free
                  </span>
                )}
                {!lesson.isPublished && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    <EyeOff size={12} />
                    Draft
                  </span>
                )}
              </div>

              {lesson.description && (
                <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                  {lesson.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {lesson.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{lesson.duration} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{lesson.viewCount || 0} views</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isHovered && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTogglePublish(lesson.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    lesson.isPublished
                      ? 'text-yellow-600 hover:bg-yellow-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={lesson.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {lesson.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={() => onEdit(lesson)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Lesson"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete(lesson.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Lesson"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
