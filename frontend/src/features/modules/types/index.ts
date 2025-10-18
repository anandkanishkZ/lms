/**
 * Module System Type Definitions
 * Mirrors backend Prisma schema for consistency
 */

// ==================== ENUMS ====================

export enum LessonType {
  VIDEO = 'VIDEO',
  YOUTUBE_LIVE = 'YOUTUBE_LIVE',
  PDF = 'PDF',
  TEXT = 'TEXT',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

export enum ModuleStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ActivityType {
  MODULE_ENROLLED = 'MODULE_ENROLLED',
  LESSON_STARTED = 'LESSON_STARTED',
  LESSON_COMPLETED = 'LESSON_COMPLETED',
  TOPIC_COMPLETED = 'TOPIC_COMPLETED',
  MODULE_COMPLETED = 'MODULE_COMPLETED',
  QUIZ_SUBMITTED = 'QUIZ_SUBMITTED',
  ASSIGNMENT_SUBMITTED = 'ASSIGNMENT_SUBMITTED',
  YOUTUBE_LIVE_JOINED = 'YOUTUBE_LIVE_JOINED',
}

// ==================== MODULE ====================

export interface Module {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  teacherId: string;
  subjectId: string;
  classId: string;
  duration: number | null; // in minutes
  level: string | null; // 'Beginner', 'Intermediate', 'Advanced'
  status: ModuleStatus;
  isFeatured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations (populated on demand)
  teacher?: {
    id: string;
    name: string;
    email: string | null;
    profileImage: string | null;
  };
  subject?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
    section: string | null;
  };
  topics?: Topic[];
  enrollments?: ModuleEnrollment[];
  reviews?: ModuleReview[];
  _count?: {
    topics?: number;
    enrollments?: number;
    reviews?: number;
  };
}

export interface CreateModuleData {
  title: string;
  description: string;
  thumbnail?: string | null;
  teacherId: string;
  subjectId: string;
  classId: string;
  duration?: number | null;
  level?: string | null;
  isFeatured?: boolean;
}

export interface UpdateModuleData {
  title?: string;
  description?: string;
  thumbnail?: string | null;
  subjectId?: string;
  classId?: string;
  duration?: number | null;
  level?: string | null;
  isFeatured?: boolean;
}

