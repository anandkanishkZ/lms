'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, ArrowLeft, Loader2, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { getClassById, updateClass, type Class } from '@/services/class-api.service';
import { AdminLayout } from '@/src/features/admin';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

// Validation schema
const classSchema = z.object({
  name: z.string()
    .min(1, 'Class name is required')
    .max(100, 'Class name must be less than 100 characters'),
  section: z.string()
    .max(50, 'Section must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
});

type ClassFormData = z.infer<typeof classSchema>;

export default function EditClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      section: '',
      description: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const response = await getClassById(classId);

      if (response.success && response.data) {
        setClassData(response.data);
        
        // Populate form with existing data
        reset({
          name: response.data.name,
          section: response.data.section || '',
          description: response.data.description || '',
          isActive: response.data.isActive,
        });
      } else {
        showErrorToast(response.message || 'Failed to fetch class details');
        router.push('/admin/classes');
      }
    } catch (error: any) {
      console.error('Error fetching class:', error);
      showErrorToast(error.message || 'Failed to fetch class details');
      router.push('/admin/classes');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ClassFormData) => {
    try {
      setSubmitting(true);

      // Clean up empty strings
      const payload = {
        name: data.name,
        section: data.section || undefined,
        description: data.description || undefined,
        isActive: data.isActive,
      };

      const response = await updateClass(classId, payload);

      if (response.success) {
        showSuccessToast('Class updated successfully!');
        router.push(`/admin/classes/${classId}`);
      }
    } catch (error: any) {
      console.error('Error updating class:', error);
      showErrorToast(error.message || 'Failed to update class');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading class details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/admin/classes/${classId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Class Details
          </button>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Class</h1>
              <p className="text-gray-600 mt-1">
                Update class information and settings
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Class Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Class Information
            </h2>

            <div className="space-y-6">
              {/* Class Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="e.g., Class 10, Grade 5, Advanced Mathematics"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Enter a descriptive name for the class
                </p>
              </div>

              {/* Section */}
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                  Section <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  id="section"
                  type="text"
                  {...register('section')}
                  placeholder="e.g., A, B, Science, Commerce"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.section ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.section && (
                  <p className="mt-1 text-sm text-red-600">{errors.section.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Specify a section if this class has multiple divisions
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={4}
                  placeholder="Enter a detailed description of the class, its objectives, curriculum, or any other relevant information..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Provide additional details about the class (max 500 characters)
                </p>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Status
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setValue('isActive', !isActive)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-green-600" />
                        <div className="text-left">
                          <div className="font-semibold text-green-900">Active</div>
                          <div className="text-sm text-green-700">
                            Class is visible and available for enrollment
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-gray-600" />
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">Inactive</div>
                          <div className="text-sm text-gray-700">
                            Class is hidden and not available for enrollment
                          </div>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Important Notes</h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>
                  <strong>Existing Enrollments:</strong> Changes to the class name or section won't affect existing student enrollments.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>
                  <strong>Status Impact:</strong> Deactivating a class will hide it from new enrollment options but won't remove existing students.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>
                  <strong>Associated Data:</strong> Teachers, batches, and modules linked to this class will remain intact.
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push(`/admin/classes/${classId}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
