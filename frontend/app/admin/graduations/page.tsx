'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Search,
  Filter,
  Award,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { graduationApiService, type Graduation, type GraduationStatistics } from '@/src/services/graduation-api.service';
import { showErrorToast } from '@/src/utils/toast.util';

export default function GraduationsPage() {
  const router = useRouter();

  const [graduations, setGraduations] = useState<Graduation[]>([]);
  const [statistics, setStatistics] = useState<GraduationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch graduations
  const fetchGraduations = async () => {
    try {
      setLoading(true);
      const [graduationsResponse, statsResponse] = await Promise.all([
        graduationApiService.getGraduations({
          search: searchQuery,
          batchId: selectedBatch || undefined,
          page: pagination.page,
          limit: pagination.limit,
        }),
        graduationApiService.getGraduationStatistics(),
      ]);

      if (graduationsResponse.success && graduationsResponse.data) {
        setGraduations(graduationsResponse.data.graduations);
        setPagination(graduationsResponse.data.pagination);
      }

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching graduations:', error);
      showErrorToast('Failed to load graduations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraduations();
  }, [searchQuery, selectedBatch, pagination.page]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Graduations</h1>
          <p className="text-gray-600">View and manage student graduations and certificates</p>
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
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{statistics.totalGraduations}</p>
              <p className="text-sm text-gray-600 mt-1">Total Graduations</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{statistics.averageGpa.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Average GPA</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{statistics.honorsDistribution.distinction}</p>
              <p className="text-sm text-gray-600 mt-1">With Distinction</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.graduationsByBatch.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Graduated Batches</p>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, symbol no, or certificate no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          {statistics && statistics.graduationsByBatch.length > 0 && (
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Batches</option>
              {statistics.graduationsByBatch.map((batch) => (
                <option key={batch.batchId} value={batch.batchId}>
                  {batch.batchName} ({batch.graduationCount})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Graduations Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : graduations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No graduations found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedBatch ? 'Try adjusting your filters' : 'Graduate batches to see records here'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
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
                      Actions
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
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">
                              {graduation.student?.firstName?.[0]}{graduation.student?.lastName?.[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {graduation.student?.firstName} {graduation.student?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{graduation.student?.symbolNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{graduation.batch?.name || '-'}</span>
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
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              graduation.honors === 'Distinction'
                                ? 'bg-purple-100 text-purple-800'
                                : graduation.honors === 'First Class'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
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
                        <div className="flex items-center justify-end gap-2">
                          {graduation.certificateUrl && (
                            <a
                              href={graduation.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700"
                              title="Download Certificate"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          )}
                          <button
                            onClick={() => router.push(`/admin/users?studentId=${graduation.studentId}`)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Student"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
