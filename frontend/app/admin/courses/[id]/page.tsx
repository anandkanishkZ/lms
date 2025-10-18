'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Users, Eye, Clock, Star } from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { CourseDetailTemplate } from '@/src/features/modules';
import { Button } from '@/src/components/ui/button';
import { ConfirmModal } from '@/src/components/ui/confirm-modal';
import { moduleApi } from '@/src/services/module-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

export default function AdminCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch course with topics
      const courseData = await moduleApi.getModuleById(courseId, true);
      setCourse(courseData);

      // Fetch topics separately
      const topicsData = await moduleApi.getTopicsByModule(courseId);
      setTopics(topicsData);

      // Fetch enrollments for admin view
      const enrollmentsData = await moduleApi.getModuleEnrollments(courseId);
      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      showErrorToast('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const handleBack = () => {
    router.push('/admin/courses');
  };

  const handleEdit = () => {
    router.push(`/admin/courses/${courseId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await moduleApi.deleteModule(courseId);
      showSuccessToast('Course deleted successfully');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Failed to delete course:', error);
      showErrorToast('Failed to delete course');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEnrollStudent = () => {
    // Navigate to enrollment management
    router.push(`/admin/courses/${courseId}/enroll`);
  };

  const handleTopicClick = (topicId: string) => {
    router.push(`/admin/courses/${courseId}/topics/${topicId}`);
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/admin/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleAddTopic = () => {
    router.push(`/admin/courses/${courseId}/topics/create`);
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

  if (!course) {
    return (
      <AdminLayout title="Course Not Found" description="The requested course could not be found">
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Course not found</p>
            <Button onClick={handleBack}>Back to Courses</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Transform course data for template
  const courseData = {
    id: course.id,
    title: course.title,
    description: course.description || '',
    thumbnail: course.thumbnail,
    instructor: {
      id: course.teacher?.id || '',
      name: course.teacher?.name || 'Unknown',
      avatar: course.teacher?.avatar,
      bio: course.teacher?.bio,
      email: course.teacher?.email,
    },
    duration: course.duration || 0,
    level: course.level || 'Beginner',
    rating: course.avgRating || 0,
    reviewCount: course.reviewCount || 0,
    enrolledCount: course.enrollmentCount || 0,
    status: course.status || 'draft',
    category: course.subject?.name || 'General',
    tags: course.tags || [],
    lastUpdated: course.updatedAt ? new Date(course.updatedAt) : new Date(),
    topics: topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      duration: topic.duration,
      lessonCount: topic.totalLessons || 0,
      orderIndex: topic.orderIndex,
      lessons: topic.lessons || [],
    })),
    isEnrolled: false,
    progress: 0,
  };

  return (
    <AdminLayout
      title={course.title}
      description="Course management and details"
    >
      <div className="p-6">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>

          <div className="flex items-center gap-2">
            {/* Course Stats */}
            <div className="flex items-center gap-4 mr-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {enrollments.length} enrolled
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {course.viewCount || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {course.avgRating?.toFixed(1) || '0.0'}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={handleEnrollStudent}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Enrollments
            </Button>
            
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>

            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Course Detail Template */}
        <CourseDetailTemplate
          course={courseData}
          onEnroll={() => handleEnrollStudent()}
          onLessonClick={(moduleId, lessonId) => handleLessonClick(lessonId)}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Course"
          message={`Are you sure you want to delete "${course?.title}"? This action cannot be undone and will permanently remove all course content, topics, and lessons.`}
          confirmText="Delete Course"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </AdminLayout>
  );
}