export interface ModuleFilters {
  status?: ModuleStatus;
  teacherId?: string;
  subjectId?: string;
  classId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ModuleListResponse {
  modules: Module[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== TOPIC ====================

export interface Topic {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  module?: Module;
  lessons?: Lesson[];
  _count?: {
    lessons?: number;
  };
}

export interface CreateTopicData {
  moduleId: string;
  title: string;
  description?: string | null;
  order?: number;
}

export interface UpdateTopicData {
  title?: string;
  description?: string | null;
  order?: number;
}

// ==================== LESSON ====================

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  description: string | null;
  type: LessonType;
  content: any; // JSON field - different structure per lesson type
  duration: number | null; // in minutes
  order: number;
  isPreview: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  topic?: Topic;
  attachments?: LessonAttachment[];
  progress?: LessonProgress[];
  _count?: {
    attachments?: number;
    views?: number;
  };
}

export interface LessonAttachment {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: Date;
}

export interface CreateLessonData {
  topicId: string;
  title: string;
  description?: string | null;
  type: LessonType;
  content: any;
  duration?: number | null;
  order?: number;
  isPreview?: boolean;
}

export interface UpdateLessonData {
  title?: string;
  description?: string | null;
  type?: LessonType;
  content?: any;
  duration?: number | null;
  order?: number;
  isPreview?: boolean;
}

export interface LessonSearchFilters {
  query?: string;
  type?: LessonType;
  topicId?: string;
  moduleId?: string;
}

// ==================== LESSON CONTENT TYPES ====================

export interface VideoLessonContent {
  videoUrl: string;
  videoProvider?: 'youtube' | 'vimeo' | 'custom';
  thumbnail?: string;
  transcriptUrl?: string;
}

export interface YoutubeLiveLessonContent {
  liveSessionId: string;
  scheduledAt?: Date;
  description?: string;
}

export interface PdfLessonContent {
  pdfUrl: string;
  pageCount?: number;
}

export interface TextLessonContent {
  content: string; // HTML or Markdown
  readingTime?: number; // in minutes
}

export interface QuizLessonContent {
  questions: QuizQuestion[];
  passingScore: number; // percentage
  timeLimit?: number; // in minutes
  allowMultipleAttempts: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface AssignmentLessonContent {
  instructions: string;
  dueDate?: Date;
  maxScore: number;
  submissionType: 'file' | 'text' | 'link';
  allowLateSubmission: boolean;
}

export interface ExternalLinkLessonContent {
  url: string;
  openInNewTab: boolean;
  description?: string;
}

// ==================== ENROLLMENT ====================

export interface ModuleEnrollment {
  id: string;
  studentId: string;
  moduleId: string;
  enrolledBy: string;
  enrolledAt: Date;
  completedAt: Date | null;
  isActive: boolean;

  // Relations
  student?: {
    id: string;
    name: string;
    email: string | null;
    symbolNo: string | null;
  };
  module?: Module;
  enrolledByUser?: {
    id: string;
    name: string;
  };
}

export interface CreateEnrollmentData {
  studentId: string;
  moduleId: string;
  enrolledBy: string;
}

export interface BulkEnrollmentData {
  studentIds: string[];
  moduleId: string;
  enrolledBy: string;
}

export interface ClassEnrollmentData {
  classId: string;
  moduleId: string;
  enrolledBy: string;
}

export interface EnrollmentFilters {
  moduleId?: string;
  studentId?: string;
  isActive?: boolean;
  completed?: boolean;
  page?: number;
  limit?: number;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number; // percentage
  averageProgress: number; // percentage
}

// ==================== PROGRESS ====================

export interface TopicProgress {
  id: string;
  studentId: string;
  topicId: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  startedAt: Date;
  completedAt: Date | null;

  // Relations
  student?: {
    id: string;
    name: string;
  };
  topic?: Topic;
}

export interface LessonProgress {
  id: string;
  studentId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt: Date | null;
  completedAt: Date | null;
  timeSpent: number; // in seconds
  lastPosition: number | null; // for video lessons
  quizScore: number | null; // for quiz lessons
  quizAttempts: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  student?: {
    id: string;
    name: string;
  };
  lesson?: Lesson;
}

export interface UpdateProgressData {
  status?: 'in_progress' | 'completed';
  lastPosition?: number;
  quizScore?: number;
  timeSpent?: number;
}

export interface ModuleProgress {
  moduleId: string;
  studentId: string;
  totalTopics: number;
  completedTopics: number;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  lastAccessedAt: Date;
  topics: TopicProgress[];
}

// ==================== ACTIVITY HISTORY ====================

export interface ActivityHistory {
  id: string;
  userId: string;
  activityType: ActivityType;
  moduleId: string | null;
  topicId: string | null;
  lessonId: string | null;
  title: string;
  description: string | null;
  metadata: any; // JSON
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;

  // Relations
  user?: {
    id: string;
    name: string;
  };
  module?: Module;
  topic?: Topic;
  lesson?: Lesson;
}

export interface ActivityFilters {
  userId?: string;
  activityType?: ActivityType;
  moduleId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface ActivityTimelineItem {
  date: Date;
  activities: ActivityHistory[];
}

// ==================== YOUTUBE LIVE ====================

export interface YoutubeLiveSession {
  id: string;
  moduleId: string;
  lessonId: string | null;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  youtubeChannelId: string | null;
  scheduledAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
  status: 'scheduled' | 'live' | 'ended';
  maxViewers: number;
  totalViews: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  module?: Module;
  lesson?: Lesson;
  creator?: {
    id: string;
    name: string;
  };
}

export interface CreateYoutubeLiveData {
  moduleId: string;
  lessonId?: string | null;
  title: string;
  description?: string | null;
  youtubeVideoId: string;
  youtubeChannelId?: string | null;
  scheduledAt: Date;
  createdBy: string;
}

export interface UpdateYoutubeLiveData {
  title?: string;
  description?: string | null;
  youtubeVideoId?: string;
  scheduledAt?: Date;
}

export interface YoutubeLiveFilters {
  moduleId?: string;
  status?: 'scheduled' | 'live' | 'ended';
  upcoming?: boolean;
  past?: boolean;
}

export interface YoutubeLiveStats {
  totalSessions: number;
  liveSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  totalViews: number;
  averageViewers: number;
}

// ==================== MODULE REVIEW ====================

export interface ModuleReview {
  id: string;
  moduleId: string;
  studentId: string;
  rating: number; // 1-5
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  module?: Module;
  student?: {
    id: string;
    name: string;
  };
}

export interface CreateReviewData {
  moduleId: string;
  studentId: string;
  rating: number;
  comment?: string | null;
}

// ==================== LESSON NOTES ====================

export interface LessonNote {
  id: string;
  lessonId: string;
  studentId: string;
  content: string;
  timestamp: number | null; // for video lessons
  createdAt: Date;
  updatedAt: Date;

  // Relations
  lesson?: Lesson;
  student?: {
    id: string;
    name: string;
  };
}

export interface CreateLessonNoteData {
  lessonId: string;
  studentId: string;
  content: string;
  timestamp?: number | null;
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== FORM TYPES ====================

export interface ModuleFormData extends CreateModuleData {
  topics?: TopicFormData[];
}

export interface TopicFormData extends CreateTopicData {
  lessons?: LessonFormData[];
}

export interface LessonFormData extends CreateLessonData {
  attachments?: File[];
}
