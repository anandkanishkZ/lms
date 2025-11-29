'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  Save,
  Download,
  Filter,
  Search,
} from 'lucide-react';
import {
  examApiService,
  type ExamDetails,
  type StudentExamAttempt,
  type GradeAnswerData,
} from '@/src/services/exam-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

export default function GradeExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [attempts, setAttempts] = useState<StudentExamAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<StudentExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'graded' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [gradeData, setGradeData] = useState<Record<string, GradeAnswerData>>({});

  useEffect(() => {
    loadExamAndAttempts();
  }, []);

  const loadExamAndAttempts = async () => {
    try {
      setLoading(true);
      const [examData, attemptsData] = await Promise.all([
        examApiService.getExamById(examId),
        examApiService.getExamAttempts(examId),
      ]);

      setExam(examData);
      setAttempts(attemptsData);

      if (attemptsData.length > 0) {
        setSelectedAttempt(attemptsData[0]);
        initializeGradeData(attemptsData[0]);
      }
    } catch (error: any) {
      console.error('Error loading exam data:', error);
      showErrorToast(error.message || 'Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  const initializeGradeData = (attempt: StudentExamAttempt) => {
    if (!attempt.answers) return;

    const grades: Record<string, GradeAnswerData> = {};
    attempt.answers.forEach((answer) => {
      if (answer.marksAwarded !== null) {
        grades[answer.id] = {
          marksAwarded: answer.marksAwarded,
          feedback: answer.feedback || '',
          isCorrect: answer.isCorrect || false,
        };
      }
    });
    setGradeData(grades);
  };

  const handleSelectAttempt = (attempt: StudentExamAttempt) => {
    setSelectedAttempt(attempt);
    initializeGradeData(attempt);
  };

  const handleGradeChange = (answerId: string, data: Partial<GradeAnswerData>) => {
    setGradeData((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        marksAwarded: prev[answerId]?.marksAwarded || 0,
        feedback: prev[answerId]?.feedback || '',
        isCorrect: prev[answerId]?.isCorrect || false,
        ...data,
      },
    }));
  };

  const handleSaveGrade = async (answerId: string) => {
    if (!gradeData[answerId]) {
      showErrorToast('Please enter marks before saving');
      return;
    }

    try {
      setGrading(true);
      const response = await examApiService.gradeAnswer(answerId, gradeData[answerId]);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      showSuccessToast('Grade saved successfully');

      // Reload attempts to get updated data
      await loadExamAndAttempts();
    } catch (error: any) {
      console.error('Error saving grade:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        answerId,
        gradeData: gradeData[answerId],
      });
      showErrorToast(error.message || 'Failed to save grade');
    } finally {
      setGrading(false);
    }
  };

  const calculateTotalScore = (attempt: StudentExamAttempt): number => {
    if (!attempt.answers) return 0;
    return attempt.answers.reduce((sum, answer) => sum + (answer.marksAwarded || 0), 0);
  };

  const getFilteredAttempts = () => {
    return attempts
      .filter((attempt) => {
        if (filter === 'graded') return attempt.isGraded;
        if (filter === 'pending') return !attempt.isGraded;
        return true;
      })
      .filter(
        (attempt) =>
          attempt.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attempt.student?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attempt.student?.symbolNo?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const filteredAttempts = getFilteredAttempts();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileExtension = (url: string): string => {
    const parts = url.split('.');
    return parts[parts.length - 1].toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Exams
            </button>

            <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-gray-600 mt-1">Grade student submissions</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Total Submissions</p>
            <p className="text-3xl font-bold text-gray-900">{attempts.length}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{attempts.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Graded</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {attempts.filter((a) => a.isGraded).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {attempts.filter((a) => !a.isGraded).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Score</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {attempts.length > 0
                    ? Math.round(
                        attempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) /
                          attempts.length
                      )
                    : 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Student List Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
            >
              {/* Filters */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  {(['all', 'pending', 'graded'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === f
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student List */}
              <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
                {filteredAttempts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No submissions found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredAttempts.map((attempt) => (
                      <button
                        key={attempt.id}
                        onClick={() => handleSelectAttempt(attempt)}
                        className={`w-full p-4 text-left transition-colors ${
                          selectedAttempt?.id === attempt.id
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {attempt.student?.name}
                          </p>
                          {attempt.isGraded ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {attempt.student?.symbolNo || attempt.student?.email}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(attempt.submittedAt || attempt.startedAt)}
                          </span>
                          {attempt.totalScore !== null && (
                            <span className="text-sm font-bold text-blue-600">
                              {attempt.totalScore}/{exam.totalMarks}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Grading Area */}
          <div className="col-span-12 lg:col-span-8">
            {selectedAttempt ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Student Info Card */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedAttempt.student?.name}
                      </h2>
                      <p className="text-gray-600">
                        {selectedAttempt.student?.symbolNo} • {selectedAttempt.student?.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Current Score</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {calculateTotalScore(selectedAttempt)}/{exam.totalMarks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Answers */}
                {selectedAttempt.answers?.map((answer, index) => {
                  const question = exam.questions.find(
                    (q) => q.question.id === answer.questionId
                  )?.question;

                  if (!question) return null;

                  return (
                    <div
                      key={answer.id}
                      className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                    >
                      {/* Question Header */}
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                            Q{index + 1}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded">
                            {question.marks} marks
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded">
                            {question.questionType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-lg text-gray-900 whitespace-pre-wrap">
                          {question.questionText}
                        </p>
                      </div>

                      {/* Student Answer */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Student's Answer:
                        </p>

                        {/* MCQ Answer */}
                        {question.questionType === 'MULTIPLE_CHOICE' && (
                          <div className="space-y-2">
                            {question.options?.map((option) => (
                              <div
                                key={option.id}
                                className={`flex items-center gap-3 p-3 rounded-lg ${
                                  answer.selectedOptionId === option.id
                                    ? option.isCorrect
                                      ? 'bg-green-100 border-2 border-green-500'
                                      : 'bg-red-100 border-2 border-red-500'
                                    : option.isCorrect
                                    ? 'bg-green-50 border border-green-300'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                {answer.selectedOptionId === option.id && (
                                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                  </div>
                                )}
                                {option.isCorrect && (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                                <span className="text-gray-900">{option.optionText}</span>
                              </div>
                            ))}
                            {answer.isCorrect !== null && (
                              <p
                                className={`text-sm font-medium ${
                                  answer.isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}
                              >
                                {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Text Answer */}
                        {(question.questionType === 'SHORT_ANSWER' ||
                          question.questionType === 'LONG_ANSWER') && (
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {answer.textAnswer || 'No answer provided'}
                          </p>
                        )}

                        {/* File Upload Answer */}
                        {question.questionType === 'FILE_UPLOAD' && (
                          <div className="space-y-3">
                            {answer.uploadedFiles && answer.uploadedFiles.length > 0 ? (
                              <div className="grid grid-cols-2 gap-3">
                                {answer.uploadedFiles.map((fileUrl, fileIndex) => (
                                  <a
                                    key={fileIndex}
                                    href={examApiService.getExamFileUrl(
                                      fileUrl.split('/').pop() || ''
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                                  >
                                    <FileText className="w-8 h-8 text-blue-600" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        File {fileIndex + 1}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {getFileExtension(fileUrl)}
                                      </p>
                                    </div>
                                    <Eye className="w-5 h-5 text-gray-400" />
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">No files uploaded</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Grading Section */}
                      {!answer.isCorrect ||
                      question.questionType === 'FILE_UPLOAD' ||
                      question.questionType === 'SHORT_ANSWER' ||
                      question.questionType === 'LONG_ANSWER' ? (
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Marks Awarded *
                              </label>
                              <input
                                type="number"
                                value={gradeData[answer.id]?.marksAwarded ?? answer.marksAwarded ?? ''}
                                onChange={(e) =>
                                  handleGradeChange(answer.id, {
                                    marksAwarded: parseFloat(e.target.value) || 0,
                                  })
                                }
                                min="0"
                                max={question.marks}
                                step="0.5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Max: ${question.marks}`}
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                onClick={() => handleSaveGrade(answer.id)}
                                disabled={grading}
                                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <Save className="w-5 h-5" />
                                Save Grade
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Feedback (Optional)
                            </label>
                            <textarea
                              value={gradeData[answer.id]?.feedback ?? answer.feedback ?? ''}
                              onChange={(e) =>
                                handleGradeChange(answer.id, {
                                  feedback: e.target.value,
                                })
                              }
                              rows={3}
                              placeholder="Provide feedback to the student..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {answer.marksAwarded !== null && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <p className="text-sm text-green-800">
                                Graded: {answer.marksAwarded}/{question.marks} marks
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ Auto-graded: {answer.marksAwarded}/{question.marks} marks
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-100">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a student
                </h3>
                <p className="text-gray-600">
                  Choose a student from the list to start grading
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
