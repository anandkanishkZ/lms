import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FileAttachment as FileAttachmentComponent } from './FileAttachment';

export interface FileLinkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileLink: {
      setFileLink: (options: { 
        url: string; 
        fileName: string; 
        fileSize?: number; 
        fileType?: string;
      }) => ReturnType;
    };
  }
}

export const FileLink = Node.create<FileLinkOptions>({
  name: 'fileLink',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      url: {
        default: null,
      },
      fileName: {
        default: 'Unnamed File',
      },
      fileSize: {
        default: 0,
      },
      fileType: {
        default: 'application/octet-stream',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-file-link]',
        getAttrs: (dom) => {
          const element = dom as HTMLElement;
          return {
            url: element.getAttribute('data-url'),
            fileName: element.getAttribute('data-file-name'),
            fileSize: element.getAttribute('data-file-size') ? parseInt(element.getAttribute('data-file-size')!) : 0,
            fileType: element.getAttribute('data-file-type'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
        'data-file-link': '',
        'data-url': HTMLAttributes.url,
        'data-file-name': HTMLAttributes.fileName,
        'data-file-size': HTMLAttributes.fileSize,
        'data-file-type': HTMLAttributes.fileType,
      })
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentComponent as any);
  },

  addCommands() {
    return {
      setFileLink: (options) => ({ commands }) => {
        console.log('🔗 setFileLink command called with options:', options);
        const result = commands.insertContent({
          type: this.name,
          attrs: options,
        });
        console.log('🔗 insertContent result:', result);
        return result;
      },
    };
  },
});

export default FileLink;
