'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { topicApiService } from '@/services/topic-api.service';
import { toast } from 'react-hot-toast';

interface Topic {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  orderIndex: number;
  duration?: number;
  isActive: boolean;
}

interface TopicFormModalProps {
  moduleId: string;
  topic: Topic | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TopicFormModal({ moduleId, topic, onClose, onSaved }: TopicFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (topic) {
      setFormData({
        title: topic.title,
        description: topic.description || '',
        isActive: topic.isActive ?? true,
      });
    } else {
      // Reset form when creating new topic
      setFormData({
        title: '',
        description: '',
        isActive: true,
      });
    }
  }, [topic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a topic title');
      return;
    }

    try {
      setLoading(true);

      if (topic) {
        // Update existing topic
        await topicApiService.updateTopic(topic.id, {
          title: formData.title,
          description: formData.description || undefined,
          isActive: formData.isActive,
        });
        toast.success('Topic updated successfully');
      } else {
        // Create new topic
        await topicApiService.createTopic({
          moduleId,
          title: formData.title,
          description: formData.description || undefined,
          isActive: formData.isActive,
        });
        toast.success('Topic created successfully');
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving topic:', error);
      toast.error(error.response?.data?.message || 'Failed to save topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {topic ? 'Edit Topic' : 'Add New Topic'}
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to React"
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
              placeholder="Brief description of what this topic covers..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Help students understand what they'll learn in this topic
            </p>
          </div>

          {/* Published Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Publish this topic immediately
            </label>
          </div>
          <p className="text-xs text-gray-500 -mt-4 ml-7">
            Unpublished topics are only visible to you and won't appear to students
          </p>

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
              {loading ? 'Saving...' : topic ? 'Update Topic' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
