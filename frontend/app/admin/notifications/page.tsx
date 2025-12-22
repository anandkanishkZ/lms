'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/src/features/admin';
import NoticeBoard from '@/src/components/notices/NoticeBoard';
import NoticeBell from '@/src/components/notices/NoticeBell';
import { Button } from '@/src/components/ui/button';
import { Plus, FileText, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

type NoticeViewMode = 'published' | 'drafts' | 'all';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<NoticeViewMode>('published');

  // Force refresh when component mounts (e.g., after creating a notice)
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleViewModeChange = (mode: NoticeViewMode) => {
    setViewMode(mode);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AdminLayout
      title="Notifications & Announcements"
      description="Manage and view all system notifications and announcements"
    >
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-3">
            <NoticeBell noticesPagePath="/admin/notifications" />
            <Button
              onClick={() => router.push('/admin/notifications/create')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Notice
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => handleViewModeChange('published')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              viewMode === 'published'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-4 w-4" />
            Published Notices
          </button>
          <button
            onClick={() => handleViewModeChange('drafts')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              viewMode === 'drafts'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            Draft Notices
          </button>
          <button
            onClick={() => handleViewModeChange('all')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              viewMode === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <EyeOff className="h-4 w-4" />
            All Notices
          </button>
        </div>

        <NoticeBoard 
          key={refreshKey}
          showCreateButton={true}
          onCreateClick={() => router.push('/admin/notifications/create')}
          title={viewMode === 'published' ? 'Published Notices' : viewMode === 'drafts' ? 'Draft Notices' : 'All Notices'}
          showActions={true}
          autoRefresh={true}
          includeDrafts={viewMode === 'drafts' ? 'true' : viewMode === 'all' ? 'all' : 'false'}
        />
      </div>
    </AdminLayout>
  );
}
