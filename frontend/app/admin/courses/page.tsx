'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { CourseListTemplate } from '@/src/features/modules';
import { Button } from '@/src/components/ui/button';
import { moduleApi } from '@/src/services/module-api.service';
import { showErrorToast } from '@/src/utils/toast.util';

// Transform Module to CourseCardData
const transformModuleToCourse = (module: any) => ({
  id: module.id,
  title: module.title,
  description: module.description || '',
  instructor: {
    name: module.teacher?.name || module.teacherName || 'Unknown',
    avatar: module.teacher?.avatar,
  },
  thumbnail: module.thumbnail,
  duration: module.duration || 0,
  level: (module.level || 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
  rating: module.avgRating || 0,
  enrolledCount: module.enrollmentCount || 0,
  category: module.subject?.name || module.subjectName || 'General',
  isEnrolled: false,
  progress: 0,
  status: module.status || 'published',
  tags: module.tags || [],
});

export default function AdminCoursesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch courses from API
  const fetchCourses = async (filterParams = {}) => {
    try {
      setIsLoading(true);
      const response = await moduleApi.getModules({
        ...filterParams,
        page: currentPage,
        limit: 12,
      });
      
      const transformedCourses = response.modules.map(transformModuleToCourse);
      setCourses(transformedCourses);
      setTotalCourses(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      showErrorToast('Failed to load courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load courses on mount
  useEffect(() => {
    fetchCourses(filters);
  }, [currentPage]);

  const handleCourseClick = (courseId: string) => {
    router.push(`/admin/courses/${courseId}`);
  };

  const handleEnroll = async (courseId: string) => {
    // In admin view, enrollment is managed differently
    console.log('Manage enrollment for course:', courseId);
  };

  const handleFilterChange = (newFilters: any) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
    fetchCourses(newFilters);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    const newFilters = { ...filters, search: query };
    setFilters(newFilters);
    setCurrentPage(1);
    fetchCourses(newFilters);
  };

  const handleSort = (sortBy: string) => {
    console.log('Sort by:', sortBy);
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    fetchCourses(newFilters);
  };

  const handleCreateCourse = () => {
    router.push('/admin/courses/create');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AdminLayout
      title="Course Management"
      description="Manage all courses, modules, and learning content"
    >
      <div className="p-6">
        {/* Header with Create Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Courses
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage all courses, modules, and learning content
            </p>
          </div>
          <Button
            onClick={handleCreateCourse}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Course List */}
        <CourseListTemplate
          courses={courses}
          loading={isLoading}
          onClick={handleCourseClick}
          onEnroll={handleEnroll}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          totalCourses={totalCourses}
          page={currentPage}
          pageSize={12}
          totalPages={Math.ceil(totalCourses / 12)}
          onPageChange={handlePageChange}
          categories={[
            { value: 'all', label: 'All Categories' },
            { value: 'Mathematics', label: 'Mathematics' },
            { value: 'Science', label: 'Science' },
            { value: 'English', label: 'English' },
            { value: 'Computer Science', label: 'Computer Science' },
            { value: 'History', label: 'History' },
          ]}
          filters={filters}
        />
      </div>
    </AdminLayout>
  );
}

