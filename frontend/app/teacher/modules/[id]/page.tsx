'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Star,
  TrendingUp,
  FileText,
  Upload,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Download,
  Link as LinkIcon,
  File,
  Video,
  Image as ImageIcon,
  Music,
  Archive,
  Code,
  X,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Filter,
  Search,
} from 'lucide-react';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/src/utils/toast.util';
import { TopicsLessonsTab } from './components/TopicsLessonsTab';
import { ResourceActionsModal } from './components/ResourceActionsModal';

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  subject?: {
    id: string;
    name: string;
  };
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  viewCount: number;
  enrollmentCount: number;
  totalTopics: number;
  totalLessons: number;
}

interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'PDF' | 'DOCUMENT' | 'PRESENTATION' | 'SPREADSHEET' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'LINK' | 'YOUTUBE' | 'ARCHIVE' | 'CODE' | 'OTHER';
  category: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  externalUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';
  isHidden: boolean;
  isPinned: boolean;
  isMandatory: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
  };
}

type TabType = 'overview' | 'resources' | 'topics';

export default function TeacherModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.id as string;

  const [module, setModule] = useState<Module | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    if (moduleId) {
      loadModuleData();
    }
  }, [moduleId]);

  const loadModuleData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadModule(), loadResources()]);
    } catch (error: any) {
      console.error('Error loading module data:', error);
      showErrorToast(error.message || 'Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  const loadModule = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch module');
    const result = await response.json();
    setModule(result.data);
  };

  const loadResources = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/resources/modules/${moduleId}?includeHidden=true`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch resources');
    const result = await response.json();
    setResources(result.data.resources || []);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
      case 'HIDDEN': return 'bg-orange-100 text-orange-800';
      case 'ARCHIVED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-blue-100 text-blue-800';
      case 'INTERMEDIATE': return 'bg-purple-100 text-purple-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || resource.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'VISIBLE' && !resource.isHidden) ||
                         (filterStatus === 'HIDDEN' && resource.isHidden);
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Module Not Found</h2>
        <button
          onClick={() => router.push('/teacher/modules')}
          className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8]"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/teacher/modules')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{module.subject?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                {module.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(module.level)}`}>
                {module.level}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600">Enrolled</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{module.enrollmentCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Views</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{module.viewCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600">Topics</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{module.totalTopics}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600">Lessons</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{module.totalLessons}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'resources'
                  ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'topics'
                  ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Topics & Lessons
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {module.description || 'No description available.'}
              </p>
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <ResourcesTab
              moduleId={moduleId}
              resources={filteredResources}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterType={filterType}
              setFilterType={setFilterType}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onAddResource={() => setShowAddResourceModal(true)}
              onReload={loadResources}
            />
          )}

          {activeTab === 'topics' && (
            <TopicsLessonsTab 
              moduleId={moduleId} 
              moduleName={module.title} 
            />
          )}
        </AnimatePresence>
      </div>

      {/* Add Resource Modal */}
      {showAddResourceModal && (
        <AddResourceModal
          moduleId={moduleId}
          onClose={() => setShowAddResourceModal(false)}
          onSuccess={() => {
            setShowAddResourceModal(false);
            loadResources();
          }}
        />
      )}
    </div>
  );
}

