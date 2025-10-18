/**
 * Lesson Viewer Template
 * Complete lesson viewing experience with video player, content display, navigation
 * Includes: Video/PDF/Text viewer, sidebar navigation, progress tracking, notes, quiz interface
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Accordion } from '../ui/Accordion';
import { Tabs } from '../ui/Tabs';
import { cn } from '@/lib/utils';

export interface LessonContent {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text' | 'quiz' | 'assignment' | 'youtube_live';
  content?: string; // HTML content for text lessons
  videoUrl?: string;
  pdfUrl?: string;
  youtubeUrl?: string;
  duration?: number;
  description?: string;
}

export interface LessonNavItem {
  id: string;
  moduleTitle: string;
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    duration?: number;
    isCompleted: boolean;
    isLocked: boolean;
    isCurrent: boolean;
  }>;
}

export interface LessonNote {
  id: string;
  content: string;
  timestamp?: number; // For video lessons
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
}

export interface LessonViewerTemplateProps {
  lesson: LessonContent;
  courseTitle: string;
  navigation: LessonNavItem[];
  progress: number; // Overall course progress 0-100
  notes?: LessonNote[];
  quiz?: QuizQuestion[];
  onComplete?: () => void;
  onNavigate?: (lessonId: string) => void;
  onAddNote?: (note: string, timestamp?: number) => void;
  onDeleteNote?: (noteId: string) => void;
  onQuizSubmit?: (answers: Record<string, number>) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Lesson Viewer Template - Full lesson viewing page
 */
