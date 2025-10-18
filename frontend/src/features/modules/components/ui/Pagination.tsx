/**
 * Pagination Component
 * Page navigation controls for paginated data
 * Used with tables, lists, search results, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const paginationVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      variant: {
        default: '',
        compact: 'space-x-1',
        simple: 'justify-between',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const paginationButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'h-9 min-w-[36px] px-3',
        compact: 'h-8 min-w-[32px] px-2',
        simple: 'h-10 px-4',
      },
      active: {
        true: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
        false: 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
      },
    },
    defaultVariants: {
      variant: 'default',
      active: false,
    },
  }
);

export interface PaginationProps extends VariantProps<typeof paginationVariants> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
  className?: string;
}

/**
 * Base Pagination Component
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  variant,
  showFirstLast = true,
  showPrevNext = true,
  maxVisible = 7,
  className,
}) => {
  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const leftOffset = Math.floor((maxVisible - 3) / 2);
    const rightOffset = Math.ceil((maxVisible - 3) / 2);

    // Always show first page
    pages.push(1);

    if (currentPage <= leftOffset + 2) {
      // Near the beginning
      for (let i = 2; i < maxVisible - 1; i++) {
        pages.push(i);
      }
      pages.push('...');
    } else if (currentPage >= totalPages - rightOffset - 1) {
      // Near the end
      pages.push('...');
      for (let i = totalPages - maxVisible + 3; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // In the middle
      pages.push('...');
      for (let i = currentPage - leftOffset; i <= currentPage + rightOffset; i++) {
        pages.push(i);
      }
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (variant === 'simple') {
    return (
      <div className={cn(paginationVariants({ variant }), className)}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(paginationButtonVariants({ variant, active: false }), 'border border-gray-300 dark:border-gray-600')}
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(paginationButtonVariants({ variant, active: false }), 'border border-gray-300 dark:border-gray-600')}
        >
          Next
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={cn(paginationVariants({ variant }), 'space-x-1', className)}>
      {/* First Page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={cn(paginationButtonVariants({ variant, active: false }), 'border border-gray-300 dark:border-gray-600')}
          aria-label="First page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Previous Page */}
      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(paginationButtonVariants({ variant, active: false }), 'border border-gray-300 dark:border-gray-600')}
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => handlePageChange(page)}
            className={cn(
              paginationButtonVariants({ variant, active: currentPage === page }),
              currentPage !== page && 'border border-gray-300 dark:border-gray-600'
            )}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span
            key={index}
            className="inline-flex h-9 min-w-[36px] items-center justify-center px-2 text-gray-500"
          >
            {page}
          </span>
        )
      )}

      {/* Next Page */}
      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(paginationButtonVariants({ variant, active: false }), 'border border-gray-300 dark:border-gray-600')}
          aria-label="Next page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Last Page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(paginationButtonVariants({ variant, active: false }), 'border border-gray-300 dark:border-gray-600')}
          aria-label="Last page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Pagination with Info - Shows page info and items per page
 */
export interface PaginationWithInfoProps extends PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange?: (value: number) => void;
  itemsPerPageOptions?: number[];
}

export const PaginationWithInfo: React.FC<PaginationWithInfoProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
  className,
  ...props
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn('flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0', className)}>
      {/* Info */}
      <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300">
        <span>
          Showing {startItem} to {endItem} of {totalItems} results
        </span>
        {onItemsPerPageChange && (
          <div className="flex items-center space-x-2">
            <label htmlFor="items-per-page" className="whitespace-nowrap">
              Items per page:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        {...props}
      />
    </div>
  );
};

/**
 * Compact Pagination - Minimal pagination for mobile
 */
export const CompactPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Previous page"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span className="text-sm text-gray-700 dark:text-gray-300">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Next page"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export { paginationVariants, paginationButtonVariants };
