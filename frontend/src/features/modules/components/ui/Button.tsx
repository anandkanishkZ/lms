/**
 * Button Component
 * Versatile button component with multiple variants, sizes, and states
 * Used throughout the application for actions and navigation
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
        success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600 dark:bg-green-500 dark:hover:bg-green-600',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600',
        error: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 dark:bg-red-500 dark:hover:bg-red-600',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-600 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-950',
        ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-800',
        link: 'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-600 dark:text-blue-500',
        gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus-visible:ring-purple-600',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  asChild?: boolean;
}

/**
 * Base Button Component
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {isLoading ? loadingText || children : children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Icon Button - Square button for icons
 */
export interface IconButtonProps
  extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'loadingText' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} className={className} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Button Group - Group multiple buttons together
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  attached?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  attached = false,
}) => {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        attached &&
          orientation === 'horizontal' &&
          '[&>button:not(:first-child)]:rounded-l-none [&>button:not(:last-child)]:rounded-r-none [&>button:not(:first-child)]:-ml-px',
        attached &&
          orientation === 'vertical' &&
          '[&>button:not(:first-child)]:rounded-t-none [&>button:not(:last-child)]:rounded-b-none [&>button:not(:first-child)]:-mt-px',
        !attached && (orientation === 'horizontal' ? 'space-x-2' : 'space-y-2'),
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
};

/**
 * Action Button - Pre-styled buttons for common actions
 */
export const SaveButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="success" {...props}>
    {props.children || 'Save'}
  </Button>
);

export const CancelButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props}>
    {props.children || 'Cancel'}
  </Button>
);

export const DeleteButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="error" {...props}>
    {props.children || 'Delete'}
  </Button>
);

export const EditButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props}>
    {props.children || 'Edit'}
  </Button>
);

export const SubmitButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="default" type="submit" {...props}>
    {props.children || 'Submit'}
  </Button>
);

/**
 * Module Action Buttons - Specific to module operations
 */
export const EnrollButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="gradient" {...props}>
    {props.children || 'Enroll Now'}
  </Button>
);

export const StartLessonButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="success" {...props}>
    {props.children || 'Start Lesson'}
  </Button>
);

export const ContinueLessonButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="default" {...props}>
    {props.children || 'Continue'}
  </Button>
);

export const CompleteButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="success" {...props}>
    {props.children || 'Mark as Complete'}
  </Button>
);

export const DownloadButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props}>
    {props.children || 'Download'}
  </Button>
);

/**
 * Social Auth Buttons
 */
export const GoogleButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button
    variant="outline"
    leftIcon={
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    }
    {...props}
  >
    {props.children || 'Continue with Google'}
  </Button>
);

export const GitHubButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button
    variant="secondary"
    leftIcon={
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    }
    {...props}
  >
    {props.children || 'Continue with GitHub'}
  </Button>
);

export { Button, buttonVariants };
