/**
 * Radio Component
 * Single selection from a group of options
 * Used for mutually exclusive choices in forms
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const radioVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 text-blue-600 focus-visible:ring-blue-500 checked:border-blue-600 dark:border-gray-600 dark:checked:border-blue-500',
        success: 'border-gray-300 text-green-600 focus-visible:ring-green-500 checked:border-green-600 dark:border-gray-600 dark:checked:border-green-500',
        warning: 'border-gray-300 text-yellow-600 focus-visible:ring-yellow-500 checked:border-yellow-600 dark:border-gray-600 dark:checked:border-yellow-500',
        error: 'border-gray-300 text-red-600 focus-visible:ring-red-500 checked:border-red-600 dark:border-gray-600 dark:checked:border-red-500',
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

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  description?: string;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
}

/**
 * Base Radio Component
 */
const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
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
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!errorText;

    return (
      <div className={cn('space-y-1', containerClassName)}>
        <div className="flex items-start space-x-2">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="radio"
              id={radioId}
              disabled={disabled}
              className={cn(radioVariants({ variant, size }), className)}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${radioId}-error` : helperText ? `${radioId}-helper` : undefined
              }
              {...props}
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-0 transition-opacity peer-checked:opacity-100" />
          </div>
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={radioId}
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
          <p id={`${radioId}-error`} className="text-xs text-red-600 dark:text-red-500">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${radioId}-helper`} className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

/**
 * Radio Group - Group of radio buttons
 */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  helperText,
  errorText,
  variant = 'default',
  size = 'md',
  orientation = 'vertical',
  required = false,
  className,
}) => {
  const [selectedValue, setSelectedValue] = React.useState<string>(value || defaultValue || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
  };

  const hasError = !!errorText;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div
        className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
        )}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            {option.icon && <div className="text-gray-500">{option.icon}</div>}
            <Radio
              name={name}
              value={option.value}
              label={option.label}
              description={option.description}
              checked={selectedValue === option.value}
              onChange={() => handleChange(option.value)}
              disabled={option.disabled}
              variant={variant}
              size={size}
              required={required}
            />
          </div>
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
 * Radio Card Group - Radio buttons styled as cards
 */
export const RadioCardGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  helperText,
  errorText,
  variant = 'default',
  required = false,
  className,
}) => {
  const [selectedValue, setSelectedValue] = React.useState<string>(value || defaultValue || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
  };

  const hasError = !!errorText;

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const radioId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={radioId}
              className={cn(
                'relative flex cursor-pointer rounded-lg border-2 p-4 transition-all',
                isSelected
                  ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                option.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <input
                id={radioId}
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => !option.disabled && handleChange(option.value)}
                disabled={option.disabled}
                className="sr-only"
                required={required}
              />
              <div className="flex w-full items-start">
                {option.icon && (
                  <div className="mr-3 flex-shrink-0 text-gray-500">{option.icon}</div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2',
                        isSelected
                          ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  {option.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {hasError && <p className="text-xs text-red-600 dark:text-red-500">{errorText}</p>}
      {!hasError && helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

export { Radio, radioVariants };
