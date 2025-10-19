'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

interface ResourceActionsModalProps {
  resource: {
    id: string;
    title: string;
    isHidden: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ResourceActionsModal({
  resource,
  isOpen,
  onClose,
  onUpdate,
}: ResourceActionsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<'visibility' | 'delete' | null>(null);

  const handleToggleVisibility = async () => {
    try {
      setIsProcessing(true);
      setActionType('visibility');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/resources/${resource.id}/visibility`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`,
          },
          body: JSON.stringify({
            isHidden: !resource.isHidden,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update visibility');

      showSuccessToast(resource.isHidden ? 'Resource is now visible to students' : 'Resource hidden from students');
      onUpdate();
      onClose();
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to update visibility');
      console.error('Failed to update visibility:', error);
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      setActionType('delete');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/resources/${resource.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete resource');

      showSuccessToast('Resource deleted successfully');
      onUpdate();
      onClose();
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to delete resource');
      console.error('Failed to delete resource:', error);
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg max-w-md w-full shadow-xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Resource Actions</h2>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Managing: <span className="font-medium text-gray-900">{resource.title}</span>
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-3">
            {/* Toggle Visibility Button */}
            <button
              onClick={handleToggleVisibility}
              disabled={isProcessing}
              className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#2563eb] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                {resource.isHidden ? (
                  <Eye className="w-5 h-5 text-gray-600 group-hover:text-[#2563eb]" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-600 group-hover:text-[#2563eb]" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 group-hover:text-[#2563eb]">
                  {resource.isHidden ? 'Make Visible' : 'Hide from Students'}
                </div>
                <div className="text-sm text-gray-600">
                  {resource.isHidden
                    ? 'Students will be able to see this resource'
                    : 'Students won\'t be able to see this resource'}
                </div>
              </div>
              {isProcessing && actionType === 'visibility' && (
                <Loader2 className="w-5 h-5 animate-spin text-[#2563eb]" />
              )}
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isProcessing}
              className="w-full flex items-center gap-3 p-4 border-2 border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-red-600">Delete Resource</div>
                <div className="text-sm text-gray-600">
                  Permanently remove this resource
                </div>
              </div>
              {isProcessing && actionType === 'delete' && (
                <Loader2 className="w-5 h-5 animate-spin text-red-600" />
              )}
            </button>

            {/* Warning for Delete */}
            {actionType === 'delete' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. The resource will be permanently deleted.
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
