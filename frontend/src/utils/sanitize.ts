import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Unsanitized HTML content
 * @returns Sanitized HTML content
 */
export const sanitizeHTML = (dirty: string): string => {
  if (!dirty) return '';
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup', 'mark',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li',
      // Links and media
      'a', 'img',
      // Code
      'code', 'pre',
      // Tables
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // Other
      'blockquote', 'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel', 'width', 'height', 'style'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    SAFE_FOR_TEMPLATES: true
  });
};

/**
 * Sanitize plain text input by removing HTML tags
 * @param input - User input string
 * @returns Sanitized plain text
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Sanitize URL to prevent javascript: and data: URLs
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return '';
  
  const trimmedUrl = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
  if (dangerousProtocols.test(trimmedUrl)) {
    return '';
  }
  
  // Allow only http, https, mailto, tel
  const allowedProtocols = /^(https?|mailto|tel):/i;
  if (!allowedProtocols.test(trimmedUrl) && !trimmedUrl.startsWith('/')) {
    return '';
  }
  
  return trimmedUrl;
};

/**
 * Escape special characters in a string for use in HTML
 * @param str - String to escape
 * @returns Escaped string
 */
export const escapeHtml = (str: string): string => {
  if (!str) return '';
  
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Sanitize JSON object recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export const sanitizeObject = (obj: any): any => {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};
