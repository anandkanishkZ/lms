/**
 * Switch Component
 * Toggle switch for boolean on/off states
 * Modern alternative to checkboxes for binary choices
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gray-200 checked:bg-blue-600 focus-visible:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-500',
        success: 'bg-gray-200 checked:bg-green-600 focus-visible:ring-green-500 dark:bg-gray-700 dark:checked:bg-green-500',
        warning: 'bg-gray-200 checked:bg-yellow-600 focus-visible:ring-yellow-500 dark:bg-gray-700 dark:checked:bg-yellow-500',
        error: 'bg-gray-200 checked:bg-red-600 focus-visible:ring-red-500 dark:bg-gray-700 dark:checked:bg-red-500',
      },
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 peer-checked:translate-x-4',
        md: 'h-5 w-5 peer-checked:translate-x-5',
        lg: 'h-6 w-6 peer-checked:translate-x-7',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof switchVariants> {
  label?: string;
  description?: string;
  helperText?: string;
  errorText?: string;
  labelPosition?: 'left' | 'right';
  showLabels?: boolean;
  onLabel?: string;
  offLabel?: string;
  loading?: boolean;
  containerClassName?: string;
}

/**
 * Base Switch Component
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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
      labelPosition = 'right',
      showLabels = false,
      onLabel = 'On',
      offLabel = 'Off',
      loading = false,
      id,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!errorText;
    const isDisabled = disabled || loading;

    return (
      <div className={cn('space-y-1', containerClassName)}>
        <div className="flex items-center justify-between">
          <div
            className={cn(
              'flex items-center space-x-3',
              labelPosition === 'left' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            )}
          >
            <div className="relative inline-block">
              <input
                ref={ref}
                type="checkbox"
                role="switch"
                id={switchId}
                disabled={isDisabled}
                checked={checked}
                className="sr-only"
                aria-invalid={hasError}
                aria-describedby={
                  hasError ? `${switchId}-error` : helperText ? `${switchId}-helper` : undefined
                }
                {...props}
              />
              <label
                htmlFor={switchId}
                className={cn(switchVariants({ variant, size }), className)}
              >
                <span className={switchThumbVariants({ size })}>
                  {loading && (
                    <svg
                      className="h-full w-full animate-spin text-gray-400"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                </span>
              </label>
            </div>

            {(label || description) && (
              <div className="flex-1">
                {label && (
                  <label
                    htmlFor={switchId}
                    className={cn(
                      'text-sm font-medium text-gray-700 dark:text-gray-300',
                      !isDisabled && 'cursor-pointer',
                      isDisabled && 'cursor-not-allowed opacity-50'
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

          {showLabels && (
            <span
              className={cn(
                'text-sm font-medium',
                checked
                  ? 'text-blue-600 dark:text-blue-500'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {checked ? onLabel : offLabel}
            </span>
          )}
        </div>

        {hasError && (
          <p id={`${switchId}-error`} className="text-xs text-red-600 dark:text-red-500">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${switchId}-helper`} className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

/**
 * Switch Group - Multiple switches
 */
export interface SwitchOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  defaultChecked?: boolean;
}

export interface SwitchGroupProps {
  options: SwitchOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  options,
  value = [],
  onChange,
  label,
  helperText,
  errorText,
  variant = 'default',
  size = 'md',
  orientation = 'vertical',
  className,
}) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(value);

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
    <div className={cn('space-y-3', className)}>
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
          <Switch
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
 * Notification Switch - Pre-configured for notifications
 */
export const NotificationSwitch = React.forwardRef<HTMLInputElement, Omit<SwitchProps, 'label'>>(
  (props, ref) => {
    return (
      <Switch
        ref={ref}
        label="Enable notifications"
        description="Receive updates about your courses and activities"
        {...props}
      />
    );
  }
);

NotificationSwitch.displayName = 'NotificationSwitch';

/**
 * Dark Mode Switch - Pre-configured for theme toggle
 */
export const DarkModeSwitch = React.forwardRef<HTMLInputElement, Omit<SwitchProps, 'label'>>(
  (props, ref) => {
    return (
      <Switch
        ref={ref}
        label="Dark mode"
        showLabels
        onLabel="Dark"
        offLabel="Light"
        {...props}
      />
    );
  }
);

DarkModeSwitch.displayName = 'DarkModeSwitch';

/**
 * Public/Private Switch - Pre-configured for visibility
 */
export const VisibilitySwitch = React.forwardRef<HTMLInputElement, Omit<SwitchProps, 'label'>>(
  (props, ref) => {
    return (
      <Switch
        ref={ref}
        label="Visibility"
        showLabels
        onLabel="Public"
        offLabel="Private"
        variant="success"
        {...props}
      />
    );
  }
);

VisibilitySwitch.displayName = 'VisibilitySwitch';

export { Switch, switchVariants, switchThumbVariants };
