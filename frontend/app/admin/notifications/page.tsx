'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/src/features/admin';
import NoticeBoard from '@/src/components/notices/NoticeBoard';
import NoticeBell from '@/src/components/notices/NoticeBell';
import { Button } from '@/src/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when component mounts (e.g., after creating a notice)
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

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

        <NoticeBoard 
          key={refreshKey}
          showCreateButton={true}
          onCreateClick={() => router.push('/admin/notifications/create')}
          title="All Notices"
          showActions={true}
          autoRefresh={true}
        />
      </div>
    </AdminLayout>
  );
}
