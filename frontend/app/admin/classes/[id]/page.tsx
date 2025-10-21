'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  BarChart3,
  Calendar,
  Loader2,
  ToggleRight,
  ToggleLeft,
  Plus,
  X,
  BookMarked,
} from 'lucide-react';
import {
  getClassById,
  deleteClass,
  toggleClassStatus,
  assignTeacherToClass,
  removeTeacherFromClass,
  getClassStatistics,
  type ClassDetails,
  type ClassStatistics,
} from '@/services/class-api.service';
import { AdminLayout } from '@/src/features/admin';

type TabType = 'overview' | 'teachers' | 'students' | 'statistics' | 'batches';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [classData, setClassData] = useState<ClassDetails | null>(null);
  const [statistics, setStatistics] = useState<ClassStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  useEffect(() => {
    fetchClassData();
    fetchStatistics();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const response = await getClassById(classId);
      if (response.success && response.data) {
        setClassData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching class:', error);
      alert(error.message || 'Failed to fetch class details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getClassStatistics(classId);
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      const response = await deleteClass(classId, false);
      if (response.success) {
        alert('Class deleted successfully');
        router.push('/admin/classes');
      }
    } catch (error: any) {
      console.error('Error deleting class:', error);
      alert(error.message || 'Failed to delete class');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await toggleClassStatus(classId);
      if (response.success) {
        alert('Class status updated successfully');
        fetchClassData();
      }
    } catch (error: any) {
      console.error('Error toggling status:', error);
      alert(error.message || 'Failed to update status');
    }
  };

  const handleRemoveTeacher = async (teacherId: string, subjectId: string) => {
    if (!confirm('Are you sure you want to remove this teacher?')) return;

    try {
      const response = await removeTeacherFromClass(classId, teacherId, subjectId);
      if (response.success) {
        alert('Teacher removed successfully');
        fetchClassData();
      }
    } catch (error: any) {
      console.error('Error removing teacher:', error);
      alert(error.message || 'Failed to remove teacher');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Not Found</h2>
        <p className="text-gray-600 mb-6">The class you're looking for doesn't exist</p>
        <button
          onClick={() => router.push('/admin/classes')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/classes')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Classes
        </button>

        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {classData.name}
                {classData.section && (
                  <span className="px-3 py-1 text-lg font-medium bg-purple-100 text-purple-800 rounded-lg">
                    Section {classData.section}
                  </span>
                )}
              </h1>
              {classData.description && (
                <p className="text-gray-600 mt-2 max-w-3xl">{classData.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>Created: {formatDate(classData.createdAt)}</span>
                <span>•</span>
                <span>Updated: {formatDate(classData.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                classData.isActive
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              {classData.isActive ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  Active
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  Inactive
                </>
              )}
            </button>
            <button
              onClick={() => router.push(`/admin/classes/${classId}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                deleteConfirm
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              {deleteConfirm ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Students</p>
              <p className="text-3xl font-bold text-gray-900">
                {classData._count?.students || 0}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Teachers</p>
              <p className="text-3xl font-bold text-gray-900">
                {classData._count?.teachers || 0}
              </p>
            </div>
            <GraduationCap className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Modules</p>
              <p className="text-3xl font-bold text-gray-900">
                {classData._count?.modules || 0}
              </p>
            </div>
            <BookMarked className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Batches</p>
              <p className="text-3xl font-bold text-gray-900">
                {classData._count?.classBatches || 0}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'teachers', label: 'Teachers', icon: GraduationCap },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'statistics', label: 'Statistics', icon: BarChart3 },
              { id: 'batches', label: 'Batches', icon: Calendar },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Class Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Class Name</p>
                    <p className="text-lg font-semibold text-gray-900">{classData.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Section</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {classData.section || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-lg text-gray-900">
                      {classData.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teachers Tab */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assigned Teachers</h3>
                <button
                  onClick={() => setShowTeacherModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Assign Teacher
                </button>
              </div>

              {classData.teachers && classData.teachers.length > 0 ? (
                <div className="grid gap-4">
                  {classData.teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <GraduationCap className="w-10 h-10 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{teacher.user.name}</p>
                          <p className="text-sm text-gray-600">{teacher.user.email}</p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                            {teacher.subject.name}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTeacher(teacher.user.id, teacher.subject.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teachers Assigned</h3>
                  <p className="text-gray-600 mb-6">
                    Start by assigning teachers to this class
                  </p>
                  <button
                    onClick={() => setShowTeacherModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Assign First Teacher
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Students</h3>

              {classData.students && classData.students.length > 0 ? (
                <div className="grid gap-4">
                  {classData.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Users className="w-10 h-10 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Enrolled</h3>
                  <p className="text-gray-600">
                    Students will be enrolled through batches
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && statistics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Statistics</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Students', value: statistics.totalStudents, color: 'blue' },
                  { label: 'Total Teachers', value: statistics.totalTeachers, color: 'green' },
                  { label: 'Total Modules', value: statistics.totalModules, color: 'purple' },
                  { label: 'Total Live Classes', value: statistics.totalLiveClasses, color: 'orange' },
                  { label: 'Upcoming Live Classes', value: statistics.upcomingLiveClasses, color: 'pink' },
                  { label: 'Total Exams', value: statistics.totalExams, color: 'indigo' },
                  { label: 'Completed Exams', value: statistics.completedExams, color: 'teal' },
                  { label: 'Total Notices', value: statistics.totalNotices, color: 'red' },
                  { label: 'Active Batches', value: statistics.activeBatches, color: 'yellow' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Batches Tab */}
          {activeTab === 'batches' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Linked Batches</h3>

              {classData.classBatches && classData.classBatches.length > 0 ? (
                <div className="grid gap-4">
                  {classData.classBatches.map((cb) => (
                    <div
                      key={cb.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/batches/${cb.batch.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="w-10 h-10 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{cb.batch.name}</p>
                          <p className="text-sm text-gray-600">
                            Academic Year: {cb.batch.academicYear} • Sequence: {cb.sequence}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                              cb.batch.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {cb.batch.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batches Linked</h3>
                  <p className="text-gray-600">
                    This class hasn't been linked to any batches yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}
