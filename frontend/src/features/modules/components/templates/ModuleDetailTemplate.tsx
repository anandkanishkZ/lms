/**
 * Module Detail Template
 * Complete module detail page with overview, curriculum (topics & lessons), reviews, and enrollment
 * Backend Alignment: Module → Subject → Topic → Lesson hierarchy
 * Includes: Module header, tabs navigation, topic accordion, reviews, related modules
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { Avatar, UserAvatar, AvatarGroup } from '../ui/Avatar';
import { Tabs } from '../ui/Tabs';
import { Accordion } from '../ui/Accordion';
import { Modal, ConfirmModal } from '../ui/Modal';
import { cn } from '@/lib/utils';

export interface ModuleDetailData {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    totalStudents?: number;
    totalModules?: number;
    rating?: number;
  };
  duration?: number; // in minutes
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string; // Subject name
  tags?: string[];
  enrolledCount?: number;
  rating?: number;
  totalRatings?: number;
  price?: number;
  isFree?: boolean;
  isEnrolled?: boolean;
  progress?: number;
  status?: 'draft' | 'published' | 'archived';
  lastUpdated?: Date;
  createdAt?: Date;
  
  // Learning outcomes
  learningOutcomes?: string[];
  
  // Requirements
  requirements?: string[];
  
  // Topics and lessons (backend: Module → Topic → Lesson)
  topics?: ModuleTopic[];
  
  // Reviews
  reviews?: ModuleReview[];
  
  // Related modules
  relatedModules?: Array<{
    id: string;
    title: string;
    thumbnail?: string;
    instructor: string;
    rating?: number;
  }>;
}

export interface ModuleTopic {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  lessons: TopicLesson[];
  isLocked?: boolean;
}

export interface TopicLesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text' | 'quiz' | 'assignment';
  duration?: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  isFree?: boolean; // Preview lesson
}

export interface ModuleReview {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
  helpful?: number;
}

export interface ModuleDetailTemplateProps {
  module: ModuleDetailData;
  onEnroll?: () => void;
  onStartModule?: () => void;
  onLessonClick?: (topicId: string, lessonId: string) => void;
  onReviewHelpful?: (reviewId: string) => void;
  onRelatedModuleClick?: (moduleId: string) => void;
  loading?: boolean;
  enrolling?: boolean;
  className?: string;
}

/**
 * Module Detail Template - Full module detail page
 */
