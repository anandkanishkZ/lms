'use client';

import { AdminLayout } from '@/src/features/admin';
import NoticeForm from '@/src/components/notices/NoticeForm';
import { useRouter } from 'next/navigation';

export default function CreateNoticePage() {
  const router = useRouter();

  return (
    <AdminLayout
      title="Create New Notice"
      description="Create and publish announcements to students, teachers, or specific groups"
    >
      <div className="p-6 max-w-5xl mx-auto">
        <NoticeForm 
          mode="create"
          onSuccess={() => router.push('/admin/notifications')}
          onCancel={() => router.back()}
        />
      </div>
    </AdminLayout>
  );
}