export const LessonViewerTemplate: React.FC<LessonViewerTemplateProps> = ({
  lesson,
  courseTitle,
  navigation,
  progress,
  notes = [],
  quiz = [],
  onComplete,
  onNavigate,
  onAddNote,
  onDeleteNote,
  onQuizSubmit,
  loading = false,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [noteContent, setNoteContent] = React.useState('');
  const [quizAnswers, setQuizAnswers] = React.useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddNote = () => {
    if (noteContent.trim()) {
      const timestamp = videoRef.current?.currentTime;
      onAddNote?.(noteContent, timestamp);
      setNoteContent('');
    }
  };

  const handleQuizSubmit = () => {
    onQuizSubmit?.(quizAnswers);
    setShowQuizResults(true);
  };

  const currentLessonIndex = navigation.reduce((acc, module) => {
    const lessonIndex = module.lessons.findIndex(l => l.isCurrent);
    return lessonIndex !== -1 ? acc + lessonIndex : acc + module.lessons.length;
  }, 0);

  const totalLessons = navigation.reduce((acc, module) => acc + module.lessons.length, 0);

  const nextLesson = navigation.flatMap(m => m.lessons).find((l, idx) => {
    const allLessons = navigation.flatMap(m => m.lessons);
    const currentIdx = allLessons.findIndex(lesson => lesson.isCurrent);
    return idx === currentIdx + 1 && !l.isLocked;
  });

  const prevLesson = navigation.flatMap(m => m.lessons).find((l, idx) => {
    const allLessons = navigation.flatMap(m => m.lessons);
    const currentIdx = allLessons.findIndex(lesson => lesson.isCurrent);
    return idx === currentIdx - 1;
  });

  if (loading) {
    return <LessonViewerSkeleton />;
  }

  return (
    <div className={cn('flex h-screen bg-gray-50 dark:bg-gray-900', className)}>
      {/* Sidebar */}
      <div
        className={cn(
          'w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300',
          !sidebarOpen && '-ml-80'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white truncate">
            {courseTitle}
          </h2>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Course Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} size="sm" />
          </div>
        </div>

        {/* Lessons Navigation */}
        <div className="flex-1 overflow-y-auto">
          <Accordion
            items={navigation.map((module) => ({
              id: module.id,
              title: module.moduleTitle,
              content: (
                <div className="space-y-1">
                  {module.lessons.map((lessonItem) => (
                    <button
                      key={lessonItem.id}
                      onClick={() => !lessonItem.isLocked && onNavigate?.(lessonItem.id)}
                      disabled={lessonItem.isLocked}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                        lessonItem.isCurrent && 'bg-blue-50 dark:bg-blue-900/20',
                        !lessonItem.isCurrent && !lessonItem.isLocked && 'hover:bg-gray-100 dark:hover:bg-gray-700',
                        lessonItem.isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {lessonItem.isCompleted ? (
                        <svg className="h-5 w-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className={cn(
                          'h-5 w-5 rounded-full border-2 shrink-0',
                          lessonItem.isCurrent ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'
                        )} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {lessonItem.title}
                        </div>
                        {lessonItem.duration && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDuration(lessonItem.duration)}
                          </div>
                        )}
                      </div>
                      {lessonItem.isLocked && (
                        <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              ),
            }))}
            variant="default"
            type="multiple"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {lesson.title}
                </h1>
                <Badge color="blue" size="sm">{lesson.type}</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lesson {currentLessonIndex + 1} of {totalLessons}
              </p>
            </div>
          </div>
          <Button onClick={onComplete} variant="success">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark as Complete
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Content Display */}
            <Card>
              {lesson.type === 'video' && lesson.videoUrl && (
                <video
                  ref={videoRef}
                  controls
                  className="w-full aspect-video bg-black rounded-lg"
                  src={lesson.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {lesson.type === 'youtube_live' && lesson.youtubeUrl && (
                <div className="w-full aspect-video">
                  <iframe
                    src={lesson.youtubeUrl}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {lesson.type === 'pdf' && lesson.pdfUrl && (
                <div className="w-full h-[600px]">
                  <iframe
                    src={lesson.pdfUrl}
                    className="w-full h-full rounded-lg"
                    title={lesson.title}
                  />
                </div>
              )}

              {lesson.type === 'text' && lesson.content && (
                <div
                  className="prose dark:prose-invert max-w-none p-6"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              )}

              {lesson.type === 'quiz' && quiz.length > 0 && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Quiz: {lesson.title}
                    </h2>
                    {!showQuizResults && (
                      <Badge>{Object.keys(quizAnswers).length} / {quiz.length} answered</Badge>
                    )}
                  </div>

                  {quiz.map((question, qIndex) => (
                    <div key={question.id} className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                          {qIndex + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            {question.question}
                          </h3>
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <label
                                key={oIndex}
                                className={cn(
                                  'flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors',
                                  quizAnswers[question.id] === oIndex
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                                  showQuizResults && question.correctAnswer === oIndex && 'border-green-600 bg-green-50 dark:bg-green-900/20',
                                  showQuizResults && quizAnswers[question.id] === oIndex && question.correctAnswer !== oIndex && 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                )}
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  checked={quizAnswers[question.id] === oIndex}
                                  onChange={() => !showQuizResults && setQuizAnswers({ ...quizAnswers, [question.id]: oIndex })}
                                  disabled={showQuizResults}
                                  className="sr-only"
                                />
                                <div className="flex-1 flex items-center gap-3">
                                  <span className={cn(
                                    'flex items-center justify-center h-6 w-6 rounded-full border-2 transition-colors',
                                    quizAnswers[question.id] === oIndex
                                      ? 'border-blue-600 bg-blue-600'
                                      : 'border-gray-300 dark:border-gray-600'
                                  )}>
                                    {quizAnswers[question.id] === oIndex && (
                                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="text-gray-900 dark:text-white">{option}</span>
                                </div>
                                {showQuizResults && question.correctAnswer === oIndex && (
                                  <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                            ))}
                          </div>
                          {showQuizResults && question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {!showQuizResults && (
                    <Button
                      fullWidth
                      size="lg"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                    >
                      Submit Quiz
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Description */}
            {lesson.description && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  About this lesson
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{lesson.description}</p>
              </Card>
            )}

            {/* Notes Section */}
            {lesson.type !== 'quiz' && (
              <Card>
                <Tabs
                  tabs={[
                    {
                      value: 'notes',
                      label: `Notes (${notes.length})`,
                      content: (
                        <div className="space-y-4">
                          {/* Add Note */}
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Add a note..."
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              rows={3}
                            />
                            <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
                              Add Note
                            </Button>
                          </div>

                          {/* Notes List */}
                          {notes.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                              No notes yet. Start taking notes to remember key points!
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {notes.map((note) => (
                                <div
                                  key={note.id}
                                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2"
                                >
                                  {note.timestamp !== undefined && (
                                    <button
                                      onClick={() => {
                                        if (videoRef.current) {
                                          videoRef.current.currentTime = note.timestamp!;
                                        }
                                      }}
                                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      Jump to {formatDuration(note.timestamp)}
                                    </button>
                                  )}
                                  <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                    <button
                                      onClick={() => onDeleteNote?.(note.id)}
                                      className="text-red-600 dark:text-red-400 hover:underline"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  variant="default"
                />
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => prevLesson && onNavigate?.(prevLesson.id)}
                disabled={!prevLesson}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Lesson
              </Button>
              <Button
                onClick={() => nextLesson && onNavigate?.(nextLesson.id)}
                disabled={!nextLesson}
              >
                Next Lesson
                <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Lesson Viewer Skeleton (Loading state)
 */
export const LessonViewerSkeleton: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex-1">
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-pulse" />
        <div className="p-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
};
