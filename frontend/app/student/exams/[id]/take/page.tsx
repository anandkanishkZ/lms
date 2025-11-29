'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  FileText,
  AlertCircle,
  Check,
  Save,
  Send,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import {
  examApiService,
  type ExamDetails,
  type StudentExamAttempt,
  type StudentAnswer,
  type SubmitAnswerData,
} from '@/src/services/exam-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

interface AnswerState {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  uploadedFiles?: string[];
}

export default function TakeExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [attempt, setAttempt] = useState<StudentExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startExam();
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (attempt && exam) {
      // Calculate time remaining
      const startTime = new Date(attempt.startedAt).getTime();
      const duration = exam.duration * 60 * 1000;
      const endTime = startTime + duration;
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);

      setTimeRemaining(Math.floor(remaining / 1000));

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start auto-save timer (every 30 seconds)
      autoSaveTimerRef.current = setInterval(() => {
        autoSaveAnswers();
      }, 30000);
    }
  }, [attempt, exam]);

  const startExam = async () => {
    try {
      setLoading(true);
      const examData = await examApiService.getExamById(examId);

      // Check if already has an attempt
      if (examData.studentAttempt && !examData.studentAttempt.isCompleted) {
        setExam(examData);
        setAttempt(examData.studentAttempt);
        // Load existing answers
        if (examData.studentAttempt.answers) {
          const existingAnswers: Record<string, AnswerState> = {};
          examData.studentAttempt.answers.forEach((answer) => {
            existingAnswers[answer.questionId] = {
              questionId: answer.questionId,
              selectedOptionId: answer.selectedOptionId || undefined,
              textAnswer: answer.textAnswer || undefined,
              uploadedFiles: answer.uploadedFiles || undefined,
            };
          });
          setAnswers(existingAnswers);
        }
      } else {
        // Start new attempt
        const response = await examApiService.startExamAttempt(examId);
        
        // Validate response structure
        if (!response || !response.attempt || !response.exam) {
          console.error('Invalid response from startExamAttempt:', response);
          throw new Error('Invalid response from server. Please try again.');
        }

        setExam(response.exam);
        setAttempt(response.attempt);
      }
    } catch (error: any) {
      console.error('Error starting exam:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Extract error message from response
      let errorMessage = 'Failed to start exam';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showErrorToast(errorMessage);
      router.push('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const autoSaveAnswers = async () => {
    if (!attempt || autoSaving) return;

    try {
      setAutoSaving(true);
      const currentAnswer = answers[currentQuestion?.question.id || ''];
      if (currentAnswer) {
        await saveAnswer(currentAnswer);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const saveAnswer = async (answerData: AnswerState) => {
    if (!attempt || !exam) return;

    try {
      const submitData: SubmitAnswerData = {
        questionId: answerData.questionId,
        selectedOptionId: answerData.selectedOptionId,
        textAnswer: answerData.textAnswer,
        uploadedFiles: answerData.uploadedFiles,
      };

      await examApiService.submitAnswer(exam.id, attempt.id, submitData);
    } catch (error: any) {
      console.error('Error saving answer:', error);
      throw error;
    }
  };

  const handleAnswerChange = (answerData: Partial<AnswerState>) => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.question.id;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        ...answerData,
      },
    }));
  };

  const handleFileUpload = async (files: FileList) => {
    if (!currentQuestion || uploadingFiles) return;

    const maxFiles = currentQuestion.question.maxFiles || 5;
    const currentFiles = answers[currentQuestion.question.id]?.uploadedFiles || [];

    if (currentFiles.length + files.length > maxFiles) {
      showErrorToast(`You can upload maximum ${maxFiles} files`);
      return;
    }

    try {
      setUploadingFiles(true);
      const fileArray = Array.from(files);
      const uploadedFileData = await examApiService.uploadAnswerFiles(fileArray);

      const newFiles = uploadedFileData.map((f) => f.url);
      handleAnswerChange({
        uploadedFiles: [...currentFiles, ...newFiles],
      });

      showSuccessToast(`${fileArray.length} file(s) uploaded successfully`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      showErrorToast(error.message || 'Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (fileUrl: string) => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.question.id;
    const currentFiles = answers[questionId]?.uploadedFiles || [];
    handleAnswerChange({
      uploadedFiles: currentFiles.filter((f) => f !== fileUrl),
    });
  };

  const handleAutoSubmit = async () => {
    showErrorToast('Time is up! Auto-submitting your exam...');
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!attempt || !exam || submitting) return;

    try {
      setSubmitting(true);

      // Save current answer before submitting
      const currentAnswer = answers[currentQuestion?.question.id || ''];
      if (currentAnswer) {
        await saveAnswer(currentAnswer);
      }

      // Submit exam
      await examApiService.submitExamAttempt(exam.id, attempt.id);

      // Close submit confirmation modal
      setShowSubmitModal(false);
      
      // Show success modal
      setShowSuccessModal(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/student/exams');
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      showErrorToast(error.message || 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const navigateQuestion = async (direction: 'next' | 'prev') => {
    // Save current answer before navigating
    if (currentQuestion) {
      const currentAnswer = answers[currentQuestion.question.id];
      if (currentAnswer) {
        try {
          await saveAnswer(currentAnswer);
        } catch (error) {
          // Continue navigation even if save fails
        }
      }
    }

    if (direction === 'next' && currentQuestionIndex < (exam?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnswerStatus = (questionId: string): 'answered' | 'partial' | 'unanswered' => {
    const answer = answers[questionId];
    if (!answer) return 'unanswered';

    if (answer.selectedOptionId || answer.textAnswer || (answer.uploadedFiles && answer.uploadedFiles.length > 0)) {
      return 'answered';
    }

    return 'unanswered';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam || !attempt) {
    return null;
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.question.id];
  const answeredCount = Object.keys(answers).filter((qId) => getAnswerStatus(qId) === 'answered').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Auto-save indicator */}
              {autoSaving && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              )}

              {/* Timer */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
                  timeRemaining < 300
                    ? 'bg-red-100 text-red-700'
                    : timeRemaining < 600
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                <Clock className="w-5 h-5" />
                {formatTime(timeRemaining)}
              </div>

              {/* Submit button */}
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Question Area */}
          <div className="col-span-12 lg:col-span-8">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-xl p-8 shadow-md border border-gray-100"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded">
                      {currentQuestion.marks} marks
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded">
                      {currentQuestion.question.questionType.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {currentQuestion.question.questionText}
                  </p>
                </div>
              </div>

              {/* Answer Area */}
              <div className="space-y-6">
                {/* MCQ Options */}
                {currentQuestion.question.questionType === 'MULTIPLE_CHOICE' &&
                  currentQuestion.question.options && (
                    <div className="space-y-3">
                      {currentQuestion.question.options
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((option, index) => (
                          <label
                            key={option.id}
                            className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              currentAnswer?.selectedOptionId === option.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestion.question.id}`}
                              value={option.id}
                              checked={currentAnswer?.selectedOptionId === option.id}
                              onChange={() =>
                                handleAnswerChange({ selectedOptionId: option.id })
                              }
                              className="w-5 h-5 text-blue-600 mt-0.5"
                            />
                            <div className="flex-1">
                              <span className="text-gray-900 font-medium mr-2">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <span className="text-gray-900">{option.optionText}</span>
                            </div>
                          </label>
                        ))}
                    </div>
                  )}

                {/* Text Answer */}
                {(currentQuestion.question.questionType === 'SHORT_ANSWER' ||
                  currentQuestion.question.questionType === 'LONG_ANSWER') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer (supports Nepali Unicode)
                    </label>
                    <textarea
                      value={currentAnswer?.textAnswer || ''}
                      onChange={(e) => handleAnswerChange({ textAnswer: e.target.value })}
                      placeholder="Type your answer here..."
                      rows={currentQuestion.question.questionType === 'LONG_ANSWER' ? 10 : 4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* File Upload */}
                {currentQuestion.question.questionType === 'FILE_UPLOAD' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept={currentQuestion.question.acceptedFileTypes || 'image/*,application/pdf'}
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                        disabled={uploadingFiles}
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-700 font-medium mb-1">
                          {uploadingFiles ? 'Uploading...' : 'Click to upload files'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Max {currentQuestion.question.maxFiles} files, {currentQuestion.question.maxFileSizeMB}MB each
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {currentQuestion.question.acceptedFileTypes}
                        </p>
                      </label>
                    </div>

                    {/* Uploaded Files */}
                    {currentAnswer?.uploadedFiles && currentAnswer.uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Uploaded Files ({currentAnswer.uploadedFiles.length}/{currentQuestion.question.maxFiles})
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {currentAnswer.uploadedFiles.map((fileUrl, index) => (
                            <div
                              key={index}
                              className="relative group bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                            >
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate">
                                  File {index + 1}
                                </p>
                                <p className="text-xs text-gray-500">Uploaded</p>
                              </div>
                              <button
                                onClick={() => removeFile(fileUrl)}
                                className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => navigateQuestion('prev')}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="text-sm text-gray-600">
                  {answeredCount} of {exam.questions.length} answered
                </div>

                <button
                  onClick={() => navigateQuestion('next')}
                  disabled={currentQuestionIndex === exam.questions.length - 1}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Question Navigator</h3>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {exam.questions.map((q, index) => {
                  const status = getAnswerStatus(q.question.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded-lg font-medium text-sm transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : status === 'answered'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-300"></div>
                  <span className="text-gray-600">Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-100 border-2 border-gray-300"></div>
                  <span className="text-gray-600">Not Answered ({exam.questions.length - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 border-2 border-blue-300"></div>
                  <span className="text-gray-600">Current</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <AlertCircle className="w-5 h-5 mb-2" />
                  <p className="font-medium mb-1">Auto-save enabled</p>
                  <p className="text-xs text-blue-600">
                    Your answers are automatically saved every 30 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Submit Exam?</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-bold text-gray-900">{exam.questions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-bold text-green-700">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-600">Not Answered:</span>
                  <span className="font-bold text-red-700">{exam.questions.length - answeredCount}</span>
                </div>
              </div>

              {answeredCount < exam.questions.length && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    You have {exam.questions.length - answeredCount} unanswered question(s). Are you sure you want to submit?
                  </p>
                </div>
              )}

              <p className="text-gray-600 mb-6">
                Once submitted, you cannot change your answers. Make sure you've reviewed all questions.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Review Again
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
            >
              {/* Celebration Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 opacity-50"></div>
              
              <div className="relative z-10">
                {/* Success Icon with Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-6"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
                  </div>
                </motion.div>

                {/* Success Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Exam Submitted Successfully! 🎉
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your answers have been recorded. Your teacher will review and grade your exam soon.
                  </p>

                  {/* Exam Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{exam?.title}</h3>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {exam?.questions.length} Questions
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-green-600" />
                        {answeredCount} Answered
                      </span>
                    </div>
                  </div>

                  {/* Redirect Message */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-center gap-2 text-sm text-gray-500"
                  >
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Redirecting to exam list...</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
