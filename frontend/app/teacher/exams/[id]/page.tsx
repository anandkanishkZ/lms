'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Users,
  Trophy,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Eye,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  ClipboardCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import {
  examApiService,
  type ExamDetails,
  type StudentExamAttempt,
} from '@/src/services/exam-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

interface AttemptWithStudent extends StudentExamAttempt {
  student: {
    id: string;
    name: string;
    email: string;
    symbolNo: string | null;
  };
}

export default function TeacherExamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [attempts, setAttempts] = useState<AttemptWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'graded'>('all');

  useEffect(() => {
    loadExamDetails();
  }, [examId]);

  const loadExamDetails = async () => {
    try {
      setLoading(true);
      const [examData, attemptsData] = await Promise.all([
        examApiService.getExamById(examId),
        examApiService.getExamAttempts(examId),
      ]);

      if (!examData) {
        throw new Error('Exam not found');
      }

      setExam(examData);
      setAttempts(attemptsData as AttemptWithStudent[]);
    } catch (error: any) {
      console.error('Error loading exam details:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        examId,
      });
      showErrorToast(error.message || 'Failed to load exam details');
      router.push('/teacher/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    try {
      setDeleting(true);
      await examApiService.deleteExam(examId);
      showSuccessToast('Exam deleted successfully');
      router.push('/teacher/exams');
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        examId,
      });
      showErrorToast(error.message || 'Failed to delete exam');
      setDeleting(false);
    }
  };

  const handleExportResults = () => {
    if (!exam || attempts.length === 0) {
      showErrorToast('No attempts to export');
      return;
    }

    // Create CSV content
    const headers = [
      'Student Name',
      'Email',
      'Symbol Number',
      'Attempt Number',
      'Started At',
      'Submitted At',
      'Time Spent (min)',
      'Status',
      'Score',
      'Max Score',
      'Percentage',
      'Grade',
      'Result',
    ];

    const rows = attempts.map((attempt) => [
      attempt.student.name,
      attempt.student.email,
      attempt.student.symbolNo || 'N/A',
      attempt.attemptNumber,
      new Date(attempt.startedAt).toLocaleString(),
      attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'Not Submitted',
      attempt.timeSpentSeconds ? Math.round(attempt.timeSpentSeconds / 60) : 0,
      attempt.isCompleted ? 'Completed' : 'In Progress',
      attempt.totalScore || 0,
      exam.totalMarks,
      attempt.percentage?.toFixed(2) || '0.00',
      examApiService.calculateGrade(attempt.percentage || 0),
      (attempt.totalScore || 0) >= exam.passingMarks ? 'PASS' : 'FAIL',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exam.title}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccessToast('Results exported successfully');
  };

  const getStatusColor = () => {
    if (!exam) return 'bg-gray-100 text-gray-800';
    const status = examApiService.getExamStatusBadge(exam).label;
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MIDTERM: 'bg-purple-100 text-purple-800 border-purple-200',
      FINAL: 'bg-red-100 text-red-800 border-red-200',
      QUIZ: 'bg-blue-100 text-blue-800 border-blue-200',
      ASSIGNMENT: 'bg-green-100 text-green-800 border-green-200',
      PROJECT: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateStats = () => {
    const completedAttempts = attempts.filter((a) => a.isCompleted);
    const gradedAttempts = completedAttempts.filter((a) => a.totalScore !== null);
    const totalAttempts = attempts.length;
    
    const avgScore =
      gradedAttempts.length > 0
        ? gradedAttempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / gradedAttempts.length
        : 0;
    
    const highestScore = gradedAttempts.length > 0 
      ? Math.max(...gradedAttempts.map((a) => a.totalScore || 0))
      : 0;
    
    const lowestScore = gradedAttempts.length > 0
      ? Math.min(...gradedAttempts.map((a) => a.totalScore || 0))
      : 0;
    
    const passCount = gradedAttempts.filter((a) => (a.totalScore || 0) >= (exam?.passingMarks || 0)).length;
    const passRate = gradedAttempts.length > 0 ? (passCount / gradedAttempts.length) * 100 : 0;

    return {
      totalAttempts,
      completedAttempts: completedAttempts.length,
      gradedAttempts: gradedAttempts.length,
      pendingGrading: completedAttempts.length - gradedAttempts.length,
      avgScore,
      highestScore,
      lowestScore,
      passRate,
    };
  };

  const getFilteredAttempts = () => {
    switch (filterStatus) {
      case 'completed':
        return attempts.filter((a) => a.isCompleted);
      case 'pending':
        return attempts.filter((a) => !a.isCompleted);
      case 'graded':
        return attempts.filter((a) => a.isCompleted && a.totalScore !== null);
      default:
        return attempts;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  const stats = calculateStats();
  const filteredAttempts = getFilteredAttempts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Exams
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
                  {examApiService.getExamStatusBadge(exam).label}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(exam.type)}`}>
                  {exam.type}
                </span>
              </div>
              {exam.description && (
                <p className="text-gray-600 mt-1">{exam.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/teacher/exams/${examId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleExportResults}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Grading</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingGrading}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.avgScore.toFixed(1)}/{exam.totalMarks}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
                <p className="text-3xl font-bold text-green-600">{stats.passRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Exam Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Exam Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Subject & Class</p>
              <p className="font-medium text-gray-900">
                {exam.subject?.name}
                {exam.class && ` - ${exam.class.name}`}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Start Time</p>
              <p className="font-medium text-gray-900">{formatDate(exam.startTime)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">End Time</p>
              <p className="font-medium text-gray-900">{formatDate(exam.endTime)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-medium text-gray-900">{exam.duration} minutes</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Total Marks</p>
              <p className="font-medium text-gray-900">{exam.totalMarks}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Passing Marks</p>
              <p className="font-medium text-gray-900">{exam.passingMarks}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="font-medium text-gray-900">{exam.questions.length}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Max Attempts</p>
              <p className="font-medium text-gray-900">{exam.maxAttempts}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Settings</p>
              <div className="flex flex-wrap gap-1">
                {exam.shuffleQuestions && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Shuffle</span>
                )}
                {exam.allowLateSubmission && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Late OK</span>
                )}
                {exam.showResultsImmediately && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Instant Results</span>
                )}
              </div>
            </div>
          </div>

          {exam.instructions && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Instructions</p>
              <p className="text-gray-900 whitespace-pre-wrap">{exam.instructions}</p>
            </div>
          )}
        </motion.div>

        {/* Questions Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions ({exam.questions.length})</h2>
          
          <div className="space-y-3">
            {exam.questions.map((eq, index) => (
              <div
                key={eq.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      {index + 1}. {eq.question.questionText}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        eq.question.questionType === 'MULTIPLE_CHOICE'
                          ? 'bg-blue-100 text-blue-700'
                          : eq.question.questionType === 'FILE_UPLOAD'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {eq.question.questionType.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">
                        {eq.question.marks} marks
                      </span>
                      {eq.question.negativeMarks > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                          -{eq.question.negativeMarks} for wrong
                        </span>
                      )}
                    </div>

                    {/* Show MCQ Options */}
                    {eq.question.questionType === 'MULTIPLE_CHOICE' && eq.question.options && (
                      <div className="mt-3 space-y-1">
                        {eq.question.options.map((opt, idx) => (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-2 text-sm ${
                              opt.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'
                            }`}
                          >
                            {opt.isCorrect && <CheckCircle className="w-4 h-4" />}
                            <span>
                              {String.fromCharCode(65 + idx)}. {opt.optionText}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Student Attempts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Student Attempts ({stats.totalAttempts})
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.totalAttempts})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed ({stats.completedAttempts})
              </button>
              <button
                onClick={() => setFilterStatus('graded')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'graded'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Graded ({stats.gradedAttempts})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress ({stats.totalAttempts - stats.completedAttempts})
              </button>
            </div>
          </div>

          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No student attempts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attempt</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Started</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttempts.map((attempt) => {
                    const isPassed = (attempt.totalScore || 0) >= exam.passingMarks;
                    const grade = examApiService.calculateGrade(attempt.percentage || 0);

                    return (
                      <tr key={attempt.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{attempt.student.name}</p>
                            <p className="text-sm text-gray-600">{attempt.student.email}</p>
                            {attempt.student.symbolNo && (
                              <p className="text-xs text-gray-500">#{attempt.student.symbolNo}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            #{attempt.attemptNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(attempt.startedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {attempt.timeSpentSeconds
                            ? `${Math.round(attempt.timeSpentSeconds / 60)} min`
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {!attempt.isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                              <Clock className="w-3 h-3" />
                              In Progress
                            </span>
                          ) : attempt.totalScore === null ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                              <AlertCircle className="w-3 h-3" />
                              Pending Grading
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                              isPassed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {isPassed ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {isPassed ? 'Passed' : 'Failed'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {attempt.totalScore !== null ? (
                            <span className="font-medium text-gray-900">
                              {attempt.totalScore}/{exam.totalMarks}
                              <span className="text-sm text-gray-500 ml-1">
                                ({attempt.percentage?.toFixed(1)}%)
                              </span>
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {attempt.totalScore !== null ? (
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              grade === 'A+' || grade === 'A'
                                ? 'bg-green-100 text-green-700'
                                : grade === 'B+' || grade === 'B'
                                ? 'bg-blue-100 text-blue-700'
                                : grade === 'C+' || grade === 'C'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/teacher/exams/${examId}/grade?attemptId=${attempt.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            {attempt.totalScore === null ? (
                              <>
                                <Edit className="w-4 h-4" />
                                Grade
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                View
                              </>
                            )}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {stats.pendingGrading > 0 && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">
                    {stats.pendingGrading} attempt(s) pending grading
                  </p>
                  <p className="text-sm text-orange-700">
                    Click "Grade" to evaluate and provide marks for each student.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Exam?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this exam? This will permanently delete all
                questions, student attempts, and grades. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteExam}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
