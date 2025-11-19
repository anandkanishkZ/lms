'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Youtube, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  Eye, 
  Video, 
  Radio,
  AlertCircle 
} from 'lucide-react';
import { featuredVideoService } from '../../../../../src/services/featured-video.service';
import { showSuccessToast, showErrorToast } from '../../../../../src/utils/toast.util';

interface FeaturedVideoManagerProps {
  moduleId: string;
}

interface FeaturedVideoData {
  type: 'featured' | 'live' | 'none';
  videoUrl?: string | null;
  title?: string;
  description?: string;
  isLive?: boolean;
}

const FeaturedVideoManager: React.FC<FeaturedVideoManagerProps> = ({ moduleId }) => {
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState({
    featuredVideoUrl: '',
    featuredVideoTitle: '',
    featuredVideoDescription: '',
  });

  useEffect(() => {
    loadFeaturedVideo();
  }, [moduleId]);

  const loadFeaturedVideo = async () => {
    try {
      setLoading(true);
      const response = await featuredVideoService.getModuleFeaturedVideo(moduleId);
      
      if (response.data.success) {
        const video = response.data.data;
        setFeaturedVideo(video);
        
        if (video.type === 'featured' || video.type === 'none') {
          setFormData({
            featuredVideoUrl: video.videoUrl || '',
            featuredVideoTitle: video.title || '',
            featuredVideoDescription: video.description || '',
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading featured video:', error);
      showErrorToast(error.message || 'Failed to load featured video');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.featuredVideoUrl && !featuredVideoService.validateYouTubeUrl(formData.featuredVideoUrl)) {
      newErrors.featuredVideoUrl = 'Please enter a valid YouTube URL';
    }

    if (formData.featuredVideoTitle && formData.featuredVideoTitle.trim().length > 200) {
      newErrors.featuredVideoTitle = 'Title must be 200 characters or less';
    }

    if (formData.featuredVideoDescription && formData.featuredVideoDescription.trim().length > 500) {
      newErrors.featuredVideoDescription = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showErrorToast('Please fix the validation errors');
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        featuredVideoUrl: formData.featuredVideoUrl.trim() || null,
        featuredVideoTitle: formData.featuredVideoTitle.trim() || null,
        featuredVideoDescription: formData.featuredVideoDescription.trim() || null,
      };

      const response = await featuredVideoService.updateModuleFeaturedVideo(moduleId, updateData);
      
      if (response.data.success) {
        showSuccessToast('Featured video updated successfully');
        setEditing(false);
        loadFeaturedVideo();
      }
    } catch (error: any) {
      console.error('Error saving featured video:', error);
      showErrorToast(error.message || 'Failed to update featured video');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (featuredVideo) {
      setFormData({
        featuredVideoUrl: (featuredVideo.type === 'featured' ? featuredVideo.videoUrl : '') || '',
        featuredVideoTitle: (featuredVideo.type === 'featured' ? featuredVideo.title : '') || '',
        featuredVideoDescription: (featuredVideo.type === 'featured' ? featuredVideo.description : '') || '',
      });
    }
    setEditing(false);
    setErrors({});
  };

  const getYouTubeThumbnail = (url: string) => {
    return featuredVideoService.getYouTubeThumbnailUrl(url);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = featuredVideoService.extractYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Youtube className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Featured Video</h3>
            <p className="text-sm text-gray-600">Set a default featured video for this module</p>
          </div>
        </div>
        
        {featuredVideo?.isLive && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <Radio className="w-4 h-4" />
            LIVE NOW
          </div>
        )}
      </div>

      <div className="p-6">
        {featuredVideo && (
          <div className="mb-6">
            {featuredVideo.isLive ? (
              <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Radio className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">{featuredVideo.title}</h4>
                  <p className="text-sm text-red-700 mt-1">{featuredVideo.description}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Live class is currently overriding the featured video
                  </p>
                </div>
              </div>
            ) : featuredVideo.videoUrl ? (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div 
                    className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden cursor-pointer group relative"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <img 
                      src={getYouTubeThumbnail(featuredVideo.videoUrl) || '/placeholder-video.jpg'} 
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{featuredVideo.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{featuredVideo.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="text-sm text-[#2563eb] hover:text-[#1d4ed8] font-medium flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No featured video set</p>
                <p className="text-sm">Add a YouTube video to feature in this module</p>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {editing ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={formData.featuredVideoUrl}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, featuredVideoUrl: e.target.value }));
                    if (errors.featuredVideoUrl) {
                      setErrors(prev => ({ ...prev, featuredVideoUrl: '' }));
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent ${
                    errors.featuredVideoUrl ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.featuredVideoUrl && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.featuredVideoUrl}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.featuredVideoTitle}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, featuredVideoTitle: e.target.value }));
                    if (errors.featuredVideoTitle) {
                      setErrors(prev => ({ ...prev, featuredVideoTitle: '' }));
                    }
                  }}
                  placeholder="Custom title for the featured video"
                  maxLength={200}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent ${
                    errors.featuredVideoTitle ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.featuredVideoTitle ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.featuredVideoTitle}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-gray-500">
                    {formData.featuredVideoTitle.length}/200
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Description (Optional)
                </label>
                <textarea
                  value={formData.featuredVideoDescription}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, featuredVideoDescription: e.target.value }));
                    if (errors.featuredVideoDescription) {
                      setErrors(prev => ({ ...prev, featuredVideoDescription: '' }));
                    }
                  }}
                  placeholder="Brief description of the featured video"
                  rows={3}
                  maxLength={500}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none ${
                    errors.featuredVideoDescription ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.featuredVideoDescription ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.featuredVideoDescription}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-gray-500">
                    {formData.featuredVideoDescription.length}/500
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            !featuredVideo?.isLive && (
              <div className="flex justify-center">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  {featuredVideo?.videoUrl ? 'Edit Featured Video' : 'Set Featured Video'}
                </button>
              </div>
            )
          )}
        </AnimatePresence>

        {previewOpen && featuredVideo?.videoUrl && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-gray-900">{featuredVideo.title}</h3>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="relative aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(featuredVideo.videoUrl) || ''}
                  className="w-full h-full"
                  allowFullScreen
                  title="Featured Video Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedVideoManager;