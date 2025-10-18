'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, UserPlus, Users, Search, X, Trash2, Check } from 'lucide-react';
import { AdminLayout } from '@/src/features/admin';
import { Button } from '@/src/components/ui/button';
import { moduleApi } from '@/src/services/module-api.service';
import adminApiService from '@/src/services/admin-api.service';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';
import type { ModuleEnrollment } from '@/src/features/modules/types';
import type { UserItem } from '@/src/features/admin/types';

export default function EnrollStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params?.id as string;

  const [module, setModule] = useState<any>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<ModuleEnrollment[]>([]);
  const [allStudents, setAllStudents] = useState<UserItem[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<UserItem[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Fetch module and enrollment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch module details
        const moduleData = await moduleApi.getModuleById(moduleId);
        setModule(moduleData);

        // Fetch enrolled students
        const enrollments = await moduleApi.getModuleEnrollments(moduleId);
        setEnrolledStudents(enrollments || []);

        // Fetch all students
        const studentsResponse = await adminApiService.getUsers({ 
          role: 'STUDENT',
          limit: 1000 // Get all students
        });
        
        if (studentsResponse.success && studentsResponse.data) {
          const students = studentsResponse.data.users;
          setAllStudents(students);
          
          // Filter out already enrolled students
          const enrolledIds = new Set((enrollments || []).map(e => e.studentId));
          const availableStudents = students.filter((s: UserItem) => !enrolledIds.has(s.id));
          setFilteredStudents(availableStudents);
        }
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        showErrorToast(error?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId) {
      fetchData();
    }
  }, [moduleId]);

  // Filter students based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      const enrolledIds = new Set(enrolledStudents.map(e => e.studentId));
      setFilteredStudents(allStudents.filter(s => !enrolledIds.has(s.id)));
      return;
    }

    const query = searchQuery.toLowerCase();
    const enrolledIds = new Set(enrolledStudents.map(e => e.studentId));
    const filtered = allStudents.filter(student => {
      if (enrolledIds.has(student.id)) return false;
      
      const name = student.name?.toLowerCase() || '';
      const email = student.email?.toLowerCase() || '';
      const symbolNo = student.symbolNo?.toLowerCase() || '';
      
      return name.includes(query) || email.includes(query) || symbolNo.includes(query);
    });
    
    setFilteredStudents(filtered);
  }, [searchQuery, allStudents, enrolledStudents]);

  const handleBack = () => {
    router.push(`/admin/courses/${moduleId}`);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleEnrollSelected = async () => {
    if (selectedStudents.length === 0) {
      showErrorToast('Please select at least one student');
      return;
    }

    try {
      setIsEnrolling(true);

      if (selectedStudents.length === 1) {
        // Single enrollment
        await moduleApi.createEnrollment({
          moduleId,
          studentId: selectedStudents[0],
        } as any);
        showSuccessToast('Student enrolled successfully');
      } else {
        // Bulk enrollment
        const result = await moduleApi.bulkEnrollStudents({
          moduleId,
          studentIds: selectedStudents,
        } as any);
        showSuccessToast(`${result.enrolled} students enrolled successfully`);
      }

      // Refresh data
      const enrollments = await moduleApi.getModuleEnrollments(moduleId);
      setEnrolledStudents(enrollments || []);
      
      // Reset selection and filter
      setSelectedStudents([]);
      setSearchQuery('');
      setShowEnrollModal(false);

      // Update filtered students
      const enrolledIds = new Set((enrollments || []).map(e => e.studentId));
      setFilteredStudents(allStudents.filter(s => !enrolledIds.has(s.id)));
    } catch (error: any) {
      console.error('Failed to enroll students:', error);
      showErrorToast(error?.message || 'Failed to enroll students');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to unenroll this student?')) {
      return;
    }

    try {
      await moduleApi.deleteEnrollment(enrollmentId);
      showSuccessToast('Student unenrolled successfully');

      // Refresh enrolled students
      const enrollments = await moduleApi.getModuleEnrollments(moduleId);
      setEnrolledStudents(enrollments || []);

      // Update available students
      const enrolledIds = new Set((enrollments || []).map(e => e.studentId));
      setFilteredStudents(allStudents.filter(s => !enrolledIds.has(s.id)));
    } catch (error: any) {
      console.error('Failed to unenroll student:', error);
      showErrorToast(error?.message || 'Failed to unenroll student');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading..." description="Please wait">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Manage Enrollments - ${module?.title || 'Module'}`}
      description="Enroll and manage students in this module"
    >
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {module?.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {enrolledStudents.length} students enrolled
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowEnrollModal(true)}
              className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
            >
              <UserPlus className="h-4 w-4" />
              Enroll Students
            </Button>
          </div>
        </div>

        {/* Enrolled Students List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2563eb]" />
              Enrolled Students ({enrolledStudents.length})
            </h3>
          </div>

          <div className="p-6">
            {enrolledStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No students enrolled yet
                </p>
                <Button
                  onClick={() => setShowEnrollModal(true)}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enroll Your First Student
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {enrolledStudents.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-semibold">
                        {enrollment.student?.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {enrollment.student?.name || 'Unknown Student'}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          {enrollment.student?.email && (
                            <span>{enrollment.student.email}</span>
                          )}
                          {enrollment.student?.symbolNo && (
                            <span className="flex items-center gap-1">
                              <span className="text-gray-400">•</span>
                              Symbol: {enrollment.student.symbolNo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnenroll(enrollment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enroll Students Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Enroll Students
                  </h3>
                  <button
                    onClick={() => {
                      setShowEnrollModal(false);
                      setSelectedStudents([]);
                      setSearchQuery('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or symbol number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {selectedStudents.length > 0 && (
                  <div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <span className="text-sm font-medium text-[#2563eb]">
                      {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={() => setSelectedStudents([])}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>

              {/* Students List */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchQuery 
                        ? 'No students found matching your search'
                        : 'All students are already enrolled'
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} available
                      </span>
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-[#2563eb] hover:text-[#1d4ed8] font-medium"
                      >
                        {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedStudents.includes(student.id)
                              ? 'border-[#2563eb] bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold">
                              {student.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {student.name || 'Unknown Student'}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                {student.email && <span>{student.email}</span>}
                                {student.symbolNo && (
                                  <span className="flex items-center gap-1">
                                    <span className="text-gray-400">•</span>
                                    Symbol: {student.symbolNo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                              selectedStudents.includes(student.id)
                                ? 'bg-[#2563eb] border-[#2563eb]'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {selectedStudents.includes(student.id) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEnrollModal(false);
                      setSelectedStudents([]);
                      setSearchQuery('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEnrollSelected}
                    disabled={selectedStudents.length === 0 || isEnrolling}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEnrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Enroll {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
