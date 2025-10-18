/**
 * RichTextEditor Component
 * WYSIWYG text editor with formatting toolbar
 * Used for lesson content, course descriptions, announcements, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const editorVariants = cva(
  'w-full rounded-md border bg-white transition-colors dark:bg-gray-950',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-600',
        error: 'border-red-500 focus-within:ring-2 focus-within:ring-red-500 dark:border-red-600',
        success: 'border-green-500 focus-within:ring-2 focus-within:ring-green-500 dark:border-green-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type EditorFormat = 'html' | 'markdown' | 'text';

export interface RichTextEditorProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>,
    VariantProps<typeof editorVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  format?: EditorFormat;
  minHeight?: number;
  maxHeight?: number;
  showToolbar?: boolean;
  showCharCount?: boolean;
  containerClassName?: string;
}

type FormatAction = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikethrough'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'code'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'undo'
  | 'redo';

/**
 * Base RichTextEditor Component
 */
const RichTextEditor = React.forwardRef<HTMLTextAreaElement, RichTextEditorProps>(
  (
    {
      className,
      containerClassName,
      variant,
      label,
      helperText,
      errorText,
      value,
      defaultValue = '',
      onChange,
      format = 'html',
      minHeight = 200,
      maxHeight = 600,
      showToolbar = true,
      showCharCount = false,
      disabled,
      id,
      maxLength,
      ...props
    },
    ref
  ) => {
    const [content, setContent] = React.useState<string>(value || defaultValue);
    const [selectionStart, setSelectionStart] = React.useState<number>(0);
    const [selectionEnd, setSelectionEnd] = React.useState<number>(0);
    const [history, setHistory] = React.useState<string[]>([content]);
    const [historyIndex, setHistoryIndex] = React.useState<number>(0);
    const editorRef = React.useRef<HTMLTextAreaElement>(null);
    const editorId = id || `editor-${Math.random().toString(36).substr(2, 9)}`;

    // Combine refs
    React.useImperativeHandle(ref, () => editorRef.current!);

    const hasError = !!errorText;

    // Update content when value prop changes
    React.useEffect(() => {
      if (value !== undefined && value !== content) {
        setContent(value);
      }
    }, [value]);

    // Handle content change
    const handleContentChange = (newContent: string) => {
      setContent(newContent);
      onChange?.(newContent);

      // Add to history (for undo/redo)
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };

    // Get current selection
    const updateSelection = () => {
      if (editorRef.current) {
        setSelectionStart(editorRef.current.selectionStart);
        setSelectionEnd(editorRef.current.selectionEnd);
      }
    };

    // Insert text at cursor
    const insertText = (before: string, after: string = '') => {
      if (!editorRef.current) return;

      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const selectedText = content.substring(start, end);
      const beforeText = content.substring(0, start);
      const afterText = content.substring(end);

      const newContent = beforeText + before + selectedText + after + afterText;
      handleContentChange(newContent);

      // Restore focus and selection
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          const newCursorPos = start + before.length + selectedText.length;
          editorRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    };

    // Format actions for HTML
    const formatHTML = (action: FormatAction) => {
      const formatMap: Record<FormatAction, () => void> = {
        bold: () => insertText('<strong>', '</strong>'),
        italic: () => insertText('<em>', '</em>'),
        underline: () => insertText('<u>', '</u>'),
        strikethrough: () => insertText('<s>', '</s>'),
        heading1: () => insertText('<h1>', '</h1>'),
        heading2: () => insertText('<h2>', '</h2>'),
        heading3: () => insertText('<h3>', '</h3>'),
        bulletList: () => insertText('<ul>\n  <li>', '</li>\n</ul>'),
        orderedList: () => insertText('<ol>\n  <li>', '</li>\n</ol>'),
        blockquote: () => insertText('<blockquote>', '</blockquote>'),
        code: () => insertText('<code>', '</code>'),
        codeBlock: () => insertText('<pre><code>', '</code></pre>'),
        link: () => insertText('<a href="url">', '</a>'),
        image: () => insertText('<img src="url" alt="description" />'),
        undo: () => handleUndo(),
        redo: () => handleRedo(),
      };

      formatMap[action]?.();
    };

    // Format actions for Markdown
    const formatMarkdown = (action: FormatAction) => {
      const formatMap: Record<FormatAction, () => void> = {
        bold: () => insertText('**', '**'),
        italic: () => insertText('_', '_'),
        underline: () => insertText('<u>', '</u>'), // Markdown doesn't have underline
        strikethrough: () => insertText('~~', '~~'),
        heading1: () => insertText('# ', ''),
        heading2: () => insertText('## ', ''),
        heading3: () => insertText('### ', ''),
        bulletList: () => insertText('- ', ''),
        orderedList: () => insertText('1. ', ''),
        blockquote: () => insertText('> ', ''),
        code: () => insertText('`', '`'),
        codeBlock: () => insertText('```\n', '\n```'),
        link: () => insertText('[text](', ')'),
        image: () => insertText('![alt](', ')'),
        undo: () => handleUndo(),
        redo: () => handleRedo(),
      };

      formatMap[action]?.();
    };

    // Handle format action
    const handleFormat = (action: FormatAction) => {
      if (format === 'markdown') {
        formatMarkdown(action);
      } else if (format === 'html') {
        formatHTML(action);
      }
    };

    // Undo/Redo
    const handleUndo = () => {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const newContent = history[newIndex];
        setContent(newContent);
        onChange?.(newContent);
      }
    };

    const handleRedo = () => {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        const newContent = history[newIndex];
        setContent(newContent);
        onChange?.(newContent);
      }
    };

    // Toolbar button component
    const ToolbarButton: React.FC<{
      action: FormatAction;
      icon: React.ReactNode;
      title: string;
    }> = ({ action, icon, title }) => (
      <button
        type="button"
        onClick={() => handleFormat(action)}
        disabled={disabled}
        title={title}
        className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {icon}
      </button>
    );

    return (
      <div className={cn('space-y-1', containerClassName)}>
        {label && (
          <label htmlFor={editorId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className={cn(editorVariants({ variant }), className)}>
          {/* Toolbar */}
          {showToolbar && (
            <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2 dark:border-gray-700">
              {/* Text Formatting */}
              <div className="flex gap-1 border-r border-gray-200 pr-2 dark:border-gray-700">
                <ToolbarButton
                  action="bold"
                  title="Bold"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                    </svg>
                  }
                />
                <ToolbarButton
                  action="italic"
                  title="Italic"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4 M14 4l-4 16 M6 20h4" />
                    </svg>
                  }
                />
                <ToolbarButton
                  action="underline"
                  title="Underline"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v8a5 5 0 0010 0V4 M5 21h14" />
                    </svg>
                  }
                />
                <ToolbarButton
                  action="strikethrough"
                  title="Strikethrough"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18 M8 5c2-1 6-1 8 0 M8 19c2 1 6 1 8 0" />
                    </svg>
                  }
                />
              </div>

              {/* Headings */}
              <div className="flex gap-1 border-r border-gray-200 pr-2 dark:border-gray-700">
                <ToolbarButton
                  action="heading1"
                  title="Heading 1"
                  icon={<span className="text-sm font-bold">H1</span>}
                />
                <ToolbarButton
                  action="heading2"
                  title="Heading 2"
                  icon={<span className="text-sm font-bold">H2</span>}
                />
                <ToolbarButton
                  action="heading3"
                  title="Heading 3"
                  icon={<span className="text-sm font-bold">H3</span>}
                />
              </div>

              {/* Lists */}
              <div className="flex gap-1 border-r border-gray-200 pr-2 dark:border-gray-700">
                <ToolbarButton
                  action="bulletList"
                  title="Bullet List"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16 M4 12h16 M4 18h16" />
                    </svg>
                  }
                />
                <ToolbarButton
                  action="orderedList"
                  title="Ordered List"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h1v5 M8 6h13 M8 12h13 M8 18h13 M4 16v3h1" />
                    </svg>
                  }
                />
              </div>

              {/* Code & Quote */}
              <div className="flex gap-1 border-r border-gray-200 pr-2 dark:border-gray-700">
                <ToolbarButton
                  action="code"
                  title="Inline Code"
                  icon={<span className="font-mono text-xs">&lt;/&gt;</span>}
                />
                <ToolbarButton
                  action="codeBlock"
                  title="Code Block"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  }
                />
                <ToolbarButton
                  action="blockquote"
                  title="Blockquote"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  }
                />
              </div>

              {/* Link & Image */}
              <div className="flex gap-1 border-r border-gray-200 pr-2 dark:border-gray-700">
                <ToolbarButton
                  action="link"
                  title="Insert Link"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  }
                />
                <ToolbarButton
                  action="image"
                  title="Insert Image"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>

              {/* Undo/Redo */}
              <div className="flex gap-1">
                <ToolbarButton
                  action="undo"
                  title="Undo"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  }
                />
                <ToolbarButton
                  action="redo"
                  title="Redo"
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                    </svg>
                  }
                />
              </div>
            </div>
          )}

          {/* Editor Area */}
          <textarea
            ref={editorRef}
            id={editorId}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onSelect={updateSelection}
            disabled={disabled}
            maxLength={maxLength}
            className="w-full resize-none border-0 bg-transparent p-3 font-mono text-sm outline-none focus:ring-0"
            style={{ minHeight, maxHeight }}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${editorId}-error` : helperText ? `${editorId}-helper` : undefined
            }
            {...props}
          />

          {/* Character Count */}
          {showCharCount && (
            <div className="border-t border-gray-200 p-2 text-right text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {content.length}
              {maxLength && ` / ${maxLength}`} characters
            </div>
          )}
        </div>

        {hasError && (
          <p id={`${editorId}-error`} className="text-xs text-red-600 dark:text-red-500">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${editorId}-helper`} className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

