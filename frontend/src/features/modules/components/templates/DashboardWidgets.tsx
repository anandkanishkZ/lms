/**
 * Dashboard Widgets
 * Reusable widget components for student and admin dashboards
 * Includes: Stats cards, progress widgets, activity feeds, quick actions
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { cn } from '@/lib/utils';

/**
 * Stats Card - Display key metrics with icon and trend
 */
export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  className,
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.value}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-4 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

/**
 * Progress Widget - Show course/task progress with details
 */
export interface ProgressItem {
  id: string;
  title: string;
  subtitle?: string;
  progress: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export interface ProgressWidgetProps {
  title: string;
  items: ProgressItem[];
  onItemClick?: (id: string) => void;
  className?: string;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  title,
  items,
  onItemClick,
  className,
}) => {
  return (
    <Card className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No items to display
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full text-left space-y-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-3">
                  {item.progress}%
                </span>
              </div>
              <Progress value={item.progress} color={item.color} size="sm" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};

/**
 * Activity Feed - Show recent activities with avatars
 */
export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  time: Date;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface ActivityFeedProps {
  title: string;
  activities: ActivityItem[];
  onActivityClick?: (id: string) => void;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  title,
  activities,
  onActivityClick,
  className,
}) => {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const typeColors = {
    success: 'bg-green-100 dark:bg-green-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30',
    error: 'bg-red-100 dark:bg-red-900/30',
  };

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {activities.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No recent activity
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => onActivityClick?.(activity.id)}
              className="w-full flex items-start gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-lg transition-colors"
            >
              <Avatar
                src={activity.user.avatar}
                alt={activity.user.name}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{activity.user.name}</span>
                  {' '}
                  <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                  {activity.target && (
                    <>
                      {' '}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {activity.target}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getTimeAgo(activity.time)}
                </p>
              </div>
              {activity.type && (
                <div className={cn('w-2 h-2 rounded-full mt-2', typeColors[activity.type])} />
              )}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};

/**
 * Quick Actions - Button grid for common actions
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick: () => void;
}

export interface QuickActionsProps {
  title: string;
  actions: QuickAction[];
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  title,
  actions,
  className,
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50',
  };

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-colors',
              colorClasses[action.color || 'blue']
            )}
          >
            <div className="h-8 w-8">
              {action.icon}
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

/**
 * Upcoming Classes Widget - Show scheduled classes
 */
export interface UpcomingClass {
  id: string;
  title: string;
  instructor?: string;
  startTime: Date;
  duration: number;
  type: 'live' | 'recorded' | 'webinar';
  thumbnail?: string;
}

export interface UpcomingClassesProps {
  title: string;
  classes: UpcomingClass[];
  onClassClick?: (id: string) => void;
  onJoinClick?: (id: string) => void;
  className?: string;
}

export const UpcomingClasses: React.FC<UpcomingClassesProps> = ({
  title,
  classes,
  onClassClick,
  onJoinClick,
  className,
}) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const isStartingSoon = (startTime: Date) => {
    const diff = startTime.getTime() - new Date().getTime();
    return diff > 0 && diff < 15 * 60 * 1000; // Within 15 minutes
  };

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {classes.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No upcoming classes
        </p>
      ) : (
        <div className="space-y-3">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {classItem.thumbnail && (
                <img
                  src={classItem.thumbnail}
                  alt={classItem.title}
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onClassClick?.(classItem.id)}
                  className="text-left"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {classItem.title}
                  </h4>
                  {classItem.instructor && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.instructor}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge size="sm" color={classItem.type === 'live' ? 'red' : 'blue'}>
                      {classItem.type}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(classItem.startTime)} • {classItem.duration}min
                    </span>
                  </div>
                </button>
              </div>
              {isStartingSoon(classItem.startTime) && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onJoinClick?.(classItem.id)}
                >
                  Join Now
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

/**
 * Performance Summary - Display exam/quiz scores
 */
export interface PerformanceData {
  label: string;
  score: number;
  maxScore: number;
  date?: Date;
}

export interface PerformanceSummaryProps {
  title: string;
  data: PerformanceData[];
  averageScore?: number;
  className?: string;
}

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  title,
  data,
  averageScore,
  className,
}) => {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 70) return 'blue';
    if (percentage >= 50) return 'yellow';
    return 'red';
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {averageScore !== undefined && (
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
            <p className={cn('text-2xl font-bold', getScoreColor(averageScore))}>
              {averageScore}%
            </p>
          </div>
        )}
      </div>
      {data.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No performance data available
        </p>
      ) : (
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.score / item.maxScore) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {item.label}
                    </p>
                    {item.date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <p className={cn('text-lg font-bold ml-3', getScoreColor(percentage))}>
                    {item.score}/{item.maxScore}
                  </p>
                </div>
                <Progress
                  value={percentage}
                  color={getProgressColor(percentage)}
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
