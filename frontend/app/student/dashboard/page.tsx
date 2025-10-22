'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Search,
  CheckCircle2,
  ChevronRight,
  Target,
} from 'lucide-react';
import { studentApiService, ModuleEnrollment } from '@/src/services/student-api.service';
import { showErrorToast } from '@/src/utils/toast.util';
import StudentLayout from '@/src/components/student/StudentLayout';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [enrolledModules, setEnrolledModules] = useState<ModuleEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const enrollments = await studentApiService.getMyEnrollments();
      setEnrolledModules(enrollments);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      showErrorToast('Failed to load enrolled courses');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Filter modules based on search
  const filteredModules = enrolledModules.filter(enrollment => {
    const matchesSearch = enrollment.module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          enrollment.module.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <StudentLayout 
      title="My Courses" 
      subtitle="View and manage your enrolled courses"
    >
      <div className="p-6">
              {/* Search Bar - Clean & Prominent */}
              <div className="mb-6">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your courses by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-sm"
                  />
                </div>
              </div>

              {/* Stats Summary - Beautiful Cards */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  You are enrolled in <span className="font-bold text-blue-600">{enrolledModules.length}</span> {enrolledModules.length === 1 ? 'course' : 'courses'}
                </p>
              </div>

              {/* Course Cards - Modern Design */}
              {loadingEnrollments ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading your courses...</p>
                  </div>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'No Matching Courses' : 'No Courses Yet'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {searchTerm 
                      ? 'Try adjusting your search terms or clear the search to see all courses.' 
                      : 'You haven\'t enrolled in any courses yet. Contact your instructor to get started.'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredModules.map((enrollment, index) => {
                    const progress = enrollment.progress || 0;
                    const isCompleted = !!enrollment.completedAt;
                    
                    return (
                      <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                        onClick={() => router.push(`/modules/${enrollment.module.slug}`)}
                      >
                        {/* Course Header */}
                        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-600 p-6">
                          {isCompleted && (
                            <div className="absolute top-4 right-4 bg-white rounded-full p-2">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                          <div className="absolute bottom-4 left-6 right-6">
                            <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                              {enrollment.module.title}
                            </h3>
                          </div>
                        </div>

                        {/* Course Content */}
                        <div className="p-5">
                          {enrollment.module.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {enrollment.module.description}
                            </p>
                          )}

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-600">Progress</span>
                              <span className="text-xs font-bold text-blue-600">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  isCompleted 
                                    ? 'bg-green-500' 
                                    : progress > 60 
                                    ? 'bg-blue-500' 
                                    : 'bg-blue-400'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Course Meta */}
                          <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {enrollment.module.topicsCount || 0} Topics
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3.5 h-3.5" />
                              {enrollment.module.duration ? `${enrollment.module.duration}h` : 'N/A'}
                            </span>
                          </div>

                          {/* Action Button */}
                          <button className="w-full py-2.5 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm">
                            {isCompleted ? 'Review Course' : progress > 0 ? 'Continue Learning' : 'Start Course'}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
      </div>
    </StudentLayout>
  );
}
