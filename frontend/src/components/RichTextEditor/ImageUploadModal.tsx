'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (imageUrl: string) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageUpload,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle drag events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Validate and set file
  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP, SVG)');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Get token from localStorage - check multiple possible keys
      let token = localStorage.getItem('teacher_token') || 
                  localStorage.getItem('adminToken') || 
                  localStorage.getItem('student_token') ||
                  localStorage.getItem('userToken');

      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/upload/editor-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload image');
      }

      // Simulate upload progress
      setUploadProgress(100);
      setUploadSuccess(true);

      // Wait a moment to show success state
      setTimeout(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
        const imageUrl = data.data.url.startsWith('http') ? data.data.url : `${apiBase}${data.data.url}`;
        onImageUpload(imageUrl);
        handleClose();
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setUploading(false);
    setUploadSuccess(false);
    setUploadProgress(0);
    setDragActive(false);
    onClose();
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Upload Image</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
            disabled={uploading}
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Drag and Drop Area */}
          {!selectedFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your image here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or
              </p>
              <button
                onClick={openFileDialog}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                type="button"
              >
                Browse Files
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: JPEG, PNG, GIF, WebP, SVG (Max 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          )}

          {/* Preview */}
          {selectedFile && preview && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain bg-gray-50"
                />
                {!uploading && !uploadSuccess && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      setError(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* File Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <ImageIcon className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-medium text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Image uploaded successfully!</span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            type="button"
            disabled={uploading}
          >
            Cancel
          </button>
          {selectedFile && !uploadSuccess && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              type="button"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Image
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
