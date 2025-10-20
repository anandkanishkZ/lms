'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  GraduationCap,
  Users,
  Award,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  FileText,
} from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { batchApiService, type BatchStatus } from '@/src/services/batch-api.service';
import { graduationApiService, type Graduation } from '@/src/services/graduation-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

// Validation schema
const graduationSchema = z.object({
  graduationDate: z.string().min(1, 'Graduation date is required'),
  remarks: z.string().optional(),
});

type GraduationFormData = z.infer<typeof graduationSchema>;

export default function BatchGraduationPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;

  const [batchName, setBatchName] = useState('');
  const [batchStatus, setBatchStatus] = useState<BatchStatus>('PLANNING');
  const [studentCount, setStudentCount] = useState(0);
  const [graduations, setGraduations] = useState<Graduation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGraduateModal, setShowGraduateModal] = useState(false);
  const [isGraduating, setIsGraduating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GraduationFormData>({
    resolver: zodResolver(graduationSchema),
    defaultValues: {
      graduationDate: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch batch and graduation data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchResponse, graduationsResponse] = await Promise.all([
        batchApiService.getBatchById(batchId),
        graduationApiService.getBatchGraduations(batchId),
      ]);

      if (batchResponse.success && batchResponse.data) {
        setBatchName(batchResponse.data.name);
        setBatchStatus(batchResponse.data.status);
        setStudentCount(batchResponse.data._count?.students || 0);
      }

      if (graduationsResponse.success && graduationsResponse.data) {
        setGraduations(graduationsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showErrorToast('Failed to load graduation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchData();
    }
  }, [batchId]);

  // Graduate batch
  const onSubmit = async (data: GraduationFormData) => {
    try {
      setIsGraduating(true);

      // Get current admin ID
      const adminId = localStorage.getItem('adminUserId') || '';

      const response = await graduationApiService.graduateBatch(batchId, {
        graduationDate: data.graduationDate,
        remarks: data.remarks,
      });

      if (response.success) {
        showSuccessToast(`Successfully graduated ${response.data?.length || 0} students`);
        setShowGraduateModal(false);
        reset();
        fetchData();
      }
    } catch (error: any) {
      console.error('Error graduating batch:', error);
      showErrorToast(error.message || 'Failed to graduate batch');
    } finally {
      setIsGraduating(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate average GPA
  const calculateAverageGPA = () => {
    if (graduations.length === 0) return 0;
    const total = graduations.reduce((sum, grad) => sum + (grad.gpa || 0), 0);
    return (total / graduations.length).toFixed(2);
  };

  // Get honors distribution
  const getHonorsDistribution = () => {
    const distribution = {
      distinction: 0,
      firstClass: 0,
      secondClass: 0,
      none: 0,
    };

    graduations.forEach((grad) => {
      if (grad.honors === 'Distinction') distribution.distinction++;
      else if (grad.honors === 'First Class') distribution.firstClass++;
      else if (grad.honors === 'Second Class') distribution.secondClass++;
      else distribution.none++;
    });

    return distribution;
  };

  const honors = getHonorsDistribution();
  const canGraduate = batchStatus === 'COMPLETED' && graduations.length === 0;

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
              <h1 className="text-3xl font-bold text-gray-900">Batch Graduation</h1>
              <p className="text-gray-600 mt-1">{batchName}</p>
            </div>
            {canGraduate && (
              <button
                onClick={() => setShowGraduateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <GraduationCap className="w-5 h-5" />
                Graduate Batch
              </button>
            )}
          </div>
        </div>

        {/* Status Warning */}
        {batchStatus !== 'COMPLETED' && graduations.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Batch Not Ready for Graduation</h3>
                <p className="text-sm text-yellow-800">
                  This batch must have status "COMPLETED" before students can be graduated. 
                  Current status: <strong>{batchStatus}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {graduations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{graduations.length}</p>
              <p className="text-sm text-gray-600 mt-1">Graduated Students</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{calculateAverageGPA()}</p>
              <p className="text-sm text-gray-600 mt-1">Average GPA</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{honors.distinction}</p>
              <p className="text-sm text-gray-600 mt-1">With Distinction</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{honors.firstClass}</p>
              <p className="text-sm text-gray-600 mt-1">First Class</p>
            </motion.div>
          </div>
        )}

        {/* Graduation List */}
        {graduations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Graduations Yet</h3>
            <p className="text-gray-600 mb-4">
              {canGraduate
                ? 'Graduate this batch to generate certificates for all students'
                : 'Complete the batch before graduating students'}
            </p>
            {canGraduate && (
              <button
                onClick={() => setShowGraduateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <GraduationCap className="w-5 h-5" />
                Graduate Batch
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Graduated Students</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GPA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Honors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Graduation Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {graduations.map((graduation, index) => (
                    <motion.tr
                      key={graduation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {graduation.student?.firstName} {graduation.student?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{graduation.student?.symbolNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">
                          {graduation.certificateNumber || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-semibold">
                          {graduation.gpa ? graduation.gpa.toFixed(2) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {graduation.honors ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            graduation.honors === 'Distinction' ? 'bg-purple-100 text-purple-800' :
                            graduation.honors === 'First Class' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {graduation.honors}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(graduation.graduationDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {graduation.certificateUrl ? (
                          <a
                            href={graduation.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Download</span>
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No certificate</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Graduate Batch Modal */}
        <AnimatePresence>
          {showGraduateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowGraduateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Graduate Batch</h2>
                  <button
                    onClick={() => setShowGraduateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">About to graduate {studentCount} students</p>
                      <p>This will generate certificates and calculate GPA for all students in this batch.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Graduation Date *
                    </label>
                    <input
                      type="date"
                      {...register('graduationDate')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {errors.graduationDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.graduationDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks (Optional)
                    </label>
                    <textarea
                      {...register('remarks')}
                      rows={3}
                      placeholder="e.g., Congratulations Class of 2025!"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowGraduateModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGraduating}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGraduating ? 'Graduating...' : 'Graduate Batch'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
