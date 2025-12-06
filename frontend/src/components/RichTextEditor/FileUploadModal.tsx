'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { 
  X, 
  Upload, 
  File as FileIcon, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Video,
  Music
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (fileData: { 
    url: string; 
    fileName: string; 
    fileSize: number; 
    fileType: string;
  }) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onFileUpload,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-600" />;
    } else if (type === 'application/pdf' || extension === 'pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    } else if (type.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
    } else if (type.includes('word') || extension === 'docx' || extension === 'doc') {
      return <FileText className="w-8 h-8 text-blue-700" />;
    } else if (type.includes('presentation') || extension === 'pptx' || extension === 'ppt') {
      return <FileText className="w-8 h-8 text-orange-600" />;
    } else if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) {
      return <FileArchive className="w-8 h-8 text-yellow-600" />;
    } else if (type.startsWith('video/')) {
      return <Video className="w-8 h-8 text-purple-600" />;
    } else if (type.startsWith('audio/')) {
      return <Music className="w-8 h-8 text-pink-600" />;
    } else {
      return <FileIcon className="w-8 h-8 text-gray-600" />;
    }
  };

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
    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(false);
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Get token from localStorage (check multiple possible keys)
      const token = localStorage.getItem('teacher_token') || 
                   localStorage.getItem('student_token') || 
                   localStorage.getItem('adminToken') ||
                   localStorage.getItem('token');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/upload/editor-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload file');
      }

      // Simulate upload progress
      setUploadProgress(100);
      setUploadSuccess(true);

      // Wait a moment to show success state
      setTimeout(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
        const fileUrl = data.data.url.startsWith('http') ? data.data.url : `${apiBase}${data.data.url}`;
        onFileUpload({
          url: fileUrl,
          fileName: data.data.originalName,
          fileSize: data.data.size,
          fileType: selectedFile.type,
        });
        handleClose();
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setSelectedFile(null);
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
          <h2 className="text-2xl font-bold text-gray-900">Upload File</h2>
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
                Drag and drop your file here
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
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR, Images, Videos, Audio (Max 50MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mp3,.avi,.mkv,.mov,.wav"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          )}

          {/* File Preview */}
          {selectedFile && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {getFileIcon(selectedFile)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                  </p>
                </div>
                {!uploading && !uploadSuccess && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setError(null);
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
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
                  <span className="font-medium">File uploaded successfully!</span>
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
                  Upload File
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
