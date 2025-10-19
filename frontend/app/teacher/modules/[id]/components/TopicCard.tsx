'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Copy, 
  Plus, 
  Clock, 
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { Lesson } from '@/services/lesson-api.service';
import { LessonCard } from './LessonCard';

interface Topic {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  orderIndex: number;
  duration?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    lessons: number;
  };
  lessons?: Lesson[];
}

interface TopicCardProps {
  topic: Topic;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topicId: string) => void;
  onDuplicate: (topicId: string) => void;
  onAddLesson: (topicId: string) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onTogglePublishLesson: (lessonId: string) => void;
}

export function TopicCard({
  topic,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onDuplicate,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onTogglePublishLesson,
}: TopicCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const lessonCount = topic._count?.lessons || topic.lessons?.length || 0;
  const publishedLessons = topic.lessons?.filter(l => l.isPublished).length || 0;
  const totalDuration = topic.duration || 0;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Topic Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Expand/Collapse Button */}
          <button
            onClick={onToggleExpand}
            className="mt-1 p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={lessonCount === 0}
          >
            {lessonCount === 0 ? (
              <div className="w-5 h-5" />
            ) : isExpanded ? (
              <ChevronDown size={20} className="text-gray-600" />
            ) : (
              <ChevronRight size={20} className="text-gray-600" />
            )}
          </button>

          {/* Topic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {topic.title}
                  </h3>
                  {!topic.isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      <EyeOff size={12} />
                      Draft
                    </span>
                  )}
                </div>
                {topic.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{topic.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <FileText size={16} />
                    <span>{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</span>
                    {lessonCount > 0 && (
                      <span className="text-gray-400">
                        ({publishedLessons} published)
                      </span>
                    )}
                  </div>
                  {totalDuration > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>
                        {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isHovered && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAddLesson(topic.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Add Lesson"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(topic)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Topic"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDuplicate(topic.id)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Duplicate Topic"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(topic.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Topic"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      {isExpanded && topic.lessons && (
        <div className="border-t border-gray-200 bg-gray-50">
          {topic.lessons.length === 0 ? (
            <div className="p-8 text-center">
              <FileText size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-4">No lessons in this topic yet</p>
              <button
                onClick={() => onAddLesson(topic.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add First Lesson
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {topic.lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  onEdit={onEditLesson}
                  onDelete={onDeleteLesson}
                  onTogglePublish={onTogglePublishLesson}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
