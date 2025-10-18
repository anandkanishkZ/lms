/**
 * Table Component
 * Data table with sorting, filtering, and pagination
 * Used for student lists, course management, grade tables, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tableVariants = cva(
  'w-full caption-bottom text-sm',
  {
    variants: {
      variant: {
        default: '',
        striped: '[&_tbody_tr:nth-child(odd)]:bg-gray-50 dark:[&_tbody_tr:nth-child(odd)]:bg-gray-900/50',
        bordered: 'border border-gray-200 dark:border-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T = any> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cell?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T = any> extends VariantProps<typeof tableVariants> {
  columns: Column<T>[];
  data: T[];
  sortable?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingRows?: number;
}

/**
 * Base Table Component
 */
export function Table<T = any>({
  columns,
  data,
  variant,
  sortable = false,
  hoverable = true,
  stickyHeader = false,
  onRowClick,
  className,
  emptyMessage = 'No data available',
  loading = false,
  loadingRows = 5,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: SortDirection;
  }>({ key: '', direction: null });

  // Handle sorting
  const handleSort = (key: string) => {
    if (!sortable) return;

    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }

    setSortConfig({ key, direction });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Get cell value
  const getCellValue = (row: T, column: Column<T>) => {
    if (column.accessor) {
      return column.accessor(row);
    }
    if (column.cell) {
      const value = (row as any)[column.key];
      return column.cell(value, row);
    }
    return (row as any)[column.key];
  };

  return (
    <div className={cn('relative w-full overflow-auto', className)}>
      <table className={cn(tableVariants({ variant }))}>
        <thead
          className={cn(
            'border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900',
            stickyHeader && 'sticky top-0 z-10'
          )}
        >
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  sortable && column.sortable !== false && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center justify-between">
                  <span>{column.header}</span>
                  {sortable && column.sortable !== false && (
                    <span className="ml-2">
                      {sortConfig.key === column.key ? (
                        sortConfig.direction === 'asc' ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : sortConfig.direction === 'desc' ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )
                      ) : (
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-950">
          {loading ? (
            // Loading skeleton rows
            Array.from({ length: loadingRows }).map((_, index) => (
              <tr key={`loading-${index}`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            // Empty state
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            // Data rows
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  hoverable && 'hover:bg-gray-50 dark:hover:bg-gray-900/50',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {getCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Simple Table - Basic table without advanced features
 */
export interface SimpleTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  className?: string;
}

export const SimpleTable: React.FC<SimpleTableProps> = ({ headers, rows, className }) => {
  return (
    <div className={cn('relative w-full overflow-auto', className)}>
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-950">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Data Table - Table with built-in search and filters
 */
export interface DataTableProps<T = any> extends Omit<TableProps<T>, 'data'> {
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: React.ReactNode;
}

export function DataTable<T = any>({
  data,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  filters,
  ...tableProps
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row) => {
      return Object.values(row as any).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [data, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {(searchable || filters) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative flex-1 sm:max-w-xs">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
          {filters && <div className="flex items-center gap-2">{filters}</div>}
        </div>
      )}

      {/* Table */}
      <Table {...tableProps} data={filteredData} />
    </div>
  );
}

export { tableVariants };
