'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NoticeForm from '@/src/components/notices/NoticeForm';
import { Button } from '@/src/components/ui/button';
import { noticeApi, Notice } from '@/services/notice-api.service';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherEditNoticePage() {
  const router = useRouter();
  const params = useParams();
  const noticeId = params.id as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const data = await noticeApi.getNoticeById(noticeId);
        setNotice(data);
      } catch (err: any) {
        console.error('Error fetching notice:', err);
        setError(err.message || 'Failed to load notice');
        toast.error('Failed to load notice');
      } finally {
        setLoading(false);
      }
    };

    if (noticeId) {
      fetchNotice();
    }
  }, [noticeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading notice...</p>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Notice
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'The notice you are looking for could not be found.'}
            </p>
          </div>
          <Button onClick={() => router.push('/teacher/notifications')}>
            Go Back to Notifications
          </Button>
        </div>
      </div>
    );
  }

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
            Edit Notice
          </h1>
          <p className="text-gray-600 mt-1">
            Update the announcement details
          </p>
        </div>

        {/* Notice Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <NoticeForm
            mode="edit"
            notice={notice}
            onSuccess={() => router.push('/teacher/notifications')}
          />
        </div>
      </div>
    </div>
  );
}
