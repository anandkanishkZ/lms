'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  Star,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Grid,
  List,
  ChevronDown,
  TrendingUp,
  FileText,
  Archive
} from 'lucide-react';
import Link from 'next/link';
import { teacherApiService } from '@/src/services/teacher-api.service';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/src/utils/toast.util';

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  subjectId: string;
  classId: string | null;
  teacherId: string;
  thumbnailUrl: string | null;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number | null;
  totalTopics: number;
  totalLessons: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  isFeatured: boolean;
  isPublic: boolean;
  viewCount: number;
  enrollmentCount: number;
  avgRating: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  subject?: {
    id: string;
    name: string;
  };
}

interface ModulesResponse {
  success: boolean;
  data: {
    modules: Module[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

type ViewMode = 'grid' | 'list';
type StatusFilter = 'ALL' | Module['status'];
type LevelFilter = 'ALL' | Module['level'];

export default function TeacherModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalModules, setTotalModules] = useState(0);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => {
    loadModules();
  }, [currentPage, statusFilter, levelFilter, searchQuery]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const teacher = teacherApiService.getCurrentUser();
      
      if (!teacher || !teacher.id) {
        console.error('Teacher user not found in localStorage');
        showErrorToast('Please login again');
        return;
      }

      console.log('Loading modules for teacher:', teacher.id);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        teacherId: teacher.id,
      });

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (levelFilter !== 'ALL') {
        params.append('level', levelFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules?${params}`;
      console.log('Fetching modules from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch modules');
      }

      const result: ModulesResponse = await response.json();
      console.log('Modules response:', result);

      if (result.success && result.data) {
        setModules(result.data.modules || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setTotalModules(result.data.pagination?.total || 0);
        console.log('Loaded modules:', result.data.modules.length);
      } else {
        console.error('Invalid response format:', result);
        showErrorToast('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error loading modules:', error);
      showErrorToast(error.message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async (moduleId: string) => {
    try {
      setActionLoading(moduleId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/modules/${moduleId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('teacher_token')}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        showSuccessToast('Module submitted for approval');
        loadModules();
      } else {
        showErrorToast(result.message || 'Failed to submit module');
      }
    } catch (error) {
      console.error('Error submitting module:', error);
      showErrorToast('Failed to submit module');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Module['status']) => {
    const badges = {
      DRAFT: { color: 'bg-gray-100 text-gray-700', icon: FileText, text: 'Draft' },
      PENDING_APPROVAL: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'Pending' },
      APPROVED: { color: 'bg-blue-100 text-[#2563eb]', icon: CheckCircle, text: 'Approved' },
      PUBLISHED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Published' },
      REJECTED: { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Rejected' },
      ARCHIVED: { color: 'bg-gray-100 text-gray-600', icon: Archive, text: 'Archived' },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getLevelBadge = (level: Module['level']) => {
    const colors = {
      BEGINNER: 'bg-green-100 text-green-700',
      INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
      ADVANCED: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[level]}`}>
        {level}
      </span>
    );
  };

  const ModuleCard = ({ module }: { module: Module }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200"
      >
        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          {module.thumbnailUrl ? (
            <img src={module.thumbnailUrl} alt={module.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-12 h-12 text-blue-400" />
          )}
          <div className="absolute top-3 left-3">
            {getStatusBadge(module.status)}
          </div>
          <div className="absolute top-3 right-3">
            {getLevelBadge(module.level)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <Link 
              href={`/teacher/modules/${module.id}`}
              className="block group"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                {module.title}
              </h3>
            </Link>
            {module.subject && (
              <p className="text-sm text-gray-500">{module.subject.name}</p>
            )}
          </div>

          {module.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{module.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <FileText className="w-3.5 h-3.5" />
              <span>{module.totalTopics} Topics</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span>{module.enrollmentCount} Students</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Star className="w-3.5 h-3.5" />
              <span>{module.avgRating?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Eye className="w-3.5 h-3.5" />
              <span>{module.viewCount} Views</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/teacher/modules/${module.id}`}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
            >
              View
            </Link>
            <Link
              href={`/teacher/modules/${module.id}/edit`}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-center"
            >
              Edit
            </Link>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20"
                    >
                      {module.status === 'DRAFT' && (
                        <button
                          onClick={() => {
                            handleSubmitForApproval(module.id);
                            setShowMenu(false);
                          }}
                          disabled={actionLoading === module.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700 transition-colors w-full text-left text-sm"
                        >
                          <Send className="w-4 h-4" />
                          <span>Submit for Approval</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleDeleteModule(module.id);
                          setShowMenu(false);
                        }}
                        disabled={actionLoading === module.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 transition-colors w-full text-left text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const ModuleListItem = ({ module }: { module: Module }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Left: Thumbnail */}
        <div className="md:w-32 h-32 md:h-auto bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
          {module.thumbnailUrl ? (
            <img src={module.thumbnailUrl} alt={module.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-10 h-10 text-blue-400" />
          )}
        </div>

        {/* Middle: Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <Link 
                href={`/teacher/modules/${module.id}`}
                className="block group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer">
                  {module.title}
                </h3>
              </Link>
              {module.subject && (
                <p className="text-sm text-gray-500">{module.subject.name}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-3">
              {getStatusBadge(module.status)}
              {getLevelBadge(module.level)}
            </div>
          </div>

          {module.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{module.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>{module.totalTopics} Topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{module.enrollmentCount} Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              <span>{module.avgRating?.toFixed(1) || '0.0'} Rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{module.viewCount} Views</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row md:flex-col gap-2 p-4 md:border-l border-t md:border-t-0 border-gray-200 bg-gray-50 md:w-36">
          <Link
            href={`/teacher/modules/${module.id}`}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
          >
            View
          </Link>
          <Link
            href={`/teacher/modules/${module.id}/edit`}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium text-center"
          >
            Edit
          </Link>
        </div>
      </div>
    </motion.div>
  );

  if (loading && modules.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-[#2563eb] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Debug Info Panel */}
      {showDebugInfo && (
        <div className="mb-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-yellow-800">Debug Information</h3>
            <button
              onClick={() => setShowDebugInfo(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Teacher ID:</strong> {teacherApiService.getCurrentUser()?.id || 'Not found'}</p>
            <p><strong>Teacher Name:</strong> {teacherApiService.getCurrentUser()?.name || 'Not found'}</p>
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}</p>
            <p><strong>Has Token:</strong> {localStorage.getItem('teacher_token') ? 'Yes' : 'No'}</p>
            <p><strong>Total Modules:</strong> {totalModules}</p>
            <p><strong>Current Page:</strong> {currentPage} / {totalPages}</p>
            <p><strong>Status Filter:</strong> {statusFilter}</p>
            <p><strong>Level Filter:</strong> {levelFilter}</p>
            <p><strong>Search Query:</strong> {searchQuery || 'None'}</p>
          </div>
          <button
            onClick={loadModules}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Reload Modules
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Modules</h1>
            <p className="text-gray-600">
              View and manage modules assigned to you ({totalModules} total)
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="ALL">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className={`w-5 h-5 ${viewMode === 'grid' ? 'text-blue-600' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className={`w-5 h-5 ${viewMode === 'list' ? 'text-blue-600' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid/List */}
      {modules.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No modules assigned yet</h3>
          <p className="text-gray-600 mb-2">You don't have any modules assigned to you.</p>
          <p className="text-sm text-gray-500 mb-6">Contact your administrator to get modules assigned to your account.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-gray-700">
              <strong className="text-[#2563eb]">Note:</strong> Only administrators can create and assign modules to teachers.
            </p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module) => (
                <ModuleListItem key={module.id} module={module} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium ${
                      currentPage === page
                        ? 'bg-[#2563eb] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