export const ModuleDetailTemplate: React.FC<ModuleDetailTemplateProps> = ({
  module,
  onEnroll,
  onStartModule,
  onLessonClick,
  onReviewHelpful,
  onRelatedModuleClick,
  loading = false,
  enrolling = false,
  className,
}) => {
  const [showEnrollModal, setShowEnrollModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const totalLessons = module.topics?.reduce((acc, topic) => acc + topic.lessons.length, 0) || 0;
  const totalDuration = module.topics?.reduce((acc, topic) => acc + (topic.duration || 0), 0) || 0;

  const handleEnrollClick = () => {
    if (module.isFree) {
      onEnroll?.();
    } else {
      setShowEnrollModal(true);
    }
  };

  const handleEnrollConfirm = () => {
    setShowEnrollModal(false);
    onEnroll?.();
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'quiz':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (loading) {
    return <ModuleDetailSkeleton />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Module Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-lg p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Module Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <span>Modules</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>{module.category || 'General'}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">{module.title}</h1>
            <p className="text-lg text-blue-100">{module.description}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {module.rating && (
                <div className="flex items-center gap-1">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">{module.rating.toFixed(1)}</span>
                  <span className="text-blue-100">({module.totalRatings?.toLocaleString()} ratings)</span>
                </div>
              )}
              {module.enrolledCount !== undefined && (
                <span>{module.enrolledCount.toLocaleString()} students</span>
              )}
              {module.level && (
                <Badge color="blue">
                  {module.level}
                </Badge>
              )}
              {module.lastUpdated && (
                <span>Updated {new Date(module.lastUpdated).toLocaleDateString()}</span>
              )}
            </div>

            {/* Instructor */}
            <UserAvatar
              src={module.instructor.avatar}
              name={module.instructor.name}
              subtitle={`${module.instructor.totalModules || 0} modules • ${module.instructor.totalStudents?.toLocaleString() || 0} students`}
              size="md"
              showName
            />

            {/* Tags */}
            {module.tags && module.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {module.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              {module.thumbnail && (
                <img
                  src={module.thumbnail}
                  alt={module.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-6 space-y-4">
                {module.isEnrolled ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Your Progress</span>
                        <span>{module.progress || 0}%</span>
                      </div>
                      <Progress value={module.progress || 0} />
                    </div>
                    <Button fullWidth size="lg" onClick={onStartModule}>
                      {module.progress && module.progress > 0 ? 'Continue Learning' : 'Start Module'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      {module.isFree ? (
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">Free</div>
                      ) : (
                        <div className="text-3xl font-bold">${module.price}</div>
                      )}
                    </div>
                    <Button
                      fullWidth
                      size="lg"
                      onClick={handleEnrollClick}
                      isLoading={enrolling}
                    >
                      {module.isFree ? 'Enroll for Free' : 'Enroll Now'}
                    </Button>
                  </>
                )}

                {/* Module Stats */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDuration(totalDuration)} total</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Access on mobile and desktop</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Module Content Tabs */}
      <Tabs
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-6">
                {/* What you'll learn */}
                {module.learningOutcomes && module.learningOutcomes.length > 0 && (
                  <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      What you'll learn
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {module.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Requirements */}
                {module.requirements && module.requirements.length > 0 && (
                  <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Requirements
                    </h2>
                    <ul className="space-y-2">
                      {module.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-gray-400">•</span>
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Instructor Info */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    About the instructor
                  </h2>
                  <div className="space-y-4">
                    <UserAvatar
                      src={module.instructor.avatar}
                      name={module.instructor.name}
                      subtitle={`${module.instructor.totalModules || 0} modules • ${module.instructor.totalStudents?.toLocaleString() || 0} students`}
                      size="lg"
                      showName
                    />
                    {module.instructor.bio && (
                      <p className="text-gray-700 dark:text-gray-300">{module.instructor.bio}</p>
                    )}
                  </div>
                </Card>
              </div>
            ),
          },
          {
            value: 'curriculum',
            label: 'Curriculum',
            content: module.topics && module.topics.length > 0 ? (
              <Card>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Module Content
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {module.topics.length} topics • {totalLessons} lessons • {formatDuration(totalDuration)}
                  </p>
                </div>
                <Accordion
                  items={module.topics.map((topic) => ({
                    id: topic.id,
                    title: `${topic.title} ${topic.duration ? `(${formatDuration(topic.duration)})` : ''}`,
                    content: (
                      <div className="space-y-2">
                        {topic.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => !lesson.isLocked && onLessonClick?.(topic.id, lesson.id)}
                            disabled={lesson.isLocked}
                            className={cn(
                              'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                              lesson.isLocked
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {lesson.isCompleted ? (
                                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <div className="text-gray-400">{getLessonIcon(lesson.type)}</div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{lesson.title}</span>
                                  {lesson.isFree && (
                                    <Badge size="sm" color="green">Preview</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {lesson.duration && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDuration(lesson.duration)}
                                </span>
                              )}
                              {lesson.isLocked && (
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ),
                  }))}
                  variant="bordered"
                />
              </Card>
            ) : null,
          },
          {
            value: 'reviews',
            label: `Reviews ${module.totalRatings ? `(${module.totalRatings})` : ''}`,
            content: (
              <div className="space-y-6">
                {/* Rating Summary */}
                <Card>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 dark:text-white">
                        {module.rating?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={cn(
                              'h-5 w-5',
                              i < Math.floor(module.rating || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {module.totalRatings?.toLocaleString()} ratings
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Reviews List */}
                {module.reviews && module.reviews.length > 0 && (
                  <div className="space-y-4">
                    {module.reviews.map((review) => (
                      <Card key={review.id}>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <UserAvatar
                              src={review.user.avatar}
                              name={review.user.name}
                              subtitle={new Date(review.createdAt).toLocaleDateString()}
                              size="sm"
                              showName
                            />
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={cn(
                                    'h-4 w-4',
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                  )}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                          {review.helpful !== undefined && (
                            <button
                              onClick={() => onReviewHelpful?.(review.id)}
                              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                              Helpful ({review.helpful})
                            </button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
        value={activeTab}
        onChange={setActiveTab}
        variant="default"
      />

      {/* Enroll Modal */}
      <ConfirmModal
        open={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onConfirm={handleEnrollConfirm}
        title="Enroll in Module"
        message={`Enroll in "${module.title}" for $${module.price}?`}
        confirmText="Enroll Now"
        loading={enrolling}
      />
    </div>
  );
};

/**
 * Module Detail Skeleton (Loading state)
 */
export const ModuleDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
};
