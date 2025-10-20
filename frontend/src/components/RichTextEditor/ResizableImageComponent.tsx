'use client';

import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Maximize2, 
  Minimize2, 
  Trash2,
  Loader2
} from 'lucide-react';

interface ResizableImageComponentProps {
  node: {
    attrs: {
      src: string;
      alt?: string;
      title?: string;
      width: string;
      height: string;
      alignment: string;
    };
  };
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
  selected: boolean;
  editor: any;
}

export const ResizableImageComponent: React.FC<ResizableImageComponentProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { src, alt, title, width, height, alignment } = node.attrs;
  const isEditable = editor?.isEditable ?? true;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
  };

  const setSize = (size: 'small' | 'medium' | 'large' | 'full') => {
    const sizes = {
      small: '300px',
      medium: '500px',
      large: '700px',
      full: '100%',
    };
    updateAttributes({ width: sizes[size], height: 'auto' });
  };

  const setAlignment = (align: 'left' | 'center' | 'right') => {
    updateAttributes({ alignment: align });
  };

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left':
        return 'justify-start';
      case 'right':
        return 'justify-end';
      case 'center':
      default:
        return 'justify-center';
    }
  };

  return (
    <NodeViewWrapper className={`resizable-image-wrapper my-4 flex ${getAlignmentClass()}`}>
      <div className="relative inline-block group">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Image */}
        <img
          src={src}
          alt={alt || ''}
          title={title || ''}
          style={{
            width: width === 'auto' ? 'auto' : width,
            height: height === 'auto' ? 'auto' : height,
            maxWidth: '100%',
          }}
          className={`rounded-lg ${selected ? 'ring-2 ring-blue-500' : ''} ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } transition-opacity`}
          onLoad={handleLoad}
          onError={handleError}
        />

        {/* Toolbar - Only show when editable and selected */}
        {isEditable && selected && !isLoading && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex gap-1 z-10">
            {/* Size Controls */}
            <div className="flex gap-1 border-r border-gray-300 pr-2">
              <button
                onClick={() => setSize('small')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Small (300px)"
                type="button"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSize('medium')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Medium (500px)"
                type="button"
              >
                <span className="text-sm font-medium">M</span>
              </button>
              <button
                onClick={() => setSize('large')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Large (700px)"
                type="button"
              >
                <span className="text-sm font-medium">L</span>
              </button>
              <button
                onClick={() => setSize('full')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Full Width"
                type="button"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Alignment Controls */}
            <div className="flex gap-1 border-r border-gray-300 pr-2">
              <button
                onClick={() => setAlignment('left')}
                className={`p-2 hover:bg-gray-100 rounded transition-colors ${
                  alignment === 'left' ? 'bg-gray-200' : ''
                }`}
                title="Align Left"
                type="button"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAlignment('center')}
                className={`p-2 hover:bg-gray-100 rounded transition-colors ${
                  alignment === 'center' ? 'bg-gray-200' : ''
                }`}
                title="Align Center"
                type="button"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAlignment('right')}
                className={`p-2 hover:bg-gray-100 rounded transition-colors ${
                  alignment === 'right' ? 'bg-gray-200' : ''
                }`}
                title="Align Right"
                type="button"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            {/* Delete */}
            <button
              onClick={deleteNode}
              className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
              title="Delete Image"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
