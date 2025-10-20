'use client';

import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileCode, 
  File, 
  Download,
  Eye,
  X
} from 'lucide-react';

interface FileAttachmentProps {
  node: any;
  deleteNode?: () => void;
  updateAttributes?: (attrs: any) => void;
  selected?: boolean;
  editor?: any;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) {
    return <FileText className="w-6 h-6 text-red-500" />;
  }
  if (fileType.includes('image')) {
    return <ImageIcon className="w-6 h-6 text-blue-500" />;
  }
  if (fileType.includes('sheet') || fileType.includes('excel')) {
    return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
  }
  if (fileType.includes('word') || fileType.includes('document')) {
    return <FileCode className="w-6 h-6 text-blue-600" />;
  }
  return <File className="w-6 h-6 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const FileAttachment: React.FC<FileAttachmentProps> = ({ 
  node, 
  deleteNode,
  selected = false,
  editor
}) => {
  const { url, fileName, fileSize, fileType } = node.attrs;
  
  // Check if editor is editable (teacher mode) or read-only (student mode)
  const isEditable = editor?.isEditable ?? true;
  
  console.log('🎯 FileAttachment rendering:', { url, fileName, fileSize, fileType, isEditable });

  const getAuthenticatedUrl = (fileUrl: string): string => {
    // If it's already a full URL or doesn't start with /api, return as-is
    if (fileUrl.startsWith('http') || !fileUrl.startsWith('/api')) {
      return fileUrl;
    }

    // Get the token
    const token = 
      localStorage.getItem('teacher_token') || 
      localStorage.getItem('student_token') || 
      localStorage.getItem('adminToken');

    // Append token as query parameter for authenticated file access
    const separator = fileUrl.includes('?') ? '&' : '?';
    return token ? `${fileUrl}${separator}token=${token}` : fileUrl;
  };

  const handleDownload = async () => {
    if (!url) return;

    try {
      // Get the token
      const teacherToken = localStorage.getItem('teacher_token');
      const studentToken = localStorage.getItem('student_token');
      const adminToken = localStorage.getItem('adminToken');
      
      const token = teacherToken || studentToken || adminToken;

      console.log('⬇️ Download attempt:', {
        hasToken: !!token,
        url: url
      });

      if (!token) {
        console.error('❌ No authentication token found for download!');
        alert('Authentication token not found. Please log in again.');
        return;
      }

      // For API URLs, fetch with authentication and trigger download
      // Handle both relative (/api/...) and full URLs (http://localhost:5000/api/...)
      if (url.startsWith('/api') || url.includes('/api/v1/upload/files/')) {
        // If it's already a full URL, just append token
        const downloadUrl = url.startsWith('http') 
          ? `${url}?token=${token}`
          : `http://localhost:5000${url}?token=${token}`;
        console.log('⬇️ Fetching from:', downloadUrl);
        
        const response = await fetch(downloadUrl);

        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName || 'download';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
          console.log('✅ Download successful!');
        } else {
          const errorText = await response.text();
          console.error('❌ Download failed:', response.status, errorText);
          alert('Failed to download file. Please try again.');
        }
      } else {
        // For non-API URLs, open in new tab
        console.log('📎 Opening external URL for download:', url);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const handleView = () => {
    if (!url) return;

    try {
      // Get the token
      const teacherToken = localStorage.getItem('teacher_token');
      const studentToken = localStorage.getItem('student_token');
      const adminToken = localStorage.getItem('adminToken');
      
      console.log('🔑 Token check:', {
        teacherToken: teacherToken ? 'EXISTS' : 'NOT FOUND',
        studentToken: studentToken ? 'EXISTS' : 'NOT FOUND',
        adminToken: adminToken ? 'EXISTS' : 'NOT FOUND',
        url: url
      });

      const token = teacherToken || studentToken || adminToken;

      if (!token) {
        console.error('❌ No authentication token found!');
        alert('Authentication token not found. Please log in again.');
        return;
      }

      // For API URLs, append token as query parameter
      // Handle both relative (/api/...) and full URLs (http://localhost:5000/api/...)
      if (url.startsWith('/api') || url.includes('/api/v1/upload/files/')) {
        // If it's already a full URL, just append token
        const authenticatedUrl = url.startsWith('http') 
          ? `${url}?token=${token}`
          : `http://localhost:5000${url}?token=${token}`;
        console.log('✅ Opening authenticated URL:', authenticatedUrl);
        window.open(authenticatedUrl, '_blank');
      } else {
        // For non-API URLs, open in new tab
        console.log('📎 Opening external URL without token:', url);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Error viewing file. Please try again.');
    }
  };

  return (
    <NodeViewWrapper className="inline-block">
      <div 
        className={`inline-block my-2 ${selected ? 'ring-2 ring-blue-500' : ''}`}
        contentEditable={false}
      >
        <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors max-w-md">
          {/* File Icon */}
          <div className="flex-shrink-0">
            {getFileIcon(fileType)}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate text-sm">
              {fileName}
            </p>
            {fileSize && (
              <p className="text-xs text-gray-500">
                {formatFileSize(fileSize)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* View button - always visible */}
            <button
              onClick={handleView}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View file"
              type="button"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Download button - always visible */}
            <button
              onClick={handleDownload}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download file"
              type="button"
            >
              <Download className="w-4 h-4" />
            </button>
            
            {/* Delete button - only for editable mode (teacher) */}
            {isEditable && deleteNode && (
              <button
                onClick={deleteNode}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove file"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default FileAttachment;
