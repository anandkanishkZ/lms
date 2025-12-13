'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Award,
  CheckCircle,
  Calendar,
  FileText,
  Info,
  AlertCircle,
  Play,
  Timer,
  User,
} from 'lucide-react';
import { examApiService, type ExamPreview } from '@/src/services/exam-api.service';
import { showErrorToast } from '@/src/utils/toast.util';

export default function ExamPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [preview, setPreview] = useState<ExamPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreview();
  }, [examId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const data = await examApiService.getExamPreview(examId);
      setPreview(data);
    } catch (error: any) {
      console.error('Error loading exam preview:', error);
      showErrorToast(error.message || 'Failed to load exam preview');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} minutes`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MIDTERM':
        return 'from-purple-500 to-purple-600';
      case 'FINAL':
        return 'from-red-500 to-red-600';
      case 'QUIZ':
        return 'from-yellow-500 to-yellow-600';
      case 'ASSIGNMENT':
        return 'from-blue-500 to-blue-600';
      case 'PROJECT':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeBadgeColor = (type: string) => {
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

  const formatQuestionType = (type: string) => {
    switch (type) {
      case 'MCQ':
        return 'Multiple Choice';
      case 'TRUE_FALSE':
        return 'True/False';
      case 'SHORT_ANSWER':
        return 'Short Answer';
      case 'LONG_ANSWER':
        return 'Long Answer';
      case 'MULTIPLE_CHOICE':
        return 'Multiple Choice';
      case 'FILE_UPLOAD':
        return 'File Upload';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Found</h2>
          <p className="text-gray-600 mb-6">The exam you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/student/exams')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/student/exams')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Exams
      </button>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${getTypeColor(preview.type)} text-white rounded-xl p-8 shadow-lg`}
      >
        <div className="flex items-start justify-between mb-4">
          <span className={`px-3 py-1 rounded-lg text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30`}>
            {preview.type}
          </span>
          {preview.status === 'ACTIVE' && (
            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-red-500/80 backdrop-blur-sm animate-pulse">
              LIVE NOW
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">{preview.title}</h1>
        
        {preview.description && (
          <p className="text-white/90 text-lg">{preview.description}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-6">
          {preview.subject && (
            <div className="flex items-center gap-2 text-white/90">
              <FileText className="w-4 h-4" />
              <span>{preview.subject.name}</span>
            </div>
          )}
          {preview.class && (
            <div className="flex items-center gap-2 text-white/90">
              <User className="w-4 h-4" />
              <span>{preview.class.name}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-bold text-gray-900">{formatDuration(preview.duration)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Marks</p>
              <p className="text-lg font-bold text-gray-900">{preview.totalMarks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Passing Marks</p>
              <p className="text-lg font-bold text-gray-900">{preview.passingMarks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-lg font-bold text-gray-900">{preview.questionCount}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Time</p>
              <p className="font-medium text-gray-900">{formatDateTime(preview.startTime)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">End Time</p>
              <p className="font-medium text-gray-900">{formatDateTime(preview.endTime)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Question Types */}
      {preview.questionTypes && Object.keys(preview.questionTypes).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Question Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(preview.questionTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{formatQuestionType(type)}</span>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Exam Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Exam Rules</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {preview.allowLateSubmission ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="text-gray-700">
              Late submission: {preview.allowLateSubmission ? 'Allowed' : 'Not allowed'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {preview.shuffleQuestions ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <span className="text-gray-700">
              Question shuffle: {preview.shuffleQuestions ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {preview.showResultsImmediately ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <span className="text-gray-700">
              Immediate results: {preview.showResultsImmediately ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {preview.allowReview ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="text-gray-700">
              Review answers: {preview.allowReview ? 'Allowed' : 'Not allowed'}
            </span>
          </div>

          {preview.maxAttempts && (
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700">
                Maximum attempts: {preview.maxAttempts}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Attempt Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-xl p-6 shadow-md border ${
          preview.canAttempt
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {preview.canAttempt ? (
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-1">Your Attempts</h3>
            <p className="text-gray-700">
              Attempts: {preview.attemptCount}/{preview.maxAttempts || '∞'}
            </p>
            <p className={`mt-2 font-medium ${preview.canAttempt ? 'text-green-700' : 'text-red-700'}`}>
              {preview.canAttempt
                ? 'You can take this exam'
                : 'Maximum attempts reached'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      {preview.instructions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-md"
        >
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold text-amber-900">Important Instructions</h2>
          </div>
          <div className="prose prose-sm max-w-none text-gray-800">
            <p className="whitespace-pre-wrap">{preview.instructions}</p>
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      {preview.canAttempt && preview.status === 'ACTIVE' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="sticky bottom-6"
        >
          <button
            onClick={() => router.push(`/student/exams/${examId}/take`)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
          >
            <Play className="w-6 h-6" />
            Start Exam Now
          </button>
        </motion.div>
      )}

      {preview.status === 'UPCOMING' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
        >
          <Timer className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Exam Not Started Yet</h3>
          <p className="text-gray-700">
            This exam will be available on {formatDateTime(preview.startTime)}
          </p>
        </motion.div>
      )}
    </div>
  );
}
