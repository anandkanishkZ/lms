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
  Home,
  Download,
  Eye,
  Search,
  Filter,
  File,
  Image as ImageIcon,
  Music,
  Video,
  Link as LinkIcon,
  Archive,
  Code
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

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: 'PDF' | 'DOCUMENT' | 'PRESENTATION' | 'SPREADSHEET' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'LINK' | 'YOUTUBE' | 'ARCHIVE' | 'CODE' | 'OTHER';
  category: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  externalUrl: string | null;
  isMandatory: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
  };
}

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [module, setModule] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [enrollment, setEnrollment] = useState<ModuleEnrollment | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'resources'>('topics');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');
  const [resourceSearch, setResourceSearch] = useState('');

  useEffect(() => {
    if (slug) {
      fetchModuleData();
    }
  }, [slug]);

  useEffect(() => {
    if (activeTab === 'resources' && module && !resources.length && !resourcesLoading) {
      fetchResources();
    }
  }, [activeTab, module]);

  const fetchModuleData = async () => {
    try {
      setLoading(true);

      // Check authentication
      if (!studentApiService.isAuthenticated()) {
        router.push('/student/login');
        return;
      }

      // Fetch module details by slug
      const moduleData = await moduleApiService.getModuleBySlug(slug);
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

  const fetchResources = async () => {
    if (!module) return;
    
    try {
      setResourcesLoading(true);
      const token = localStorage.getItem('student_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/resources/modules/${module.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResources(data.data?.resources || []);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setResourcesLoading(false);
    }
  };

  const trackResourceAccess = async (resourceId: string, action: 'VIEW' | 'DOWNLOAD') => {
    try {
      const token = localStorage.getItem('student_token');
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/resources/${resourceId}/track`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        }
      );
    } catch (error) {
      console.error('Failed to track resource access:', error);
    }
  };

  const handleViewResource = (resource: Resource) => {
    trackResourceAccess(resource.id, 'VIEW');
    const url = resource.fileUrl || resource.externalUrl;
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDownloadResource = (resource: Resource) => {
    trackResourceAccess(resource.id, 'DOWNLOAD');
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    }
  };

  const getResourceIcon = (type: string) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case 'PDF':
      case 'DOCUMENT':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'PRESENTATION':
        return <FileText className={`${iconClass} text-orange-500`} />;
      case 'VIDEO':
        return <Video className={`${iconClass} text-purple-500`} />;
      case 'AUDIO':
        return <Music className={`${iconClass} text-teal-500`} />;
      case 'IMAGE':
        return <ImageIcon className={`${iconClass} text-green-500`} />;
      case 'LINK':
        return <LinkIcon className={`${iconClass} text-blue-500`} />;
      case 'YOUTUBE':
        return <Youtube className={`${iconClass} text-red-600`} />;
      case 'ARCHIVE':
        return <Archive className={`${iconClass} text-gray-500`} />;
      case 'CODE':
        return <Code className={`${iconClass} text-indigo-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredResources = resources.filter((resource) => {
    const matchesType = resourceTypeFilter === 'all' || resource.type === resourceTypeFilter;
    const matchesSearch = !resourceSearch || 
      resource.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      resource.description?.toLowerCase().includes(resourceSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

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
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2.5 rounded-md font-medium transition ${
              activeTab === 'overview'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex-1 px-4 py-2.5 rounded-md font-medium transition ${
              activeTab === 'topics'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Topics & Lessons
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 px-4 py-2.5 rounded-md font-medium transition ${
              activeTab === 'resources'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Resources
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Module</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {module.description || 'No description available for this module.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Instructor</div>
                <div className="font-semibold text-gray-900">{module.teacher.name}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Level</div>
                <div className="font-semibold text-gray-900">{module.level}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Topics</div>
                <div className="font-semibold text-gray-900">{module.totalTopics}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Lessons</div>
                <div className="font-semibold text-gray-900">{module.totalLessons}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {topics.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No content available</h3>
                <p className="text-gray-600">This module doesn't have any topics or lessons yet.</p>
              </div>
            ) : (
              <div className="space-y-4">{topics.map((topic, topicIndex) => (
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
          </motion.div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Filter Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={resourceTypeFilter}
                  onChange={(e) => setResourceTypeFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">Video</option>
                  <option value="DOCUMENT">Document</option>
                  <option value="IMAGE">Image</option>
                  <option value="LINK">Link</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="AUDIO">Audio</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Resources Grid */}
            {resourcesLoading ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#2563eb] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading resources...</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {resourceSearch || resourceTypeFilter !== 'all' ? 'No resources found' : 'No resources available'}
                </h3>
                <p className="text-gray-600">
                  {resourceSearch || resourceTypeFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Your instructor hasn\'t added any resources yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
                  >
                    {/* Resource Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 flex-1">
                            {resource.title}
                          </h3>
                          {resource.isMandatory && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md flex-shrink-0">
                              MANDATORY
                            </span>
                          )}
                        </div>
                        {resource.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Resource Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{resource.uploader.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                      </div>
                      {resource.fileSize && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{formatFileSize(resource.fileSize)}</span>
                        </div>
                      )}
                    </div>

                    {/* Resource Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{resource.viewCount} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{resource.downloadCount} downloads</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewResource(resource)}
                        className="flex-1 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      {resource.fileUrl && (
                        <button
                          onClick={() => handleDownloadResource(resource)}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

