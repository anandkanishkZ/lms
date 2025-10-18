/**
 * Select Component
 * Dropdown selection with search, multi-select, and grouping support
 * Used for form selections throughout the application
 */

import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500 dark:border-gray-600',
        error: 'border-red-500 focus-visible:border-red-600 focus-visible:ring-red-500 dark:border-red-600',
        success: 'border-green-500 focus-visible:border-green-600 focus-visible:ring-green-500 dark:border-green-600',
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

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps extends VariantProps<typeof selectVariants> {
  options?: SelectOption[];
  groups?: SelectGroup[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  maxHeight?: number;
  className?: string;
  containerClassName?: string;
}

/**
 * Base Select Component
 */
export const Select: React.FC<SelectProps> = ({
  options = [],
  groups = [],
  value,
  defaultValue,
  onChange,
  onBlur,
  placeholder = 'Select an option...',
  label,
  helperText,
  errorText,
  disabled = false,
  required = false,
  searchable = false,
  multiple = false,
  clearable = false,
  maxHeight = 300,
  variant,
  size,
  className,
  containerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple
      ? Array.isArray(value)
        ? value
        : value
        ? [value]
        : Array.isArray(defaultValue)
        ? defaultValue
        : defaultValue
        ? [defaultValue]
        : []
      : []
  );
  const [selectedValue, setSelectedValue] = useState<string>(
    !multiple && typeof value === 'string'
      ? value
      : !multiple && typeof defaultValue === 'string'
      ? defaultValue
      : ''
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasError = !!errorText;
  const finalVariant = hasError ? 'error' : variant;

  // Combine options and groups
  const allOptions = [...options];
  groups.forEach((group) => allOptions.push(...group.options));

  // Filter options based on search
  const filteredOptions = searchQuery
    ? allOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allOptions;

  const filteredGroups = searchQuery
    ? groups
        .map((group) => ({
          ...group,
          options: group.options.filter((opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((group) => group.options.length > 0)
    : groups;

  // Get display value
  const getDisplayValue = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = allOptions.find((opt) => opt.value === selectedValues[0]);
        return option?.label || selectedValues[0];
      }
      return `${selectedValues.length} selected`;
    } else {
      const option = allOptions.find((opt) => opt.value === selectedValue);
      return option?.label || placeholder;
    }
  };

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newValues);
      onChange?.(newValues);
    } else {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      setSelectedValues([]);
      onChange?.([]);
    } else {
      setSelectedValue('');
      onChange?.('');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const showClearButton = clearable && (multiple ? selectedValues.length > 0 : selectedValue);

  return (
    <div ref={containerRef} className={cn('relative w-full', containerClassName)}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Select Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(selectVariants({ variant: finalVariant, size }), className)}
      >
        <span className={cn(!selectedValue && !selectedValues.length && 'text-gray-400')}>
          {getDisplayValue()}
        </span>
        <div className="flex items-center space-x-1">
          {showClearButton && (
            <div
              onClick={handleClear}
              className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          <svg
            className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          style={{ maxHeight }}
        >
          {searchable && (
            <div className="border-b border-gray-200 p-2 dark:border-gray-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>
          )}

          <div className="overflow-y-auto" style={{ maxHeight: maxHeight - 60 }}>
            {/* Ungrouped options */}
            {!groups.length &&
              (filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <SelectOption
                    key={option.value}
                    option={option}
                    selected={
                      multiple
                        ? selectedValues.includes(option.value)
                        : selectedValue === option.value
                    }
                    onSelect={() => handleSelect(option.value)}
                    multiple={multiple}
                  />
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
              ))}

            {/* Grouped options */}
            {filteredGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {group.label}
                </div>
                {group.options.map((option) => (
                  <SelectOption
                    key={option.value}
                    option={option}
                    selected={
                      multiple
                        ? selectedValues.includes(option.value)
                        : selectedValue === option.value
                    }
                    onSelect={() => handleSelect(option.value)}
                    multiple={multiple}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper/Error Text */}
      {hasError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errorText}</p>
      )}
      {!hasError && helperText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

/**
 * Select Option Item
 */
interface SelectOptionProps {
  option: SelectOption;
  selected: boolean;
  onSelect: () => void;
  multiple: boolean;
}

const SelectOption: React.FC<SelectOptionProps> = ({ option, selected, onSelect, multiple }) => {
  return (
    <div
      onClick={option.disabled ? undefined : onSelect}
      className={cn(
        'flex cursor-pointer items-center px-3 py-2 text-sm transition-colors',
        option.disabled && 'cursor-not-allowed opacity-50',
        !option.disabled && 'hover:bg-gray-100 dark:hover:bg-gray-700',
        selected && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
      )}
    >
      {multiple && (
        <div
          className={cn(
            'mr-2 flex h-4 w-4 items-center justify-center rounded border',
            selected
              ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
              : 'border-gray-300 dark:border-gray-600'
          )}
        >
          {selected && (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}
      {option.icon && <div className="mr-2">{option.icon}</div>}
      <div className="flex-1">
        <div>{option.label}</div>
        {option.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
        )}
      </div>
      {!multiple && selected && (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
};

/**
 * Simple Select - Quick select without advanced features
 */
export const SimpleSelect: React.FC<
  Omit<SelectProps, 'searchable' | 'multiple' | 'clearable' | 'groups'>
> = (props) => {
  return <Select {...props} searchable={false} multiple={false} clearable={false} />;
};

/**
 * Multi Select - Pre-configured for multiple selection
 */
export const MultiSelect: React.FC<Omit<SelectProps, 'multiple'>> = (props) => {
  return <Select {...props} multiple searchable clearable />;
};

/**
 * Searchable Select - Pre-configured with search
 */
export const SearchableSelect: React.FC<Omit<SelectProps, 'searchable'>> = (props) => {
  return <Select {...props} searchable />;
};

export { selectVariants };
