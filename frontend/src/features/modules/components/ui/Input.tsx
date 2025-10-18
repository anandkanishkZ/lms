/**
 * Input Component
 * Text input fields with validation states, icons, and various types
 * Used for forms, search, and data entry throughout the application
 */

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500 dark:border-gray-600',
        error: 'border-red-500 focus-visible:border-red-600 focus-visible:ring-red-500 dark:border-red-600',
        success: 'border-green-500 focus-visible:border-green-600 focus-visible:ring-green-500 dark:border-green-600',
        warning: 'border-yellow-500 focus-visible:border-yellow-600 focus-visible:ring-yellow-500 dark:border-yellow-600',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  fullWidth?: boolean;
  containerClassName?: string;
}

/**
 * Base Input Component
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      variant,
      size,
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      fullWidth = true,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!errorText;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant: finalVariant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400',
                onRightIconClick && 'cursor-pointer hover:text-gray-600'
              )}
              onClick={onRightIconClick}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {hasError && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 dark:text-red-500">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Password Input - Input with show/hide password toggle
 */
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showStrengthIndicator?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrengthIndicator = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

    const calculateStrength = (password: string): 'weak' | 'medium' | 'strong' => {
      let score = 0;
      if (password.length >= 8) score++;
      if (password.length >= 12) score++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
      if (/\d/.test(password)) score++;
      if (/[^a-zA-Z\d]/.test(password)) score++;

      if (score <= 2) return 'weak';
      if (score <= 4) return 'medium';
      return 'strong';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrengthIndicator) {
        setStrength(calculateStrength(e.target.value));
      }
      props.onChange?.(e);
    };

    const strengthColors = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-green-500',
    };

    const strengthWidths = {
      weak: 'w-1/3',
      medium: 'w-2/3',
      strong: 'w-full',
    };

    const EyeIcon = showPassword ? (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </svg>
    ) : (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    );

    return (
      <div className="space-y-2">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          rightIcon={EyeIcon}
          onRightIconClick={() => setShowPassword(!showPassword)}
          onChange={handleChange}
          {...props}
        />
        {showStrengthIndicator && props.value && (
          <div className="space-y-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  strengthColors[strength],
                  strengthWidths[strength]
                )}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Password strength:{' '}
              <span
                className={cn(
                  'font-medium',
                  strength === 'weak' && 'text-red-600',
                  strength === 'medium' && 'text-yellow-600',
                  strength === 'strong' && 'text-green-600'
                )}
              >
                {strength}
              </span>
            </p>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

/**
 * Search Input - Input specifically for search functionality
 */
export interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, value, ...props }, ref) => {
    const SearchIcon = (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    );

    const ClearIcon = value ? (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ) : null;

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={SearchIcon}
        rightIcon={ClearIcon}
        onRightIconClick={onClear}
        value={value}
        placeholder="Search..."
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

/**
 * Number Input - Input with increment/decrement buttons
 */
export interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  showControls?: boolean;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ min, max, step = 1, showControls = true, value, onChange, ...props }, ref) => {
    const handleIncrement = () => {
      const currentValue = Number(value) || 0;
      const newValue = currentValue + step;
      if (max === undefined || newValue <= max) {
        const event = {
          target: { value: String(newValue) },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(event);
      }
    };

    const handleDecrement = () => {
      const currentValue = Number(value) || 0;
      const newValue = currentValue - step;
      if (min === undefined || newValue >= min) {
        const event = {
          target: { value: String(newValue) },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(event);
      }
    };

    const controls = showControls ? (
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col">
        <button
          type="button"
          onClick={handleIncrement}
          className="px-2 py-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          tabIndex={-1}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          className="px-2 py-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          tabIndex={-1}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    ) : null;

    return (
      <Input
        ref={ref}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        rightIcon={controls}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

/**
 * Email Input - Input with email validation styling
 */
export const EmailInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    const EmailIcon = (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );

    return <Input ref={ref} type="email" leftIcon={EmailIcon} {...props} />;
  }
);

EmailInput.displayName = 'EmailInput';

/**
 * Phone Input - Input for phone numbers
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    const PhoneIcon = (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    );

    return <Input ref={ref} type="tel" leftIcon={PhoneIcon} {...props} />;
  }
);

PhoneInput.displayName = 'PhoneInput';

/**
 * URL Input - Input for URLs
 */
export const URLInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => {
    const LinkIcon = (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    );

    return <Input ref={ref} type="url" leftIcon={LinkIcon} {...props} />;
  }
);

URLInput.displayName = 'URLInput';

export { Input, inputVariants };
