'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Video,
  Calendar,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  Radio,
  CheckCircle,
} from 'lucide-react';
import { liveClassApiService, LiveClass } from '@/src/services/live-class-api.service';
import { LiveClassCard } from './LiveClassCard';
import { LiveClassFormModal, LiveClassFormData } from './LiveClassFormModal';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

interface LiveClassTabProps {
  moduleId: string;
  moduleName: string;
  subjectId: string;
  classId: string;
}

export function LiveClassTab({ moduleId, moduleName, subjectId, classId }: LiveClassTabProps) {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadLiveClasses();
  }, [moduleId]);

  useEffect(() => {
    filterLiveClasses();
  }, [liveClasses, searchQuery, filterStatus]);

  const loadLiveClasses = async () => {
    try {
      setLoading(true);
      const response = await liveClassApiService.getModuleLiveClasses(moduleId);
      
      if (response.data.success) {
        setLiveClasses(response.data.data.liveClasses);
      }
    } catch (error: any) {
      console.error('Error loading live classes:', error);
      showErrorToast(error.message || 'Failed to load live classes');
    } finally {
      setLoading(false);
    }
  };

  const filterLiveClasses = () => {
    let filtered = [...liveClasses];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lc) =>
          lc.title.toLowerCase().includes(query) ||
          lc.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((lc) => lc.status === filterStatus);
    }

    // Sort by start time (most recent first)
    filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    setFilteredClasses(filtered);
  };

  const handleCreate = () => {
    setEditingClass(null);
    setShowFormModal(true);
  };

  const handleEdit = (liveClass: LiveClass) => {
    setEditingClass(liveClass);
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await liveClassApiService.deleteLiveClass(id);
      showSuccessToast('Live class deleted successfully');
      loadLiveClasses();
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to delete live class');
    }
  };

  const handleSubmit = async (formData: LiveClassFormData) => {
    try {
      if (editingClass) {
        // Update existing
        await liveClassApiService.updateLiveClass(editingClass.id, {
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
        });
        showSuccessToast('Live class updated successfully');
      } else {
        // Create new
        await liveClassApiService.createLiveClass({
          ...formData,
          moduleId,
          subjectId,
          classId,
          startTime: new Date(formData.startTime).toISOString(),
        });
        showSuccessToast('Live class created successfully');
      }
      
      loadLiveClasses();
      setShowFormModal(false);
    } catch (error: any) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const getStats = () => {
    const total = liveClasses.length;
    const upcoming = liveClasses.filter(
      (lc) => lc.status === 'SCHEDULED' && new Date(lc.startTime) > new Date()
    ).length;
    const live = liveClasses.filter((lc) => lc.status === 'LIVE').length;
    const completed = liveClasses.filter((lc) => lc.status === 'COMPLETED').length;

    return { total, upcoming, live, completed };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Live Classes</h2>
            <p className="text-blue-100">Manage YouTube live sessions for this module</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#2563eb] rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Live Class
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-5 h-5" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Upcoming</span>
            </div>
            <p className="text-3xl font-bold">{stats.upcoming}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-5 h-5" />
              <span className="text-sm font-medium">Live Now</span>
            </div>
            <p className="text-3xl font-bold">{stats.live}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-3xl font-bold">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search live classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="LIVE">Live Now</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Classes List */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center border-2 border-dashed border-gray-300">
          {liveClasses.length === 0 ? (
            <>
              <Video className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No live classes yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start engaging with your students by scheduling YouTube live classes for this module
              </p>
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors inline-flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Schedule Your First Live Class
              </button>
            </>
          ) : (
            <>
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching results</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredClasses.map((liveClass) => (
              <LiveClassCard
                key={liveClass.id}
                liveClass={liveClass}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Modal */}
      <LiveClassFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingClass(null);
        }}
        onSubmit={handleSubmit}
        liveClass={editingClass}
        moduleId={moduleId}
        moduleTitle={moduleName}
      />
    </div>
  );
}
