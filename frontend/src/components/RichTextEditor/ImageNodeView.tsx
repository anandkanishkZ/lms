'use client';

import React, { useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { 
  Maximize2, 
  Minimize2, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Edit3,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface ImageNodeViewProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
  selected: boolean;
  editor: any;
}

export const ImageNodeView: React.FC<ImageNodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [altText, setAltText] = useState(node.attrs.alt || '');
  const [isHidden, setIsHidden] = useState(node.attrs.hidden || false);
  const [imageSrc, setImageSrc] = useState(node.attrs.src);

  // Check if editor is editable (teacher mode) or read-only (student mode)
  const isEditable = editor?.isEditable ?? true;

  const currentSize = node.attrs.width || 'auto';
  const currentAlign = node.attrs.align || 'left';

  // Get authenticated image URL
  useEffect(() => {
    const loadImage = () => {
      const src = node.attrs.src;
      
      console.log('🖼️ ImageNodeView loading:', { src });
      
      // If it's an API URL, append token as query parameter
      // Handle both relative (/api/...) and full URLs
      if (src && (src.startsWith('/api') || src.includes('/api/v1/upload/files/'))) {
        const teacherToken = localStorage.getItem('teacher_token');
        const studentToken = localStorage.getItem('student_token');
        const adminToken = localStorage.getItem('adminToken');
        
        const token = teacherToken || studentToken || adminToken;
        
        console.log('🔑 Image token check:', {
          teacherToken: teacherToken ? 'EXISTS' : 'NOT FOUND',
          studentToken: studentToken ? 'EXISTS' : 'NOT FOUND',
          adminToken: adminToken ? 'EXISTS' : 'NOT FOUND',
          hasToken: !!token
        });
        
        if (token) {
          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
          // If it's already a full URL, just append token
          const authenticatedUrl = src.startsWith('http') 
            ? `${src}?token=${token}`
            : `${apiBase}${src}?token=${token}`;
          console.log('✅ Authenticated image URL:', authenticatedUrl);
          setImageSrc(authenticatedUrl);
        } else {
          console.error('❌ No token found for image authentication!');
          setImageSrc(src); // Fallback to original src
        }
      } else {
        console.log('📷 Loading external image without token:', src);
        setImageSrc(src);
      }
    };

    loadImage();
  }, [node.attrs.src]);

  // Size presets (percentages of container width)
  const sizes = {
    small: '25%',
    medium: '50%',
    large: '75%',
    full: '100%',
  };

  const handleResize = (size: string) => {
    updateAttributes({ width: sizes[size as keyof typeof sizes] });
  };

  const handleAlign = (align: string) => {
    updateAttributes({ align });
  };

  const handleSaveAlt = () => {
    updateAttributes({ alt: altText });
    setIsEditingAlt(false);
  };

  const handleCancelAlt = () => {
    setAltText(node.attrs.alt || '');
    setIsEditingAlt(false);
  };

  const handleToggleHidden = () => {
    const newHiddenState = !isHidden;
    setIsHidden(newHiddenState);
    updateAttributes({ hidden: newHiddenState });
  };

  const getAlignStyle = () => {
    switch (currentAlign) {
      case 'center':
        return { display: 'block', marginLeft: 'auto', marginRight: 'auto' };
      case 'right':
        return { display: 'block', marginLeft: 'auto' };
      default:
        return { display: 'block' };
    }
  };

  const getSizeLabel = () => {
    const width = node.attrs.width;
    if (width === '25%') return 'Small';
    if (width === '50%') return 'Medium';
    if (width === '75%') return 'Large';
    if (width === '100%') return 'Full';
    return 'Custom';
  };

  return (
    <NodeViewWrapper className="image-wrapper" data-drag-handle>
      <div
        className="relative inline-block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ maxWidth: '100%' }}
      >
        {/* Image */}
        <img
          src={imageSrc}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          style={{
            ...getAlignStyle(),
            width: node.attrs.width || 'auto',
            maxWidth: '100%',
            height: 'auto',
            border: selected ? '2px solid #3b82f6' : '2px solid transparent',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            opacity: isHidden ? 0.3 : 1,
            filter: isHidden ? 'grayscale(100%)' : 'none',
          }}
        />

        {/* Hidden Badge */}
        {isHidden && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <EyeOff className="w-3 h-3" />
            Hidden
          </div>
        )}

        {/* Floating Toolbar - Shows on hover or when selected */}
        {(isHovered || selected) && !isEditingAlt && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
            {/* Size Controls */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600 px-2">Size: {getSizeLabel()}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleResize('small')}
                  className={`p-1.5 rounded hover:bg-blue-50 transition-colors ${
                    currentSize === '25%' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                  title="Small (25%)"
                  type="button"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleResize('medium')}
                  className={`p-1.5 rounded hover:bg-blue-50 transition-colors ${
                    currentSize === '50%' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                  title="Medium (50%)"
                  type="button"
                >
                  <span className="text-sm font-bold">M</span>
                </button>
                <button
                  onClick={() => handleResize('large')}
                  className={`p-1.5 rounded hover:bg-blue-50 transition-colors ${
                    currentSize === '75%' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                  title="Large (75%)"
                  type="button"
                >
                  <span className="text-sm font-bold">L</span>
                </button>
                <button
                  onClick={() => handleResize('full')}
                  className={`p-1.5 rounded hover:bg-blue-50 transition-colors ${
                    currentSize === '100%' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                  title="Full Width (100%)"
                  type="button"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Alignment Controls */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600 px-2">Align</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleAlign('left')}
                  className={`p-1.5 rounded hover:bg-blue-50 transition-colors ${
                    currentAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                  title="Align Left"
                  type="button"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlign('center')}
                  className={`p-1.5 rounded hover:bg-blue-50 transition-colors ${
                    currentAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                  title="Align Center"
                  type="button"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlign('right')}
                  className={`p-1.5 rounded hover:bg-blue-50 transition-colors ${
                    currentAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                  title="Align Right"
                  type="button"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Other Controls */}
            <div className="flex flex-col gap-1">
              {/* Hide/Unhide - For students, Alt Text and Delete - For teachers */}
              {!isEditable ? (
                // Student view - only hide/unhide option
                <button
                  onClick={handleToggleHidden}
                  className={`p-1.5 rounded hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                    isHidden ? 'text-orange-600' : 'text-blue-600'
                  }`}
                  title={isHidden ? "Unhide Image" : "Hide Image"}
                  type="button"
                >
                  {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="text-xs">{isHidden ? 'Unhide' : 'Hide'}</span>
                </button>
              ) : (
                // Teacher view - alt text and delete options
                <>
                  <button
                    onClick={() => setIsEditingAlt(true)}
                    className="p-1.5 rounded hover:bg-blue-50 transition-colors text-gray-600 flex items-center gap-2"
                    title="Edit Alt Text"
                    type="button"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-xs">Alt Text</span>
                  </button>
                  <button
                    onClick={deleteNode}
                    className="p-1.5 rounded hover:bg-red-50 transition-colors text-red-600 flex items-center gap-2"
                    title="Delete Image"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs">Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Alt Text Editor */}
        {isEditingAlt && (
          <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 min-w-[250px]">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Alt Text (for accessibility)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              placeholder="Describe this image..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveAlt}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-sm"
                type="button"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancelAlt}
                className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 text-sm"
                type="button"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Size Indicator Badge */}
        {selected && !isEditingAlt && (
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {getSizeLabel()} • {currentAlign}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageNodeView;
