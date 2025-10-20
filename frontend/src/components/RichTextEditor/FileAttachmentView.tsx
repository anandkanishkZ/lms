import { NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileArchive, 
  Video, 
  Music, 
  Image as ImageIcon,
  File as FileIcon,
  X
} from 'lucide-react';

const FileAttachmentView = ({ node, deleteNode, editor }: any) => {
  const { src, fileName, fileType } = node.attrs;

  // Get file icon based on type
  const getFileIcon = () => {
    const type = fileType.toLowerCase();
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-blue-600" />;
    } else if (type === 'application/pdf' || extension === 'pdf') {
      return <FileText className="w-6 h-6 text-red-600" />;
    } else if (type.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
    } else if (type.includes('word') || extension === 'docx' || extension === 'doc') {
      return <FileText className="w-6 h-6 text-blue-700" />;
    } else if (type.includes('presentation') || extension === 'pptx' || extension === 'ppt') {
      return <FileText className="w-6 h-6 text-orange-600" />;
    } else if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) {
      return <FileArchive className="w-6 h-6 text-yellow-600" />;
    } else if (type.startsWith('video/')) {
      return <Video className="w-6 h-6 text-purple-600" />;
    } else if (type.startsWith('audio/')) {
      return <Music className="w-6 h-6 text-pink-600" />;
    } else {
      return <FileIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  // Get file color based on type
  const getFileColor = () => {
    const type = fileType.toLowerCase();
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) {
      return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
    } else if (type === 'application/pdf' || extension === 'pdf') {
      return 'border-red-200 bg-red-50 hover:bg-red-100';
    } else if (type.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      return 'border-green-200 bg-green-50 hover:bg-green-100';
    } else if (type.includes('word') || extension === 'docx' || extension === 'doc') {
      return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
    } else if (type.includes('presentation') || extension === 'pptx' || extension === 'ppt') {
      return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
    } else if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) {
      return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
    } else if (type.startsWith('video/')) {
      return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
    } else if (type.startsWith('audio/')) {
      return 'border-pink-200 bg-pink-50 hover:bg-pink-100';
    } else {
      return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  const handleDownload = () => {
    window.open(src, '_blank');
  };

  const handleDelete = () => {
    if (editor && editor.isEditable) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper className="file-attachment-wrapper my-4">
      <div className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${getFileColor()} group relative`}>
        {/* File Icon */}
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{fileName}</p>
          <p className="text-sm text-gray-500">Click to download or view</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Download file"
            type="button"
          >
            <Download className="w-5 h-5 text-gray-700" />
          </button>

          {/* Delete Button (only in edit mode) */}
          {editor?.isEditable && (
            <button
              onClick={handleDelete}
              className="p-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove file"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default FileAttachmentView;
