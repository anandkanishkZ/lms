/**
 * Skeleton Component
 * Loading state indicators with multiple variants
 * Used throughout the app for loading states
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva('animate-pulse bg-gray-200 dark:bg-gray-700', {
  variants: {
    variant: {
      default: 'rounded',
      text: 'rounded h-4',
      title: 'rounded h-8',
      circle: 'rounded-full',
      rectangle: 'rounded',
      card: 'rounded-lg',
      avatar: 'rounded-full',
      button: 'rounded-md h-10',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
  },
  compoundVariants: [
    {
      variant: 'avatar',
      size: 'sm',
      class: 'h-8 w-8',
    },
    {
      variant: 'avatar',
      size: 'md',
      class: 'h-10 w-10',
    },
    {
      variant: 'avatar',
      size: 'lg',
      class: 'h-12 w-12',
    },
    {
      variant: 'avatar',
      size: 'xl',
      class: 'h-16 w-16',
    },
    {
      variant: 'circle',
      size: 'sm',
      class: 'h-8 w-8',
    },
    {
      variant: 'circle',
      size: 'md',
      class: 'h-12 w-12',
    },
    {
      variant: 'circle',
      size: 'lg',
      class: 'h-16 w-16',
    },
    {
      variant: 'circle',
      size: 'xl',
      class: 'h-20 w-20',
    },
    {
      variant: 'text',
      size: 'sm',
      class: 'h-3',
    },
    {
      variant: 'text',
      size: 'md',
      class: 'h-4',
    },
    {
      variant: 'text',
      size: 'lg',
      class: 'h-5',
    },
    {
      variant: 'text',
      size: 'xl',
      class: 'h-6',
    },
    {
      variant: 'title',
      size: 'sm',
      class: 'h-6',
    },
    {
      variant: 'title',
      size: 'md',
      class: 'h-8',
    },
    {
      variant: 'title',
      size: 'lg',
      class: 'h-10',
    },
    {
      variant: 'title',
      size: 'xl',
      class: 'h-12',
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
  count?: number;
  spacing?: string;
}

/**
 * Base Skeleton Component
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, width, height, count = 1, spacing = '0.5rem', style, ...props }, ref) => {
    const skeletonStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    if (count === 1) {
      return (
        <div
          ref={ref}
          className={cn(skeletonVariants({ variant, size }), className)}
          style={skeletonStyle}
          {...props}
        />
      );
    }

    return (
      <div className="space-y-2" style={{ gap: spacing }}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(skeletonVariants({ variant, size }), className)}
            style={skeletonStyle}
            {...props}
          />
        ))}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Card Skeleton - For module/lesson cards
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('rounded-lg border border-gray-200 p-4 dark:border-gray-700', className)}>
      <div className="space-y-3">
        <Skeleton variant="rectangle" height={160} />
        <Skeleton variant="title" size="md" width="70%" />
        <Skeleton variant="text" count={2} width="100%" />
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="button" width={100} />
        </div>
      </div>
    </div>
  );
};

/**
 * List Item Skeleton - For lesson lists
 */
export const SkeletonListItem: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex items-center space-x-4 p-4', className)}>
      <Skeleton variant="circle" size="md" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" size="md" width="60%" />
        <Skeleton variant="text" size="sm" width="40%" />
      </div>
      <Skeleton variant="button" width={80} />
    </div>
  );
};

/**
 * Table Skeleton - For data tables
 */
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="mb-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} variant="text" size="md" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="mb-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" size="sm" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Profile Skeleton - For user profiles
 */
export const SkeletonProfile: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex items-start space-x-4', className)}>
      <Skeleton variant="avatar" size="xl" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="title" size="md" width="40%" />
        <Skeleton variant="text" size="sm" width="60%" />
        <Skeleton variant="text" size="sm" width="50%" />
        <div className="flex space-x-2">
          <Skeleton variant="button" width={100} />
          <Skeleton variant="button" width={100} />
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard Stats Skeleton - For dashboard statistics
 */
export const SkeletonStats: React.FC<{ count?: number; className?: string }> = ({ count = 4, className }) => {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <Skeleton variant="text" size="sm" width="60%" className="mb-2" />
          <Skeleton variant="title" size="lg" width="40%" className="mb-1" />
          <Skeleton variant="text" size="sm" width="50%" />
        </div>
      ))}
    </div>
  );
};

/**
 * Module Detail Skeleton - For module detail page
 */
export const SkeletonModuleDetail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-4">
        <Skeleton variant="title" size="xl" width="60%" />
        <Skeleton variant="text" count={3} width="100%" />
        <div className="flex space-x-4">
          <Skeleton variant="button" width={120} />
          <Skeleton variant="button" width={120} />
        </div>
      </div>

      {/* Stats */}
      <SkeletonStats count={3} />

      {/* Lessons */}
      <div className="space-y-4">
        <Skeleton variant="title" size="md" width="30%" />
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
      </div>
    </div>
  );
};

/**
 * Video Player Skeleton
 */
export const SkeletonVideoPlayer: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton variant="rectangle" height={400} className="w-full" />
      <div className="space-y-2">
        <Skeleton variant="title" size="md" width="70%" />
        <Skeleton variant="text" size="sm" width="100%" />
        <Skeleton variant="text" size="sm" width="90%" />
      </div>
    </div>
  );
};

export { Skeleton, skeletonVariants };
