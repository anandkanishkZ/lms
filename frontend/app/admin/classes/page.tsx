'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  GraduationCap,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getAllClasses, deleteClass, toggleClassStatus, type Class } from '@/services/class-api.service';
import { AdminLayout } from '@/src/features/admin';

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [showPermanentConfirm, setShowPermanentConfirm] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClasses();
  }, [searchTerm, activeFilter, currentPage]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }

      if (activeFilter !== 'all') {
        filters.isActive = activeFilter === 'active';
      }

      const response = await getAllClasses(filters);

      if (response.success && response.data) {
        // Ensure data is an array
        const classesData = Array.isArray(response.data) ? response.data : [];
        setClasses(classesData);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalClasses(response.pagination.total);
        }
      } else {
        // If no data, set empty array
        setClasses([]);
      }
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      alert(error.message || 'Failed to fetch classes');
      setClasses([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId: string, hardDelete: boolean = false) => {
    try {
      const response = await deleteClass(classId, hardDelete);
      if (response.success) {
        alert(response.message || 'Class deleted successfully');
        fetchClasses();
        setDeleteConfirm(null);
        setShowDeleteModal(false);
        setShowPermanentConfirm(false);
        setClassToDelete(null);
        setDeleteType(null);
        setConfirmText('');
      }
    } catch (error: any) {
      console.error('Error deleting class:', error);
      alert(error.message || 'Failed to delete class');
    }
  };

  const openDeleteModal = (classId: string, className: string) => {
    setClassToDelete({ id: classId, name: className });
    setShowDeleteModal(true);
    setDeleteType(null);
    setConfirmText('');
    setShowPermanentConfirm(false);
  };

  const handleDeactivate = () => {
    if (classToDelete) {
      handleDelete(classToDelete.id, false);
    }
  };

  const handlePermanentDeleteRequest = () => {
    setShowPermanentConfirm(true);
  };

  const handlePermanentDeleteConfirm = () => {
    if (confirmText === 'DELETE' && classToDelete) {
      handleDelete(classToDelete.id, true);
    } else {
      alert('Please type DELETE exactly to confirm permanent deletion.');
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setShowPermanentConfirm(false);
    setClassToDelete(null);
    setDeleteType(null);
    setConfirmText('');
  };

  const handleToggleStatus = async (classId: string) => {
    try {
      const response = await toggleClassStatus(classId);
      if (response.success) {
        alert('Class status updated successfully');
        fetchClasses();
      }
    } catch (error: any) {
      console.error('Error toggling class status:', error);
      alert(error.message || 'Failed to update class status');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchClasses();
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Class Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage classes, assign teachers, and track academic progress
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/classes/create')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create Class
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900">{totalClasses}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Classes</p>
              <p className="text-3xl font-bold text-gray-900">
                {Array.isArray(classes) ? classes.filter((c) => c.isActive).length : 0}
              </p>
            </div>
            <ToggleRight className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Page</p>
              <p className="text-3xl font-bold text-gray-900">
                {currentPage} / {totalPages}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by class name, section, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('active');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('inactive');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </form>
      </div>

      {/* Classes Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading classes...</p>
        </div>
      ) : !Array.isArray(classes) || classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'No classes match your search criteria'
              : 'Get started by creating your first class'}
          </p>
          <button
            onClick={() => router.push('/admin/classes/create')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Class
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teachers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {classItem.name}
                        </div>
                        {classItem.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {classItem.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {classItem.section || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {classItem._count?.students || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                      {classItem._count?.teachers || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(classItem.id)}
                      className="flex items-center gap-2"
                    >
                      {classItem.isActive ? (
                        <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <ToggleRight className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <ToggleLeft className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/classes/${classItem.id}`)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/classes/${classItem.id}/edit`)}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(classItem.id, classItem.name)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && classToDelete && !showPermanentConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white bg-opacity-20 rounded-full">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Delete Class</h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-6 text-center">
                Are you sure you want to delete{' '}
                <span className="font-bold text-gray-900 text-lg block mt-2">
                  "{classToDelete.name}"
                </span>
              </p>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-5 mb-6 shadow-sm">
                <p className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Choose delete type:
                </p>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="font-semibold text-amber-900 text-sm">Deactivate (Soft Delete)</p>
                        <p className="text-xs text-amber-700 mt-1">Makes the class inactive but keeps all data. Can be reactivated later.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="font-semibold text-red-900 text-sm">Permanent Delete (Hard Delete)</p>
                        <p className="text-xs text-red-700 mt-1">⚠️ Completely removes the class and all related data. This action cannot be undone!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Deactivate
                </button>
                <button
                  onClick={handlePermanentDeleteRequest}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Permanent Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showPermanentConfirm && classToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-slideUp">
            {/* Danger Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white bg-opacity-20 rounded-full animate-pulse">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">⚠️ Permanent Deletion</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone!</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-5">
                <p className="text-red-900 font-semibold mb-3 text-center">
                  You are about to permanently delete:
                </p>
                <p className="text-red-800 font-bold text-lg text-center bg-white rounded-lg py-2 px-3 border border-red-300">
                  {classToDelete.name}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">This will permanently remove:</p>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    All class data and settings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Student enrollments
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Teacher assignments
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    All related records
                  </li>
                </ul>
              </div>

              {/* Confirmation Input */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Type <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-center font-mono text-lg"
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPermanentConfirm(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105"
                >
                  Go Back
                </button>
                <button
                  onClick={handlePermanentDeleteConfirm}
                  disabled={confirmText !== 'DELETE'}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all transform ${
                    confirmText === 'DELETE'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:scale-105 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {confirmText === 'DELETE' ? '🗑️ Confirm Delete' : 'Type DELETE to Enable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
