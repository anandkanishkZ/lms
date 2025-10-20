'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  RefreshCw,
  Search,
  GripVertical,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { batchApiService } from '@/src/services/batch-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

// Validation schema
const attachClassSchema = z.object({
  classId: z.string().min(1, 'Please select a class'),
  sequence: z.string().min(1, 'Sequence is required').transform(Number),
});

type AttachClassFormData = z.infer<typeof attachClassSchema>;

interface Class {
  id: string;
  name: string;
  section?: string;
  description?: string;
  isActive?: boolean;
}

interface ClassBatch {
  id: string;
  sequence: number;
  isActive: boolean;
  class: Class;
}

export default function BatchClassesPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;

  const [batchName, setBatchName] = useState('');
  const [classBatches, setClassBatches] = useState<ClassBatch[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassBatch | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AttachClassFormData>({
    resolver: zodResolver(attachClassSchema),
  });

  // Fetch batch classes
  const fetchBatchClasses = async () => {
    try {
      setLoading(true);
      const [batchResponse, classesResponse] = await Promise.all([
        batchApiService.getBatchById(batchId),
        batchApiService.getBatchClasses(batchId),
      ]);

      if (batchResponse.success && batchResponse.data) {
        setBatchName(batchResponse.data.name);
        if (batchResponse.data.classBatches) {
          setClassBatches(batchResponse.data.classBatches.sort((a, b) => a.sequence - b.sequence));
        }
      }

      // Fetch all available classes (you'll need to create this endpoint or use existing one)
      // For now, we'll use a placeholder
      await fetchAvailableClasses();
    } catch (error) {
      console.error('Error fetching batch classes:', error);
      showErrorToast('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available classes from your API
  const fetchAvailableClasses = async () => {
    try {
      // Replace with actual API call to get all classes
      // For now, using mock data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/classes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAvailableClasses(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching available classes:', error);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchBatchClasses();
    }
  }, [batchId]);

  // Attach class to batch
  const onSubmit = async (data: AttachClassFormData) => {
    try {
      const response = await batchApiService.attachClassToBatch(batchId, {
        classId: data.classId,
        sequence: data.sequence,
      });

      if (response.success) {
        showSuccessToast('Class added to batch successfully');
        setShowAddModal(false);
        reset();
        fetchBatchClasses();
      }
    } catch (error: any) {
      console.error('Error attaching class:', error);
      showErrorToast(error.message || 'Failed to add class');
    }
  };

  // Detach class from batch
  const handleDelete = async () => {
    if (!selectedClass) return;

    try {
      const response = await batchApiService.detachClassFromBatch(batchId, selectedClass.class.id);

      if (response.success) {
        showSuccessToast('Class removed from batch');
        setShowDeleteConfirm(false);
        setSelectedClass(null);
        fetchBatchClasses();
      }
    } catch (error: any) {
      console.error('Error detaching class:', error);
      showErrorToast(error.message || 'Failed to remove class');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/admin/batches/${batchId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Batch Details
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
              <p className="text-gray-600 mt-1">{batchName}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Class
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">About Class Sequences</h3>
              <p className="text-sm text-blue-800">
                The sequence number determines the order of classes in the batch. For example, Class 10 could be sequence 1, 
                Class 11 as sequence 2, and Class 12 as sequence 3. This helps in tracking student progression through the batch.
              </p>
            </div>
          </div>
        </div>

        {/* Classes List */}
        {classBatches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes added yet</h3>
            <p className="text-gray-600 mb-4">Add classes to this batch to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Class
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sequence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classBatches.map((cb, index) => (
                    <motion.tr
                      key={cb.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                            {cb.sequence}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{cb.class.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600">{cb.class.section || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 line-clamp-1">
                          {cb.class.description || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cb.isActive ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Active</span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => {
                            setSelectedClass(cb);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Class Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Add Class to Batch</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Class *
                    </label>
                    <select
                      {...register('classId')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a class...</option>
                      {availableClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} {cls.section ? `- ${cls.section}` : ''}
                        </option>
                      ))}
                    </select>
                    {errors.classId && (
                      <p className="text-red-500 text-sm mt-1">{errors.classId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sequence Number *
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('sequence')}
                      placeholder="e.g., 1 for first class, 2 for second class"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.sequence && (
                      <p className="text-red-500 text-sm mt-1">{errors.sequence.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Determines the order of progression through classes
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Class'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && selectedClass && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Remove Class</h2>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove <strong>{selectedClass.class.name}</strong> from this batch? 
                  This will not delete the class itself, only remove it from the batch.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
