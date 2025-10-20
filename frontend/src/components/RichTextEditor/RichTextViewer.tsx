'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import './RichTextEditor.css';
import { CustomImage } from './CustomImage';
import { FileLink } from './FileLinkExtension';

interface RichTextViewerProps {
  content: string;
  className?: string;
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({
  content,
  className = ''
}) => {
  console.log('👀 RichTextViewer rendering with content:', content?.substring(0, 200));
  
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
      }),
      FileLink,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer'
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
    editable: false,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none ${className}`
      }
    }
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-viewer">
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextViewer;
