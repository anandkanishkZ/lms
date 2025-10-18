/**
 * Tooltip Component
 * Accessible tooltip with multiple positions and variants
 * Provides contextual help text and information
 */

import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tooltipVariants = cva(
  'absolute z-50 rounded-md px-3 py-2 text-sm font-medium shadow-lg transition-opacity duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white dark:bg-gray-700',
        light: 'bg-white text-gray-900 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white',
        success: 'bg-green-600 text-white dark:bg-green-700',
        warning: 'bg-yellow-600 text-white dark:bg-yellow-700',
        error: 'bg-red-600 text-white dark:bg-red-700',
        info: 'bg-blue-600 text-white dark:bg-blue-700',
      },
      position: {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'top',
    },
  }
);

const arrowVariants = cva('absolute h-2 w-2 rotate-45', {
  variants: {
    variant: {
      default: 'bg-gray-900 dark:bg-gray-700',
      light: 'bg-white border-gray-200 dark:border-gray-700 dark:bg-gray-800',
      success: 'bg-green-600 dark:bg-green-700',
      warning: 'bg-yellow-600 dark:bg-yellow-700',
      error: 'bg-red-600 dark:bg-red-700',
      info: 'bg-blue-600 dark:bg-blue-700',
    },
    position: {
      top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
      left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
      right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
    },
  },
  defaultVariants: {
    variant: 'default',
    position: 'top',
  },
});

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  disabled?: boolean;
  maxWidth?: number;
  arrow?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Main Tooltip Component
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  variant = 'default',
  position = 'top',
  delay = 200,
  disabled = false,
  maxWidth = 300,
  arrow = true,
  className,
  contentClassName,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Adjust tooltip position if it goes off-screen
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let newPosition = position;

      // Check if tooltip goes off right edge
      if (tooltipRect.right > windowWidth && position === 'right') {
        newPosition = 'left';
      }
      // Check if tooltip goes off left edge
      else if (tooltipRect.left < 0 && position === 'left') {
        newPosition = 'right';
      }
      // Check if tooltip goes off top edge
      else if (tooltipRect.top < 0 && position === 'top') {
        newPosition = 'bottom';
      }
      // Check if tooltip goes off bottom edge
      else if (tooltipRect.bottom > windowHeight && position === 'bottom') {
        newPosition = 'top';
      }

      if (newPosition !== actualPosition) {
        setActualPosition(newPosition);
      }
    }
  }, [isVisible, position, actualPosition]);

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          className={cn(tooltipVariants({ variant, position: actualPosition }), contentClassName)}
          style={{ maxWidth: `${maxWidth}px` }}
          role="tooltip"
        >
          {content}
          {arrow && <div className={cn(arrowVariants({ variant, position: actualPosition }))} />}
        </div>
      )}
    </div>
  );
};

/**
 * Simple Tooltip - Quick helper for basic tooltips
 */
export const SimpleTooltip: React.FC<{
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ text, children, position = 'top' }) => {
  return (
    <Tooltip content={text} position={position}>
      {children}
    </Tooltip>
  );
};

/**
 * Icon Tooltip - Tooltip specifically for icons
 */
export const IconTooltip: React.FC<{
  icon: React.ReactNode;
  text: string;
  variant?: 'default' | 'light' | 'success' | 'warning' | 'error' | 'info';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}> = ({ icon, text, variant = 'default', position = 'top', className }) => {
  return (
    <Tooltip content={text} variant={variant} position={position}>
      <div className={cn('inline-flex cursor-help items-center justify-center', className)}>{icon}</div>
    </Tooltip>
  );
};

/**
 * Rich Tooltip - Tooltip with title and description
 */
export interface RichTooltipProps {
  title: string;
  description: string;
  children: React.ReactNode;
  variant?: 'default' | 'light' | 'success' | 'warning' | 'error' | 'info';
  position?: 'top' | 'bottom' | 'left' | 'right';
  icon?: React.ReactNode;
  className?: string;
}

export const RichTooltip: React.FC<RichTooltipProps> = ({
  title,
  description,
  children,
  variant = 'light',
  position = 'top',
  icon,
  className,
}) => {
  const content = (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="font-semibold">{title}</div>
      </div>
      <div className="text-xs opacity-90">{description}</div>
    </div>
  );

  return (
    <Tooltip content={content} variant={variant} position={position} maxWidth={350} className={className}>
      {children}
    </Tooltip>
  );
};

/**
 * Interactive Tooltip - Stays open when hovering over tooltip content
 */
export const InteractiveTooltip: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'light' | 'success' | 'warning' | 'error' | 'info';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}> = ({ content, children, variant = 'light', position = 'top', className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={cn(tooltipVariants({ variant, position }), 'cursor-auto')}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ maxWidth: '400px' }}
          role="tooltip"
        >
          {content}
          <div className={cn(arrowVariants({ variant, position }))} />
        </div>
      )}
    </div>
  );
};

/**
 * Keyboard Shortcut Tooltip
 */
export const KeyboardTooltip: React.FC<{
  shortcut: string | string[];
  children: React.ReactNode;
  description?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ shortcut, children, description, position = 'bottom' }) => {
  const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];

  const content = (
    <div className="space-y-1">
      {description && <div className="text-xs">{description}</div>}
      <div className="flex items-center space-x-1">
        {shortcuts.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-xs">+</span>}
            <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <Tooltip content={content} variant="light" position={position} maxWidth={250}>
      {children}
    </Tooltip>
  );
};

export { tooltipVariants, arrowVariants };
