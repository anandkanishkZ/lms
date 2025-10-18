/**
 * Avatar Component
 * User profile images with fallback initials and status indicators
 * Used for user profiles, comments, chat, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center font-medium text-white overflow-hidden shrink-0',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

const statusVariants = cva(
  'absolute rounded-full border-2 border-white dark:border-gray-900',
  {
    variants: {
      status: {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        away: 'bg-yellow-500',
        busy: 'bg-red-500',
      },
      size: {
        xs: 'h-1.5 w-1.5 bottom-0 right-0',
        sm: 'h-2 w-2 bottom-0 right-0',
        md: 'h-2.5 w-2.5 bottom-0 right-0',
        lg: 'h-3 w-3 bottom-0.5 right-0.5',
        xl: 'h-3.5 w-3.5 bottom-0.5 right-0.5',
        '2xl': 'h-4 w-4 bottom-1 right-1',
      },
    },
    defaultVariants: {
      status: 'online',
      size: 'md',
    },
  }
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  imgClassName?: string;
  onClick?: () => void;
}

/**
 * Base Avatar Component
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name = '',
  status,
  size,
  shape,
  className,
  imgClassName,
  onClick,
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Generate initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Generate background color from name
  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-600',
      'bg-green-600',
      'bg-yellow-600',
      'bg-red-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-indigo-600',
      'bg-teal-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={cn(
        avatarVariants({ size, shape }),
        !src || imgError ? getBackgroundColor(name) : '',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImgError(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
      {status && (
        <span className={cn(statusVariants({ status, size }))} title={status} />
      )}
    </div>
  );
};

/**
 * Avatar Group - Stack multiple avatars with overlap
 */
export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name: string;
    alt?: string;
  }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 5,
  size = 'md',
  shape = 'circle',
  className,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapClass = {
    xs: '-space-x-2',
    sm: '-space-x-2',
    md: '-space-x-3',
    lg: '-space-x-4',
    xl: '-space-x-5',
    '2xl': '-space-x-6',
  }[size];

  return (
    <div className={cn('flex items-center', overlapClass, className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
          shape={shape}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            avatarVariants({ size, shape }),
            'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
            'ring-2 ring-white dark:ring-gray-900'
          )}
        >
          <span>+{remaining}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Avatar with Badge - Avatar with notification badge
 */
export interface AvatarWithBadgeProps extends AvatarProps {
  badge?: number | string;
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow';
}

export const AvatarWithBadge: React.FC<AvatarWithBadgeProps> = ({
  badge,
  badgeColor = 'red',
  ...avatarProps
}) => {
  const badgeColorClass = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
  }[badgeColor];

  const badgeSizeClass = {
    xs: 'h-4 w-4 text-[10px] -top-1 -right-1',
    sm: 'h-5 w-5 text-xs -top-1 -right-1',
    md: 'h-6 w-6 text-xs -top-1.5 -right-1.5',
    lg: 'h-7 w-7 text-sm -top-2 -right-2',
    xl: 'h-8 w-8 text-sm -top-2 -right-2',
    '2xl': 'h-9 w-9 text-base -top-2.5 -right-2.5',
  }[avatarProps.size || 'md'];

  return (
    <div className="relative inline-block">
      <Avatar {...avatarProps} />
      {badge !== undefined && (
        <span
          className={cn(
            'absolute flex items-center justify-center rounded-full text-white font-semibold',
            badgeColorClass,
            badgeSizeClass
          )}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  );
};

/**
 * User Avatar - Pre-configured with name and optional subtitle
 */
export interface UserAvatarProps extends AvatarProps {
  subtitle?: string;
  showName?: boolean;
  vertical?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '',
  subtitle,
  showName = true,
  vertical = false,
  ...avatarProps
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        vertical && 'flex-col text-center'
      )}
    >
      <Avatar name={name} {...avatarProps} />
      {showName && (
        <div className={cn('flex flex-col', vertical && 'items-center')}>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {name}
          </span>
          {subtitle && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export { avatarVariants, statusVariants };
