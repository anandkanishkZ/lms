/**
 * Progress Component
 * Progress bars and circular indicators for lesson/module completion
 * Supports linear and circular variants with percentage display
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressVariants = cva('relative overflow-hidden', {
  variants: {
    variant: {
      default: 'bg-gray-200 dark:bg-gray-700',
      success: 'bg-green-100 dark:bg-green-900/20',
      warning: 'bg-yellow-100 dark:bg-yellow-900/20',
      error: 'bg-red-100 dark:bg-red-900/20',
      info: 'bg-blue-100 dark:bg-blue-900/20',
    },
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
      xl: 'h-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const progressBarVariants = cva('h-full transition-all duration-300 ease-out', {
  variants: {
    variant: {
      default: 'bg-blue-600 dark:bg-blue-500',
      success: 'bg-green-600 dark:bg-green-500',
      warning: 'bg-yellow-600 dark:bg-yellow-500',
      error: 'bg-red-600 dark:bg-red-500',
      info: 'bg-blue-600 dark:bg-blue-500',
      gradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

/**
 * Linear Progress Bar
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      variant,
      size,
      value = 0,
      max = 100,
      showLabel = false,
      label,
      animated = false,
      striped = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayValue = Math.round(percentage);

    const stripedClass = striped
      ? 'bg-stripes bg-[length:1rem_1rem] animate-stripe-move'
      : '';

    const animatedClass = animated ? 'animate-pulse' : '';

    return (
      <div ref={ref} className="w-full space-y-1">
        {(showLabel || label) && (
          <div className="flex items-center justify-between text-sm">
            {label && <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>}
            {showLabel && <span className="text-gray-600 dark:text-gray-400">{displayValue}%</span>}
          </div>
        )}
        <div className={cn(progressVariants({ variant, size }), 'rounded-full', className)} {...props}>
          <div
            className={cn(progressBarVariants({ variant }), stripedClass, animatedClass, 'rounded-full')}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

/**
 * Circular Progress
 */
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  label,
  variant = 'default',
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayValue = Math.round(percentage);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    default: 'text-blue-600 dark:text-blue-500',
    success: 'text-green-600 dark:text-green-500',
    warning: 'text-yellow-600 dark:text-yellow-500',
    error: 'text-red-600 dark:text-red-500',
    info: 'text-blue-600 dark:text-blue-500',
    gradient: 'text-purple-600 dark:text-purple-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(colorMap[variant], 'transition-all duration-300 ease-out')}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{displayValue}%</span>
          {label && <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>}
        </div>
      )}
    </div>
  );
};

/**
 * Module Progress - Shows overall module completion
 */
export interface ModuleProgressProps {
  completedLessons: number;
  totalLessons: number;
  className?: string;
}

export const ModuleProgress: React.FC<ModuleProgressProps> = ({ completedLessons, totalLessons, className }) => {
  const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const variant = percentage === 100 ? 'success' : percentage >= 50 ? 'info' : 'default';

  return (
    <Progress
      value={completedLessons}
      max={totalLessons}
      variant={variant}
      size="md"
      showLabel
      label="Progress"
      className={className}
    />
  );
};

/**
 * Lesson Progress - Shows progress within a single lesson
 */
export interface LessonProgressProps {
  currentTime: number;
  duration: number;
  className?: string;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({ currentTime, duration, className }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <Progress value={currentTime} max={duration} variant="info" size="sm" />
    </div>
  );
};

/**
 * Multi-step Progress - For multi-step forms or processes
 */
export interface MultiStepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const MultiStepProgress: React.FC<MultiStepProgressProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                    isCompleted && 'border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500',
                    isCurrent && 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500',
                    isUpcoming && 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800'
                  )}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isCurrent ? 'text-blue-600 dark:text-blue-500' : 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1">
                  <div
                    className={cn(
                      'h-1',
                      isCompleted ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Skills Progress - Shows multiple skill levels
 */
export interface Skill {
  name: string;
  level: number;
  maxLevel?: number;
}

export interface SkillsProgressProps {
  skills: Skill[];
  className?: string;
}

export const SkillsProgress: React.FC<SkillsProgressProps> = ({ skills, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {skills.map((skill, index) => (
        <Progress
          key={index}
          value={skill.level}
          max={skill.maxLevel || 100}
          label={skill.name}
          showLabel
          variant={skill.level >= 80 ? 'success' : skill.level >= 50 ? 'info' : 'default'}
          size="md"
        />
      ))}
    </div>
  );
};

export { Progress, progressVariants, progressBarVariants };
