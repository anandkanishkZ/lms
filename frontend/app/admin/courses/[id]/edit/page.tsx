'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/src/features/admin/components/layout/AdminLayout';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { moduleApi } from '@/src/services/module-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';
import { ArrowLeft, Save, Eye } from 'lucide-react';

/**
 * Edit Course Page
 * Form for updating existing courses
 */
export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    subjectId: '',
    classId: '',
    teacherId: '',
    duration: 0,
    level: 'Beginner',
    status: 'DRAFT',
    tags: [] as string[],
    price: 0,
    discountPrice: 0,
  });

  const [tagInput, setTagInput] = useState('');

  // Load course data and dropdown options
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsFetching(true);

        // Load existing course data
        const course = await moduleApi.getModuleById(courseId, false);
        
        // Populate form with existing data
        setFormData({
          title: course.title || '',
          description: course.description || '',
          thumbnail: course.thumbnail || '',
          subjectId: course.subjectId || '',
          classId: course.classId || '',
          teacherId: course.teacherId || '',
          duration: course.duration || 0,
          level: course.level || 'Beginner',
          status: course.status || 'DRAFT',
          tags: (course as any).tags || [],
          price: (course as any).price || 0,
          discountPrice: (course as any).discountPrice || 0,
        });

        // Load dropdown data from backend API
        const [subjectsData, classesData, teachersData] = await Promise.all([
          moduleApi.getSubjects(),
          moduleApi.getClasses(),
          moduleApi.getTeachers(),
        ]);
        
        setSubjects(subjectsData);
        setClasses(classesData);
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error loading course data:', error);
        showErrorToast('Failed to load course data');
        router.push('/admin/courses');
      } finally {
        setIsFetching(false);
      }
    };

    if (courseId) {
      loadData();
    }
  }, [courseId, router]);

  // Handle form field changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' || name === 'discountPrice' 
        ? Number(value) 
        : value,
    }));
  };

  // Handle tags
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      showErrorToast('Please enter a course title');
      return;
    }
    if (!formData.description.trim()) {
      showErrorToast('Please enter a course description');
      return;
    }
    if (!formData.subjectId) {
      showErrorToast('Please select a subject');
      return;
    }
    if (!formData.teacherId) {
      showErrorToast('Please assign a teacher');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const courseData = {
        ...formData,
        status: isDraft ? 'DRAFT' : formData.status,
      };

      // Update course
      await moduleApi.updateModule(courseId, courseData);
      
      showSuccessToast(
        isDraft 
          ? 'Course saved as draft successfully' 
          : 'Course updated successfully'
      );
      
      // Redirect to course detail page
      router.push(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error('Error updating course:', error);
      showErrorToast('Failed to update course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/courses/${courseId}`);
  };

  if (isFetching) {
    return (
      <AdminLayout
        title="Edit Course"
        description="Loading course data..."
      >
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-600">Loading course data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Edit: ${formData.title}`}
      description="Update course information"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isLoading ? 'Updating...' : 'Update Course'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>
            
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="mb-2 block text-sm font-medium">
                Course Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter course title"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="mb-2 block text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
                rows={4}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Thumbnail */}
            <div className="mb-4">
              <label htmlFor="thumbnail" className="mb-2 block text-sm font-medium">
                Course Thumbnail URL
              </label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="Enter thumbnail URL"
              />
              {formData.thumbnail && (
                <div className="mt-2">
                  <img 
                    src={formData.thumbnail} 
                    alt="Thumbnail preview" 
                    className="h-32 w-auto rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Course Details</h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Subject */}
              <div>
                <label htmlFor="subjectId" className="mb-2 block text-sm font-medium">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  id="subjectId"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div>
                <label htmlFor="classId" className="mb-2 block text-sm font-medium">
                  Class
                </label>
                <select
                  id="classId"
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label htmlFor="teacherId" className="mb-2 block text-sm font-medium">
                  Teacher <span className="text-red-500">*</span>
                </label>
                <select
                  id="teacherId"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Assign a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="mb-2 block text-sm font-medium">
                  Duration (hours)
                </label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Level */}
              <div>
                <label htmlFor="level" className="mb-2 block text-sm font-medium">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="mb-2 block text-sm font-medium">
                  Price ($)
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Discount Price */}
              <div>
                <label htmlFor="discountPrice" className="mb-2 block text-sm font-medium">
                  Discount Price ($)
                </label>
                <Input
                  id="discountPrice"
                  name="discountPrice"
                  type="number"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Tags</h2>
            
            {/* Tag Input */}
            <div className="mb-4 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tags (press Enter)"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
              >
                Add
              </Button>
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
}
