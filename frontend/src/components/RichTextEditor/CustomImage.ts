import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from './ImageNodeView';

export const CustomImage = Image.extend({
  name: 'customImage',

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '50%',
        parseHTML: (element: HTMLElement) => element.getAttribute('width') || element.style.width || '50%',
        renderHTML: (attributes: any) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}`,
          };
        },
      },
      height: {
        default: 'auto',
        parseHTML: (element: HTMLElement) => element.getAttribute('height') || element.style.height || 'auto',
        renderHTML: (attributes: any) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
            style: `height: ${attributes.height}`,
          };
        },
      },
      align: {
        default: 'left',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-align') || 'left',
        renderHTML: (attributes: any) => {
          if (!attributes.align) {
            return {};
          }
          return {
            'data-align': attributes.align,
          };
        },
      },
      hidden: {
        default: false,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-hidden') === 'true',
        renderHTML: (attributes: any) => {
          if (!attributes.hidden) {
            return {};
          }
          return {
            'data-hidden': 'true',
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

export default CustomImage;
