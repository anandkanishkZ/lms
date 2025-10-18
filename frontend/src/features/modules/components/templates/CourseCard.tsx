/**
 * Course Card Template
 * Reusable card component for displaying course information
 * Used in course listings, dashboards, search results
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { cn } from '@/lib/utils';

export interface CourseCardData {
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
  price?: number;
  isFree?: boolean;
  isEnrolled?: boolean;
  progress?: number; // 0-100
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  tags?: string[];
  lastUpdated?: Date;
}

export interface CourseCardProps {
  course: CourseCardData;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  onEnroll?: (courseId: string) => void;
  onView?: (courseId: string) => void;
  onClick?: (courseId: string) => void;
  className?: string;
}

/**
 * Base Course Card
 */
export const CourseCard: React.FC<CourseCardProps> = ({
  course,
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
    onClick?.(course.id);
  };

  const handleEnroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnroll?.(course.id);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(course.id);
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
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {course.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Avatar
                src={course.instructor.avatar}
                name={course.instructor.name}
                size="xs"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {course.instructor.name}
              </span>
            </div>
          </div>
          {course.isEnrolled && showProgress && course.progress !== undefined && (
            <div className="w-24">
              <Progress value={course.progress} size="sm" showLabel />
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
      {course.thumbnail && (
        <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {course.isEnrolled && (
            <div className="absolute top-3 right-3">
              <Badge color="green" size="sm">Enrolled</Badge>
            </div>
          )}
          {course.status && course.status !== 'published' && (
            <div className="absolute top-3 left-3">
              <Badge color={getStatusColor(course.status)} size="sm">
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
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
              {course.title}
            </h3>
          </div>
          
          {variant === 'detailed' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {course.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          {course.level && (
            <Badge color={getLevelColor(course.level)} size="sm">
              {course.level}
            </Badge>
          )}
          {course.category && (
            <Badge variant="outline" size="sm">
              {course.category}
            </Badge>
          )}
          {course.duration && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(course.duration)}
            </span>
          )}
          {course.rating && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {course.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Avatar
            src={course.instructor.avatar}
            name={course.instructor.name}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {course.instructor.name}
            </p>
            {course.enrolledCount !== undefined && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {course.enrolledCount.toLocaleString()} students
              </p>
            )}
          </div>
        </div>

        {/* Progress (if enrolled) */}
        {course.isEnrolled && showProgress && course.progress !== undefined && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} />
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2">
          {course.isFree ? (
            <span className="text-lg font-bold text-green-600 dark:text-green-400">Free</span>
          ) : course.price !== undefined ? (
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${course.price}
            </span>
          ) : null}

          {course.isEnrolled ? (
            <Button size="sm" onClick={handleView}>
              Continue Learning
            </Button>
          ) : (
            <Button
              size="sm"
              variant={course.isFree ? 'outline' : 'default'}
              onClick={handleEnroll}
            >
              {course.isFree ? 'Enroll Free' : 'Enroll Now'}
            </Button>
          )}
        </div>

        {/* Tags (detailed variant) */}
        {variant === 'detailed' && course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200 dark:border-gray-700">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" size="sm">+{course.tags.length - 3}</Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Course Card Skeleton (Loading state)
 */
export const CourseCardSkeleton: React.FC<{ variant?: 'default' | 'compact' | 'detailed' }> = ({
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
 * Course Grid - Grid layout for course cards
 */
export interface CourseGridProps {
  courses: CourseCardData[];
  variant?: 'default' | 'compact' | 'detailed';
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
  emptyMessage?: string;
  onEnroll?: (courseId: string) => void;
  onView?: (courseId: string) => void;
  onClick?: (courseId: string) => void;
  className?: string;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  variant = 'default',
  columns = 3,
  loading = false,
  emptyMessage = 'No courses found',
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
          <CourseCardSkeleton key={index} variant={variant} />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
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
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          variant={variant}
          onEnroll={onEnroll}
          onView={onView}
          onClick={onClick}
        />
      ))}
    </div>
  );
};
