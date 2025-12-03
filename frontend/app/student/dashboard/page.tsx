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
  ClipboardCheck,
  Clock,
  AlertCircle,
  Trophy,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { studentApiService, ModuleEnrollment } from '@/src/services/student-api.service';
import { examApiService, type Exam } from '@/src/services/exam-api.service';
import { showErrorToast } from '@/src/utils/toast.util';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [enrolledModules, setEnrolledModules] = useState<ModuleEnrollment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEnrollments();
    fetchExams();
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

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const data = await examApiService.getAllExams();
      setExams(data);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoadingExams(false);
    }
  };

  const categorizeExams = () => {
    const now = new Date();
    const upcoming: Exam[] = [];
    const active: Exam[] = [];
    const completed: Exam[] = [];

    exams.forEach((exam) => {
      if (exam.status === 'CANCELLED') return;
      
      const startTime = new Date(exam.startTime);
      const endTime = new Date(exam.endTime);

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

  const { upcoming: upcomingExams, active: activeExams, completed: completedExams } = categorizeExams();

  const getTimeRemaining = (endTime: string): string => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter modules based on search
  const filteredModules = enrolledModules.filter(enrollment => {
    const matchesSearch = enrollment.module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          enrollment.module.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
      <div className="p-6 space-y-8">
        {/* Development Notice Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 space-y-3">
              {/* English Message */}
              <div>
                <h3 className="text-lg font-bold text-amber-900 mb-2">🚧 System Under Development</h3>
                <p className="text-amber-800 leading-relaxed">
                  <strong>Please Note:</strong> This Learning Management System is currently under active development. 
                  You may encounter bugs, errors, or features that are not fully functional. We are working hard to 
                  bring you the best possible learning experience. Thank you for your patience and understanding!
                </p>
              </div>
              
              {/* Nepali Message */}
              <div className="pt-3 border-t border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 mb-2">🚧 प्रणाली विकासाधीन छ</h3>
                <p className="text-amber-800 leading-relaxed">
                  <strong>कृपया ध्यान दिनुहोस्:</strong> यो सिकाइ व्यवस्थापन प्रणाली हाल सक्रिय विकासमा छ। 
                  तपाईंले केही बगहरू, त्रुटिहरू वा पूर्ण रूपमा काम नगर्ने सुविधाहरू अनुभव गर्न सक्नुहुन्छ। 
                  हामी तपाईंलाई उत्कृष्ट सिकाइ अनुभव प्रदान गर्न कडा मेहनत गरिरहेका छौं। 
                  तपाईंको धैर्य र समझदारीको लागि धन्यवाद!
                </p>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-amber-700 font-medium">
                  We appreciate your cooperation | हामी तपाईंको सहयोगको कदर गर्छौं
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Exam Section - Only show if there are active or upcoming exams */}
        {!loadingExams && (activeExams.length > 0 || upcomingExams.length > 0) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClipboardCheck className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Exams</h2>
                  <p className="text-sm text-gray-600">Active and upcoming assessments</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/student/exams')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                View All Exams
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <>
              {/* Active Exams - Urgent */}
              {activeExams.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    ACTIVE NOW - Take Immediately
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeExams.slice(0, 3).map((exam, index) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-orange-400"
                        onClick={() => router.push(`/student/exams/${exam.id}/take`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
                            {exam.type}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            {getTimeRemaining(exam.endTime)}
                          </div>
                        </div>
                        <h4 className="font-bold text-lg mb-2 line-clamp-2">{exam.title}</h4>
                        <p className="text-sm text-white/90 mb-3">{exam.subject?.name}</p>
                        <div className="flex items-center justify-between text-xs mb-4">
                          <span>{exam.totalMarks} marks</span>
                          <span>{exam.duration} min</span>
                        </div>
                        <button className="w-full py-2.5 bg-white text-orange-600 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors">
                          <ClipboardCheck className="w-4 h-4" />
                          Start Exam Now
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Exams */}
              {upcomingExams.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Upcoming Exams
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingExams.slice(0, 2).map((exam, index) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl p-5 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => router.push('/student/exams')}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                            {exam.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(exam.startTime)}
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{exam.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{exam.subject?.name}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {exam.totalMarks} marks
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exam.duration} min
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          </div>
        )}

        {/* Divider - Only show if exams section is visible */}
        {!loadingExams && (activeExams.length > 0 || upcomingExams.length > 0) && (
          <div className="border-t border-gray-200"></div>
        )}

        {/* Courses Section - Clean & Simple */}
        <div>
          {/* Header - Minimal */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
                <p className="text-sm text-gray-600">
                  {!loadingEnrollments && enrolledModules.length > 0 
                    ? `${enrolledModules.length} ${enrolledModules.length === 1 ? 'course' : 'courses'} enrolled`
                    : 'Continue your learning journey'}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Course Cards - Horizontal Layout */}
          {loadingEnrollments ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">Loading your courses...</p>
              </div>
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No Matching Courses' : 'No Courses Yet'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'You haven\'t enrolled in any courses yet.'}
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
            <div className="space-y-4">
              {filteredModules.map((enrollment, index) => {
                const progress = enrollment.progress || 0;
                const isCompleted = !!enrollment.completedAt;
                
                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
                    onClick={() => router.push(`/modules/${enrollment.module.slug}`)}
                  >
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Left: Course Info */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {enrollment.module.title}
                            </h3>
                            {enrollment.module.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {enrollment.module.description}
                              </p>
                            )}
                          </div>
                          {isCompleted && (
                            <div className="ml-3 flex-shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {enrollment.module.topicsCount || 0} Topics
                          </span>
                          {enrollment.module.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {enrollment.module.duration}h
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Progress</span>
                            <span className="text-xs font-semibold text-gray-900">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                isCompleted 
                                  ? 'bg-green-500' 
                                  : progress > 0 
                                  ? 'bg-blue-500' 
                                  : 'bg-gray-400'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Button */}
                      <div className="flex items-center justify-center p-5 md:border-l border-t md:border-t-0 border-gray-200 bg-gray-50 md:w-40">
                        <button className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 whitespace-nowrap">
                          {isCompleted ? (
                            <>
                              Review
                              <ChevronRight className="w-4 h-4" />
                            </>
                          ) : progress > 0 ? (
                            <>
                              Continue
                              <ChevronRight className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Start
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
