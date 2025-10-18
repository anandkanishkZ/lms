'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  PlayCircle,
  FileText,
  CheckCircle,
  Lock,
  Clock,
  ChevronDown,
  ChevronRight,
  Youtube,
  ExternalLink,
  HelpCircle,
  CheckSquare,
  Award,
  User,
  Calendar,
  ArrowRight,
  Home
} from 'lucide-react';
import moduleApiService from '@/src/services/module-api.service';
import { studentApiService, type ModuleEnrollment } from '@/src/services/student-api.service';

// Types
interface Module {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  level: string;
  duration: number | null;
  totalTopics: number;
  totalLessons: number;
  viewCount: number;
  teacher: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'PDF' | 'YOUTUBE_LIVE' | 'QUIZ' | 'ASSIGNMENT' | 'EXTERNAL_LINK';
  duration: number | null;
  orderIndex: number;
  isPublished: boolean;
  isCompleted?: boolean;
  isCurrent?: boolean;
  isLocked?: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  duration: number | null;
  totalLessons: number;
  lessons?: Lesson[];
  completedLessons?: number;
  progress?: number;
}

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [module, setModule] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<ModuleEnrollment | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchModuleData();
    }
  }, [slug]);

  const fetchModuleData = async () => {
    try {
      setLoading(true);

      // Check authentication
      if (!studentApiService.isAuthenticated()) {
        router.push('/student/login');
        return;
      }

      // Fetch module details
      const moduleData = await moduleApiService.getModuleById(slug);
      setModule(moduleData);

      // Fetch topics with lessons
      const topicsData = await moduleApiService.getTopicsByModule(moduleData.id);
      
      // Fetch student enrollments
      const enrollments = await studentApiService.getMyEnrollments();
      const currentEnrollment = enrollments.find((e) => e.moduleId === moduleData.id);

      if (!currentEnrollment) {
        // Student not enrolled
        router.push('/student/dashboard');
        return;
      }

      setEnrollment(currentEnrollment);

      // Fetch lessons for each topic
      const topicsWithLessons = await Promise.all(
        topicsData.map(async (topic: any) => {
          const lessons = await moduleApiService.getLessonsByTopic(topic.id);
          
          // Calculate topic progress
          const completedCount = lessons.filter((l: any) => l.isCompleted).length;
          const progress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

          return {
            ...topic,
            lessons,
            completedLessons: completedCount,
            progress
          };
        })
      );

      setTopics(topicsWithLessons);

      // Expand first topic by default
      if (topicsWithLessons.length > 0) {
        setExpandedTopics([topicsWithLessons[0].id]);
      }

      // Find current lesson (first incomplete or first lesson)
      for (const topic of topicsWithLessons) {
        const currentLesson = topic.lessons?.find((l: any) => !l.isCompleted);
        if (currentLesson) {
          setCurrentLessonId(currentLesson.id);
          break;
        }
      }

    } catch (error) {
      console.error('Failed to fetch module data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleLessonClick = (lessonId: string, isLocked: boolean) => {
    if (isLocked) {
      return; // Don't navigate if locked
    }
    router.push(`/modules/${slug}/lessons/${lessonId}`);
  };

  const handleContinueLearning = () => {
    if (currentLessonId) {
      router.push(`/modules/${slug}/lessons/${currentLessonId}`);
    } else if (topics.length > 0 && topics[0].lessons && topics[0].lessons.length > 0) {
      router.push(`/modules/${slug}/lessons/${topics[0].lessons[0].id}`);
    }
  };

  const getLessonIcon = (type: string) => {
    const iconClass = "w-5 h-5";
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

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2563eb] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module || !enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Module not found</h2>
          <p className="text-gray-600 mb-6">You may not be enrolled in this module.</p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-6 py-3 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completedLessons = topics.reduce((sum, topic) => sum + (topic.completedLessons || 0), 0);
  const progressPercentage = Math.round(enrollment.progress || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => router.push('/student/dashboard')}
              className="hover:text-[#2563eb] transition flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{module.title}</span>
          </div>
        </div>
      </div>

      {/* Module Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white"
      >
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-start gap-8">
            {/* Module Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {module.subject.name}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {module.level}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{module.title}</h1>
              
              {module.description && (
                <p className="text-white/90 text-lg mb-6 leading-relaxed">
                  {module.description}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/80 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{module.teacher.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{module.totalTopics} Topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{module.totalLessons} Lessons</span>
                </div>
                {module.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(module.duration)}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="bg-white h-full rounded-full shadow-lg"
                  />
                </div>
                <p className="text-sm text-white/70 mt-2">
                  {completedLessons} of {module.totalLessons} lessons completed
                </p>
              </div>

              {/* Continue Learning Button */}
              <button
                onClick={handleContinueLearning}
                className="px-8 py-3 bg-white text-[#2563eb] rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Continue Learning</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Circle */}
            <div className="hidden lg:block">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * progressPercentage) / 100 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    strokeDasharray="440"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{progressPercentage}%</div>
                    <div className="text-xs text-white/70">Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Course Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>

        {topics.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No content available</h3>
            <p className="text-gray-600">This module doesn't have any topics or lessons yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, topicIndex) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: topicIndex * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition"
              >
                {/* Topic Header */}
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {expandedTopics.includes(topic.id) ? (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {topicIndex + 1}. {topic.title}
                      </h3>
                      {topic.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{topic.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{topic.totalLessons} lessons</span>
                        {topic.duration && <span>{formatDuration(topic.duration)}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Topic Progress */}
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">
                        {topic.completedLessons || 0}/{topic.totalLessons} completed
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(topic.progress || 0)}% complete
                      </div>
                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden hidden md:block">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.progress || 0}%` }}
                        transition={{ duration: 0.5, delay: topicIndex * 0.1 + 0.2 }}
                        className="h-full bg-[#2563eb] rounded-full"
                      />
                    </div>
                  </div>
                </button>

                {/* Lessons List */}
                <AnimatePresence>
                  {expandedTopics.includes(topic.id) && topic.lessons && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200"
                    >
                      {topic.lessons.map((lesson: any, lessonIndex: number) => {
                        const isCompleted = lesson.isCompleted || false;
                        const isCurrent = lesson.id === currentLessonId;
                        const isLocked = lesson.isLocked || false;

                        return (
                          <motion.button
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: lessonIndex * 0.05 }}
                            onClick={() => handleLessonClick(lesson.id, isLocked)}
                            disabled={isLocked}
                            className={`w-full flex items-center gap-4 p-4 border-b last:border-b-0 transition ${
                              isCurrent
                                ? 'bg-[#2563eb]/5 border-l-4 border-l-[#2563eb]'
                                : 'hover:bg-gray-50'
                            } ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                          >
                            {/* Completion Status */}
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : isLocked ? (
                                <Lock className="w-6 h-6 text-gray-400" />
                              ) : isCurrent ? (
                                <div className="w-6 h-6 rounded-full border-4 border-[#2563eb] bg-[#2563eb]/20" />
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                              )}
                            </div>

                            {/* Lesson Icon */}
                            <div className={`flex-shrink-0 ${isCompleted ? 'text-green-600' : 'text-[#2563eb]'}`}>
                              {getLessonIcon(lesson.type)}
                            </div>

                            {/* Lesson Title */}
                            <div className="flex-1 text-left">
                              <p className={`font-medium ${isCurrent ? 'text-[#2563eb]' : 'text-gray-900'}`}>
                                {lesson.title}
                              </p>
                              {isCurrent && (
                                <p className="text-xs text-[#2563eb] mt-1">← Continue from here</p>
                              )}
                            </div>

                            {/* Lesson Type Badge */}
                            <div className="hidden sm:block">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                {lesson.type}
                              </span>
                            </div>

                            {/* Duration */}
                            {lesson.duration && (
                              <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
                                <Clock className="w-4 h-4" />
                                <span>{lesson.duration} min</span>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
