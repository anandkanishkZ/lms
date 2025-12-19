'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  Save,
  Plus,
  Trash2,
  Info,
  Calendar,
  Clock,
  Settings,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  examApiService,
  type UpdateExamData,
  type CreateQuestionData,
  type Exam,
  type ExamDetails,
} from '@/src/services/exam-api.service';
import { getAllClasses } from '@/src/services/class-api.service';
import { apiClient } from '@/src/services/api-client';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';
import QuestionBuilder from '@/src/components/exam/QuestionBuilder';

interface Subject {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
}

const EXAM_TYPES = [
  { value: 'MIDTERM', label: 'Midterm Exam' },
  { value: 'FINAL', label: 'Final Exam' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'PROJECT', label: 'Project' },
];

const STEPS = [
  { id: 1, title: 'Basic Details', icon: FileText },
  { id: 2, title: 'Scheduling', icon: Calendar },
  { id: 3, title: 'Settings', icon: Settings },
  { id: 4, title: 'Questions', icon: ClipboardCheck },
];

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [questions, setQuestions] = useState<CreateQuestionData[]>([]);
  const [originalExam, setOriginalExam] = useState<ExamDetails | null>(null);
  const [hasAttempts, setHasAttempts] = useState(false);

  const [formData, setFormData] = useState<Partial<UpdateExamData & { subjectId?: string; classId?: string; type?: string }>>({
    title: '',
    description: '',
    instructions: '',
    startTime: '',
    endTime: '',
    duration: 60,
    totalMarks: 0,
    passingMarks: 0,
    allowLateSubmission: false,
    shuffleQuestions: false,
    showResultsImmediately: false,
    allowReview: true,
    maxAttempts: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadExamData();
    loadDropdownData();
  }, [examId]);

  useEffect(() => {
    // Calculate total marks from questions
    const total = questions.reduce((sum, q) => sum + q.marks, 0);
    setFormData((prev) => ({ ...prev, totalMarks: total }));
  }, [questions]);

  const loadExamData = async () => {
    try {
      setInitialLoading(true);
      const exam = await examApiService.getExamById(examId);
      setOriginalExam(exam);
      
      // Check if exam has attempts
      const attemptCount = exam._count?.attempts || 0;
      setHasAttempts(attemptCount > 0);

      // Format dates for datetime-local input
      const formatDateTimeLocal = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Populate form data
      setFormData({
        title: exam.title,
        description: exam.description || '',
        instructions: exam.instructions || '',
        startTime: formatDateTimeLocal(exam.startTime),
        endTime: formatDateTimeLocal(exam.endTime),
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        allowLateSubmission: exam.allowLateSubmission,
        shuffleQuestions: exam.shuffleQuestions,
        showResultsImmediately: exam.showResultsImmediately,
        allowReview: exam.allowReview,
        maxAttempts: exam.maxAttempts,
        subjectId: exam.subjectId || '',
        classId: exam.classId || '',
        type: exam.type,
      });

      // Populate questions (convert from exam questions to CreateQuestionData format)
      if (exam.questions && exam.questions.length > 0) {
        const formattedQuestions: CreateQuestionData[] = exam.questions.map((eq) => {
          // Parse acceptedFileTypes if it's a string
          let fileTypes: string | undefined = undefined;
          if (eq.question.acceptedFileTypes) {
            if (typeof eq.question.acceptedFileTypes === 'string') {
              fileTypes = eq.question.acceptedFileTypes;
            }
          }

          return {
            questionText: eq.question.questionText,
            questionType: eq.question.questionType as any,
            marks: eq.question.marks,
            negativeMarks: eq.question.negativeMarks || 0,
            orderIndex: eq.orderIndex,
            options: eq.question.options?.map((opt) => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
            })) || [],
            correctAnswer: '',
            acceptedFileTypes: fileTypes,
            maxFiles: eq.question.maxFiles || 1,
            maxFileSizeMB: eq.question.maxFileSizeMB || 10,
          };
        });
        setQuestions(formattedQuestions);
      }
    } catch (error: any) {
      console.error('Error loading exam:', error);
      showErrorToast(error.message || 'Failed to load exam data');
      router.push('/teacher/exams');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      // Load subjects
      const subjectRes = await apiClient.get<{ success: boolean; data: Subject[] }>('/subjects');
      if (subjectRes.data?.success && subjectRes.data?.data) {
        setSubjects(subjectRes.data.data);
      } else {
        setSubjects([]);
      }

      // Load classes
      const classRes = await getAllClasses();
      if (classRes.success && classRes.data) {
        setClasses(classRes.data);
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      showErrorToast('Failed to load subjects and classes');
      setSubjects([]);
      setClasses([]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title?.trim()) {
        newErrors.title = 'Title is required';
      }
    }

    if (step === 2) {
      if (!formData.startTime) {
        newErrors.startTime = 'Start time is required';
      }
      if (!formData.endTime) {
        newErrors.endTime = 'End time is required';
      }
      if (formData.startTime && formData.endTime) {
        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        if (end <= start) {
          newErrors.endTime = 'End time must be after start time';
        }
      }
      if (!formData.duration || formData.duration <= 0) {
        newErrors.duration = 'Duration must be greater than 0';
      }
    }

    if (step === 3) {
      if (formData.passingMarks !== undefined && formData.passingMarks < 0) {
        newErrors.passingMarks = 'Passing marks must be 0 or greater';
      }
      if (
        formData.passingMarks &&
        formData.totalMarks &&
        formData.passingMarks > formData.totalMarks
      ) {
        newErrors.passingMarks = 'Passing marks cannot exceed total marks';
      }
      if (!formData.maxAttempts || formData.maxAttempts < 1) {
        newErrors.maxAttempts = 'Maximum attempts must be at least 1';
      }
    }

    if (step === 4) {
      if (questions.length === 0) {
        newErrors.questions = 'Add at least one question';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    // Check if exam is completed
    if (originalExam?.status === 'COMPLETED') {
      showErrorToast('Cannot edit a completed exam');
      return;
    }

    // Warn if exam is active
    if (originalExam?.status === 'ACTIVE') {
      const confirm = window.confirm(
        'This exam is currently active. Students may be taking it now. Are you sure you want to make changes?'
      );
      if (!confirm) return;
    }

    // Warn if trying to edit questions with existing attempts
    if (hasAttempts && questions.length > 0) {
      const confirm = window.confirm(
        'Warning: This exam has student attempts. Editing questions may invalidate existing answers. Continue?'
      );
      if (!confirm) return;
    }

    try {
      setLoading(true);

      // Prepare update data (only changed fields)
      // Convert datetime-local strings to ISO format to preserve timezone
      const updateData: UpdateExamData = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        duration: formData.duration,
        totalMarks: formData.totalMarks,
        passingMarks: formData.passingMarks,
        allowLateSubmission: formData.allowLateSubmission,
        shuffleQuestions: formData.shuffleQuestions,
        showResultsImmediately: formData.showResultsImmediately,
        allowReview: formData.allowReview,
        maxAttempts: formData.maxAttempts,
      };

      await examApiService.updateExam(examId, updateData);

      // Update questions if changed and no attempts exist
      if (!hasAttempts) {
        // Remove old questions
        if (originalExam?.questions) {
          for (const eq of originalExam.questions) {
            try {
              await examApiService.removeQuestion(examId, eq.question.id);
            } catch (error) {
              console.error('Error removing question:', error);
            }
          }
        }

        // Add new questions
        for (const question of questions) {
          try {
            await examApiService.addQuestionToExam(examId, question);
          } catch (error) {
            console.error('Error adding question:', error);
          }
        }
      }

      showSuccessToast('Exam updated successfully');
      router.push('/teacher/exams');
    } catch (error: any) {
      console.error('Error updating exam:', error);
      showErrorToast(error.message || 'Failed to update exam');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (question: CreateQuestionData) => {
    setQuestions([...questions, { ...question, orderIndex: questions.length }]);
  };

  const updateQuestion = (index: number, question: CreateQuestionData) => {
    const updated = [...questions];
    updated[index] = { ...question, orderIndex: index };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated.map((q, i) => ({ ...q, orderIndex: i })));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated.map((q, i) => ({ ...q, orderIndex: i })));
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Exams
          </button>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <ClipboardCheck className="w-8 h-8 text-white" />
            </div>
            Edit Exam
          </h1>
          <p className="text-gray-600 mt-1">
            Update exam details and settings
          </p>

          {/* Warning Messages */}
          {originalExam?.status === 'COMPLETED' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Cannot Edit Completed Exam</p>
                <p className="text-red-600 text-sm">This exam has been completed and cannot be modified.</p>
              </div>
            </div>
          )}

          {originalExam?.status === 'ACTIVE' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Exam is Currently Active</p>
                <p className="text-yellow-600 text-sm">Students may be taking this exam now. Changes will affect ongoing attempts.</p>
              </div>
            </div>
          )}

          {hasAttempts && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-800 font-medium">Students Have Attempted This Exam</p>
                <p className="text-orange-600 text-sm">
                  Question editing is restricted. Modifying questions may invalidate existing student answers.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mb-6"
        >
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep > step.id
                        ? 'bg-green-500 border-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium mt-2 ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-8 shadow-md border border-gray-100"
          >
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Basic Details
                  </h2>
                  <p className="text-gray-600">
                    Enter the fundamental information about the exam
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., First Terminal Examination"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the exam (supports Nepali Unicode)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.subjectId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {errors.subjectId && (
                    <p className="text-red-500 text-sm mt-1">{errors.subjectId}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Subject cannot be changed after creation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) =>
                      setFormData({ ...formData, classId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-500 text-xs mt-1">Class cannot be changed after creation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled
                  >
                    {EXAM_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Exam type cannot be changed after creation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions for Students
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter exam instructions (supports Nepali Unicode)"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Scheduling */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Scheduling
                  </h2>
                  <p className="text-gray-600">
                    Set the date, time, and duration for the exam
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.startTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.endTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="60"
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    How long students have to complete the exam
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Exam Settings
                  </h2>
                  <p className="text-gray-600">
                    Configure exam rules and scoring
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.totalMarks}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Auto-calculated from questions
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.passingMarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passingMarks: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.passingMarks ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="40"
                    />
                    {errors.passingMarks && (
                      <p className="text-red-500 text-sm mt-1">{errors.passingMarks}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Attempts <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxAttempts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxAttempts: parseInt(e.target.value) || 1,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.maxAttempts ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {errors.maxAttempts && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxAttempts}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    How many times a student can attempt this exam
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.allowLateSubmission}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowLateSubmission: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Allow Late Submission
                      </span>
                      <p className="text-xs text-gray-500">
                        Students can submit after the end time
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.shuffleQuestions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shuffleQuestions: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Shuffle Questions
                      </span>
                      <p className="text-xs text-gray-500">
                        Questions appear in random order for each student
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.showResultsImmediately}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showResultsImmediately: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Show Results Immediately
                      </span>
                      <p className="text-xs text-gray-500">
                        Students see their score right after submission
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.allowReview}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowReview: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Allow Review
                      </span>
                      <p className="text-xs text-gray-500">
                        Students can review correct answers after grading
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Questions */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Exam Questions
                  </h2>
                  <p className="text-gray-600">
                    {hasAttempts 
                      ? 'Question editing is restricted because students have attempted this exam'
                      : 'Add and manage exam questions'
                    }
                  </p>
                  {errors.questions && (
                    <p className="text-red-500 text-sm mt-2">{errors.questions}</p>
                  )}
                </div>

                {hasAttempts ? (
                  <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-orange-900 mb-2">
                          Question Editing Disabled
                        </h3>
                        <p className="text-orange-700 text-sm mb-4">
                          This exam has {originalExam?._count?.attempts || 0} student attempt(s). 
                          Editing questions would invalidate existing answers and grading.
                        </p>
                        <div className="space-y-2">
                          <p className="text-orange-800 font-medium text-sm">Current Questions:</p>
                          {questions.map((q, index) => (
                            <div key={index} className="p-3 bg-white rounded border border-orange-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {index + 1}. {q.questionText}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                      {q.questionType}
                                    </span>
                                    <span>{q.marks} marks</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <QuestionBuilder
                    questions={questions}
                    onAddQuestion={addQuestion}
                    onUpdateQuestion={updateQuestion}
                    onDeleteQuestion={deleteQuestion}
                    onMoveQuestion={moveQuestion}
                  />
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>

              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || originalExam?.status === 'COMPLETED'}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    loading || originalExam?.status === 'COMPLETED'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Exam
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
