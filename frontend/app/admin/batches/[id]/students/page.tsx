'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  BookOpen,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { batchApiService } from '@/src/services/batch-api.service';
import { classEnrollmentApiService } from '@/src/services/classEnrollment-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  symbolNo: string;
  email?: string;
  phone?: string;
}

interface EnrollmentInfo {
  studentId: string;
  enrollments: Array<{
    id: string;
    status: string;
    className: string;
    completedAt?: string;
  }>;
}

export default function BatchStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;

  const [batchName, setBatchName] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<Map<string, EnrollmentInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch batch students
  const fetchBatchStudents = async () => {
    try {
      setLoading(true);
      const [batchResponse, studentsResponse] = await Promise.all([
        batchApiService.getBatchById(batchId),
        batchApiService.getBatchStudents(batchId),
      ]);

      if (batchResponse.success && batchResponse.data) {
        setBatchName(batchResponse.data.name);
      }

      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);

        // Fetch enrollment data for each student
        const enrollmentMap = new Map<string, EnrollmentInfo>();
        for (const student of studentsResponse.data) {
          try {
            const enrollmentResponse = await classEnrollmentApiService.getStudentEnrollments(student.id);
            if (enrollmentResponse.success && enrollmentResponse.data) {
              enrollmentMap.set(student.id, {
                studentId: student.id,
                enrollments: enrollmentResponse.data.map((e: any) => ({
                  id: e.id,
                  status: e.status,
                  className: e.class?.name || 'Unknown',
                  completedAt: e.completedAt,
                })),
              });
            }
          } catch (error) {
            console.error(`Error fetching enrollments for student ${student.id}:`, error);
          }
        }
        setEnrollmentData(enrollmentMap);
      }
    } catch (error) {
      console.error('Error fetching batch students:', error);
      showErrorToast('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchBatchStudents();
    }
  }, [batchId]);

  // Filter students based on search
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const symbolNo = student.symbolNo?.toLowerCase() || '';
    const email = student.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || symbolNo.includes(query) || email.includes(query);
  });

  // Get enrollment summary for a student
  const getEnrollmentSummary = (studentId: string) => {
    const data = enrollmentData.get(studentId);
    if (!data || data.enrollments.length === 0) {
      return { total: 0, active: 0, completed: 0 };
    }

    return {
      total: data.enrollments.length,
      active: data.enrollments.filter((e) => e.status === 'ACTIVE').length,
      completed: data.enrollments.filter((e) => e.status === 'COMPLETED').length,
    };
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
              <h1 className="text-3xl font-bold text-gray-900">Batch Students</h1>
              <p className="text-gray-600 mt-1">{batchName}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{students.length}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, symbol no, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No students found' : 'No students in this batch'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'Students will appear here once they are assigned to this batch'}
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
                      Symbol No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
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
                  {filteredStudents.map((student, index) => {
                    const summary = getEnrollmentSummary(student.id);
                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {student.firstName[0]}{student.lastName[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 font-mono">{student.symbolNo}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {student.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{student.email}</span>
                              </div>
                            )}
                            {student.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{student.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{summary.total}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">{summary.completed}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <XCircle className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-600">{summary.active}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {summary.active > 0 ? (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              Active
                            </span>
                          ) : summary.completed > 0 ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              Not Enrolled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => router.push(`/admin/users?studentId=${student.id}`)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Profile"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
