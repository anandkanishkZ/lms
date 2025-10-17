'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  School, 
  Save,
  X,
  Edit,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import { studentApiService, StudentProfile, UpdateProfileData, ChangePasswordData } from '@/src/services/student-api.service';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/src/utils/toast.util';

// Validation Schemas
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  school: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function StudentProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!studentApiService.isAuthenticated()) {
        router.push('/student/login');
        return;
      }

      const userData = await studentApiService.getCurrentUser();
      if (userData) {
        setStudent(userData);
        // Populate form with current data
        profileForm.reset({
          firstName: userData.firstName || '',
          middleName: userData.middleName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          school: userData.school || '',
        });
      } else {
        router.push('/student/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/student/login');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsSavingProfile(true);
    try {
      const updateData: UpdateProfileData = {
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        school: data.school || undefined,
      };

      const updatedProfile = await studentApiService.updateProfile(updateData);
      setStudent(updatedProfile);
      setIsEditMode(false);
      showSuccessToast('Profile updated successfully!');
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsSavingPassword(true);
    try {
      const passwordData: ChangePasswordData = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      await studentApiService.changePassword(passwordData);
      passwordForm.reset();
      setIsChangingPassword(false);
      showSuccessToast('Password changed successfully!');
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    if (student) {
      profileForm.reset({
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        school: student.school || '',
      });
    }
    setIsEditMode(false);
  };

  const handleCancelPassword = () => {
    passwordForm.reset();
    setIsChangingPassword(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showErrorToast('❌ Invalid file type! Only image files (JPEG, PNG, GIF, WEBP) are allowed', {
        autoClose: 5000,
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorToast('❌ File too large! Maximum size is 5MB', {
        autoClose: 5000,
      });
      return;
    }

    // Show loading toast
    const toastId = showLoadingToast('📤 Uploading profile picture...');

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    setIsUploadingAvatar(true);
    try {
      const response = await studentApiService.uploadAvatar(file);
      if (response.success) {
        // Update student state with the new data
        setStudent(response.data.user);
        // Clear the preview so it shows the actual uploaded image
        setAvatarPreview(null);
        dismissToast(toastId);
        showSuccessToast('✅ Profile picture updated successfully!', {
          autoClose: 4000,
        });
      } else {
        dismissToast(toastId);
        showErrorToast('❌ Failed to update profile picture', {
          autoClose: 4000,
        });
        setAvatarPreview(null);
      }
    } catch (error: any) {
      dismissToast(toastId);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to upload avatar';
      showErrorToast(`❌ ${errorMessage}`, {
        autoClose: 5000,
      });
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('⚠️ Are you sure you want to delete your profile picture?')) {
      return;
    }

    const toastId = showLoadingToast('🗑️ Deleting profile picture...');
    setIsUploadingAvatar(true);
    try {
      const response = await studentApiService.deleteAvatar();
      if (response.success) {
        setStudent(response.data.user);
        setAvatarPreview(null);
        dismissToast(toastId);
        showSuccessToast('✅ Profile picture deleted successfully!', {
          autoClose: 4000,
        });
      } else {
        dismissToast(toastId);
        showErrorToast('❌ Failed to delete profile picture', {
          autoClose: 4000,
        });
      }
    } catch (error: any) {
      dismissToast(toastId);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to delete avatar';
      showErrorToast(`❌ ${errorMessage}`, {
        autoClose: 5000,
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (student?.profileImage) {
      return studentApiService.getAvatarUrl(student.profileImage);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/student/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
                <p className="text-xs text-gray-500">Manage your personal information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            
            {/* Profile Content */}
            <div className="px-6 pb-6">
              <div className="relative">
                {/* Avatar */}
                <div className="absolute -top-16 left-0">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-400 to-purple-400">
                      {getAvatarUrl() ? (
                        <img
                          src={getAvatarUrl()!}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Avatar Upload Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={handleAvatarChange}
                          disabled={isUploadingAvatar}
                        />
                        {isUploadingAvatar ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        ) : (
                          <Edit className="w-8 h-8 text-white" />
                        )}
                      </label>
                    </div>

                    {/* Delete Avatar Button */}
                    {student.profileImage && (
                      <button
                        onClick={handleDeleteAvatar}
                        disabled={isUploadingAvatar}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                        title="Delete avatar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="pt-20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                      <p className="text-gray-600">Symbol No: {student.symbolNo}</p>
                    </div>
                    {!isEditMode && (
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...profileForm.register('firstName')}
                      disabled={!isEditMode}
                      className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  {profileForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{profileForm.formState.errors.firstName.message}</p>
                  )}
                </div>

                {/* Middle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...profileForm.register('middleName')}
                      disabled={!isEditMode}
                      className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter middle name"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...profileForm.register('lastName')}
                      disabled={!isEditMode}
                      className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter last name"
                    />
                  </div>
                  {profileForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{profileForm.formState.errors.lastName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...profileForm.register('email')}
                      disabled={!isEditMode}
                      type="email"
                      className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter email"
                    />
                  </div>
                  {profileForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...profileForm.register('phone')}
                      disabled={!isEditMode}
                      className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* School */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...profileForm.register('school')}
                      disabled={!isEditMode}
                      className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter school name"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditMode && (
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </form>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              )}
            </div>

            {isChangingPassword && (
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...passwordForm.register('currentPassword')}
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="w-full pl-11 pr-11 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...passwordForm.register('newPassword')}
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full pl-11 pr-11 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...passwordForm.register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full pl-11 pr-11 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Changing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPassword}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            )}

            {!isChangingPassword && (
              <p className="text-sm text-gray-600">
                Keep your account secure by using a strong password. Change it regularly for better security.
              </p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
