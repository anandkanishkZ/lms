'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  BookOpen,
  Users,
  AlertCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { moduleApprovalApiService, PendingModule, ModuleApprovalStats } from '@/src/services/module-approval-api.service';
import { AdminLayout } from '@/src/features/admin';

export default function ModuleApprovalsPage() {
  const [pendingModules, setPendingModules] = useState<PendingModule[]>([]);
  const [stats, setStats] = useState<ModuleApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<PendingModule | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, modulesData] = await Promise.all([
        moduleApprovalApiService.getStats(),
        moduleApprovalApiService.getPendingModules(1, 50),
      ]);

      setStats(statsData);
      setPendingModules(modulesData.modules);
    } catch (error: any) {
      console.error('Error loading approval data:', error);
      toast.error(error.message || 'Failed to load approval data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (moduleId: string, publishImmediately: boolean = false) => {
    try {
      setActionLoading(moduleId);
      await moduleApprovalApiService.approveModule(moduleId, publishImmediately);
      toast.success(
        publishImmediately
          ? 'Module approved and published successfully!'
          : 'Module approved successfully!'
      );
      loadData(); // Refresh data
    } catch (error: any) {
      console.error('Error approving module:', error);
      toast.error(error.message || 'Failed to approve module');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (module: PendingModule) => {
    setSelectedModule(module);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedModule || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(selectedModule.id);
      await moduleApprovalApiService.rejectModule(selectedModule.id, rejectionReason);
      toast.success('Module rejected successfully');
      setShowRejectModal(false);
      setSelectedModule(null);
      setRejectionReason('');
      loadData(); // Refresh data
    } catch (error: any) {
      console.error('Error rejecting module:', error);
      toast.error(error.message || 'Failed to reject module');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Module Approvals"
        description="Review and approve module submissions from teachers"
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading approval requests...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Module Approvals"
      description="Review and approve module submissions from teachers"
    >
      <div className="p-6">

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Approved</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Published</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.published}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pending Modules List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Pending Approval Requests</h2>
          <p className="text-sm text-gray-600 mt-1">
            {pendingModules.length} {pendingModules.length === 1 ? 'module' : 'modules'} waiting for
            approval
          </p>
        </div>

        {pendingModules.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">There are no pending module approval requests at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {module.thumbnailUrl ? (
                      <img
                        src={module.thumbnailUrl}
                        alt={module.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{module.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {module.description || 'No description provided'}
                        </p>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{module.teacher.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{module.subject.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{module._count.topics} topics</span>
                          </div>
                          {module.level && (
                            <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                              {module.level}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            Submitted {new Date(module.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => window.open(`/modules/${module.slug}`, '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleApprove(module.id, false)}
                        disabled={actionLoading === module.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading === module.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleApprove(module.id, true)}
                        disabled={actionLoading === module.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleRejectClick(module)}
                        disabled={actionLoading === module.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && selectedModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Reject Module</h3>
                <p className="text-sm text-gray-600">
                  You are about to reject: <strong>{selectedModule.title}</strong>
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Provide a clear reason for rejection to help the teacher improve..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be sent to the teacher as feedback.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedModule(null);
                  setRejectionReason('');
                }}
                disabled={actionLoading === selectedModule.id}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading === selectedModule.id || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedModule.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
