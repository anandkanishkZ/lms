/**
 * Dropdown Component
 * Dropdown menu for actions, navigation, and options
 * Used for user menus, action buttons, context menus, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const dropdownContentVariants = cva(
  'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-gray-700 dark:bg-gray-900',
  {
    variants: {
      align: {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
      },
      side: {
        top: 'bottom-full mb-1',
        bottom: 'top-full mt-1',
        left: 'right-full mr-1',
        right: 'left-full ml-1',
      },
    },
    defaultVariants: {
      align: 'start',
      side: 'bottom',
    },
  }
);

const dropdownItemVariants = cva(
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-white',
  {
    variants: {
      variant: {
        default: 'hover:bg-gray-100 dark:hover:bg-gray-800',
        destructive: 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-900/20',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      disabled: false,
    },
  }
);

export interface DropdownItem {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  onClick?: () => void;
  separator?: boolean;
}

export interface DropdownProps extends VariantProps<typeof dropdownContentVariants> {
  trigger: React.ReactNode;
  items: DropdownItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
}

/**
 * Base Dropdown Component
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  open: controlledOpen,
  onOpenChange,
  align,
  side,
  className,
  contentClassName,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : isOpen;

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick?.();
      handleOpenChange(false);
    }
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div onClick={() => handleOpenChange(!open)}>{trigger}</div>

      {/* Dropdown Content */}
      {open && (
        <div className={cn(dropdownContentVariants({ align, side }), contentClassName)}>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.separator ? (
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
              ) : (
                <div
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    dropdownItemVariants({
                      variant: item.variant,
                      disabled: item.disabled,
                    })
                  )}
                >
                  {item.icon && <span className="mr-2 h-4 w-4">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-auto text-xs tracking-widest text-gray-500">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * User Menu Dropdown - Pre-configured for user profile menu
 */
export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onProfile,
  onSettings,
  onLogout,
  className,
}) => {
  const items: DropdownItem[] = [
    {
      label: 'Profile',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      onClick: onProfile,
    },
    {
      label: 'Settings',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: onSettings,
    },
    { separator: true, label: '' },
    {
      label: 'Log out',
      variant: 'destructive',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
      onClick: onLogout,
    },
  ];

  return (
    <Dropdown
      trigger={
        <button className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden text-left md:block">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      }
      items={items}
      align="end"
      className={className}
    />
  );
};

/**
 * Actions Dropdown - Pre-configured for action menus
 */
export interface ActionsDropdownProps {
  actions: DropdownItem[];
  label?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'icon';
  className?: string;
}

export const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  actions,
  label = 'Actions',
  icon,
  variant = 'default',
  className,
}) => {
  const defaultIcon = (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );

  return (
    <Dropdown
      trigger={
        variant === 'icon' ? (
          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Actions"
          >
            {icon || defaultIcon}
          </button>
        ) : (
          <button className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
            <span>{label}</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )
      }
      items={actions}
      className={className}
    />
  );
};

export { dropdownContentVariants, dropdownItemVariants };
