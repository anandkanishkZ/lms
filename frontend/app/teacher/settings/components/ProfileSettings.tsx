'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Mail, Phone, Save, X, Upload, Trash2 } from 'lucide-react';
import { teacherApiService } from '@/src/services/teacher-api.service';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/src/utils/toast.util';
import Image from 'next/image';

interface TeacherProfile {
  id: string;
  name: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  profileImage: string | null;
  role: string;
}

// Helper function to construct proper image URL
const getImageUrl = (profileImage: string | null): string | null => {
  if (!profileImage) return null;
  
  // If already a full URL, return as is
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
    return profileImage;
  }
  
  // Backend returns path like "avatars/filename.jpg"
  // Static files are served directly from: http://localhost:5000/uploads/avatars/filename.jpg
  // NOT through the API route (/api/v1)
  
  // Get base URL and remove /api/v1 suffix if present
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  baseUrl = baseUrl.replace(/\/api(\/v1)?\/?$/, ''); // Remove /api or /api/v1 from end
  
  // Remove any leading slashes from profile image path
  const cleanPath = profileImage.replace(/^\/+/, '');
  
  // Ensure path starts with avatars/
  const imagePath = cleanPath.startsWith('avatars/') ? cleanPath : `avatars/${cleanPath}`;
  
  // Static uploads are served from /uploads/ not /api/v1/uploads/
  return `${baseUrl}/uploads/${imagePath}`;
};

export default function ProfileSettings() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await teacherApiService.getProfile();
      setProfile(data);
      
      // If firstName, middleName, lastName are null, try to parse from name field
      let firstName = data.firstName || '';
      let middleName = data.middleName || '';
      let lastName = data.lastName || '';
      
      // If individual fields are empty but name exists, parse it
      if (!firstName && !lastName && data.name) {
        const nameParts = data.name.trim().split(/\s+/);
        if (nameParts.length === 1) {
          firstName = nameParts[0];
        } else if (nameParts.length === 2) {
          firstName = nameParts[0];
          lastName = nameParts[1];
        } else if (nameParts.length >= 3) {
          firstName = nameParts[0];
          middleName = nameParts.slice(1, -1).join(' ');
          lastName = nameParts[nameParts.length - 1];
        }
      }
      
      setFormData({
        firstName,
        middleName,
        lastName,
        email: data.email || '',
        phone: data.phone || '',
      });
      
      // Set profile image preview
      const imageUrl = getImageUrl(data.profileImage);
      setPreviewImage(imageUrl);
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorToast('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Image size should not exceed 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const loadingToastId = showLoadingToast('Uploading photo...');

      const response = await teacherApiService.uploadAvatar(file);
      
      if (response.success) {
        showSuccessToast('Photo uploaded successfully');
        
        // Update preview
        const imageUrl = getImageUrl(response.data.profileImage);
        setPreviewImage(imageUrl);
        
        // Update profile
        setProfile(response.data);
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('teacher_user', JSON.stringify(response.data));
        }
      }
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Are you sure you want to delete your profile photo?')) {
      return;
    }

    try {
      setUploadingPhoto(true);
      const response = await teacherApiService.deleteAvatar();
      
      if (response.success) {
        showSuccessToast('Photo deleted successfully');
        setPreviewImage(null);
        
        // Update profile
        if (profile) {
          const updatedProfile = { ...profile, profileImage: null };
          setProfile(updatedProfile);
          
          // Update localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('teacher_user', JSON.stringify(updatedProfile));
          }
        }
      }
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to delete photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await teacherApiService.updateProfile(formData);
      
      if (response.success) {
        showSuccessToast('Profile updated successfully');
        setProfile(response.data);
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('teacher_user', JSON.stringify(response.data));
        }
      }
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
        <p className="text-gray-600">Update your personal information and profile photo</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {/* Profile Photo Section */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4">Profile Photo</label>
          <div className="flex items-center space-x-6">
            {/* Photo Preview */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Upload/Delete Buttons */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              
              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#2563eb] to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </motion.button>

                {previewImage && (
                  <motion.button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={uploadingPhoto}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </motion.button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG, GIF or WEBP. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter first name"
            />
          </div>

          {/* Middle Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Middle Name
            </label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter middle name (optional)"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter last name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter phone number (optional)"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <motion.button
            type="button"
            onClick={handleReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </motion.button>

          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#2563eb] to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
