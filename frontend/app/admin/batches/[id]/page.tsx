'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  Edit,
  RefreshCw,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { batchApiService, type BatchWithDetails, type BatchStatus, type BatchStatistics } from '@/src/services/batch-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

// Status badge colors
const statusColors: Record<BatchStatus, string> = {
  PLANNING: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  GRADUATED: 'bg-purple-100 text-purple-800',
  ARCHIVED: 'bg-orange-100 text-orange-800',
};

// Status flow
const statusFlow: BatchStatus[] = ['PLANNING', 'ACTIVE', 'COMPLETED', 'GRADUATED', 'ARCHIVED'];

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;

  const [batch, setBatch] = useState<BatchWithDetails | null>(null);
  const [statistics, setStatistics] = useState<BatchStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'students' | 'graduation'>('overview');

  // Fetch batch details
  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const [batchResponse, statsResponse] = await Promise.all([
        batchApiService.getBatchById(batchId),
        batchApiService.getBatchStatistics(batchId),
      ]);

      if (batchResponse.success && batchResponse.data) {
        setBatch(batchResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching batch details:', error);
      showErrorToast('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchBatchDetails();
    }
  }, [batchId]);

  // Update batch status
  const handleStatusUpdate = async (newStatus: BatchStatus) => {
    if (!batch) return;

    try {
      const response = await batchApiService.updateBatchStatus(batchId, { status: newStatus });

      if (response.success) {
        showSuccessToast(`Batch status updated to ${newStatus}`);
        fetchBatchDetails();
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      showErrorToast(error.message || 'Failed to update status');
    }
  };

  // Get next status in flow
  const getNextStatus = (): BatchStatus | null => {
    if (!batch) return null;
    const currentIndex = statusFlow.indexOf(batch.status);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  // Get previous status in flow (for reverting)
  const getPreviousStatus = (): BatchStatus | null => {
    if (!batch) return null;
    const currentIndex = statusFlow.indexOf(batch.status);
    if (currentIndex === -1 || currentIndex === 0) return null;
    return statusFlow[currentIndex - 1];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (!batch) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch not found</h3>
            <button
              onClick={() => router.push('/admin/batches')}
              className="text-blue-600 hover:text-blue-700"
            >
              Back to Batches
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const nextStatus = getNextStatus();

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/batches')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Batches
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{batch.name}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[batch.status]}`}>
                  {batch.status}
                </span>
              </div>
              {batch.description && (
                <p className="text-gray-600">{batch.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(batch.startDate)} - {batch.endDate ? formatDate(batch.endDate) : 'TBD'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Created by {batch.createdBy?.firstName} {batch.createdBy?.lastName}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {nextStatus && (
                <button
                  onClick={() => handleStatusUpdate(nextStatus)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <TrendingUp className="w-5 h-5" />
                  Move to {nextStatus}
                </button>
              )}
              {getPreviousStatus() && (
                <button
                  onClick={() => {
                    const prevStatus = getPreviousStatus();
                    if (prevStatus && confirm(`Are you sure you want to revert status back to ${prevStatus}?`)) {
                      handleStatusUpdate(prevStatus);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <RefreshCw className="w-5 h-5" />
                  Revert to {getPreviousStatus()}
                </button>
              )}
              <button
                onClick={() => router.push(`/admin/batches/${batchId}/classes`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <BookOpen className="w-5 h-5" />
                Manage Classes
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{statistics.totalStudents}</p>
              <p className="text-sm text-gray-600 mt-1">Total Students</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{statistics.totalEnrollments}</p>
              <p className="text-sm text-gray-600 mt-1">Total Enrollments</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.completionRate != null ? statistics.completionRate.toFixed(1) : '0.0'}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Completion Rate</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.passRate != null ? statistics.passRate.toFixed(1) : '0.0'}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Pass Rate</p>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => router.push(`/admin/batches/${batchId}/classes`)}
                className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900"
              >
                Classes ({batch.classBatches?.length || 0})
              </button>
              <button
                onClick={() => router.push(`/admin/batches/${batchId}/students`)}
                className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900"
              >
                Students ({batch._count?.students || 0})
              </button>
              <button
                onClick={() => router.push(`/admin/batches/${batchId}/graduate`)}
                className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900"
              >
                Graduation ({batch._count?.graduations || 0})
              </button>
            </div>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="p-6">
              {/* Classes Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Classes in Batch</h3>
                {batch.classBatches && batch.classBatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batch.classBatches
                      .sort((a, b) => a.sequence - b.sequence)
                      .map((cb) => (
                        <div
                          key={cb.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{cb.class.name}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              Seq {cb.sequence}
                            </span>
                          </div>
                          {cb.class.description && (
                            <p className="text-sm text-gray-600">{cb.class.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No classes attached to this batch yet</p>
                    <button
                      onClick={() => router.push(`/admin/batches/${batchId}/classes`)}
                      className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add Classes
                    </button>
                  </div>
                )}
              </div>

              {/* Performance by Class */}
              {statistics && statistics.classesBySequence && statistics.classesBySequence.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Class</h3>
                  <div className="space-y-3">
                    {statistics.classesBySequence.map((classStats, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                              Seq {classStats.sequence}
                            </span>
                            <h4 className="font-semibold text-gray-900">{classStats.className}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {classStats.completedCount}/{classStats.enrollmentCount} completed
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(classStats.completedCount / classStats.enrollmentCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push(`/admin/batches/${batchId}/students`)}
            className="flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Users className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">View Students</span>
          </button>
          <button
            onClick={() => router.push(`/admin/batches/${batchId}/classes`)}
            className="flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <BookOpen className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Manage Classes</span>
          </button>
          <button
            onClick={() => router.push(`/admin/batches/${batchId}/graduate`)}
            className="flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={batch.status !== 'COMPLETED'}
          >
            <GraduationCap className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Graduate Batch</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
