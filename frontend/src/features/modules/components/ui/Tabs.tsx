/**
 * Tabs Component
 * Tabbed navigation for organizing content into sections
 * Used for course sections, profile pages, settings, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tabsListVariants = cva(
  'inline-flex items-center',
  {
    variants: {
      variant: {
        default: 'border-b border-gray-200 dark:border-gray-700',
        pills: 'rounded-lg bg-gray-100 p-1 dark:bg-gray-800',
        enclosed: 'border-b border-gray-200 dark:border-gray-700',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      fullWidth: false,
    },
  }
);

const tabTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:hover:border-gray-600 dark:hover:text-gray-300 dark:data-[state=active]:border-blue-500 dark:data-[state=active]:text-blue-500',
        pills: 'rounded-md hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:hover:bg-gray-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white',
        enclosed: 'rounded-t-lg border border-b-0 border-transparent hover:border-gray-300 data-[state=active]:border-gray-200 data-[state=active]:bg-white dark:hover:border-gray-600 dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-900',
      },
      fullWidth: {
        true: 'flex-1',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      fullWidth: false,
    },
  }
);

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  content: React.ReactNode;
}

export interface TabsProps extends VariantProps<typeof tabsListVariants> {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  contentClassName?: string;
}

/**
 * Base Tabs Component
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  value: controlledValue,
  onChange,
  variant,
  fullWidth,
  className,
  contentClassName,
}) => {
  const [activeTab, setActiveTab] = React.useState<string>(
    controlledValue || defaultValue || tabs[0]?.value || ''
  );

  // Update active tab when controlled value changes
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setActiveTab(controlledValue);
    }
  }, [controlledValue]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  const activeTabContent = tabs.find((tab) => tab.value === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div className={cn(tabsListVariants({ variant, fullWidth }))} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls={`panel-${tab.value}`}
            id={`tab-${tab.value}`}
            disabled={tab.disabled}
            data-state={activeTab === tab.value ? 'active' : 'inactive'}
            onClick={() => !tab.disabled && handleTabChange(tab.value)}
            className={cn(
              tabTriggerVariants({ variant, fullWidth }),
              'text-gray-600 dark:text-gray-400'
            )}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className={cn('mt-4', contentClassName)}
      >
        {activeTabContent}
      </div>
    </div>
  );
};

/**
 * Vertical Tabs - Tabs with vertical orientation
 */
export interface VerticalTabsProps extends Omit<TabsProps, 'fullWidth'> {
  tabWidth?: string;
}

export const VerticalTabs: React.FC<VerticalTabsProps> = ({
  tabs,
  tabWidth = 'w-48',
  className,
  contentClassName,
  ...props
}) => {
  const [activeTab, setActiveTab] = React.useState<string>(
    props.value || props.defaultValue || tabs[0]?.value || ''
  );

  React.useEffect(() => {
    if (props.value !== undefined) {
      setActiveTab(props.value);
    }
  }, [props.value]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    props.onChange?.(value);
  };

  const activeTabContent = tabs.find((tab) => tab.value === activeTab)?.content;

  return (
    <div className={cn('flex gap-4', className)}>
      {/* Vertical Tab List */}
      <div className={cn('flex flex-col space-y-1', tabWidth)} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls={`panel-${tab.value}`}
            id={`tab-${tab.value}`}
            disabled={tab.disabled}
            data-state={activeTab === tab.value ? 'active' : 'inactive'}
            onClick={() => !tab.disabled && handleTabChange(tab.value)}
            className={cn(
              'flex items-center justify-start rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
              tab.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            <span className="flex-1">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs font-semibold',
                  activeTab === tab.value
                    ? 'bg-blue-500 text-white dark:bg-blue-400'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Vertical Tab Content */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className={cn('flex-1', contentClassName)}
      >
        {activeTabContent}
      </div>
    </div>
  );
};

/**
 * Icon Tabs - Tabs with only icons (compact)
 */
export interface IconTabsProps extends Omit<TabsProps, 'fullWidth'> {
  showTooltip?: boolean;
}

export const IconTabs: React.FC<IconTabsProps> = ({
  tabs,
  showTooltip = true,
  className,
  contentClassName,
  ...props
}) => {
  const [activeTab, setActiveTab] = React.useState<string>(
    props.value || props.defaultValue || tabs[0]?.value || ''
  );

  React.useEffect(() => {
    if (props.value !== undefined) {
      setActiveTab(props.value);
    }
  }, [props.value]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    props.onChange?.(value);
  };

  const activeTabContent = tabs.find((tab) => tab.value === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Icon Tab List */}
      <div className="inline-flex items-center space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls={`panel-${tab.value}`}
            aria-label={tab.label}
            id={`tab-${tab.value}`}
            disabled={tab.disabled}
            title={showTooltip ? tab.label : undefined}
            data-state={activeTab === tab.value ? 'active' : 'inactive'}
            onClick={() => !tab.disabled && handleTabChange(tab.value)}
            className={cn(
              'relative rounded-md p-2 transition-colors',
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700',
              tab.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {tab.icon}
            {tab.badge !== undefined && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Icon Tab Content */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className={cn('mt-4', contentClassName)}
      >
        {activeTabContent}
      </div>
    </div>
  );
};

/**
 * Scrollable Tabs - Tabs with horizontal scroll for many items
 */
export const ScrollableTabs: React.FC<TabsProps> = ({
  tabs,
  className,
  contentClassName,
  ...props
}) => {
  const [activeTab, setActiveTab] = React.useState<string>(
    props.value || props.defaultValue || tabs[0]?.value || ''
  );
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (props.value !== undefined) {
      setActiveTab(props.value);
    }
  }, [props.value]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    props.onChange?.(value);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const activeTabContent = tabs.find((tab) => tab.value === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Scrollable Tab List */}
      <div className="relative border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 z-10 flex h-full items-center bg-gradient-to-r from-white to-transparent px-2 dark:from-gray-900"
          aria-label="Scroll left"
        >
          <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={scrollContainerRef}
          className="scrollbar-hide flex overflow-x-auto"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              aria-controls={`panel-${tab.value}`}
              id={`tab-${tab.value}`}
              disabled={tab.disabled}
              data-state={activeTab === tab.value ? 'active' : 'inactive'}
              onClick={() => !tab.disabled && handleTabChange(tab.value)}
              className={cn(
                'flex-shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.value
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300',
                tab.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 z-10 flex h-full items-center bg-gradient-to-l from-white to-transparent px-2 dark:from-gray-900"
          aria-label="Scroll right"
        >
          <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Scrollable Tab Content */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className={cn('mt-4', contentClassName)}
      >
        {activeTabContent}
      </div>
    </div>
  );
};

export { tabsListVariants, tabTriggerVariants };
