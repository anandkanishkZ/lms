/**
 * Module Card Template
 * Reusable card component for displaying module/subject information
 * Used in module listings, dashboards, search results
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { cn } from '@/lib/utils';

export interface ModuleCardData {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  duration?: number; // in minutes
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  enrolledCount?: number;
  rating?: number;
  isEnrolled?: boolean;
  progress?: number; // 0-100
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  tags?: string[];
  lastUpdated?: Date;
}

export interface ModuleCardProps {
  module: ModuleCardData;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  onEnroll?: (moduleId: string) => void;
  onView?: (moduleId: string) => void;
  onClick?: (moduleId: string) => void;
  className?: string;
}

/**
 * Base Module Card
 */
export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  variant = 'default',
  showProgress = true,
  onEnroll,
  onView,
  onClick,
  className,
}) => {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLevelColor = (level?: string): 'blue' | 'yellow' | 'red' => {
    switch (level) {
      case 'Beginner': return 'blue';
      case 'Intermediate': return 'yellow';
      case 'Advanced': return 'red';
      default: return 'blue';
    }
  };

  const getStatusColor = (status?: string): 'blue' | 'green' | 'gray' => {
    switch (status) {
      case 'draft': return 'gray';
      case 'published': return 'green';
      case 'archived': return 'blue';
      default: return 'blue';
    }
  };

  const handleClick = () => {
    onClick?.(module.id);
  };

  const handleEnroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnroll?.(module.id);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(module.id);
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card
        variant="interactive"
        padding="sm"
        onClick={handleClick}
        className={cn('cursor-pointer', className)}
      >
        <div className="flex items-center gap-4">
          {module.thumbnail && (
            <img
              src={module.thumbnail}
              alt={module.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {module.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Avatar
                src={module.instructor.avatar}
                name={module.instructor.name}
                size="xs"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {module.instructor.name}
              </span>
            </div>
          </div>
          {module.isEnrolled && showProgress && module.progress !== undefined && (
            <div className="w-24">
              <Progress value={module.progress} size="sm" showLabel />
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Default and Detailed variants
  return (
    <Card
      variant="interactive"
      onClick={handleClick}
      className={cn('cursor-pointer overflow-hidden', className)}
    >
      {/* Thumbnail */}
      {module.thumbnail && (
        <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={module.thumbnail}
            alt={module.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {module.isEnrolled && (
            <div className="absolute top-3 right-3">
              <Badge color="green" size="sm">Enrolled</Badge>
            </div>
          )}
          {module.status && module.status !== 'published' && (
            <div className="absolute top-3 left-3">
              <Badge color={getStatusColor(module.status)} size="sm">
                {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {module.title}
            </h3>
          </div>
          
          {variant === 'detailed' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {module.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          {module.level && (
            <Badge color={getLevelColor(module.level)} size="sm">
              {module.level}
            </Badge>
          )}
          {module.category && (
            <Badge variant="outline" size="sm">
              {module.category}
            </Badge>
          )}
          {module.duration && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(module.duration)}
            </span>
          )}
          {module.rating && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {module.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Avatar
            src={module.instructor.avatar}
            name={module.instructor.name}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {module.instructor.name}
            </p>
            {module.enrolledCount !== undefined && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {module.enrolledCount.toLocaleString()} students
              </p>
            )}
          </div>
        </div>

        {/* Progress (if enrolled) */}
        {module.isEnrolled && showProgress && module.progress !== undefined && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{module.progress}%</span>
            </div>
            <Progress value={module.progress} />
          </div>
        )}

        {/* Enroll Action */}
        <div className="flex items-center justify-end pt-2">
          {module.isEnrolled ? (
            <Button size="sm" onClick={handleView}>
              Continue Learning
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleEnroll}
            >
              Enroll Now
            </Button>
          )}
        </div>

        {/* Tags (detailed variant) */}
        {variant === 'detailed' && module.tags && module.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200 dark:border-gray-700">
            {module.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
            {module.tags.length > 3 && (
              <Badge variant="outline" size="sm">+{module.tags.length - 3}</Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Module Card Skeleton (Loading state)
 */
export const ModuleCardSkeleton: React.FC<{ variant?: 'default' | 'compact' | 'detailed' }> = ({
  variant = 'default',
}) => {
  if (variant === 'compact') {
    return (
      <Card padding="sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
};

/**
 * Module Grid - Grid layout for module cards
 */
export interface ModuleGridProps {
  modules: ModuleCardData[];
  variant?: 'default' | 'compact' | 'detailed';
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
  emptyMessage?: string;
  onEnroll?: (moduleId: string) => void;
  onView?: (moduleId: string) => void;
  onClick?: (moduleId: string) => void;
  className?: string;
}

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  variant = 'default',
  columns = 3,
  loading = false,
  emptyMessage = 'No modules found',
  onEnroll,
  onView,
  onClick,
  className,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  if (loading) {
    return (
      <div className={cn('grid gap-6', gridCols, className)}>
        {Array.from({ length: columns * 2 }).map((_, index) => (
          <ModuleCardSkeleton key={index} variant={variant} />
        ))}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', gridCols, className)}>
      {modules.map((module) => (
        <ModuleCard
          key={module.id}
          module={module}
          variant={variant}
          onEnroll={onEnroll}
          onView={onView}
          onClick={onClick}
        />
      ))}
    </div>
  );
};
