'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Link as LinkIcon, Video, Check, Loader2, AlertCircle } from 'lucide-react';
import { LiveClass } from '@/src/services/live-class-api.service';
import { YouTubePreview } from './YouTubePreview';
import { showErrorToast } from '@/src/utils/toast.util';

interface LiveClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LiveClassFormData) => Promise<void>;
  liveClass?: LiveClass | null;
  moduleId: string;
  moduleTitle: string;
}

export interface LiveClassFormData {
  title: string;
  description: string;
  youtubeUrl: string;
  startTime: string;
  endTime: string;
}

export function LiveClassFormModal({
  isOpen,
  onClose,
  onSubmit,
  liveClass,
  moduleId,
  moduleTitle,
}: LiveClassFormModalProps) {
  const [formData, setFormData] = useState<LiveClassFormData>({
    title: '',
    description: '',
    youtubeUrl: '',
    startTime: '',
    endTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<LiveClassFormData>>({});

  useEffect(() => {
    if (isOpen) {
      if (liveClass) {
        // Edit mode - format datetime preserving the original time
        const formatDateTimeLocal = (dateString: string) => {
          const date = new Date(dateString);
          // Get the date in local timezone
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };
        
        setFormData({
          title: liveClass.title,
          description: liveClass.description || '',
          youtubeUrl: liveClass.youtubeUrl || '',
          startTime: liveClass.startTime ? formatDateTimeLocal(liveClass.startTime) : '',
          endTime: liveClass.endTime ? formatDateTimeLocal(liveClass.endTime) : '',
        });
      } else {
        // Create mode - set default time (start: now, end: now + 1 hour)
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        
        setFormData({
          title: '',
          description: '',
          youtubeUrl: '',
          startTime: now.toISOString().slice(0, 16),
          endTime: oneHourLater.toISOString().slice(0, 16),
        });
      }
      setErrors({});
    }
  }, [isOpen, liveClass]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LiveClassFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start date & time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorToast('Please fix the errors before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      console.error('Submit error:', error);
      showErrorToast(error.message || 'Failed to save live class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof LiveClassFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {liveClass ? 'Edit Live Class' : 'Add Live Class'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Module: <span className="font-medium">{moduleTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Live Class Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Introduction to React Hooks"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  placeholder="Brief description of what will be covered in this live class..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
                />
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  YouTube Live URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all ${
                      errors.youtubeUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.youtubeUrl && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.youtubeUrl}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Supports: youtube.com/watch, youtu.be, youtube.com/live formats
                </p>
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent ${
                        errors.startTime ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.startTime && (
                    <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>
                  )}
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date & Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      min={formData.startTime}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent ${
                        errors.endTime ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.endTime && (
                    <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: Leave empty for open-ended sessions
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - YouTube Preview */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                Live Preview
              </label>
              <div className="flex-1 min-h-[300px]">
                <YouTubePreview 
                  url={formData.youtubeUrl} 
                  className="h-full"
                  showThumbnail={false}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {liveClass ? 'Update Live Class' : 'Create Live Class'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
