'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, FolderOpen, FileText, Clock, Eye } from 'lucide-react';
import { topicApiService } from '@/services/topic-api.service';
import { lessonApiService, Lesson } from '@/services/lesson-api.service';
import { TopicCard } from './TopicCard';
import { TopicFormModal } from './TopicFormModal';
import { LessonFormModal } from './LessonFormModal';
import { toast } from 'react-hot-toast';

interface Topic {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  orderIndex: number;
  duration?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    lessons: number;
  };
  lessons?: Lesson[];
}

interface TopicsLessonsTabProps {
  moduleId: string;
  moduleName: string;
}

export function TopicsLessonsTab({ moduleId, moduleName }: TopicsLessonsTabProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTopicForLesson, setSelectedTopicForLesson] = useState<string | null>(null);

  // Load topics
  useEffect(() => {
    loadTopics();
  }, [moduleId]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await topicApiService.getTopicsByModule(moduleId, true);
      if (response.success) {
        // Ensure lessons have topicId if they're included
        const topicsWithTopicId = response.data.map(topic => ({
          ...topic,
          lessons: topic.lessons?.map(lesson => ({
            ...lesson,
            topicId: topic.id  // Add topicId to each lesson
          }))
        }));
        
        setTopics(topicsWithTopicId);
      }
    } catch (error: any) {
      console.error('Error loading topics:', error);
      toast.error(error.response?.data?.message || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const loadLessonsForTopic = async (topicId: string) => {
    try {
      const response = await lessonApiService.getLessonsByTopic(topicId, true);
      if (response.success) {
        // Ensure each lesson has topicId (backend might not include it)
        const lessonsWithTopicId = response.data.map(lesson => ({
          ...lesson,
          topicId: topicId  // Add topicId to each lesson
        }));
        
        setTopics(prevTopics =>
          prevTopics.map(topic =>
            topic.id === topicId
              ? { ...topic, lessons: lessonsWithTopicId }
              : topic
          )
        );
      }
    } catch (error: any) {
      console.error('Error loading lessons:', error);
      toast.error(error.response?.data?.message || 'Failed to load lessons');
    }
  };

  const toggleTopic = async (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
      // Load lessons if not already loaded
      const topic = topics.find(t => t.id === topicId);
      if (topic && !topic.lessons) {
        await loadLessonsForTopic(topicId);
      }
    }
    setExpandedTopics(newExpanded);
  };

  const handleAddTopic = () => {
    setSelectedTopic(null);
    setShowTopicModal(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowTopicModal(true);
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? All lessons will also be deleted.')) {
      return;
    }

    try {
      const response = await topicApiService.deleteTopic(topicId);
      if (response.success) {
        toast.success('Topic deleted successfully');
        await loadTopics();
      }
    } catch (error: any) {
      console.error('Error deleting topic:', error);
      toast.error(error.response?.data?.message || 'Failed to delete topic');
    }
  };

  const handleDuplicateTopic = async (topicId: string) => {
    try {
      const response = await topicApiService.duplicateTopic(topicId);
      if (response.success) {
        toast.success('Topic duplicated successfully');
        await loadTopics();
      }
    } catch (error: any) {
      console.error('Error duplicating topic:', error);
      toast.error(error.response?.data?.message || 'Failed to duplicate topic');
    }
  };

  const handleAddLesson = (topicId: string) => {
    setSelectedTopicForLesson(topicId);
    setSelectedLesson(null);
    setShowLessonModal(true);
  };

  const handleEditLesson = async (lesson: Lesson) => {
    console.log('🔍 handleEditLesson called with:', lesson);
    
    // Get topicId from lesson, or find it from topics array
    let topicId = lesson.topicId;
    
    if (!topicId) {
      console.warn('⚠️ Lesson missing topicId, searching in topics...');
      // Find the topic that contains this lesson
      const parentTopic = topics.find(t => 
        t.lessons?.some(l => l.id === lesson.id)
      );
      
      if (parentTopic) {
        topicId = parentTopic.id;
        console.log('✅ Found topicId from parent topic:', topicId);
      } else {
        console.error('❌ Could not find topicId for lesson:', lesson.id);
        toast.error('Cannot edit lesson: missing topic information');
        return;
      }
    }
    
    console.log('📝 Topic ID:', topicId);
    
    // Fetch complete lesson details including content
    try {
      console.log('📡 Fetching full lesson details...');
      const response = await lessonApiService.getLessonById(lesson.id);
      if (response.success) {
        const fullLesson = {
          ...response.data,
          topicId: topicId  // Ensure topicId is included
        };
        console.log('✅ Full lesson loaded, content length:', fullLesson.content?.length || 0);
        setSelectedTopicForLesson(topicId);
        setSelectedLesson(fullLesson);
        setShowLessonModal(true);
        console.log('✅ Modal state set with full lesson data');
      }
    } catch (error: any) {
      console.error('❌ Error loading lesson details:', error);
      toast.error(error.response?.data?.message || 'Failed to load lesson details');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const response = await lessonApiService.deleteLesson(lessonId);
      if (response.success) {
        toast.success('Lesson deleted successfully');
        await loadTopics();
      }
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const handleTogglePublish = async (lessonId: string) => {
    try {
      const response = await lessonApiService.togglePublishStatus(lessonId);
      if (response.success) {
        toast.success(`Lesson ${response.data.isPublished ? 'published' : 'unpublished'} successfully`);
        await loadTopics();
      }
    } catch (error: any) {
      console.error('Error toggling publish status:', error);
      toast.error(error.response?.data?.message || 'Failed to update lesson status');
    }
  };

  const handleTopicSaved = async () => {
    setShowTopicModal(false);
    setSelectedTopic(null);
    await loadTopics();
  };

  const handleLessonSaved = async () => {
    setShowLessonModal(false);
    setSelectedLesson(null);
    setSelectedTopicForLesson(null);
    await loadTopics();
  };

  // Calculate total stats
  const totalLessons = topics.reduce((sum, topic) => sum + (topic._count?.lessons || 0), 0);
  const totalDuration = topics.reduce((sum, topic) => sum + (topic.duration || 0), 0);
  const publishedTopics = topics.filter(t => t.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Topics & Lessons</h2>
            <p className="text-sm text-gray-600 mt-1">Manage course content for {moduleName}</p>
          </div>
          <button
            onClick={handleAddTopic}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Topic
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <FolderOpen size={20} />
              <span className="text-sm font-medium">Topics</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
            <p className="text-xs text-gray-600 mt-1">{publishedTopics} published</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <FileText size={20} />
              <span className="text-sm font-medium">Lessons</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
            <p className="text-xs text-gray-600 mt-1">Across all topics</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Clock size={20} />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
            </p>
            <p className="text-xs text-gray-600 mt-1">Total content</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Eye size={20} />
              <span className="text-sm font-medium">Completion</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">0%</p>
            <p className="text-xs text-gray-600 mt-1">Average progress</p>
          </div>
        </div>
      </div>

      {/* Topics List */}
      {topics.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No topics yet</h3>
          <p className="text-gray-600 mb-6">
            Start building your course by adding your first topic
          </p>
          <button
            onClick={handleAddTopic}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Your First Topic
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              isExpanded={expandedTopics.has(topic.id)}
              onToggleExpand={() => toggleTopic(topic.id)}
              onEdit={handleEditTopic}
              onDelete={handleDeleteTopic}
              onDuplicate={handleDuplicateTopic}
              onAddLesson={handleAddLesson}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
              onTogglePublishLesson={handleTogglePublish}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showTopicModal && (
        <TopicFormModal
          moduleId={moduleId}
          topic={selectedTopic}
          onClose={() => {
            setShowTopicModal(false);
            setSelectedTopic(null);
          }}
          onSaved={handleTopicSaved}
        />
      )}

      {showLessonModal && selectedTopicForLesson && (
        <LessonFormModal
          key={selectedLesson?.id || 'new-lesson'}
          topicId={selectedTopicForLesson}
          lesson={selectedLesson}
          onClose={() => {
            setShowLessonModal(false);
            setSelectedLesson(null);
            setSelectedTopicForLesson(null);
          }}
          onSaved={handleLessonSaved}
        />
      )}
    </div>
  );
}
