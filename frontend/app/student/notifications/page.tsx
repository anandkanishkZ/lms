'use client';

import NoticeBoard from '@/src/components/notices/NoticeBoard';
import NoticeBell from '@/src/components/notices/NoticeBell';
import StudentLayout from '@/src/components/student/StudentLayout';

export default function StudentNotificationsPage() {
  return (
    <StudentLayout
      title="Notifications & Announcements"
      subtitle="View all announcements, updates, and important notices"
    >
      <div className="p-6">
        {/* Header with Bell Icon */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Notices</h2>
          </div>
          <NoticeBell noticesPagePath="/student/notifications" />
        </div>

        {/* Notice Board */}
        <NoticeBoard
          showCreateButton={false} // Students cannot create notices
          title=""
          showActions={false} // Students cannot edit/delete notices
        />
      </div>
    </StudentLayout>
  );
}
