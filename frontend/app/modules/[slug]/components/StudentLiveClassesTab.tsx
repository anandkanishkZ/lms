'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Calendar,
  Radio,
  CheckCircle,
  Search,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { liveClassApiService, LiveClass } from '@/src/services/live-class-api.service';
import { StudentLiveClassCard } from './StudentLiveClassCard';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';

interface StudentLiveClassesTabProps {
  moduleId: string;
  moduleName: string;
}

export function StudentLiveClassesTab({ moduleId, moduleName }: StudentLiveClassesTabProps) {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
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

    // Sort by start time (upcoming first, then most recent)
    filtered.sort((a, b) => {
      const now = new Date();
      const aStart = new Date(a.startTime);
      const bStart = new Date(b.startTime);
      
      // Live classes first
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
      
      // Then upcoming classes
      if (aStart > now && bStart > now) {
        return aStart.getTime() - bStart.getTime(); // Soonest first
      }
      
      // Then past classes (most recent first)
      return bStart.getTime() - aStart.getTime();
    });

    setFilteredClasses(filtered);
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
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2563eb] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading live classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Live Classes</h2>
            <p className="text-white/80 text-sm">YouTube live sessions for {moduleName}</p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/80">Total</span>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/80">Upcoming</span>
            </div>
            <p className="text-3xl font-bold">{stats.upcoming}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-5 h-5 text-white/80 animate-pulse" />
              <span className="text-sm text-white/80">Live Now</span>
            </div>
            <p className="text-3xl font-bold">{stats.live}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/80">Completed</span>
            </div>
            <p className="text-3xl font-bold">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search live classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent appearance-none bg-white cursor-pointer min-w-[180px]"
          >
            <option value="ALL">All Status</option>
            <option value="LIVE">Live Now</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Live Classes List */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border-2 border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || filterStatus !== 'ALL' ? 'No Matching Classes' : 'No Live Classes Yet'}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchQuery || filterStatus !== 'ALL'
              ? 'Try adjusting your search or filter to see more results.'
              : 'Your instructor hasn\'t scheduled any live classes for this module yet.'}
          </p>
          {(searchQuery || filterStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
              }}
              className="mt-4 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg transition-colors text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredClasses.map((liveClass, index) => (
              <motion.div
                key={liveClass.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <StudentLiveClassCard 
                  liveClass={liveClass}
                  moduleName={moduleName}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
