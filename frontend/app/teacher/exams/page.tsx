'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { examApiService, type Exam, type ExamFilters } from '@/src/services/exam-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

export default function TeacherExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [exams, searchQuery, statusFilter, typeFilter]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await examApiService.getAllExams();
      setExams(data);
    } catch (error: any) {
      console.error('Error loading exams:', error);
      showErrorToast(error.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = [...exams];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (exam) =>
          exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.subject?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const status = examApiService.getExamStatusBadge(
        filtered[0]
      ).label.toUpperCase() as any;
      filtered = filtered.filter((exam) => {
        const examStatus = examApiService.getExamStatusBadge(exam).label.toUpperCase();
        return examStatus === statusFilter.toUpperCase();
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((exam) => exam.type === typeFilter);
    }

    setFilteredExams(filtered);
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      await examApiService.deleteExam(examId);
      showSuccessToast('Exam deleted successfully');
      setExams(exams.filter((e) => e.id !== examId));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      showErrorToast(error.message || 'Failed to delete exam');
    }
  };

  const getStatusIcon = (exam: Exam) => {
    const status = examApiService.getExamStatusBadge(exam);
    switch (status.label) {
      case 'Upcoming':
        return <Clock className="w-4 h-4" />;
      case 'Active':
        return <CheckCircle className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (exam: Exam) => {
    const status = examApiService.getExamStatusBadge(exam);
    switch (status.color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'gray':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MIDTERM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FINAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'QUIZ':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ASSIGNMENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROJECT':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <ClipboardCheck className="w-8 h-8 text-white" />
              </div>
              Exam Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage exams for your students
            </p>
          </div>

          <Link
            href="/teacher/exams/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Exam
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: 'Total Exams',
              value: exams.length,
              icon: ClipboardCheck,
              color: 'blue',
            },
            {
              label: 'Upcoming',
              value: exams.filter(
                (e) => examApiService.getExamStatusBadge(e).label === 'Upcoming'
              ).length,
              icon: Clock,
              color: 'yellow',
            },
            {
              label: 'Active',
              value: exams.filter(
                (e) => examApiService.getExamStatusBadge(e).label === 'Active'
              ).length,
              icon: CheckCircle,
              color: 'green',
            },
            {
              label: 'Completed',
              value: exams.filter(
                (e) => examApiService.getExamStatusBadge(e).label === 'Completed'
              ).length,
              icon: FileText,
              color: 'purple',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 bg-${stat.color}-100 rounded-lg`}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="MIDTERM">Midterm</option>
                  <option value="FINAL">Final</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="PROJECT">Project</option>
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-100"
          >
            <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No exams found
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first exam to get started
            </p>
            <Link
              href="/teacher/exams/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Exam
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Card Header */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {exam.title}
                      </h3>
                      {exam.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {exam.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                        exam
                      )}`}
                    >
                      {getStatusIcon(exam)}
                      {examApiService.getExamStatusBadge(exam).label}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(
                        exam.type
                      )}`}
                    >
                      {exam.type}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{exam.subject?.name}</span>
                    {exam.class && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>{exam.class.name}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(exam.startTime)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{formatTime(exam.startTime)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{exam.duration} minutes</span>
                    <span className="text-gray-400">•</span>
                    <span>{exam.totalMarks} marks</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{exam._count?.questions || 0} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{exam._count?.attempts || 0} attempts</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/teacher/exams/${exam.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    href={`/teacher/exams/${exam.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(exam.id)}
                    className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Exam?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this exam? This action cannot be
                undone and will delete all associated questions and student
                attempts.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteExam(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