// Resources Tab Component
function ResourcesTab({
  moduleId,
  resources,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  onAddResource,
  onReload,
}: {
  moduleId: string;
  resources: Resource[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  onAddResource: () => void;
  onReload: () => void;
}) {
  return (
    <motion.div
      key="resources"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Toolbar */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Content Resources</h2>
          <button
            onClick={onAddResource}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
          >
            <option value="ALL">All Types</option>
            <option value="PDF">PDF</option>
            <option value="DOCUMENT">Document</option>
            <option value="VIDEO">Video</option>
            <option value="IMAGE">Image</option>
            <option value="LINK">Link</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="VISIBLE">Visible</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </div>
      </div>

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources yet</h3>
          <p className="text-gray-600 mb-6">Start adding learning materials for your students</p>
          <button
            onClick={onAddResource}
            className="px-6 py-3 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8]"
          >
            Add First Resource
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} onUpdate={onReload} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Resource Card Component
function ResourceCard({ resource, onUpdate }: { resource: Resource; onUpdate: () => void }) {
  const [showActionsModal, setShowActionsModal] = useState(false);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <File className="w-5 h-5 text-red-600" />;
      case 'DOCUMENT': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'VIDEO': return <Video className="w-5 h-5 text-purple-600" />;
      case 'IMAGE': return <ImageIcon className="w-5 h-5 text-green-600" />;
      case 'AUDIO': return <Music className="w-5 h-5 text-orange-600" />;
      case 'LINK': return <LinkIcon className="w-5 h-5 text-blue-600" />;
      case 'ARCHIVE': return <Archive className="w-5 h-5 text-gray-600" />;
      case 'CODE': return <Code className="w-5 h-5 text-yellow-600" />;
      default: return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <>
      <div className={`bg-white rounded-lg p-4 border-2 transition-all ${
        resource.isHidden ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200 hover:border-[#2563eb]'
      }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-3 bg-gray-100 rounded-lg">
          {getResourceIcon(resource.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {resource.title}
                {resource.isPinned && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Pinned
                  </span>
                )}
                {resource.isMandatory && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                    Mandatory
                  </span>
                )}
                {resource.isHidden && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Hidden
                  </span>
                )}
              </h3>
              {resource.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {resource.viewCount} views
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {resource.downloadCount} downloads
                </span>
                {resource.fileSize && <span>{formatFileSize(resource.fileSize)}</span>}
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="relative">
              <button
                onClick={() => setShowActionsModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Resource Actions Modal */}
      <ResourceActionsModal
        resource={{
          id: resource.id,
          title: resource.title,
          isHidden: resource.isHidden,
        }}
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}

// Add Resource Modal
function AddResourceModal({
  moduleId,
  onClose,
  onSuccess,
}: {
  moduleId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PDF' as Resource['type'],
    category: 'LECTURE_NOTE',
    externalUrl: '',
    isPinned: false,
    isMandatory: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showErrorToast('Please enter a title');
      return;
    }

    if (!file && !formData.externalUrl && formData.type !== 'LINK') {
      showErrorToast('Please upload a file or provide a URL');
      return;
    }

    try {
      setIsUploading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isPinned', String(formData.isPinned));
      formDataToSend.append('isMandatory', String(formData.isMandatory));
      
      if (file) {
        formDataToSend.append('resource', file);
      }
      
      if (formData.externalUrl) {
        formDataToSend.append('externalUrl', formData.externalUrl);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/resources/modules/${moduleId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create resource');
      }

      showSuccessToast('Resource added successfully');
      onSuccess();
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to add resource');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add New Resource</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              placeholder="e.g., Chapter 1 Notes"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              placeholder="Brief description of the resource"
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              >
                <option value="PDF">PDF</option>
                <option value="DOCUMENT">Document</option>
                <option value="PRESENTATION">Presentation</option>
                <option value="VIDEO">Video</option>
                <option value="IMAGE">Image</option>
                <option value="LINK">External Link</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              >
                <option value="LECTURE_NOTE">Lecture Note</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="REFERENCE_MATERIAL">Reference Material</option>
                <option value="PRACTICE_QUESTION">Practice Question</option>
                <option value="SOLUTION">Solution</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          {formData.type !== 'LINK' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.jpg,.jpeg,.png,.zip"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm font-medium text-gray-700"
                >
                  Choose File
                </label>
              </div>
            </div>
          )}

          {/* External URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              External URL (optional)
            </label>
            <input
              type="url"
              value={formData.externalUrl}
              onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 text-[#2563eb] rounded focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Pin to top</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isMandatory}
                onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                className="w-4 h-4 text-[#2563eb] rounded focus:ring-[#2563eb]"
              />
              <span className="text-sm text-gray-700">Mark as mandatory</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Add Resource
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
