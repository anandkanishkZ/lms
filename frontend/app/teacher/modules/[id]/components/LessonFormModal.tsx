'use client';

import { useState, useEffect } from 'react';
import { X, Play, Youtube, FileText, BookOpen, CheckSquare, FileCheck, Link as LinkIcon } from 'lucide-react';
import { lessonApiService, Lesson, LessonType, CreateLessonDto } from '@/services/lesson-api.service';
import { toast } from 'react-hot-toast';
import { RichTextEditor } from '../../../../../src/components/RichTextEditor';

interface LessonFormModalProps {
  topicId: string;
  lesson: Lesson | null;
  onClose: () => void;
  onSaved: () => void;
}

const LESSON_TYPES: Array<{ value: LessonType; label: string; icon: any; color: string; description: string }> = [
  { 
    value: 'VIDEO', 
    label: 'Video', 
    icon: Play, 
    color: 'text-red-600',
    description: 'Upload or link to a video file'
  },
  { 
    value: 'YOUTUBE_LIVE', 
    label: 'YouTube Live', 
    icon: Youtube, 
    color: 'text-red-600',
    description: 'Embed a YouTube video or live stream'
  },
  { 
    value: 'PDF', 
    label: 'PDF Document', 
    icon: FileText, 
    color: 'text-blue-600',
    description: 'Upload a PDF file for students to view/download'
  },
  { 
    value: 'TEXT', 
    label: 'Text Content', 
    icon: BookOpen, 
    color: 'text-green-600',
    description: 'Rich text content with formatting'
  },
  { 
    value: 'QUIZ', 
    label: 'Quiz', 
    icon: CheckSquare, 
    color: 'text-purple-600',
    description: 'Interactive quiz to test understanding'
  },
  { 
    value: 'ASSIGNMENT', 
    label: 'Assignment', 
    icon: FileCheck, 
    color: 'text-orange-600',
    description: 'Task for students to submit work'
  },
  { 
    value: 'EXTERNAL_LINK', 
    label: 'External Link', 
    icon: LinkIcon, 
    color: 'text-gray-600',
    description: 'Link to external resources'
  },
];

export function LessonFormModal({ topicId, lesson, onClose, onSaved }: LessonFormModalProps) {
  console.log('🎨 LessonFormModal rendered with:', { topicId, lesson: lesson?.id, lessonTitle: lesson?.title });
  
  const [selectedType, setSelectedType] = useState<LessonType>(lesson?.type || 'TEXT');
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    description: lesson?.description || '',
    duration: lesson?.duration?.toString() || '',
    videoUrl: lesson?.videoUrl || '',
    youtubeVideoId: lesson?.youtubeVideoId || '',
    content: lesson?.content || '',
    isFree: lesson?.isFree ?? false,  // Use ?? instead of || to handle false values
    isPublished: lesson?.isPublished ?? true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔄 useEffect triggered, lesson:', lesson?.id);
    if (lesson) {
      console.log('✏️ Editing mode - populating form with:', lesson.title);
      console.log('📄 Lesson object keys:', Object.keys(lesson));
      console.log('📄 Lesson content value:', lesson.content, 'length:', lesson.content?.length || 0);
      setSelectedType(lesson.type);
      setFormData({
        title: lesson.title,
        description: lesson.description || '',
        duration: lesson.duration?.toString() || '',
        videoUrl: lesson.videoUrl || '',
        youtubeVideoId: lesson.youtubeVideoId || '',
        content: lesson.content || '',
        isFree: lesson.isFree ?? false,  // Use ?? to handle false values properly
        isPublished: lesson.isPublished ?? true,
      });
    } else {
      console.log('➕ Create mode - resetting form');
      // Reset to default values for new lesson
      setSelectedType('TEXT');
      setFormData({
        title: '',
        description: '',
        duration: '',
        videoUrl: '',
        youtubeVideoId: '',
        content: '',
        isFree: false,
        isPublished: true,
      });
    }
  }, [lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    // Validate type-specific fields
    if (selectedType === 'VIDEO' && !formData.videoUrl.trim()) {
      toast.error('Please enter a video URL');
      return;
    }
    if (selectedType === 'YOUTUBE_LIVE' && !formData.youtubeVideoId.trim()) {
      toast.error('Please enter a YouTube video ID');
      return;
    }

    try {
      setLoading(true);

      const data: any = {
        title: formData.title,
        description: formData.description || undefined,
        type: selectedType,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        isFree: formData.isFree,
        isPublished: formData.isPublished,
      };

      // Add type-specific fields
      if (selectedType === 'VIDEO') {
        data.videoUrl = formData.videoUrl;
      } else if (selectedType === 'YOUTUBE_LIVE') {
        data.youtubeVideoId = formData.youtubeVideoId;
      } else if (selectedType === 'TEXT') {
        data.content = formData.content;
      }

      if (lesson) {
        // Update existing lesson
        await lessonApiService.updateLesson(lesson.id, data);
        toast.success('Lesson updated successfully');
      } else {
        // Create new lesson
        data.topicId = topicId;
        await lessonApiService.createLesson(data as CreateLessonDto);
        toast.success('Lesson created successfully');
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'VIDEO':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://example.com/video.mp4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a direct video URL or upload link
            </p>
          </div>
        );

      case 'YOUTUBE_LIVE':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube Video ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.youtubeVideoId}
              onChange={(e) => setFormData({ ...formData, youtubeVideoId: e.target.value })}
              placeholder="dQw4w9WgXcQ"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The ID from the YouTube URL (e.g., youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
            </p>
          </div>
        );

      case 'TEXT':
        console.log('🎨 Rendering RichTextEditor with content:', formData.content?.substring(0, 100) || '(empty)');
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(html) => {
                console.log('📝 Content changed to:', html?.substring(0, 100) || '(empty)');
                setFormData({ ...formData, content: html });
              }}
              placeholder="Write your lesson content here... Use the toolbar to format text, add images, and more."
              minHeight="300px"
              maxHeight="600px"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Use the rich text editor to create engaging lesson content with formatting, images, and links
            </p>
          </div>
        );

      case 'PDF':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">PDF upload functionality coming soon</p>
            <p className="text-xs text-gray-500">You'll be able to upload PDF files directly</p>
          </div>
        );

      case 'QUIZ':
      case 'ASSIGNMENT':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <CheckSquare size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              {selectedType === 'QUIZ' ? 'Quiz builder' : 'Assignment builder'} coming soon
            </p>
            <p className="text-xs text-gray-500">
              Advanced {selectedType.toLowerCase()} creation tools will be available in the next update
            </p>
          </div>
        );

      case 'EXTERNAL_LINK':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              External URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://example.com/resource"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to an external resource or website
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {lesson ? 'Edit Lesson' : 'Add New Lesson'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Lesson Type Selection (only for new lessons) */}
          {!lesson && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Lesson Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {LESSON_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon size={24} className={type.color} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900">{type.label}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Understanding React Hooks"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this lesson..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="30"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type-Specific Fields */}
          {renderTypeSpecificFields()}

          {/* Free Preview & Published */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFree"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
                Free preview lesson
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                Publish this lesson immediately
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : lesson ? 'Update Lesson' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
