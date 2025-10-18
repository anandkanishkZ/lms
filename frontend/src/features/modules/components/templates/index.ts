/**
 * Templates Index
 * Central export point for all page templates and widgets
 */

// Course Templates
export { 
  CourseCard, 
  CourseCardSkeleton, 
  CourseGrid,
  type CourseCardData,
  type CourseCardProps,
  type CourseGridProps,
} from './CourseCard';

export {
  CourseListTemplate,
  type CourseFilters,
  type CourseListTemplateProps,
} from './CourseListTemplate';

export {
  CourseDetailTemplate,
  CourseDetailSkeleton,
  type CourseDetailData,
  type CourseModule,
  type CourseLesson,
  type CourseReview,
  type CourseDetailTemplateProps,
} from './CourseDetailTemplate';

// Lesson Viewer
export {
  LessonViewerTemplate,
  LessonViewerSkeleton,
  type LessonContent,
  type LessonNavItem,
  type LessonNote,
  type QuizQuestion,
  type LessonViewerTemplateProps,
} from './LessonViewerTemplate';

// Dashboard Widgets
export {
  StatsCard,
  ProgressWidget,
  ActivityFeed,
  QuickActions,
  UpcomingClasses,
  PerformanceSummary,
  type StatsCardProps,
  type ProgressItem,
  type ProgressWidgetProps,
  type ActivityItem,
  type ActivityFeedProps,
  type QuickAction,
  type QuickActionsProps,
  type UpcomingClass,
  type UpcomingClassesProps,
  type PerformanceData,
  type PerformanceSummaryProps,
} from './DashboardWidgets';

// Profile
export {
  ProfilePageTemplate,
  ProfilePageSkeleton,
  type UserProfile,
  type EnrolledCourse,
  type ActivityLog,
  type ProfilePageTemplateProps,
} from './ProfilePageTemplate';
