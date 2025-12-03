'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Award,
  FileText,
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  TrendingUp,
  Target,
} from 'lucide-react';
import StudentLayout from '@/src/components/student/StudentLayout';
import { examApiService, type StudentExamAttempt } from '@/src/services/exam-api.service';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast.util';
import { formatDate, formatDateTime } from '@/src/utils/date.util';

export default function StudentExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [attempt, setAttempt] = useState<StudentExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswerReview, setShowAnswerReview] = useState(false);

  useEffect(() => {
    loadExamResult();
  }, [examId]);

  const loadExamResult = async () => {
    try {
      setLoading(true);
      const data = await examApiService.getMyExamResult(examId);
      setAttempt(data);
    } catch (error: any) {
      console.error('Error loading exam result:', error);
      showErrorToast(error.message || 'Failed to load exam result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Exam Result" subtitle="Loading your exam result...">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your result...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!attempt) {
    return (
      <StudentLayout title="Exam Result" subtitle="No result found">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Result Found</h2>
            <p className="text-gray-600 mb-6">
              You haven't completed this exam yet or your result is not yet available.
            </p>
            <button
              onClick={() => router.push('/student/exams')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Exams
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const isPassed = attempt.isPassed ?? false;
  const percentage = attempt.percentage ?? 0;
  const totalScore = attempt.totalScore ?? 0;
  const maxScore = attempt.maxScore;

  const getGradeColor = () => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPerformanceText = () => {
    if (percentage >= 90) return 'Outstanding Performance! 🎉';
    if (percentage >= 80) return 'Excellent Work! 🌟';
    if (percentage >= 70) return 'Very Good! 👏';
    if (percentage >= 60) return 'Good Job! 👍';
    if (percentage >= 50) return 'Fair Performance';
    return 'Needs Improvement';
  };

  const timeSpentMinutes = Math.floor(attempt.timeSpentSeconds / 60);
  const timeSpentHours = Math.floor(timeSpentMinutes / 60);
  const remainingMinutes = timeSpentMinutes % 60;

  const getTimeSpentText = () => {
    if (timeSpentHours > 0) {
      return `${timeSpentHours}h ${remainingMinutes}m`;
    }
    return `${timeSpentMinutes} minutes`;
  };

  const correctAnswers = attempt.answers?.filter((a) => a.isCorrect === true).length || 0;
  const incorrectAnswers = attempt.answers?.filter((a) => a.isCorrect === false).length || 0;
  const unansweredQuestions = attempt.answers?.filter((a) => a.isCorrect === null).length || 0;
  const totalQuestions = attempt.answers?.length || 0;

  return (
    <StudentLayout title="Exam Result" subtitle={attempt.exam?.title || 'View your exam results'}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => router.push('/student/exams')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Exams
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Exam Result</h1>
            <p className="text-gray-600 mt-1">{attempt.exam?.title}</p>
          </motion.div>

          {/* Result Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
          >
            {/* Pass/Fail Banner */}
            <div
              className={`py-6 px-8 text-center ${
                isPassed
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-gradient-to-r from-red-500 to-orange-600'
              }`}
            >
              {isPassed ? (
                <Trophy className="w-16 h-16 text-white mx-auto mb-3" />
              ) : (
                <AlertCircle className="w-16 h-16 text-white mx-auto mb-3" />
              )}
              <h2 className="text-3xl font-bold text-white mb-2">
                {isPassed ? 'Congratulations! 🎉' : 'Keep Trying!'}
              </h2>
              <p className="text-white text-lg opacity-90">{getPerformanceText()}</p>
            </div>

            {/* Score Section */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Score */}
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <Award className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {totalScore} / {maxScore}
                  </div>
                  <div className="text-gray-600 font-medium">Total Score</div>
                </div>

                {/* Percentage */}
                <div className={`text-center p-6 rounded-xl border-2 ${getGradeColor()}`}>
                  <Target className="w-10 h-10 mx-auto mb-3" />
                  <div className="text-4xl font-bold mb-1">{percentage.toFixed(1)}%</div>
                  <div className="font-medium">Percentage</div>
                </div>

                {/* Grade */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                  <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-purple-600 mb-1">
                    {attempt.grade || 'N/A'}
                  </div>
                  <div className="text-gray-600 font-medium">Grade</div>
                </div>
              </div>

              {/* Question Statistics */}
              <div className="border-t pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Question Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{totalQuestions}</div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
                    <div className="text-sm text-gray-600">Incorrect</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{unansweredQuestions}</div>
                    <div className="text-sm text-gray-600">Unanswered</div>
                  </div>
                </div>
              </div>

              {/* Attempt Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Attempt Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Time Spent</div>
                      <div className="font-semibold text-gray-800">{getTimeSpentText()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Submitted At</div>
                      <div className="font-semibold text-gray-800">
                        {formatDateTime(attempt.submittedAt || attempt.startedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Attempt Number</div>
                      <div className="font-semibold text-gray-800">#{attempt.attemptNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-semibold text-gray-800">
                        {attempt.isGraded ? 'Graded' : 'Pending Grading'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grading Status */}
              {!attempt.isGraded && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-yellow-800">Grading in Progress</div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your exam contains questions that require manual grading. Your final score
                        may change once the teacher completes the grading process.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Graded Info */}
              {attempt.isGraded && attempt.gradedAt && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-800">Grading Complete</div>
                      <p className="text-sm text-green-700 mt-1">
                        Your exam was graded on {formatDateTime(attempt.gradedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Answer Review Section */}
              {attempt.exam?.allowReview && attempt.answers && attempt.answers.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <button
                    onClick={() => setShowAnswerReview(!showAnswerReview)}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">
                        {showAnswerReview ? 'Hide' : 'View'} Answer Review
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: showAnswerReview ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.div>
                  </button>

                  {showAnswerReview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-4"
                    >
                      {attempt.answers.map((answer, index) => (
                        <div
                          key={answer.id}
                          className="p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-800">
                                  Question {index + 1}
                                </span>
                                {answer.isCorrect === true && (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                                {answer.isCorrect === false && (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                {answer.isCorrect === null && (
                                  <Clock className="w-5 h-5 text-yellow-600" />
                                )}
                              </div>
                              <p className="text-gray-700 mb-2">
                                {answer.question?.questionText}
                              </p>
                            </div>
                            <div className="ml-4">
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  answer.isCorrect === true
                                    ? 'bg-green-100 text-green-700'
                                    : answer.isCorrect === false
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {answer.marksAwarded ?? 0} / {answer.question?.marks ?? 0}
                              </div>
                            </div>
                          </div>

                          {/* Your Answer */}
                          <div className="mb-2">
                            <div className="text-sm font-semibold text-gray-600 mb-1">
                              Your Answer:
                            </div>
                            {answer.question?.questionType === 'MULTIPLE_CHOICE' && (
                              <p className="text-gray-800 ml-2">
                                {answer.selectedOption?.optionText || 'Not answered'}
                              </p>
                            )}
                            {(answer.question?.questionType === 'SHORT_ANSWER' ||
                              answer.question?.questionType === 'LONG_ANSWER') && (
                              <p className="text-gray-800 ml-2">
                                {answer.textAnswer || 'Not answered'}
                              </p>
                            )}
                            {answer.question?.questionType === 'FILE_UPLOAD' && (
                              <div className="ml-2">
                                {answer.uploadedFiles && answer.uploadedFiles.length > 0 ? (
                                  <div className="space-y-1">
                                    {answer.uploadedFiles.map((file, i) => (
                                      <a
                                        key={i}
                                        href={file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                      >
                                        <Download className="w-4 h-4" />
                                        File {i + 1}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-600">No files uploaded</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Correct Answer (for MCQ) */}
                          {answer.question?.questionType === 'MULTIPLE_CHOICE' &&
                            answer.isCorrect === false && (
                              <div className="mb-2">
                                <div className="text-sm font-semibold text-green-700 mb-1">
                                  Correct Answer:
                                </div>
                                <p className="text-green-800 ml-2">
                                  {answer.question?.options?.find((opt) => opt.isCorrect)
                                    ?.optionText || 'N/A'}
                                </p>
                              </div>
                            )}

                          {/* Feedback */}
                          {answer.feedback && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="text-sm font-semibold text-blue-800 mb-1">
                                Teacher's Feedback:
                              </div>
                              <p className="text-blue-900 text-sm">{answer.feedback}</p>
                            </div>
                          )}

                          {/* Explanation */}
                          {answer.question?.explanation && (
                            <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                              <div className="text-sm font-semibold text-purple-800 mb-1">
                                Explanation:
                              </div>
                              <p className="text-purple-900 text-sm">
                                {answer.question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <button
              onClick={() => router.push('/student/exams')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Back to Exams
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Result
            </button>
          </motion.div>
        </div>
      </div>
    </StudentLayout>
  );
}
