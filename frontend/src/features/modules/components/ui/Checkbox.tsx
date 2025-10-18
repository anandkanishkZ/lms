/**
 * Checkbox Component
 * Single and multiple selection checkboxes with indeterminate state
 * Used for boolean selections and multi-select lists
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 text-blue-600 focus-visible:ring-blue-500 checked:border-blue-600 checked:bg-blue-600 dark:border-gray-600 dark:checked:border-blue-500 dark:checked:bg-blue-500',
        success: 'border-gray-300 text-green-600 focus-visible:ring-green-500 checked:border-green-600 checked:bg-green-600 dark:border-gray-600 dark:checked:border-green-500 dark:checked:bg-green-500',
        warning: 'border-gray-300 text-yellow-600 focus-visible:ring-yellow-500 checked:border-yellow-600 checked:bg-yellow-600 dark:border-gray-600 dark:checked:border-yellow-500 dark:checked:bg-yellow-500',
        error: 'border-gray-300 text-red-600 focus-visible:ring-red-500 checked:border-red-600 checked:bg-red-600 dark:border-gray-600 dark:checked:border-red-500 dark:checked:bg-red-500',
      },
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  helperText?: string;
  errorText?: string;
  indeterminate?: boolean;
  containerClassName?: string;
}

/**
 * Base Checkbox Component
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      containerClassName,
      variant,
      size,
      label,
      description,
      helperText,
      errorText,
      indeterminate = false,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!errorText;
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Handle indeterminate state
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    return (
      <div className={cn('space-y-1', containerClassName)}>
        <div className="flex items-start space-x-2">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              className={cn(checkboxVariants({ variant, size }), className)}
              aria-invalid={hasError}
              aria-describedby={
                hasError
                  ? `${checkboxId}-error`
                  : helperText
                  ? `${checkboxId}-helper`
                  : undefined
              }
              {...props}
            />
            <svg
              className={cn(
                'pointer-events-none absolute left-0 h-full w-full text-white opacity-0 transition-opacity peer-checked:opacity-100',
                indeterminate && 'opacity-100'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {indeterminate ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              )}
            </svg>
          </div>
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className={cn(
                    'text-sm font-medium text-gray-700 dark:text-gray-300',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {label}
                  {props.required && <span className="ml-1 text-red-500">*</span>}
                </label>
              )}
              {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
              )}
            </div>
          )}
        </div>

        {hasError && (
          <p id={`${checkboxId}-error`} className="text-xs text-red-600 dark:text-red-500">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${checkboxId}-helper`} className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * Checkbox Group - Multiple checkboxes
 */
export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value = [],
  defaultValue = [],
  onChange,
  label,
  helperText,
  errorText,
  variant = 'default',
  size = 'md',
  orientation = 'vertical',
  className,
}) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(value || defaultValue);

  React.useEffect(() => {
    if (value) {
      setSelectedValues(value);
    }
  }, [value]);

  const handleChange = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((v) => v !== optionValue);
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const hasError = !!errorText;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div
        className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
        )}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={selectedValues.includes(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            disabled={option.disabled}
            variant={variant}
            size={size}
          />
        ))}
      </div>

      {hasError && <p className="text-xs text-red-600 dark:text-red-500">{errorText}</p>}
      {!hasError && helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

/**
 * Terms Checkbox - Pre-configured for terms acceptance
 */
export const TermsCheckbox = React.forwardRef<HTMLInputElement, Omit<CheckboxProps, 'label'>>(
  (props, ref) => {
    return (
      <Checkbox
        ref={ref}
        label="I agree to the terms and conditions"
        required
        {...props}
      />
    );
  }
);

TermsCheckbox.displayName = 'TermsCheckbox';

/**
 * Remember Me Checkbox - Pre-configured for login
 */
export const RememberMeCheckbox = React.forwardRef<HTMLInputElement, Omit<CheckboxProps, 'label'>>(
  (props, ref) => {
    return <Checkbox ref={ref} label="Remember me" {...props} />;
  }
);

RememberMeCheckbox.displayName = 'RememberMeCheckbox';

export { Checkbox, checkboxVariants };
