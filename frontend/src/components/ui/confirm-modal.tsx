import React from 'react';
import { Button } from './button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

/**
 * Confirmation Modal Component
 * Used for confirming destructive actions like delete
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const iconStyles = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  const buttonVariant = variant === 'danger' ? 'destructive' : 'default';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${variantStyles[variant]}`}>
          <AlertTriangle className={`h-6 w-6 ${iconStyles[variant]}`} />
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
