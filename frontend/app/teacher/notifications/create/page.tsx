'use client';

import { useRouter } from 'next/navigation';
import NoticeForm from '@/src/components/notices/NoticeForm';
import { Button } from '@/src/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TeacherCreateNoticePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/teacher/notifications')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notifications
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Notice
          </h1>
          <p className="text-gray-600 mt-1">
            Create announcements for your assigned classes and modules
          </p>
        </div>

        {/* Notice Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <NoticeForm
            mode="create"
            onSuccess={() => router.push('/teacher/notifications')}
          />
        </div>
      </div>
    </div>
  );
}
