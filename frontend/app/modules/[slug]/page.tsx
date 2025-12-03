'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
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
  Code,
  Plus,
  Minus
} from 'lucide-react';
import moduleApiService from '@/src/services/module-api.service';
import { studentApiService, type ModuleEnrollment } from '@/src/services/student-api.service';
import { StudentLiveClassesTab } from './components/StudentLiveClassesTab';
import { StudentFeaturedVideo } from '@/src/components/StudentFeaturedVideo';
import ModuleRating from '@/src/components/ModuleRating';

// Helper function to construct proper image URL
const getImageUrl = (profileImage: string | null): string | null => {
  if (!profileImage) return null;
  
  // If already a full URL, return as is
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
    return profileImage;
  }
  
  // Get base URL and remove /api/v1 suffix if present
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  baseUrl = baseUrl.replace(/\/api(\/v1)?\/?$/, '');
  
  // Remove any leading slashes from profile image path
  const cleanPath = profileImage.replace(/^\/+/, '');
  
  // Ensure path starts with avatars/
  const imagePath = cleanPath.startsWith('avatars/') ? cleanPath : `avatars/${cleanPath}`;
  
  // Static uploads are served from /uploads/
  return `${baseUrl}/uploads/${imagePath}`;
};

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
    email?: string | null;
    profileImage?: string | null;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'studymaterials' | 'tasks' | 'quiz' | 'challenges' | 'liveclasses' | 'ratings'>('overview');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');
  const [resourceSearch, setResourceSearch] = useState('');
  const tabContainerRef = useRef<HTMLDivElement>(null);

  // Calculate progress metrics from topics data
  const progressStats = useMemo(() => {
    if (!topics || topics.length === 0) {
      return {
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0
      };
    }

    const totalLessons = topics.reduce((sum, topic) => sum + (topic.lessons?.length || 0), 0);
    const completedLessons = topics.reduce((sum, topic) => {
      return sum + (topic.lessons?.filter((l: any) => l.isCompleted).length || 0);
    }, 0);
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return { totalLessons, completedLessons, progressPercentage };
  }, [topics]);

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

  // Scroll tabs left
  const scrollTabsLeft = () => {
    if (tabContainerRef.current) {
      tabContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // Scroll tabs right
  const scrollTabsRight = () => {
    if (tabContainerRef.current) {
      tabContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
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
  const totalAssignments = topics.reduce((sum, topic) => {
    const assignments = topic.lessons?.filter((l: any) => l.type === 'ASSIGNMENT') || [];
    return sum + assignments.length;
  }, 0);
  const completedAssignments = topics.reduce((sum, topic) => {
    const assignments = topic.lessons?.filter((l: any) => l.type === 'ASSIGNMENT' && l.isCompleted) || [];
    return sum + assignments.length;
  }, 0);
  const assignmentPercentage = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

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
            <span className="text-gray-900 font-medium">{module.title}</span>
          </div>
        </div>
      </div>

      {/* Module Header - Campus 4.0 Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[rgb(4,53,162)]"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Category Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-md text-white text-sm font-medium border border-white/20">
              {module.subject.name}
            </span>
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-md text-white text-sm font-medium border border-white/20">
              {module.level}
            </span>
            {module.totalTopics > 0 && (
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-md text-white text-sm font-medium border border-white/20">
                {module.totalTopics} Topics
              </span>
            )}
          </div>

          {/* Module Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{module.title}</h1>

          {/* Module Stats - Simple Text */}
          <div className="flex flex-wrap items-center gap-6 mb-6 text-white">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white/80" />
              <span className="text-sm font-medium">Year One</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-white/80" />
              <span className="text-sm font-medium">
                {module.duration ? `${Math.ceil(module.duration / 60)} weeks` : '4 weeks'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-white/80" />
              <span className="text-sm font-medium">
                {module.duration ? formatDuration(module.duration) : '10 Hours'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-white/80" />
              <span className="text-sm font-medium">{module.totalLessons} Lessons</span>
            </div>
          </div>

          {/* Continue Learning Button */}
          <button
            onClick={handleContinueLearning}
            className="px-6 py-3 bg-white text-[#1e40af] rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Continue Learning</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Featured Video Section - Above Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <StudentFeaturedVideo moduleId={module?.id || ''} />
            </motion.div>

            {/* Tabs - Campus 4.0 Style */}
            <div className="bg-[rgb(4,53,162)] rounded-xl shadow-sm mb-6 overflow-hidden">
              <div className="flex items-center">
                {/* Left Arrow */}
                <button 
                  onClick={scrollTabsLeft}
                  className="flex-shrink-0 px-4 py-4 text-white hover:bg-white/10 transition"
                  aria-label="Scroll tabs left"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>

                {/* Tab Buttons */}
                <div ref={tabContainerRef} className="flex items-center flex-1 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-4 font-medium transition whitespace-nowrap ${
                      activeTab === 'overview'
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`px-6 py-4 font-medium transition whitespace-nowrap ${
                      activeTab === 'resources'
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Resources
                  </button>
                  <button
                    onClick={() => setActiveTab('studymaterials')}
                    className={`px-6 py-4 font-medium transition whitespace-nowrap ${
                      activeTab === 'studymaterials'
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Topics & Lessons
                  </button>
                  <button
                    onClick={() => setActiveTab('liveclasses')}
                    className={`px-6 py-4 font-medium transition whitespace-nowrap ${
                      activeTab === 'liveclasses'
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Live Classes
                  </button>
                  <button
                    onClick={() => setActiveTab('ratings')}
                    className={`px-6 py-4 font-medium transition whitespace-nowrap ${
                      activeTab === 'ratings'
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Ratings & Reviews
                  </button>
                </div>

                {/* Right Arrow */}
                <button 
                  onClick={scrollTabsRight}
                  className="flex-shrink-0 px-4 py-4 text-white hover:bg-white/10 transition"
                  aria-label="Scroll tabs right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Content */}
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Module Description */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Module/Subject Overview</h2>
                  <p className="text-gray-700 leading-relaxed mb-8">
                    {module.description || 'This module introduces the fundamentals of the subject that will underpin the technical and theoretical content of undergraduate degree courses. Students taking the module will develop core skills and understanding through comprehensive lessons and practical applications.'}
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Outcome</h3>
                  <div className="space-y-3 text-gray-700">
                    <p>By the end of the module/subject, you will be able to ...</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Demonstrate understanding of core concepts and principles</li>
                      <li>Apply learned techniques to solve practical problems</li>
                      <li>Analyze complex scenarios using appropriate methodologies</li>
                      <li>Communicate technical concepts effectively</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Topics/Lessons Tab */}
            {activeTab === 'studymaterials' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {topics.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No topics available yet.</p>
                  </div>
                ) : (
                  topics.map((topic, topicIndex) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: topicIndex * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      {/* Topic Header */}
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                      >
                        <h3 className="text-lg font-semibold text-gray-900">
                          {topic.title}
                        </h3>
                        <div className="flex-shrink-0">
                          {expandedTopics.includes(topic.id) ? (
                            <Minus className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Plus className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </button>

                      {/* Lessons List */}
                      <AnimatePresence>
                        {expandedTopics.includes(topic.id) && topic.lessons && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200"
                          >
                            {topic.lessons.map((lesson: any, lessonIndex: number) => (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson.id, lesson.isLocked || false)}
                                disabled={lesson.isLocked}
                                className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${
                                  lesson.isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                              >
                                {/* Play Icon */}
                                <div className="flex-shrink-0">
                                  {lesson.isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : lesson.isLocked ? (
                                    <Lock className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <PlayCircle className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>

                                {/* Lesson Number and Title */}
                                <div className="flex items-center gap-3 flex-1 text-left">
                                  <span className="text-sm font-medium text-gray-600">
                                    Lesson: {lessonIndex + 1}
                                  </span>
                                  <span className="text-base font-semibold text-gray-900">
                                    {lesson.title}
                                  </span>
                                </div>

                                {/* Duration (if available) */}
                                {lesson.duration && (
                                  <span className="text-sm text-gray-500">
                                    {lesson.duration}min
                                  </span>
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tasks & Assignments</h2>
                <div className="grid gap-4">
                  {topics.map((topic) => (
                    topic.lessons?.filter((l: any) => l.type === 'ASSIGNMENT').map((lesson: any) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id, lesson.isLocked || false)}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
                      >
                        <CheckSquare className="w-10 h-10 text-[#1e40af]" />
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.isCompleted ? (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Completed</span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Pending</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))
                  ))}
                  {topics.every(t => !t.lessons?.some((l: any) => l.type === 'ASSIGNMENT')) && (
                    <div className="text-center py-12">
                      <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No assignments available yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quizzes</h2>
                <div className="grid gap-4">
                  {topics.map((topic) => (
                    topic.lessons?.filter((l: any) => l.type === 'QUIZ').map((lesson: any) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id, lesson.isLocked || false)}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
                      >
                        <HelpCircle className="w-10 h-10 text-[#1e40af]" />
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.isCompleted ? (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Completed</span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Available</span>
                            )}
                            {lesson.duration && (
                              <span className="text-xs text-gray-500">{lesson.duration} min</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))
                  ))}
                  {topics.every(t => !t.lessons?.some((l: any) => l.type === 'QUIZ')) && (
                    <div className="text-center py-12">
                      <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No quizzes available yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Challenges</h2>
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon!</h3>
                  <p className="text-gray-600">Challenge activities will be available soon.</p>
                </div>
              </motion.div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Filter Bar */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search resources..."
                        value={resourceSearch}
                        onChange={(e) => setResourceSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-transparent"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={resourceTypeFilter}
                        onChange={(e) => setResourceTypeFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-transparent appearance-none bg-white cursor-pointer"
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
                </div>

                {/* Resources Grid */}
                {resourcesLoading ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1e40af] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading resources...</p>
                  </div>
                ) : filteredResources.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
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
                  <div className="grid grid-cols-1 gap-4">
                    {filteredResources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getResourceIcon(resource.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
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
                              <p className="text-sm text-gray-600 mb-3">
                                {resource.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{resource.uploader.name}</span>
                              </div>
                              {resource.fileSize && (
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  <span>{formatFileSize(resource.fileSize)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{resource.viewCount} views</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewResource(resource)}
                                className="px-4 py-2 bg-[#1e40af] text-white rounded-lg hover:bg-[#1e3a8a] transition flex items-center gap-2 text-sm font-medium"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </button>
                              {resource.fileUrl && (
                                <button
                                  onClick={() => handleDownloadResource(resource)}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm font-medium"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>Download</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Live Classes Tab */}
            {activeTab === 'liveclasses' && module && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <StudentLiveClassesTab 
                  moduleId={module.id} 
                  moduleName={module.title}
                />
              </motion.div>
            )}

            {/* Ratings & Reviews Tab */}
            {activeTab === 'ratings' && module && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ModuleRating 
                  moduleId={module.id} 
                  currentUserRole="STUDENT"
                  currentUserId={enrollment?.studentId}
                />
              </motion.div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Lecturer Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lecturer</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center overflow-hidden">
                  {module.teacher.profileImage ? (
                    <img
                      src={getImageUrl(module.teacher.profileImage) || ''}
                      alt={module.teacher.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If image fails to load, show initials
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.classList.add('bg-gradient-to-br', 'from-pink-400', 'to-red-500');
                          parent.innerHTML = `<span class="text-white text-2xl font-bold">${module.teacher.name.split(' ').map((n: string) => n[0]).join('')}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {module.teacher.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{module.teacher.name}</h4>
                  <p className="text-sm text-gray-600">Module/Subject Leader</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Teacher ID: {module.teacher.id.substring(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Exp. 4 Years</span>
                </div>
              </div>
            </motion.div>

            {/* Overall Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Overall Progress</h3>
              
              {/* Single Progress Circle - Lessons */}
              <div className="flex flex-col items-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e0e7ff"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#4f46e5"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 56 * progressStats.progressPercentage / 100} ${2 * Math.PI * 56}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{progressStats.progressPercentage}%</div>
                      <div className="text-xs text-gray-500 mt-1">Complete</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-6">Lessons Completed</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="text-3xl font-bold text-blue-600">{progressStats.completedLessons}</div>
                  <div className="text-xs text-gray-600 mt-1">Lessons Completed</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-200">
                  <div className="text-3xl font-bold text-gray-700">{progressStats.totalLessons}</div>
                  <div className="text-xs text-gray-600 mt-1">Total Lessons</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">{progressStats.completedLessons} / {progressStats.totalLessons}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressStats.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>



            {/* Bottom Stats Bar - Campus 4.0 Style */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-500">{completedLessons}</div>
                  <div className="text-sm text-gray-600 mt-1">Lessons<br/>Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">{completedAssignments}</div>
                  <div className="text-sm text-gray-600 mt-1">Assignments<br/>Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">22</div>
                  <div className="text-sm text-gray-600 mt-1">Classes<br/>Attended</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

