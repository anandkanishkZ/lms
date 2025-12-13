import { apiClient } from './api-client';
import { API_CONFIG } from '@/src/config/api.config';

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  subjectId: string;
  classId: string | null;
  batchId: string | null;
  type: 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  allowLateSubmission: boolean;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
  };
  batch?: {
    id: string;
    name: string;
  };
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface Question {
  id: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'FILE_UPLOAD' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  marks: number;
  negativeMarks: number;
  explanation: string | null;
  allowMultipleFiles: boolean;
  maxFiles: number;
  acceptedFileTypes: string | null;
  maxFileSizeMB: number;
  isOptional: boolean;
  sectionName: string | null;
  createdAt: string;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  questionId: string;
  orderIndex: number;
  marks: number;
  question: Question;
}

export interface ExamDetails extends Exam {
  questions: ExamQuestion[];
  studentAttempt?: StudentExamAttempt | null;
}

export interface StudentExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string | null;
  isCompleted: boolean;
  isLate: boolean;
  timeSpentSeconds: number;
  totalScore: number | null;
  maxScore: number;
  percentage: number | null;
  grade: string | null;
  isPassed: boolean | null;
  isGraded: boolean;
  gradedAt: string | null;
  gradedById: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  student?: {
    id: string;
    name: string;
    email: string;
    symbolNo: string | null;
  };
  exam?: Exam;
  answers?: StudentAnswer[];
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
  textAnswer: string | null;
  uploadedFiles: string[];
  isCorrect: boolean | null;
  marksAwarded: number | null;
  feedback: string | null;
  answeredAt: string;
  question?: Question;
  selectedOption?: QuestionOption;
}

export interface CreateExamData {
  title: string;
  description?: string;
  instructions?: string;
  subjectId: string;
  classId?: string;
  batchId?: string;
  type: 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT';
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  allowLateSubmission?: boolean;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  allowReview?: boolean;
  maxAttempts?: number;
  questions?: CreateQuestionData[];
}

export interface CreateQuestionData {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'FILE_UPLOAD' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  marks: number;
  negativeMarks?: number;
  explanation?: string;
  allowMultipleFiles?: boolean;
  maxFiles?: number;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  isOptional?: boolean;
  sectionName?: string;
  orderIndex?: number;
  options?: {
    optionText: string;
    isCorrect: boolean;
  }[];
}

export interface UpdateExamData {
  title?: string;
  description?: string;
  instructions?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  allowLateSubmission?: boolean;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  allowReview?: boolean;
  maxAttempts?: number;
}

export interface ExamFilters {
  subjectId?: string;
  classId?: string;
  batchId?: string;
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  type?: 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT';
}

export interface SubmitAnswerData {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  uploadedFiles?: string[];
}

export interface GradeAnswerData {
  marksAwarded: number;
  feedback?: string;
  isCorrect?: boolean;
}

export interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface ExamPreview {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  type: 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT';
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  allowLateSubmission: boolean;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  maxAttempts: number;
  subject?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
  };
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  questionCount: number;
  questionTypes: Record<string, number>;
  attemptCount: number;
  canAttempt: boolean;
}

class ExamApiService {
  private readonly BASE_URL = '/exams';

  /**
   * Create a new exam
   */
  async createExam(data: CreateExamData): Promise<Exam> {
    const response = await apiClient.post<{ success: boolean; data: Exam }>(this.BASE_URL, data);
    return response.data?.data as Exam;
  }

  /**
   * Get all exams with optional filters
   */
  async getAllExams(filters?: ExamFilters): Promise<Exam[]> {
    const params = new URLSearchParams();
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.batchId) params.append('batchId', filters.batchId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    const url = params.toString() ? `${this.BASE_URL}?${params.toString()}` : this.BASE_URL;
    const response = await apiClient.get<{ success: boolean; data: Exam[] }>(url);
    return response.data?.data || [];
  }

  /**
   * Get exam preview (student-safe, no answers)
   */
  async getExamPreview(examId: string): Promise<ExamPreview> {
    const response = await apiClient.get<{ success: boolean; data: ExamPreview }>(
      `${this.BASE_URL}/${examId}/preview`
    );
    return response.data?.data as ExamPreview;
  }

  /**
   * Get exam by ID with full details
   */
  async getExamById(examId: string): Promise<ExamDetails> {
    const response = await apiClient.get<{ success: boolean; data: ExamDetails }>(`${this.BASE_URL}/${examId}`);
    return response.data?.data as ExamDetails;
  }

  /**
   * Update exam details
   */
  async updateExam(examId: string, data: UpdateExamData): Promise<Exam> {
    const response = await apiClient.put<{ success: boolean; data: Exam }>(`${this.BASE_URL}/${examId}`, data);
    return response.data?.data as Exam;
  }

