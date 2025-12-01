'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/src/features/admin';
import NoticeForm from '@/src/components/notices/NoticeForm';
import noticeApi, { Notice } from '@/src/services/notice-api.service';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EditNoticePage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const id = params.id as string;
        const data = await noticeApi.getNoticeById(id);
        setNotice(data);
      } catch (error: any) {
        setError(error.message || 'Failed to load notice');
        toast.error('Failed to load notice');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchNotice();
    }
  }, [params.id]);

  if (loading) {
    return (
      <AdminLayout
        title="Edit Notice"
        description="Loading notice details..."
      >
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading notice...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !notice) {
    return (
      <AdminLayout
        title="Edit Notice"
        description="Error loading notice"
      >
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Notice</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Edit Notice"
      description={`Editing: ${notice.title}`}
    >
      <div className="p-6 max-w-5xl mx-auto">
        <NoticeForm 
          notice={notice}
          mode="edit"
          onSuccess={() => router.push('/admin/notifications')}
          onCancel={() => router.back()}
        />
      </div>
    </AdminLayout>
  );
}
