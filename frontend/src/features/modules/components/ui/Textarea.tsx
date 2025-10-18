/**
 * Textarea Component
 * Multi-line text input with auto-resize, character count, and validation
 * Used for descriptions, comments, and long-form content
 */

import React, { useRef, useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500 dark:border-gray-600',
        error: 'border-red-500 focus-visible:border-red-600 focus-visible:ring-red-500 dark:border-red-600',
        success: 'border-green-500 focus-visible:border-green-600 focus-visible:ring-green-500 dark:border-green-600',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      resize: 'vertical',
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  maxLength?: number;
  showCount?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  fullWidth?: boolean;
  containerClassName?: string;
}

/**
 * Base Textarea Component
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      variant,
      resize,
      label,
      helperText,
      errorText,
      maxLength,
      showCount = false,
      autoResize = false,
      minRows = 3,
      maxRows,
      fullWidth = true,
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!errorText;
    const finalVariant = hasError ? 'error' : variant;
    const [charCount, setCharCount] = useState(0);
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Calculate character count
    useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        
        // Calculate min/max height
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
        const minHeight = minRows * lineHeight;
        const maxHeight = maxRows ? maxRows * lineHeight : Infinity;
        
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${newHeight}px`;
      }
    }, [value, autoResize, minRows, maxRows, textareaRef]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (maxLength && newValue.length > maxLength) {
        return;
      }
      setCharCount(newValue.length);
      onChange?.(e);
    };

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={textareaRef}
            id={textareaId}
            className={cn(
              textareaVariants({ variant: finalVariant, resize: autoResize ? 'none' : resize }),
              showCount && maxLength && 'pb-6',
              className
            )}
            rows={autoResize ? minRows : props.rows || minRows}
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
            }
            {...props}
          />
          
          {showCount && maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {hasError && (
          <p id={`${textareaId}-error`} className="text-xs text-red-600 dark:text-red-500">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${textareaId}-helper`} className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Auto-resize Textarea - Grows with content
 */
export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<TextareaProps, 'autoResize' | 'resize'>
>((props, ref) => {
  return <Textarea ref={ref} autoResize resize="none" {...props} />;
});

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

/**
 * Comment Textarea - Pre-configured for comments
 */
export const CommentTextarea = React.forwardRef<HTMLTextAreaElement, Omit<TextareaProps, 'label'>>(
  (props, ref) => {
    return (
      <Textarea
        ref={ref}
        placeholder="Write a comment..."
        autoResize
        minRows={2}
        maxRows={6}
        showCount
        maxLength={500}
        {...props}
      />
    );
  }
);

CommentTextarea.displayName = 'CommentTextarea';

/**
 * Description Textarea - Pre-configured for descriptions
 */
export const DescriptionTextarea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<TextareaProps, 'label'>
>((props, ref) => {
  return (
    <Textarea
      ref={ref}
      label="Description"
      placeholder="Enter a description..."
      autoResize
      minRows={4}
      maxRows={10}
      showCount
      maxLength={1000}
      {...props}
    />
  );
});

DescriptionTextarea.displayName = 'DescriptionTextarea';

/**
 * Code Textarea - Pre-configured for code input
 */
export const CodeTextarea = React.forwardRef<HTMLTextAreaElement, Omit<TextareaProps, 'className'>>(
  (props, ref) => {
    return (
      <Textarea
        ref={ref}
        className="font-mono text-xs"
        placeholder="// Enter code here..."
        resize="both"
        minRows={10}
        {...props}
      />
    );
  }
);

CodeTextarea.displayName = 'CodeTextarea';

export { Textarea, textareaVariants };
