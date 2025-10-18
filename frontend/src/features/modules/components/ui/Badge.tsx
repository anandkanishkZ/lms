/**
 * Badge Component
 * Status indicators for modules, lessons, enrollments, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        
        // Module status variants
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        'under-review': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        archived: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        
        // Lesson type variants
        video: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        pdf: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        text: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
        quiz: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        assignment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        'external-link': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
        'youtube-live': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before the badge text
   */
  icon?: React.ReactNode;
  /**
   * Whether the badge should pulse (for live/active states)
   */
  pulse?: boolean;
  /**
   * Whether the badge is removable (shows X button)
   */
  removable?: boolean;
  /**
   * Callback when remove button is clicked
   */
  onRemove?: () => void;
}

export function Badge({
  className,
  variant,
  size,
  icon,
  pulse = false,
  removable = false,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
          aria-label="Remove"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// Helper components for common use cases
export function ModuleStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: any; label: string }> = {
    DRAFT: { variant: 'draft', label: 'Draft' },
    UNDER_REVIEW: { variant: 'under-review', label: 'Under Review' },
    APPROVED: { variant: 'approved', label: 'Approved' },
    PUBLISHED: { variant: 'published', label: 'Published' },
    ARCHIVED: { variant: 'archived', label: 'Archived' },
  };

  const config = statusMap[status] || { variant: 'default', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function LessonTypeBadge({ type }: { type: string }) {
  const typeMap: Record<string, { variant: any; label: string; icon: string }> = {
    VIDEO: { variant: 'video', label: 'Video', icon: '🎥' },
    PDF: { variant: 'pdf', label: 'PDF', icon: '📄' },
    TEXT: { variant: 'text', label: 'Text', icon: '📝' },
    QUIZ: { variant: 'quiz', label: 'Quiz', icon: '❓' },
    ASSIGNMENT: { variant: 'assignment', label: 'Assignment', icon: '📋' },
    EXTERNAL_LINK: { variant: 'external-link', label: 'External Link', icon: '🔗' },
    YOUTUBE_LIVE: { variant: 'youtube-live', label: 'YouTube Live', icon: '📺' },
  };

  const config = typeMap[type] || { variant: 'default', label: type, icon: '' };

  return (
    <Badge variant={config.variant}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

export function LiveBadge() {
  return (
    <Badge variant="error" pulse>
      <span className="mr-1">🔴</span>
      LIVE
    </Badge>
  );
}

export function CompletionBadge({ percentage }: { percentage: number }) {
  const variant = percentage >= 100 ? 'success' : percentage >= 50 ? 'info' : 'warning';
  
  return (
    <Badge variant={variant}>
      {percentage >= 100 ? '✅' : '📊'} {percentage}% Complete
    </Badge>
  );
}
