'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  GripVertical,
  FileUp,
  Type,
  List,
  ChevronUp,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { CreateQuestionData } from '@/src/services/exam-api.service';

interface QuestionBuilderProps {
  questions: CreateQuestionData[];
  onAddQuestion: (question: CreateQuestionData) => void;
  onUpdateQuestion: (index: number, question: CreateQuestionData) => void;
  onDeleteQuestion: (index: number) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
}

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice (MCQ)', icon: List },
  { value: 'FILE_UPLOAD', label: 'File Upload', icon: FileUp },
  { value: 'SHORT_ANSWER', label: 'Short Answer', icon: Type },
  { value: 'LONG_ANSWER', label: 'Long Answer (Essay)', icon: Type },
];

export default function QuestionBuilder({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onMoveQuestion,
}: QuestionBuilderProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateQuestionData>({
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    marks: 5,
    negativeMarks: 0,
    explanation: '',
    allowMultipleFiles: true,
    maxFiles: 5,
    acceptedFileTypes: 'image/jpeg,image/png,application/pdf',
    maxFileSizeMB: 10,
    isOptional: false,
    sectionName: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
  });

  const resetForm = () => {
    setFormData({
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      marks: 5,
      negativeMarks: 0,
      explanation: '',
      allowMultipleFiles: true,
      maxFiles: 5,
      acceptedFileTypes: 'image/jpeg,image/png,application/pdf',
      maxFileSizeMB: 10,
      isOptional: false,
      sectionName: '',
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
      ],
    });
    setShowAddForm(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!formData.questionText.trim()) {
      alert('Question text is required');
      return;
    }

    if (
      formData.questionType === 'MULTIPLE_CHOICE' &&
      (!formData.options ||
        formData.options.length < 2 ||
        !formData.options.some((opt) => opt.isCorrect))
    ) {
      alert('MCQ must have at least 2 options and one correct answer');
      return;
    }

    if (editingIndex !== null) {
      onUpdateQuestion(editingIndex, formData);
    } else {
      onAddQuestion(formData);
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    setFormData(questions[index]);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...(formData.options || []), { optionText: '', isCorrect: false }],
    });
  };

  const updateOption = (index: number, text: string, isCorrect: boolean) => {
    const updated = [...(formData.options || [])];
    updated[index] = { optionText: text, isCorrect };
    setFormData({ ...formData, options: updated });
  };

  const removeOption = (index: number) => {
    const updated = (formData.options || []).filter((_, i) => i !== index);
    setFormData({ ...formData, options: updated });
  };

  return (
    <div className="space-y-4">
      {/* Question List */}
      {questions.map((question, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gray-50 rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onMoveQuestion(index, 'up')}
                disabled={index === 0}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <GripVertical className="w-5 h-5 text-gray-400" />
              <button
                onClick={() => onMoveQuestion(index, 'down')}
                disabled={index === questions.length - 1}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      Q{index + 1}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                      {question.questionType.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      {question.marks} marks
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium whitespace-pre-wrap">
                    {question.questionText}
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDeleteQuestion(index)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Show options for MCQ */}
              {question.questionType === 'MULTIPLE_CHOICE' &&
                question.options &&
                question.options.length > 0 && (
                  <div className="space-y-2 mt-3 pl-4 border-l-2 border-gray-300">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex items-center gap-2 text-sm ${
                          option.isCorrect ? 'text-green-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.isCorrect && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                        <span>
                          {String.fromCharCode(65 + optIndex)}. {option.optionText}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              {/* Show file upload settings */}
              {question.questionType === 'FILE_UPLOAD' && (
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>• Max files: {question.maxFiles}</p>
                  <p>• Max size: {question.maxFileSizeMB}MB per file</p>
                  <p>• Allowed types: {question.acceptedFileTypes}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Add Question Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      )}

      {/* Add/Edit Question Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-2 border-blue-500 rounded-lg p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {QUESTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setFormData({ ...formData, questionType: type.value as any })
                    }
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                      formData.questionType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text (supports Nepali Unicode)
              </label>
              <textarea
                value={formData.questionText}
                onChange={(e) =>
                  setFormData({ ...formData, questionText: e.target.value })
                }
                placeholder="50 जना विद्यार्थीहरूको एक समूहमा..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Marks */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks
                </label>
                <input
                  type="number"
                  value={formData.marks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marks: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Negative Marks
                </label>
                <input
                  type="number"
                  value={formData.negativeMarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      negativeMarks: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* MCQ Options */}
            {formData.questionType === 'MULTIPLE_CHOICE' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Options (check the correct answer)
                  </label>
                  <button
                    onClick={addOption}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Option
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-6">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) =>
                          updateOption(index, e.target.value, option.isCorrect)
                        }
                        placeholder="Option text (supports Nepali)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={option.isCorrect}
                          onChange={() => {
                            const updated = (formData.options || []).map((opt, i) => ({
                              ...opt,
                              isCorrect: i === index,
                            }));
                            setFormData({ ...formData, options: updated });
                          }}
                          className="w-5 h-5 text-green-600"
                        />
                        <span className="text-sm text-gray-600">Correct</span>
                      </label>
                      {(formData.options || []).length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="p-2 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Settings */}
            {formData.questionType === 'FILE_UPLOAD' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Files
                    </label>
                    <input
                      type="number"
                      value={formData.maxFiles}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxFiles: parseInt(e.target.value) || 1,
                        })
                      }
                      min="1"
                      max="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Size (MB)
                    </label>
                    <input
                      type="number"
                      value={formData.maxFileSizeMB}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxFileSizeMB: parseInt(e.target.value) || 10,
                        })
                      }
                      min="1"
                      max="50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accepted File Types
                  </label>
                  <input
                    type="text"
                    value={formData.acceptedFileTypes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        acceptedFileTypes: e.target.value,
                      })
                    }
                    placeholder="image/jpeg,image/png,application/pdf"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated MIME types
                  </p>
                </div>
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation (Optional)
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                placeholder="Explain the correct answer..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingIndex !== null ? 'Update' : 'Add'} Question
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
