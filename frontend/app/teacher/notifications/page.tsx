'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NoticeBoard from '@/src/components/notices/NoticeBoard';
import NoticeBell from '@/src/components/notices/NoticeBell';
import { Button } from '@/src/components/ui/button';
import { Plus } from 'lucide-react';

export default function TeacherNotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications & Announcements
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage announcements for your classes and modules
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NoticeBell noticesPagePath="/teacher/notifications" />
              <Button
                onClick={() => router.push('/teacher/notifications/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Notice
              </Button>
            </div>
          </div>
        </div>

        {/* Notice Board */}
        <NoticeBoard
          showCreateButton={false} // We have button in header
          title="All Notices"
          showActions={true} // Enable Edit/Delete for teacher's own notices
        />
      </div>
    </div>
  );
}
