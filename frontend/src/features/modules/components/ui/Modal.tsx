/**
 * Modal Component
 * Dialog/popup with overlay for important interactions
 * Used for confirmations, forms, alerts, media viewers, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const modalOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
  {
    variants: {
      state: {
        open: 'opacity-100',
        closed: 'opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      state: 'closed',
    },
  }
);

const modalContentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white shadow-lg transition-all duration-200 dark:border-gray-700 dark:bg-gray-900',
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
      },
      state: {
        open: 'scale-100 opacity-100',
        closed: 'scale-95 opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'closed',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalContentVariants> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
}

/**
 * Base Modal Component
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  overlayClassName,
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape || !open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, open, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus management
  React.useEffect(() => {
    if (open && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open && !document.querySelector('[data-modal-open="true"]')) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(modalOverlayVariants({ state: open ? 'open' : 'closed' }), overlayClassName)}
        onClick={handleOverlayClick}
        aria-hidden="true"
        data-modal-open={open}
      />

      {/* Modal Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        className={cn(modalContentVariants({ size, state: open ? 'open' : 'closed' }), className)}
        data-modal-open={open}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex-1">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[calc(95vh-200px)] overflow-y-auto p-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">{footer}</div>
        )}
      </div>
    </>
  );
};

/**
 * Confirm Modal - Pre-configured for confirmations
 */
export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmVariant?: 'default' | 'danger';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  confirmVariant = 'default',
  loading = false,
  ...props
}) => {
  return (
    <Modal
      {...props}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50',
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            )}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      }
    >
      <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
    </Modal>
  );
};

/**
 * Alert Modal - Pre-configured for alerts
 */
export interface AlertModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  message,
  type = 'info',
  buttonText = 'OK',
  onClose,
  ...props
}) => {
  const iconMap = {
    info: (
      <svg className="h-6 w-6 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-6 w-6 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="h-6 w-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <Modal
      {...props}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {buttonText}
          </button>
        </div>
      }
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{iconMap[type]}</div>
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
      </div>
    </Modal>
  );
};

/**
 * Form Modal - Pre-configured for forms
 */
export interface FormModalProps extends Omit<ModalProps, 'footer'> {
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  onClose,
  children,
  ...props
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            form="modal-form"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? 'Submitting...' : submitText}
          </button>
        </div>
      }
    >
      <form id="modal-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
};

export { modalOverlayVariants, modalContentVariants };
