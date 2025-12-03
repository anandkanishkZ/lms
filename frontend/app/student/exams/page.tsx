'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  FileText,
  Play,
  Eye,
  CheckCircle,
  AlertCircle,
  Timer,
  Trophy,
  Search,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { examApiService, type Exam } from '@/src/services/exam-api.service';
import { showErrorToast } from '@/src/utils/toast.util';

type ExamTab = 'upcoming' | 'active' | 'completed';

export default function StudentExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ExamTab>('active');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadExams();
    // Refresh every minute to update timers
    const interval = setInterval(loadExams, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadExams = async () => {
    try {
      const data = await examApiService.getAllExams();
      setExams(data);
    } catch (error: any) {
      console.error('Error loading exams:', error);
      showErrorToast(error.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const categorizeExams = () => {
    const now = new Date();
    const upcoming: Exam[] = [];
    const active: Exam[] = [];
    const completed: Exam[] = [];

    exams.forEach((exam) => {
      const startTime = new Date(exam.startTime);
      const endTime = new Date(exam.endTime);

      if (exam.status === 'CANCELLED') {
        return; // Don't show cancelled exams to students
      }

      if (now < startTime) {
        upcoming.push(exam);
      } else if (now >= startTime && now <= endTime) {
        active.push(exam);
      } else {
        completed.push(exam);
      }
    });

    return { upcoming, active, completed };
  };

  const { upcoming, active, completed } = categorizeExams();

  const getCurrentExams = () => {
    const examsMap = {
      upcoming,
      active,
      completed,
    };
    return examsMap[activeTab].filter(
      (exam) =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const currentExams = getCurrentExams();

  const getCountdownText = (endTime: string): string => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MIDTERM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FINAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'QUIZ':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ASSIGNMENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROJECT':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {upcoming.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Now</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {active.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Timer className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {completed.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {(['active', 'upcoming', 'completed'] as ExamTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-2 text-sm">
                    ({tab === 'active' ? active.length : tab === 'upcoming' ? upcoming.length : completed.length})
                  </span>
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Exams Grid */}
        {currentExams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-100"
          >
            <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeTab} exams
            </h3>
            <p className="text-gray-600">
              {activeTab === 'active' && "You don't have any active exams right now."}
              {activeTab === 'upcoming' && 'No upcoming exams scheduled.'}
              {activeTab === 'completed' && "You haven't completed any exams yet."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Card Header */}
                <div
                  className={`p-6 ${
                    activeTab === 'active'
                      ? 'bg-gradient-to-br from-green-50 to-green-100'
                      : activeTab === 'upcoming'
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100'
                  } border-b border-gray-100`}
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(
                        exam.type
                      )}`}
                    >
                      {exam.type}
                    </span>
                    {activeTab === 'active' && (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200 animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {exam.title}
                  </h3>

                  {exam.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {exam.description}
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{exam.subject?.name}</span>
                    {exam.class && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>{exam.class.name}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(exam.startTime)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{exam.duration} minutes</span>
                    <span className="text-gray-400">•</span>
                    <span>{exam.totalMarks} marks</span>
                  </div>

                  {activeTab === 'active' && (
                    <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <Timer className="w-4 h-4" />
                      {getCountdownText(exam.endTime)}
                    </div>
                  )}

                  {activeTab === 'completed' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t border-gray-100">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Submitted</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  {activeTab === 'active' && (
                    <Link
                      href={`/student/exams/${exam.id}/take`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md hover:shadow-lg"
                    >
                      <Play className="w-5 h-5" />
                      Start Exam
                    </Link>
                  )}

                  {activeTab === 'upcoming' && (
                    <div className="flex gap-2">
                      <Link
                        href={`/student/exams/${exam.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Link>
                      <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                        <Clock className="w-4 h-4" />
                        Not Started
                      </div>
                    </div>
                  )}

                  {activeTab === 'completed' && (
                    <Link
                      href={`/student/exams/${exam.id}/result`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Trophy className="w-4 h-4" />
                      View Result
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
  );
}
