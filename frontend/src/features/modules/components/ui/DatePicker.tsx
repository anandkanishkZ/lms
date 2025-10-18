/**
 * DatePicker Component
 * Calendar-based date selection with single date, date range, and time options
 * Used for course schedules, deadlines, event planning, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const datePickerVariants = cva(
  'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-within:ring-blue-500 dark:border-gray-600',
        error: 'border-red-500 focus-within:ring-red-500 dark:border-red-600',
        success: 'border-green-500 focus-within:ring-green-500 dark:border-green-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'onChange' | 'defaultValue'>,
    VariantProps<typeof datePickerVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  value?: Date | null;
  defaultValue?: Date;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showTime?: boolean;
  format?: string;
  placeholder?: string;
  containerClassName?: string;
  clearable?: boolean;
}

/**
 * Base DatePicker Component
 */
const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      containerClassName,
      variant,
      label,
      helperText,
      errorText,
      value,
      defaultValue,
      onChange,
      minDate,
      maxDate,
      disabledDates = [],
      showTime = false,
      format = 'yyyy-MM-dd',
      placeholder = 'Select date...',
      clearable = true,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(value || defaultValue || null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState<Date>(selectedDate || new Date());
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const pickerId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    const hasError = !!errorText;

    // Update selected date when value prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedDate(value);
        if (value) {
          setCurrentMonth(value);
        }
      }
    }, [value]);

    // Close calendar on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Format date to string
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      if (showTime) {
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }
      return `${year}-${month}-${day}`;
    };

    // Check if date is disabled
    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return disabledDates.some(
        (disabledDate) =>
          disabledDate.getFullYear() === date.getFullYear() &&
          disabledDate.getMonth() === date.getMonth() &&
          disabledDate.getDate() === date.getDate()
      );
    };

    // Check if date is same day
    const isSameDay = (date1: Date | null, date2: Date): boolean => {
      if (!date1) return false;
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    // Check if date is today
    const isToday = (date: Date): boolean => {
      return isSameDay(new Date(), date);
    };

    // Handle date selection
    const handleDateSelect = (date: Date) => {
      setSelectedDate(date);
      onChange?.(date);
      if (!showTime) {
        setIsOpen(false);
      }
    };

    // Handle clear
    const handleClear = () => {
      setSelectedDate(null);
      onChange?.(null);
    };

    // Navigate months
    const previousMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Get days in month
    const getDaysInMonth = (date: Date): Date[] => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days: Date[] = [];

      // Add previous month's days
      for (let i = 0; i < startingDayOfWeek; i++) {
        const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
        days.push(prevMonthDay);
      }

      // Add current month's days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }

      // Add next month's days to complete the grid
      const remainingDays = 42 - days.length; // 6 rows × 7 days
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i));
      }

      return days;
    };

    const days = getDaysInMonth(currentMonth);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className={cn('space-y-1', containerClassName)} ref={containerRef}>
        {label && (
          <label htmlFor={pickerId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          <div className={cn(datePickerVariants({ variant }), className)}>
            <input
              ref={inputRef}
              id={pickerId}
              type="text"
              value={formatDate(selectedDate)}
              placeholder={placeholder}
              readOnly
              disabled={disabled}
              className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${pickerId}-error` : helperText ? `${pickerId}-helper` : undefined
              }
              {...props}
            />
            <div className="flex items-center space-x-1">
              {clearable && selectedDate && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear date"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Toggle calendar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Popup */}
          {isOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[280px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              {/* Month Navigation */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={previousMonth}
                  className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Previous month"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Next month"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day Names */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const isSelected = isSameDay(selectedDate, day);
                  const isTodayDate = isToday(day);
                  const isDisabled = isDateDisabled(day);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(day)}
                      disabled={isDisabled}
                      className={cn(
                        'aspect-square rounded p-1 text-sm transition-colors',
                        !isCurrentMonth && 'text-gray-400 dark:text-gray-600',
                        isCurrentMonth && !isSelected && !isDisabled && 'hover:bg-gray-100 dark:hover:bg-gray-800',
                        isSelected && 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500',
                        isTodayDate && !isSelected && 'font-bold text-blue-600 dark:text-blue-500',
                        isDisabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Time Picker */}
              {showTime && selectedDate && (
                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={selectedDate.getHours()}
                      onChange={(e) => {
                        const newDate = new Date(selectedDate);
                        newDate.setHours(parseInt(e.target.value) || 0);
                        handleDateSelect(newDate);
                      }}
                      className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-gray-500">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={selectedDate.getMinutes()}
                      onChange={(e) => {
                        const newDate = new Date(selectedDate);
                        newDate.setMinutes(parseInt(e.target.value) || 0);
                        handleDateSelect(newDate);
                      }}
                      className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {hasError && (
          <p id={`${pickerId}-error`} className="text-xs text-red-600 dark:text-red-500">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${pickerId}-helper`} className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

/**
 * Date Range Picker
 */
export interface DateRangePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  value?: { start: Date | null; end: Date | null };
  onChange?: (range: { start: Date | null; end: Date | null }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label,
  ...props
}) => {
  const [startDate, setStartDate] = React.useState<Date | null>(value?.start || null);
  const [endDate, setEndDate] = React.useState<Date | null>(value?.end || null);

  React.useEffect(() => {
    if (value) {
      setStartDate(value.start);
      setEndDate(value.end);
    }
  }, [value]);

  const handleStartChange = (date: Date | null) => {
    setStartDate(date);
    onChange?.({ start: date, end: endDate });
  };

  const handleEndChange = (date: Date | null) => {
    setEndDate(date);
    onChange?.({ start: startDate, end: date });
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="grid gap-3 sm:grid-cols-2">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={handleStartChange}
          maxDate={endDate || undefined}
          {...props}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={handleEndChange}
          minDate={startDate || undefined}
          {...props}
        />
      </div>
    </div>
  );
};

/**
 * Birthday Picker - Pre-configured for birthdays
 */
export const BirthdayPicker = React.forwardRef<HTMLInputElement, Omit<DatePickerProps, 'maxDate'>>(
  (props, ref) => {
    return (
      <DatePicker
        ref={ref}
        maxDate={new Date()}
        placeholder="Select birthday..."
        {...props}
      />
    );
  }
);

BirthdayPicker.displayName = 'BirthdayPicker';

/**
 * Deadline Picker - Pre-configured for deadlines
 */
export const DeadlinePicker = React.forwardRef<HTMLInputElement, Omit<DatePickerProps, 'minDate'>>(
  (props, ref) => {
    return (
      <DatePicker
        ref={ref}
        minDate={new Date()}
        showTime
        placeholder="Select deadline..."
        {...props}
      />
    );
  }
);

DeadlinePicker.displayName = 'DeadlinePicker';

export { DatePicker, datePickerVariants };
