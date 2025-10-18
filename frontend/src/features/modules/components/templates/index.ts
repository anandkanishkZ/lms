/**
 * Templates Index
 * Central export point for all page templates and widgets
 */

// Module Templates (NEW - Primary exports)
export {
  ModuleCard,
  ModuleCardSkeleton,
  ModuleGrid,
  type ModuleCardData,
  type ModuleCardProps,
  type ModuleGridProps,
} from './ModuleCard';

export {
  ModuleListTemplate,
  type ModuleFilters,
  type ModuleListTemplateProps,
} from './ModuleListTemplate';

export {
  ModuleDetailTemplate,
  ModuleDetailSkeleton,
  type ModuleDetailData,
  type ModuleTopic,
  type TopicLesson,
  type ModuleReview,
  type ModuleDetailTemplateProps,
} from './ModuleDetailTemplate';

// Course Templates (DEPRECATED - Use Module* instead, keeping for backward compatibility)
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
} from './CourseListTemplate';export {
  CourseDetailTemplate,
  CourseDetailSkeleton,
  type CourseDetailData,
  type CourseModule as CourseModuleLegacy,
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
  type EnrolledModule,
  type ActivityLog,
  type ProfilePageTemplateProps,
} from './ProfilePageTemplate';