/**
 * Simple Editor - Minimal toolbar
 */
export const SimpleEditor = React.forwardRef<HTMLTextAreaElement, Omit<RichTextEditorProps, 'showToolbar'>>(
  (props, ref) => {
    return <RichTextEditor ref={ref} showToolbar={false} {...props} />;
  }
);

SimpleEditor.displayName = 'SimpleEditor';

/**
 * Lesson Content Editor - Pre-configured for lesson content
 */
export const LessonContentEditor = React.forwardRef<HTMLTextAreaElement, Omit<RichTextEditorProps, 'format' | 'minHeight'>>(
  (props, ref) => {
    return (
      <RichTextEditor
        ref={ref}
        format="html"
        minHeight={400}
        showCharCount
        placeholder="Write your lesson content here..."
        {...props}
      />
    );
  }
);

LessonContentEditor.displayName = 'LessonContentEditor';

/**
 * Comment Editor - Pre-configured for comments
 */
export const CommentEditor = React.forwardRef<HTMLTextAreaElement, Omit<RichTextEditorProps, 'minHeight' | 'maxLength'>>(
  (props, ref) => {
    return (
      <RichTextEditor
        ref={ref}
        minHeight={120}
        maxLength={1000}
        showCharCount
        placeholder="Write a comment..."
        {...props}
      />
    );
  }
);

CommentEditor.displayName = 'CommentEditor';

export { RichTextEditor, editorVariants };
