'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Users, Eye, Clock, Star } from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { ModuleDetailTemplate } from '@/src/features/modules';
import { Button } from '@/src/components/ui/button';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import { moduleApi } from '@/src/services/module-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

export default function AdminModuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [module, setModule] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch module details
  const fetchModuleDetails = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching module with ID:', moduleId);
      
      // Fetch module with topics
      const moduleData = await moduleApi.getModuleById(moduleId, true);
      console.log('Module data received:', moduleData);
      setModule(moduleData);

      // Fetch topics separately
      const topicsData = await moduleApi.getTopicsByModule(moduleId);
      console.log('Topics data received:', topicsData);
      setTopics(topicsData);

      // Fetch enrollments for admin view
      const enrollmentsData = await moduleApi.getModuleEnrollments(moduleId);
      console.log('Enrollments data received:', enrollmentsData);
      setEnrollments(enrollmentsData || []);
    } catch (error: any) {
      console.error('Failed to fetch module details:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Failed to load module details';
      
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId]);

  const handleBack = () => {
    router.push('/admin/courses');
  };

  const handleEdit = () => {
    router.push(`/admin/courses/${moduleId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await moduleApi.deleteModule(moduleId);
      showSuccessToast('Module deleted successfully');
      router.push('/admin/courses');
    } catch (error: any) {
      console.error('Failed to delete module:', error);
      
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Failed to delete module';
      
      showErrorToast(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEnrollStudent = () => {
    // Navigate to enrollment management
    router.push(`/admin/courses/${moduleId}/enroll`);
  };

  const handleTopicClick = (topicId: string) => {
    router.push(`/admin/courses/${moduleId}/topics/${topicId}`);
  };

  const handleLessonClick = (topicId: string, lessonId: string) => {
    router.push(`/admin/courses/${moduleId}/topics/${topicId}/lessons/${lessonId}`);
  };

  const handleAddTopic = () => {
    router.push(`/admin/courses/${moduleId}/topics/create`);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading..." description="Please wait">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!module) {
    return (
      <AdminLayout title="Module Not Found" description="The requested module could not be found">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Module not found</p>
            <Button onClick={handleBack}>Back to Modules</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Transform module data for template
  const moduleData = {
    id: module.id,
    title: module.title,
    description: module.description || '',
    thumbnail: module.thumbnail,
    instructor: {
      id: module.teacher?.id || '',
      name: module.teacher?.name || 'Unknown',
      avatar: module.teacher?.avatar,
      bio: module.teacher?.bio,
      totalModules: module.teacher?.moduleCount || 0,
      totalStudents: module.teacher?.studentCount || 0,
    },
    duration: module.duration || 0,
    level: module.level || 'Beginner',
    rating: module.avgRating || 0,
    totalRatings: module.reviewCount || 0,
    enrolledCount: module.enrollmentCount || 0,
    status: module.status || 'draft',
    category: module.subject?.name || 'General',
    tags: module.tags || [],
    lastUpdated: module.updatedAt ? new Date(module.updatedAt) : new Date(),
    topics: topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      duration: topic.duration,
      lessons: topic.lessons || [],
    })),
    isEnrolled: false,
    progress: 0,
  };

  return (
    <AdminLayout
      title={module.title}
      description="Module management and details"
    >
      <div className="p-6 bg-gray-50 dark:bg-gray-900">
        {/* Header Actions */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Modules
            </Button>

            <div className="flex items-center gap-3">
              {/* Module Stats */}
              <div className="flex items-center gap-4 mr-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#2563eb]" />
                  <span className="font-medium text-gray-900 dark:text-white">{enrollments.length}</span>
                  <span className="hidden sm:inline">enrolled</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-[#2563eb]" />
                  <span className="font-medium text-gray-900 dark:text-white">{module.viewCount || 0}</span>
                  <span className="hidden sm:inline">views</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{module.avgRating?.toFixed(1) || '0.0'}</span>
                </span>
              </div>

              <Button
                variant="outline"
                onClick={handleEnrollStudent}
                className="flex items-center gap-2 hover:bg-blue-50 hover:text-[#2563eb] hover:border-[#2563eb] dark:hover:bg-gray-700"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Manage Enrollments</span>
                <span className="sm:hidden">Enrollments</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2 hover:bg-blue-50 hover:text-[#2563eb] hover:border-[#2563eb] dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Module Detail Template */}
        <ModuleDetailTemplate
          module={moduleData}
          onEnroll={() => handleEnrollStudent()}
          onLessonClick={(topicId, lessonId) => handleLessonClick(topicId, lessonId)}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Module"
          message={`Are you sure you want to delete "${module?.title}"? This action cannot be undone and will permanently remove all module content, topics, and lessons.`}
          confirmText="Delete Module"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </AdminLayout>
  );
}
