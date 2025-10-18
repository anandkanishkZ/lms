/**
 * Course List Template
 * Complete course listing page with filters, search, and pagination
 * Includes: search bar, category filters, level filters, grid/list view toggle
 */

import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { Checkbox } from '../ui/Checkbox';
import { Dropdown } from '../ui/Dropdown';
import { Pagination } from '../ui/Pagination';
import { CourseCard, CourseCardData, CourseGrid } from './CourseCard';
import { cn } from '@/lib/utils';

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string[];
  priceType?: 'all' | 'free' | 'paid';
  rating?: number;
  sortBy?: 'recent' | 'popular' | 'rating' | 'title';
}

export interface CourseListTemplateProps {
  courses: CourseCardData[];
  totalCourses?: number;
  categories?: Array<{ value: string; label: string }>;
  filters?: CourseFilters;
  onFilterChange?: (filters: CourseFilters) => void;
  onSearch?: (query: string) => void;
  onEnroll?: (courseId: string) => void;
  onView?: (courseId: string) => void;
  onClick?: (courseId: string) => void;
  loading?: boolean;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

/**
 * Course List Template - Full page component
 */
export const CourseListTemplate: React.FC<CourseListTemplateProps> = ({
  courses,
  totalCourses = 0,
  categories = [],
  filters = {},
  onFilterChange,
  onSearch,
  onEnroll,
  onView,
  onClick,
  loading = false,
  page = 1,
  pageSize = 12,
  totalPages = 1,
  onPageChange,
  className,
}) => {
  const [searchQuery, setSearchQuery] = React.useState(filters.search || '');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedLevels, setSelectedLevels] = React.useState<string[]>(filters.level || []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked
      ? [...selectedLevels, level]
      : selectedLevels.filter(l => l !== level);
    setSelectedLevels(newLevels);
    onFilterChange?.({ ...filters, level: newLevels });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange?.({ ...filters, category });
  };

  const handlePriceTypeChange = (priceType: 'all' | 'free' | 'paid') => {
    onFilterChange?.({ ...filters, priceType });
  };

  const handleSortChange = (sortBy: 'recent' | 'popular' | 'rating' | 'title') => {
    onFilterChange?.({ ...filters, sortBy });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLevels([]);
    onFilterChange?.({ search: '', category: undefined, level: [], priceType: 'all' });
  };

  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.level && filters.level.length > 0,
    filters.priceType && filters.priceType !== 'all',
  ].filter(Boolean).length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Explore Courses
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {totalCourses.toLocaleString()} courses available
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            className="flex-1"
          />
          <Button type="submit" variant="default">
            Search
          </Button>
        </form>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          {categories.length > 0 && (
            <Select
              options={[{ value: '', label: 'All Categories' }, ...categories]}
              value={filters.category || ''}
              onChange={(value) => handleCategoryChange(Array.isArray(value) ? value[0] : value)}
              placeholder="Category"
              className="w-48"
            />
          )}

          {/* Level Filter Dropdown */}
          <Dropdown
            trigger={
              <Button variant="outline" size="md">
                Level {selectedLevels.length > 0 && `(${selectedLevels.length})`}
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            }
            items={[
              {
                label: 'Levels',
                separator: false,
              },
            ]}
          />
          {/* Level Checkboxes (using Dropdown replacement) */}
          <div className="relative">
            <Button variant="outline" size="md">
              Level {selectedLevels.length > 0 && `(${selectedLevels.length})`}
            </Button>
          </div>

          {/* Price Type */}
          <Tabs
            tabs={[
              { value: 'all', label: 'All', content: null },
              { value: 'free', label: 'Free', content: null },
              { value: 'paid', label: 'Paid', content: null },
            ]}
            value={filters.priceType || 'all'}
            onChange={(value) => handlePriceTypeChange(value as any)}
            variant="pills"
          />

          {/* Sort By */}
          <Select
            options={[
              { value: 'recent', label: 'Most Recent' },
              { value: 'popular', label: 'Most Popular' },
              { value: 'rating', label: 'Highest Rated' },
              { value: 'title', label: 'Title A-Z' },
            ]}
            value={filters.sortBy || 'recent'}
            onChange={(value) => handleSortChange(value as any)}
            placeholder="Sort by"
            className="w-40"
          />

          {/* View Mode Toggle */}
          <div className="ml-auto flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
              aria-label="Grid view"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
              aria-label="List view"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters ({activeFilterCount})
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                Search: {filters.search}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    onFilterChange?.({ ...filters, search: '' });
                  }}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                Category: {categories.find(c => c.value === filters.category)?.label || filters.category}
                <button
                  onClick={() => onFilterChange?.({ ...filters, category: undefined })}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Course Grid/List */}
      {viewMode === 'grid' ? (
        <CourseGrid
          courses={courses}
          variant="default"
          columns={3}
          loading={loading}
          emptyMessage="No courses match your filters"
          onEnroll={onEnroll}
          onView={onView}
          onClick={onClick}
        />
      ) : (
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No courses match your filters</p>
            </div>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                variant="compact"
                onEnroll={onEnroll}
                onView={onView}
                onClick={onClick}
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showFirstLast
            showPrevNext
          />
        </div>
      )}
    </div>
  );
};