  /**
   * Delete an exam
   */
  async deleteExam(examId: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${examId}`);
  }

  /**
   * Add a question to an exam
   */
  async addQuestionToExam(examId: string, question: CreateQuestionData): Promise<ExamQuestion> {
    const response = await apiClient.post<{ success: boolean; data: ExamQuestion }>(
      `${this.BASE_URL}/${examId}/questions`,
      question
    );
    return response.data?.data as ExamQuestion;
  }

  /**
   * Update a question in an exam
   */
  async updateQuestion(
    examId: string,
    questionId: string,
    data: Partial<CreateQuestionData>
  ): Promise<ExamQuestion> {
    const response = await apiClient.put<{ success: boolean; data: ExamQuestion }>(
      `${this.BASE_URL}/${examId}/questions/${questionId}`,
      data
    );
    return response.data?.data as ExamQuestion;
  }

  /**
   * Remove a question from an exam
   */
  async removeQuestion(examId: string, questionId: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${examId}/questions/${questionId}`);
  }

  /**
   * Start an exam attempt (Student)
   */
  async startExamAttempt(examId: string): Promise<{
    attempt: StudentExamAttempt;
    exam: ExamDetails;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        attempt: StudentExamAttempt;
        exam: ExamDetails;
      };
    }>(`${this.BASE_URL}/${examId}/start`, {
      ipAddress: '',
      userAgent: navigator.userAgent,
      deviceInfo: navigator.platform,
    });
    return response.data?.data as { attempt: StudentExamAttempt; exam: ExamDetails };
  }

  /**
   * Submit an answer (Student)
   */
  async submitAnswer(
    examId: string,
    attemptId: string,
    answer: SubmitAnswerData
  ): Promise<StudentAnswer> {
    const response = await apiClient.post<{ success: boolean; data: StudentAnswer }>(
      `${this.BASE_URL}/${examId}/attempts/${attemptId}/answer`,
      answer
    );
    return response.data?.data as StudentAnswer;
  }

  /**
   * Submit exam attempt (Student)
   */
  async submitExamAttempt(examId: string, attemptId: string): Promise<StudentExamAttempt> {
    const response = await apiClient.post<{ success: boolean; data: StudentExamAttempt }>(
      `${this.BASE_URL}/${examId}/attempts/${attemptId}/submit`
    );
    return response.data?.data as StudentExamAttempt;
  }

  /**
   * Get student's exam result
   */
  async getMyExamResult(examId: string): Promise<StudentExamAttempt> {
    const response = await apiClient.get<{ success: boolean; data: StudentExamAttempt }>(
      `${this.BASE_URL}/${examId}/my-result`
    );
    return response.data?.data as StudentExamAttempt;
  }

  /**
   * Get all attempts for an exam (Teacher/Admin)
   */
  async getExamAttempts(examId: string): Promise<StudentExamAttempt[]> {
    const response = await apiClient.get<{ success: boolean; data: StudentExamAttempt[] }>(
      `${this.BASE_URL}/${examId}/attempts`
    );
    return response.data?.data || [];
  }

  /**
   * Grade an answer (Teacher/Admin)
   */
  async gradeAnswer(answerId: string, gradeData: GradeAnswerData): Promise<StudentAnswer> {
    const response = await apiClient.put<{ success: boolean; data: StudentAnswer }>(
      `${this.BASE_URL}/answers/${answerId}/grade`,
      gradeData
    );
    return response.data?.data as StudentAnswer;
  }

  /**
   * Upload exam answer files
   */
  async uploadAnswerFiles(files: File[]): Promise<UploadedFile[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post<{ success: boolean; data: UploadedFile[] }>(
      '/upload/exam-answer',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data?.data || [];
  }

  /**
   * Get exam file URL
   */
  getExamFileUrl(filename: string): string {
    return `${API_CONFIG.baseURL}/upload/exam-files/${filename}`;
  }

  /**
   * Format exam status for display
   */
  getExamStatusBadge(exam: Exam): { label: string; color: string } {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (exam.status === 'CANCELLED') {
      return { label: 'Cancelled', color: 'red' };
    }

    if (now < startTime) {
      return { label: 'Upcoming', color: 'blue' };
    }

    if (now >= startTime && now <= endTime) {
      return { label: 'Active', color: 'green' };
    }

    return { label: 'Completed', color: 'gray' };
  }

  /**
   * Calculate time remaining for exam
   */
  getTimeRemaining(endTime: string): string {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  /**
   * Calculate grade from percentage
   */
  calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  }
}

export const examApiService = new ExamApiService();
