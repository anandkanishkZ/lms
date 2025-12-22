'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card } from '@/src/components/ui/card';
import { Select } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { 
  Save, 
  X, 
  AlertCircle,
  Loader2,
  Calendar,
  Pin,
  Eye,
  EyeOff,
  FileText,
  PartyPopper,
  Megaphone,
  Palmtree,
  AlertTriangle,
  ChevronUp,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import noticeApi, { 
  Notice, 
  NoticeCategory, 
  NoticePriority, 
  UserRole,
  CreateNoticeData 
} from '@/src/services/notice-api.service';
import { getCurrentUserRole } from '@/utils/auth';

// Validation schema
const noticeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.nativeEnum(NoticeCategory),
  priority: z.nativeEnum(NoticePriority),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
  isPinned: z.boolean(),
  isPublished: z.boolean(),
  expiresAt: z.string().optional().or(z.literal('')),
  classId: z.string().optional().or(z.literal('')),
  batchId: z.string().optional().or(z.literal('')),
  moduleId: z.string().optional().or(z.literal('')),
  targetRole: z.nativeEnum(UserRole).optional().or(z.literal('')),
});

type NoticeFormData = z.infer<typeof noticeSchema>;

interface NoticeFormProps {
  notice?: Notice;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Category configuration with icons
const categoryConfig = {
  [NoticeCategory.GENERAL]: { label: 'General', icon: Megaphone, color: 'text-blue-600' },
  [NoticeCategory.EXAM]: { label: 'Exam', icon: FileText, color: 'text-orange-600' },
  [NoticeCategory.EVENT]: { label: 'Event', icon: PartyPopper, color: 'text-purple-600' },
  [NoticeCategory.HOLIDAY]: { label: 'Holiday', icon: Palmtree, color: 'text-green-600' },
};

// Priority configuration with icons
const priorityConfig = {
  [NoticePriority.LOW]: { label: 'Low', icon: Minus, color: 'text-gray-500' },
  [NoticePriority.MEDIUM]: { label: 'Medium', icon: ChevronUp, color: 'text-blue-600' },
  [NoticePriority.HIGH]: { label: 'High', icon: AlertTriangle, color: 'text-orange-600' },
  [NoticePriority.URGENT]: { label: 'Urgent', icon: AlertCircle, color: 'text-red-600' },
};

export default function NoticeForm({ notice, mode, onSuccess, onCancel }: NoticeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [batches, setBatches] = useState<Array<{ id: string; name: string }>>([]);
  const [modules, setModules] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  
  const currentUserRole = getCurrentUserRole();
  const isTeacher = currentUserRole === 'TEACHER';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: notice?.title || '',
      content: notice?.content || '',
      category: notice?.category || NoticeCategory.GENERAL,
      priority: notice?.priority || NoticePriority.MEDIUM,
      attachmentUrl: notice?.attachmentUrl || '',
      isPinned: notice?.isPinned || false,
      isPublished: notice?.isPublished ?? true, // Default to published (true)
      expiresAt: notice?.expiresAt ? new Date(notice.expiresAt).toISOString().slice(0, 16) : '',
      classId: notice?.classId || '',
      batchId: notice?.batchId || '',
      moduleId: notice?.moduleId || '',
      targetRole: notice?.targetRole || '',
    },
  });

  const isPinned = watch('isPinned');
  const isPublished = watch('isPublished');

  // Load classes, batches, modules for targeting
  useEffect(() => {
    const loadTargetingOptions = async () => {
      try {
        setIsLoadingOptions(true);
        
        if (isTeacher) {
          // Teachers: Load only their assigned classes and modules
          const [teacherClasses, teacherModules] = await Promise.all([
            noticeApi.getTeacherClasses(),
            noticeApi.getTeacherModules(),
          ]);
          
          setClasses(teacherClasses.map(tc => ({ id: tc.id, name: tc.name })));
          setModules(teacherModules.map(tm => ({ id: tm.id, title: tm.title })));
          // Teachers don't get batch options
          setBatches([]);
        } else {
          // Admins: Load all classes, batches, and modules
          const [allClasses, allBatches, allModules] = await Promise.all([
            noticeApi.getAllClasses(),
            noticeApi.getAllBatches(),
            noticeApi.getAllModules(),
          ]);
          
          setClasses(allClasses);
          setBatches(allBatches);
          setModules(allModules);
        }
      } catch (error: any) {
        console.error('Failed to load targeting options:', error);
        toast.error('Failed to load targeting options');
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadTargetingOptions();
  }, [isTeacher]);

  const onSubmit = async (data: NoticeFormData) => {
    try {
      setIsSubmitting(true);

      // Additional validation for teachers
      if (isTeacher) {
        // Teachers must specify at least one target
        if (!data.classId && !data.moduleId && !data.batchId) {
          toast.error('Teachers must specify a class, batch, or module for notices');
          return;
        }

        // Teachers cannot target admin role
        if (data.targetRole === UserRole.ADMIN) {
          toast.error('Teachers cannot create notices targeted to admins');
          return;
        }
      }

      // Prepare data
      const noticeData: CreateNoticeData = {
        title: data.title,
        content: data.content,
        category: data.category,
        priority: data.priority,
        attachmentUrl: data.attachmentUrl || undefined,
        isPinned: data.isPinned,
        isPublished: data.isPublished,
        expiresAt: data.expiresAt || undefined,
        classId: data.classId || undefined,
        batchId: data.batchId || undefined,
        moduleId: data.moduleId || undefined,
        targetRole: (data.targetRole as UserRole) || undefined,
      };

      if (mode === 'create') {
        await noticeApi.createNotice(noticeData);
        toast.success('Notice created successfully');
      } else {
        await noticeApi.updateNotice(notice!.id, noticeData);
        toast.success('Notice updated successfully');
      }

      // Invalidate router cache to ensure fresh data on navigation
      router.refresh();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} notice`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('title')}
            placeholder="Enter notice title"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('content')}
            rows={6}
            placeholder="Enter notice content"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {(() => {
                  const category = watch('category');
                  const Icon = categoryConfig[category]?.icon || Megaphone;
                  const color = categoryConfig[category]?.color || 'text-gray-600';
                  return <Icon className={`w-4 h-4 ${color}`} />;
                })()}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {(() => {
                  const priority = watch('priority');
                  const Icon = priorityConfig[priority]?.icon || ChevronUp;
                  const color = priorityConfig[priority]?.color || 'text-gray-600';
                  return <Icon className={`w-4 h-4 ${color}`} />;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Attachment URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachment URL (Optional)
          </label>
          <Input
            {...register('attachmentUrl')}
            type="url"
            placeholder="https://example.com/file.pdf"
            className={errors.attachmentUrl ? 'border-red-500' : ''}
          />
          {errors.attachmentUrl && (
            <p className="mt-1 text-sm text-red-500">{errors.attachmentUrl.message}</p>
          )}
        </div>

        {/* Expiration Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Expiration Date (Optional)
          </label>
          <Input
            {...register('expiresAt')}
            type="datetime-local"
            className="max-w-md"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty for notices that don't expire
          </p>
        </div>
      </Card>

      {/* Targeting Options */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Targeting Options</h2>
        {isTeacher ? (
          <p className="text-sm text-gray-600 mb-4">
            <AlertCircle className="h-4 w-4 inline mr-1 text-orange-500" />
            As a teacher, you must specify at least one class or module for this notice.
          </p>
        ) : (
          <p className="text-sm text-gray-600 mb-4">
            Leave all empty to send to everyone. Select specific groups to target the notice.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Role
            </label>
            <select
              {...register('targetRole')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value={UserRole.STUDENT}>Students</option>
              <option value={UserRole.TEACHER}>Teachers</option>
              {!isTeacher && <option value={UserRole.ADMIN}>Admins</option>}
            </select>
            {isTeacher && (
              <p className="mt-1 text-xs text-gray-500">
                Note: You cannot create notices for admins
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Class {isTeacher && <span className="text-red-500">*</span>}
            </label>
            <select
              {...register('classId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoadingOptions || classes.length === 0}
            >
              <option value="">{isLoadingOptions ? 'Loading...' : classes.length === 0 ? 'No classes available' : 'All Classes'}</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {isTeacher && classes.length === 0 && !isLoadingOptions && (
              <p className="mt-1 text-xs text-red-500">
                You have no assigned classes
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Batch
            </label>
            <select
              {...register('batchId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoadingOptions || batches.length === 0 || isTeacher}
            >
              <option value="">{isTeacher ? 'Not available for teachers' : batches.length === 0 ? 'No batches available' : 'All Batches'}</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Module {isTeacher && <span className="text-red-500">*</span>}
            </label>
            <select
              {...register('moduleId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoadingOptions || modules.length === 0}
            >
              <option value="">{isLoadingOptions ? 'Loading...' : modules.length === 0 ? 'No modules available' : 'All Modules'}</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
            {isTeacher && modules.length === 0 && !isLoadingOptions && (
              <p className="mt-1 text-xs text-red-500">
                You have no modules assigned
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Publishing Options */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Publishing Options</h2>

        <div className="space-y-4">
          {/* Pin Notice */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('isPinned')}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Pin className={`h-5 w-5 ${isPinned ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">Pin this notice</span>
              </div>
              <p className="text-sm text-gray-500">
                Pinned notices appear at the top of the list
              </p>
            </div>
          </label>

          {/* Publish Notice */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('isPublished')}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {isPublished ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                )}
                <span className="font-medium">Publish immediately</span>
              </div>
              <p className="text-sm text-gray-500">
                Uncheck to save as draft
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel ? onCancel() : router.back()}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Notice' : 'Update Notice'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
