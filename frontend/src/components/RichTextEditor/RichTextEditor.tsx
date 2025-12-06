'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './RichTextEditor.css';
import { CustomImage } from './CustomImage';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FileLink } from './FileLinkExtension';
import { sanitizeHTML } from '@/utils/sanitize';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Undo, 
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Palette,
  Paperclip
} from 'lucide-react';
import { ImageUploadModal } from './ImageUploadModal';
import { FileUploadModal } from './FileUploadModal';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  minHeight = '200px',
  maxHeight = '600px',
  className = ''
}) => {
  console.log('🎨 RichTextEditor render - content length:', content?.length || 0, 'editable:', editable);
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'custom-image',
        },
      }),
      FileLink,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      })
    ],
    content: content || '',  // Ensure content is never undefined
    editable: editable,
    onUpdate: ({ editor }) => {
      // Sanitize HTML before passing to parent to prevent XSS
      const htmlContent = editor.getHTML();
      const sanitizedContent = sanitizeHTML(htmlContent);
      onChange(sanitizedContent);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${className}`,
        style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`,
        'data-placeholder': placeholder  // Add placeholder attribute for CSS
      }
    }
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log('📝 Updating editor content:', content?.substring(0, 100) || '(empty)');
      editor.commands.setContent(content || '');  // Ensure content is never undefined
    }
  }, [content, editor]);

  // Update editable state when prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) {
    console.log('⏳ Editor not ready yet');
    return null;
  }

  console.log('✅ Editor ready, current HTML length:', editor.getHTML()?.length || 0);

  const addImage = () => {
    setIsImageModalOpen(true);
  };

  const handleImageUpload = (imageUrl: string) => {
    if (editor) {
      // Insert customImage node with all attributes
      editor.chain().focus().insertContent({
        type: 'customImage',
        attrs: {
          src: imageUrl,
          width: '50%', // Default to medium size
          align: 'center', // Default to center alignment
          alt: ''
        }
      }).run();
    }
  };

  const addFile = () => {
    setIsFileModalOpen(true);
  };

  const handleFileUpload = (fileData: { 
    url: string; 
    fileName: string; 
    fileSize: number; 
    fileType: string;
  }) => {
    console.log('📎 handleFileUpload called with data:', fileData);
    if (editor) {
      editor.chain().focus().setFileLink({
        url: fileData.url,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize,
      }).run();
      console.log('📎 File link inserted into editor');
      console.log('📎 Editor content after insert:', editor.getHTML());
      setIsFileModalOpen(false);
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const setColor = () => {
    const color = window.prompt('Enter hex color (e.g., #ff0000):');
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  };

  const setHighlight = () => {
    const color = window.prompt('Enter highlight color (e.g., #ffff00):');
    if (color) {
      editor.chain().focus().setHighlight({ color }).run();
    }
  };

  return (
    <>
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageUpload={handleImageUpload}
      />

      <FileUploadModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onFileUpload={handleFileUpload}
      />
      
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {editable && (
        <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('bold') ? 'bg-gray-300' : ''
              }`}
              title="Bold (Ctrl+B)"
              type="button"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('italic') ? 'bg-gray-300' : ''
              }`}
              title="Italic (Ctrl+I)"
              type="button"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('underline') ? 'bg-gray-300' : ''
              }`}
              title="Underline (Ctrl+U)"
              type="button"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('strike') ? 'bg-gray-300' : ''
              }`}
              title="Strikethrough"
              type="button"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('code') ? 'bg-gray-300' : ''
              }`}
              title="Code"
              type="button"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
              }`}
              title="Heading 1"
              type="button"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
              }`}
              title="Heading 2"
              type="button"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
              }`}
              title="Heading 3"
              type="button"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('bulletList') ? 'bg-gray-300' : ''
              }`}
              title="Bullet List"
              type="button"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('orderedList') ? 'bg-gray-300' : ''
              }`}
              title="Numbered List"
              type="button"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
              }`}
              title="Align Left"
              type="button"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
              }`}
              title="Align Center"
              type="button"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
              }`}
              title="Align Right"
              type="button"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300' : ''
              }`}
              title="Justify"
              type="button"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Media & Links */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={setLink}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('link') ? 'bg-gray-300' : ''
              }`}
              title="Add Link"
              type="button"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={addImage}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Add Image"
              type="button"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={addFile}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Upload File"
              type="button"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Colors */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={setColor}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Text Color"
              type="button"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={setHighlight}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('highlight') ? 'bg-gray-300' : ''
              }`}
              title="Highlight"
              type="button"
            >
              <Highlighter className="w-4 h-4" />
            </button>
          </div>

          {/* Other */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('blockquote') ? 'bg-gray-300' : ''
              }`}
              title="Quote"
              type="button"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Horizontal Line"
              type="button"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
              type="button"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
              type="button"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 bg-white">
        <EditorContent editor={editor} />
      </div>
      </div>
    </>
  );
};

export default RichTextEditor;
