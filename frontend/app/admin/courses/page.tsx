'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { ModuleListTemplate } from '@/src/features/modules';
import { Button } from '@/src/components/ui/button';
import { moduleApi } from '@/src/services/module-api.service';
import { showErrorToast } from '@/src/utils/toast.util';

// Transform Module API response to ModuleCardData
const transformModuleToCardData = (module: any) => ({
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

export default function AdminModulesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [totalModules, setTotalModules] = useState(0);
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch modules from API
  const fetchModules = async (filterParams = {}) => {
    try {
      setIsLoading(true);
      const response = await moduleApi.getModules({
        ...filterParams,
        page: currentPage,
        limit: 12,
      });
      
      const transformedModules = response.modules.map(transformModuleToCardData);
      setModules(transformedModules);
      setTotalModules(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      showErrorToast('Failed to load modules');
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load modules on mount
  useEffect(() => {
    fetchModules(filters);
  }, [currentPage]);

  const handleModuleClick = (moduleId: string) => {
    router.push(`/admin/courses/${moduleId}`);
  };

  const handleEnroll = async (moduleId: string) => {
    // In admin view, enrollment is managed differently
    console.log('Manage enrollment for module:', moduleId);
  };

  const handleFilterChange = (newFilters: any) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
    fetchModules(newFilters);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    const newFilters = { ...filters, search: query };
    setFilters(newFilters);
    setCurrentPage(1);
    fetchModules(newFilters);
  };

  const handleSort = (sortBy: string) => {
    console.log('Sort by:', sortBy);
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    fetchModules(newFilters);
  };

  const handleCreateModule = () => {
    router.push('/admin/courses/create');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AdminLayout
      title="Module Management"
      description="Manage all modules, subjects, and learning content"
    >
      <div className="p-6">
        {/* Header with Create Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Modules & Subjects
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage all modules, subjects, and learning content
            </p>
          </div>
          <Button
            onClick={handleCreateModule}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Module
          </Button>
        </div>

        {/* Module List */}
        <ModuleListTemplate
          modules={modules}
          loading={isLoading}
          onClick={handleModuleClick}
          onEnroll={handleEnroll}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          totalModules={totalModules}
          page={currentPage}
          pageSize={12}
          totalPages={Math.ceil(totalModules / 12)}
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
