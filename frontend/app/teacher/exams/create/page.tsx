'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  type CreateExamData,
  type CreateQuestionData,
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

export default function CreateExamPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [questions, setQuestions] = useState<CreateQuestionData[]>([]);

  const [formData, setFormData] = useState<Partial<CreateExamData>>({
    title: '',
    description: '',
    instructions: '',
    subjectId: '',
    classId: '',
    type: 'MIDTERM',
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
    loadDropdownData();
  }, []);

  useEffect(() => {
    // Calculate total marks from questions
    const total = questions.reduce((sum, q) => sum + q.marks, 0);
    setFormData((prev) => ({ ...prev, totalMarks: total }));
  }, [questions]);

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
      if (!formData.subjectId) {
        newErrors.subjectId = 'Subject is required';
      }
      if (!formData.type) {
        newErrors.type = 'Exam type is required';
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
      if (!formData.passingMarks || formData.passingMarks < 0) {
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

    try {
      setLoading(true);

      // Convert datetime-local strings to ISO format to preserve timezone
      const examData: CreateExamData = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : '',
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : '',
        questions,
      } as CreateExamData;

      await examApiService.createExam(examData);
      showSuccessToast('Exam created successfully');
      router.push('/teacher/exams');
    } catch (error: any) {
      console.error('Error creating exam:', error);
      showErrorToast(error.message || 'Failed to create exam');
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
            Create New Exam
          </h1>
          <p className="text-gray-600 mt-1">
            Follow the steps to create a comprehensive exam
          </p>
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
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
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
            className="bg-white rounded-xl p-8 shadow-md border border-gray-100 mb-6"
          >
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Basic Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Mathematics Mid-Term Exam"
                    className={`w-full px-4 py-2 border ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    placeholder="Brief description of the exam"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) =>
                        setFormData({ ...formData, subjectId: e.target.value })
                      }
                      className={`w-full px-4 py-2 border ${
                        errors.subjectId ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class (Optional)
                    </label>
                    <select
                      value={formData.classId || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, classId: e.target.value || undefined })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className={`w-full px-4 py-2 border ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions (supports Nepali Unicode)
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    placeholder="परीक्षा सुरु गर्नु अघि सबै निर्देशनहरू राम्रोसँग पढ्नुहोस्..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You can type in Nepali or English
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Scheduling */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Scheduling
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Set the exam schedule</p>
                    <p className="mt-1">
                      Students will only be able to access the exam during the
                      specified time window.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className={`w-full px-4 py-2 border ${
                        errors.startTime ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.startTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className={`w-full px-4 py-2 border ${
                        errors.endTime ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    className={`w-full px-4 py-2 border ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Students will have {formData.duration} minutes to complete the
                    exam once they start
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Exam Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={formData.totalMarks}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Auto-calculated from questions
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Marks *
                    </label>
                    <input
                      type="number"
                      value={formData.passingMarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passingMarks: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className={`w-full px-4 py-2 border ${
                        errors.passingMarks ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.passingMarks && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.passingMarks}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Attempts *
                  </label>
                  <input
                    type="number"
                    value={formData.maxAttempts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxAttempts: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                    max="5"
                    className={`w-full px-4 py-2 border ${
                      errors.maxAttempts ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.maxAttempts && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxAttempts}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowLateSubmission}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowLateSubmission: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Allow Late Submission
                      </span>
                      <p className="text-xs text-gray-500">
                        Students can submit after the end time
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shuffleQuestions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shuffleQuestions: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Shuffle Questions
                      </span>
                      <p className="text-xs text-gray-500">
                        Randomize question order for each student
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showResultsImmediately}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showResultsImmediately: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Show Results Immediately
                      </span>
                      <p className="text-xs text-gray-500">
                        Students can see results right after submission
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowReview}
                      onChange={(e) =>
                        setFormData({ ...formData, allowReview: e.target.checked })
                      }
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Allow Review
                      </span>
                      <p className="text-xs text-gray-500">
                        Students can review their answers before submitting
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Questions */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
                    <p className="text-gray-600 mt-1">
                      Add questions to your exam (supports Nepali Unicode)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Questions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {questions.length}
                    </p>
                  </div>
                </div>

                {errors.questions && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{errors.questions}</p>
                  </div>
                )}

                <QuestionBuilder
                  questions={questions}
                  onAddQuestion={addQuestion}
                  onUpdateQuestion={updateQuestion}
                  onDeleteQuestion={deleteQuestion}
                  onMoveQuestion={moveQuestion}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Exam
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
