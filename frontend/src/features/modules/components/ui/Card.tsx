/**
 * Card Component
 * Container component for grouping related content
 * Used throughout the application for modules, lessons, and various content displays
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-lg bg-white shadow transition-all duration-200 dark:bg-gray-800', {
  variants: {
    variant: {
      default: 'border border-gray-200 dark:border-gray-700',
      elevated: 'shadow-lg',
      outlined: 'border-2 border-gray-300 shadow-none dark:border-gray-600',
      filled: 'bg-gray-50 shadow-none dark:bg-gray-900',
      interactive: 'border border-gray-200 hover:shadow-lg hover:border-blue-500 cursor-pointer dark:border-gray-700 dark:hover:border-blue-500',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean;
  clickable?: boolean;
}

/**
 * Base Card Component
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover = false, clickable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding }),
          hover && 'hover:shadow-md',
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, divided = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5',
          divided && 'border-b border-gray-200 pb-4 dark:border-gray-700',
          className
        )}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Title
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white', className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

/**
 * Card Description
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
      {...props}
    />
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * Card Content
 */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />;
  }
);

CardContent.displayName = 'CardContent';

/**
 * Card Footer
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, divided = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          divided && 'border-t border-gray-200 pt-4 dark:border-gray-700',
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

/**
 * Module Card - Specialized card for displaying modules
 */
export interface ModuleCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  duration?: string;
  lessonsCount?: number;
  progress?: number;
  instructor?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  onClick?: () => void;
  className?: string;
  badge?: React.ReactNode;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  imageUrl,
  duration,
  lessonsCount,
  progress,
  instructor,
  difficulty,
  onClick,
  className,
  badge,
}) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <Card variant="interactive" padding="none" onClick={onClick} className={className}>
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-200">
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          {badge && <div className="absolute right-3 top-3">{badge}</div>}
          {difficulty && (
            <div className="absolute bottom-3 left-3">
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  difficultyColors[difficulty]
                )}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <CardHeader className="mb-3">
          <CardTitle className="line-clamp-2">{title}</CardTitle>
          {instructor && (
            <CardDescription className="text-xs">by {instructor}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
          {progress !== undefined && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-blue-600 transition-all dark:bg-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
          {duration && (
            <div className="flex items-center">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {duration}
            </div>
          )}
          {lessonsCount !== undefined && (
            <div className="ml-auto flex items-center">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              {lessonsCount} lessons
            </div>
          )}
        </CardFooter>
      </div>
    </Card>
  );
};

/**
 * Lesson Card - Specialized card for displaying lessons
 */
export interface LessonCardProps {
  title: string;
  type: 'video' | 'pdf' | 'text' | 'quiz' | 'assignment';
  duration?: string;
  completed?: boolean;
  locked?: boolean;
  onClick?: () => void;
  className?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  title,
  type,
  duration,
  completed = false,
  locked = false,
  onClick,
  className,
}) => {
  const typeIcons = {
    video: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    pdf: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    text: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    quiz: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    assignment: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  };

  return (
    <Card
      variant={locked ? 'outlined' : 'interactive'}
      padding="md"
      onClick={locked ? undefined : onClick}
      className={cn(locked && 'opacity-50', className)}
    >
      <div className="flex items-center space-x-4">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            completed ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
          )}
        >
          {locked ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          ) : (
            typeIcons[type]
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
          {duration && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{duration}</p>
          )}
        </div>
        {completed && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Stats Card - For displaying statistics
 */
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, className }) => {
  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-2 flex items-center text-sm font-medium',
                change.isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              )}
            >
              {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
