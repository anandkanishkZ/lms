/**
 * Alert Component
 * Notification alerts and toast messages for user feedback
 * Used for success messages, errors, warnings, and info
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
        success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
        error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Base Alert Component
 */
export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  icon,
  dismissible,
  onDismiss,
  variant,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const defaultIcons = {
    info: (
      <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  const displayIcon = icon || (variant ? defaultIcons[variant] : defaultIcons.info);

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert">
      <div className="flex gap-3">
        {displayIcon && <div className="shrink-0">{displayIcon}</div>}
        <div className="flex-1">
          {title && <h3 className="mb-1 font-semibold">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Toast Notification - Auto-dismissing alert
 */
export interface ToastProps extends Omit<AlertProps, 'dismissible'> {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const Toast: React.FC<ToastProps> = ({
  duration = 5000,
  position = 'top-right',
  onDismiss,
  ...alertProps
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
  }[position];

  return (
    <div className={cn(positionClasses, 'animate-in slide-in-from-top-5 fade-in')}>
      <Alert
        {...alertProps}
        dismissible
        onDismiss={() => {
          setIsVisible(false);
          onDismiss?.();
        }}
        className="shadow-lg min-w-[300px] max-w-md"
      />
    </div>
  );
};

/**
 * Toast Container - Manage multiple toasts
 */
export interface ToastMessage {
  id: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
  className,
}) => {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
  }[position];

  return (
    <div className={cn(positionClasses, 'flex flex-col gap-2', className)}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-top-5 fade-in"
        >
          <Alert
            variant={toast.variant}
            title={toast.title}
            dismissible
            onDismiss={() => onDismiss(toast.id)}
            className="shadow-lg min-w-[300px] max-w-md"
          >
            {toast.message}
          </Alert>
        </div>
      ))}
    </div>
  );
};

/**
 * Inline Alert - Compact alert for forms
 */
export interface InlineAlertProps extends Omit<AlertProps, 'title' | 'dismissible'> {
  message: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  message,
  variant,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md p-2 text-sm',
        {
          info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
          success: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
          warning: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
          error: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
        }[variant || 'info'],
        className
      )}
      role="alert"
    >
      {variant === 'success' && (
        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {variant === 'error' && (
        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      {variant === 'warning' && (
        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
      {variant === 'info' && (
        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
};

export { alertVariants };
