'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  PlayCircle,
  FileText,
  CheckCircle,
  Lock,
  Clock,
  ChevronLeft,
  ChevronRight,
  Youtube,
  ExternalLink,
  HelpCircle,
  CheckSquare,
  Home,
  Download,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import moduleApiService from '@/src/services/module-api.service';
import { studentApiService } from '@/src/services/student-api.service';
import RichTextViewer from '@/src/components/RichTextEditor/RichTextViewer';

// Custom types matching backend Prisma schema
interface LessonData {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  type: 'VIDEO' | 'TEXT' | 'PDF' | 'YOUTUBE_LIVE' | 'QUIZ' | 'ASSIGNMENT' | 'EXTERNAL_LINK';
  duration: number | null;
  videoUrl: string | null;
  youtubeVideoId: string | null;
  orderIndex: number;
  isPublished: boolean;
  isFree: boolean;
  topicId: string;
  topic?: {
    id: string;
    title: string;
  };
  attachments?: {
    id: string;
    title: string;
    fileUrl: string;
    fileType: string | null;
  }[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ModuleData {
  id: string;
  title: string;
  description: string | null;
}

interface TopicData {
  id: string;
  title: string;
  order: number;
  lessons?: LessonData[];
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const lessonId = params?.id as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [module, setModule] = useState<ModuleData | null>(null);
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [previousLesson, setPreviousLesson] = useState<{ id: string; title: string } | null>(null);
  const [nextLesson, setNextLesson] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (slug && lessonId) {
      fetchLessonData();
    }
  }, [slug, lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);

      // Check authentication
      if (!studentApiService.isAuthenticated()) {
        router.push('/student/login');
        return;
      }

      // Fetch module details
      const moduleData = await moduleApiService.getModuleBySlug(slug);
      setModule(moduleData);

      // Check if enrolled
      const enrollments = await studentApiService.getMyEnrollments();
      const userEnrollment = enrollments.find((e) => e.moduleId === moduleData.id);

      if (!userEnrollment) {
        router.push('/student/dashboard');
        return;
      }
      
      // Store enrollment ID for progress tracking
      setEnrollmentId(userEnrollment.id);

      // Fetch lesson details
      const lessonData = await moduleApiService.getLessonById(lessonId);
      setLesson(lessonData as any as LessonData);

      // Fetch all topics with lessons for navigation
      const topicsData = await moduleApiService.getTopicsByModule(moduleData.id);
      const topicsWithLessons = await Promise.all(
        topicsData.map(async (topic: any) => {
          const lessons = await moduleApiService.getLessonsByTopic(topic.id);
          return {
            ...topic,
            lessons,
          };
        })
      );
      setTopics(topicsWithLessons as any as TopicData[]);

      // Find previous and next lessons
      findAdjacentLessons(lessonData as any as LessonData, topicsWithLessons as any as TopicData[]);

      // Check if lesson is completed using the enrollment ID
      checkLessonCompletion(lessonId, userEnrollment.id);

    } catch (error: any) {
      console.error('Failed to fetch lesson data:', error);
      if (error.response?.status === 404) {
        router.push(`/modules/${slug}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const findAdjacentLessons = (currentLesson: LessonData, allTopics: TopicData[]) => {
    // Flatten all lessons across topics
    const allLessons: { id: string; title: string; topicOrder: number; lessonOrder: number }[] = [];
    
    allTopics.forEach((topic) => {
      if (topic.lessons) {
        topic.lessons.forEach((lesson: LessonData) => {
          allLessons.push({
            id: lesson.id,
            title: lesson.title,
            topicOrder: topic.order,
            lessonOrder: lesson.orderIndex,
          });
        });
      }
    });

    // Sort by topic order, then lesson order
    allLessons.sort((a, b) => {
      if (a.topicOrder !== b.topicOrder) {
        return a.topicOrder - b.topicOrder;
      }
      return a.lessonOrder - b.lessonOrder;
    });

    // Find current lesson index
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);

    if (currentIndex > 0) {
      setPreviousLesson({
        id: allLessons[currentIndex - 1].id,
        title: allLessons[currentIndex - 1].title,
      });
    }

    if (currentIndex < allLessons.length - 1) {
      setNextLesson({
        id: allLessons[currentIndex + 1].id,
        title: allLessons[currentIndex + 1].title,
      });
    }
  };

  const checkLessonCompletion = async (lessonId: string, enrollmentIdParam: string) => {
    try {
      const token = localStorage.getItem('student_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/progress/lessons/${lessonId}?enrollmentId=${enrollmentIdParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsCompleted(data.data?.isCompleted || false);
      }
    } catch (error) {
      console.error('Failed to check lesson completion:', error);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson || markingComplete || !enrollmentId) return;

    try {
      setMarkingComplete(true);
      const token = localStorage.getItem('student_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/progress/lessons/${lesson.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enrollmentId: enrollmentId
          }),
        }
      );

      if (response.ok) {
        setIsCompleted(true);
        
        // Auto-navigate to next lesson after 1 second
        if (nextLesson) {
          setTimeout(() => {
            router.push(`/modules/${slug}/lessons/${nextLesson.id}`);
          }, 1000);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to mark lesson as complete:', errorData);
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  const getLessonIcon = (type: string) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className={iconClass} />;
      case 'YOUTUBE_LIVE':
        return <Youtube className={iconClass} />;
      case 'TEXT':
        return <FileText className={iconClass} />;
      case 'PDF':
        return <FileText className={iconClass} />;
      case 'QUIZ':
        return <HelpCircle className={iconClass} />;
      case 'ASSIGNMENT':
        return <CheckSquare className={iconClass} />;
      case 'EXTERNAL_LINK':
        return <ExternalLink className={iconClass} />;
      default:
        return <BookOpen className={iconClass} />;
    }
  };

  const renderLessonContent = () => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'TEXT':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {lesson.content ? (
              <RichTextViewer content={lesson.content} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No content available for this lesson.</p>
              </div>
            )}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="bg-black rounded-lg overflow-hidden shadow-lg">
            {lesson.videoUrl ? (
              <video
                controls
                controlsList="nodownload"
                className="w-full aspect-video"
                src={lesson.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Video not available</p>
                </div>
              </div>
            )}
            {lesson.content && (
              <div className="bg-white p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Lesson Notes</h3>
                <RichTextViewer content={lesson.content} />
              </div>
            )}
          </div>
        );

      case 'YOUTUBE_LIVE':
        return (
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            {lesson.youtubeVideoId ? (
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}`}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Youtube className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">YouTube video not available</p>
                </div>
              </div>
            )}
            {lesson.content && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Lesson Notes</h3>
                <RichTextViewer content={lesson.content} />
              </div>
            )}
          </div>
        );

      case 'PDF':
        // Use first PDF attachment if available
        const pdfAttachment = lesson.attachments?.find(a => a.fileType?.toLowerCase().includes('pdf'));
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {pdfAttachment ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{pdfAttachment.title}</h3>
                      <p className="text-sm text-gray-600">Click below to view or download</p>
                    </div>
                  </div>
                  <a
                    href={pdfAttachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download PDF</span>
                  </a>
                </div>
                
                {/* PDF Viewer */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src={`${pdfAttachment.fileUrl}#toolbar=0`}
                    className="w-full"
                    style={{ height: '800px' }}
                    title={lesson.title}
                  />
                </div>

                {lesson.content && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
                    <RichTextViewer content={lesson.content} />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>PDF document not available</p>
                {lesson.content && (
                  <div className="text-left max-w-3xl mx-auto mt-8 pt-8 border-t border-gray-200">
                    <RichTextViewer content={lesson.content} />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'EXTERNAL_LINK':
        // Use first attachment as external link or content field
        const linkAttachment = lesson.attachments?.[0];
        const externalUrl = linkAttachment?.fileUrl || null;
        
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {externalUrl ? (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-purple-500 rounded-lg">
                        <ExternalLink className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {linkAttachment?.title || 'External Resource'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 break-all">{externalUrl}</p>
                      </div>
                    </div>
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Open Link</span>
                    </a>
                  </div>
                </div>

                {lesson.content && (
                  <RichTextViewer content={lesson.content} />
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ExternalLink className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>External link not available</p>
                {lesson.content && (
                  <div className="text-left max-w-3xl mx-auto mt-8 pt-8 border-t border-gray-200">
                    <RichTextViewer content={lesson.content} />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'QUIZ':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center py-12">
              <div className="p-4 bg-yellow-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <HelpCircle className="w-12 h-12 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Coming Soon</h3>
              <p className="text-gray-600 mb-6">Quiz functionality will be available soon.</p>
              {lesson.content && (
                <div className="text-left max-w-3xl mx-auto mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-semibold mb-4">Instructions</h4>
                  <RichTextViewer content={lesson.content} />
                </div>
              )}
            </div>
          </div>
        );

      case 'ASSIGNMENT':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center py-12">
              <div className="p-4 bg-green-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <CheckSquare className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Assignment Coming Soon</h3>
              <p className="text-gray-600 mb-6">Assignment functionality will be available soon.</p>
              {lesson.content && (
                <div className="text-left max-w-3xl mx-auto mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-semibold mb-4">Instructions</h4>
                  <RichTextViewer content={lesson.content} />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Unknown lesson type</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
          <p className="text-gray-600 mb-6">The lesson you're looking for doesn't exist or you don't have access.</p>
          <button
            onClick={() => router.push(`/modules/${slug}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Module
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => router.push('/student/dashboard')}
              className="hover:text-[#1e40af] transition flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => router.push(`/modules/${slug}`)}
              className="hover:text-[#1e40af] transition"
            >
              {module.title}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{lesson.title}</span>
          </div>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {getLessonIcon(lesson.type)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  {lesson.topic && (
                    <span className="text-sm font-medium">{lesson.topic.title}</span>
                  )}
                  {lesson.duration && (
                    <>
                      {lesson.topic && <span>•</span>}
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration} min</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Campus 4.0 Style */}
      <div className="bg-[rgb(4,53,162)] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Left: Navigation Tabs */}
            <div className="flex items-center gap-2">
              <button
                className="px-6 py-4 font-medium text-white bg-white/20 border-b-2 border-white transition"
              >
                Lesson
              </button>
              <button
                className="px-6 py-4 font-medium text-white/80 hover:text-white hover:bg-white/10 transition"
                onClick={() => {/* Add task functionality if needed */}}
              >
                Task
              </button>
              <button
                className="px-6 py-4 font-medium text-white/80 hover:text-white hover:bg-white/10 transition"
                onClick={() => {/* Add additional resources functionality if needed */}}
              >
                Additional Resources
              </button>
            </div>

            {/* Right: Go to Module & Mark as Complete Buttons */}
            <div className="flex items-center gap-3 py-2">
              {/* Go to Module/Subject Button */}
              <button
                onClick={() => router.push(`/modules/${slug}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all font-semibold border border-white/20 hover:shadow-lg"
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go to Module/Subject</span>
              </button>

              {/* Mark as Complete Button */}
              {!isCompleted ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600/90 backdrop-blur-md text-white rounded-lg hover:bg-green-700/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg border border-white/20 hover:shadow-xl hover:scale-105"
                  style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  {markingComplete ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Marking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </button>
              ) : (
                <div 
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-100/80 backdrop-blur-md text-green-700 rounded-lg border border-green-300/50 font-semibold shadow-lg"
                  style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Lesson Title Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Lesson {lesson.orderIndex + 1}: {lesson.title}
          </h2>
        </div>

        {/* Lesson Description */}
        {lesson.description && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
            <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
          </div>
        )}

        {/* Lesson Content */}
        <div className="mb-8">
          {renderLessonContent()}
        </div>

        {/* Attachments Section */}
        {lesson.attachments && lesson.attachments.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Attachments</h3>
            <div className="grid gap-3">
              {lesson.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
                >
                  <FileText className="w-10 h-10 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{attachment.title}</h4>
                    {attachment.fileType && (
                      <p className="text-sm text-gray-600">{attachment.fileType}</p>
                    )}
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Content spacing for sticky footer */}
        <div className="h-32"></div>
      </div>

      {/* Sticky Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Previous/Next Lesson Navigation */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Previous Button */}
            {previousLesson ? (
              <button
                onClick={() => router.push(`/modules/${slug}/lessons/${previousLesson.id}`)}
                className="flex items-center gap-3 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors group"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                <div className="text-left">
                  <div className="text-xs text-gray-500 uppercase">Previous</div>
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                    {previousLesson.title}
                  </div>
                </div>
              </button>
            ) : (
              <div></div>
            )}

            {/* Right: Next Button or Module Complete */}
            {nextLesson ? (
              <button
                onClick={() => router.push(`/modules/${slug}/lessons/${nextLesson.id}`)}
                className="flex items-center gap-3 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors group"
              >
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase">Next</div>
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                    {nextLesson.title}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </button>
            ) : isCompleted ? (
              <button
                onClick={() => router.push(`/modules/${slug}`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Module Complete!</span>
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
