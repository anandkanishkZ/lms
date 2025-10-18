/**
 * FileUpload Component
 * Drag-and-drop file upload with preview, progress, and validation
 * Used for course materials, assignments, profile pictures, etc.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const fileUploadVariants = cva(
  'relative rounded-lg border-2 border-dashed transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
        active: 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20',
        error: 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20',
        success: 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  error?: string;
  id?: string;
}

export interface FileUploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof fileUploadVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  acceptedFileTypes?: string[];
  showPreview?: boolean;
  showProgress?: boolean;
  onFilesChange?: (files: FileWithPreview[]) => void;
  onUpload?: (files: FileWithPreview[]) => Promise<void>;
  containerClassName?: string;
  icon?: React.ReactNode;
}

/**
 * Base FileUpload Component
 */
const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      containerClassName,
      variant: initialVariant,
      size,
      label,
      helperText,
      errorText,
      maxSize = 5 * 1024 * 1024, // 5MB default
      maxFiles = 10,
      acceptedFileTypes,
      showPreview = true,
      showProgress = true,
      onFilesChange,
      onUpload,
      disabled,
      icon,
      id,
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<FileWithPreview[]>([]);
    const [isDragging, setIsDragging] = React.useState(false);
    const [uploadError, setUploadError] = React.useState<string>('');
    const inputRef = React.useRef<HTMLInputElement>(null);
    const uploadId = id || `file-upload-${Math.random().toString(36).substr(2, 9)}`;

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Determine variant based on state
    const variant = uploadError || errorText ? 'error' : isDragging ? 'active' : initialVariant;
    const hasError = !!(uploadError || errorText);

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // Validate file
    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`;
      }
      if (acceptedFileTypes && acceptedFileTypes.length > 0) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const mimeType = file.type;
        const isAccepted = acceptedFileTypes.some(
          (type) => type === mimeType || type === fileExtension || type === fileExtension.substring(1)
        );
        if (!isAccepted) {
          return `File type not accepted. Allowed: ${acceptedFileTypes.join(', ')}`;
        }
      }
      return null;
    };

    // Process files
    const processFiles = (fileList: FileList | File[]) => {
      const newFiles: FileWithPreview[] = [];
      const fileArray = Array.from(fileList);

      // Check max files
      if (files.length + fileArray.length > maxFiles) {
        setUploadError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      fileArray.forEach((file) => {
        const error = validateFile(file);
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          progress: 0,
          error: error || undefined,
          id: Math.random().toString(36).substr(2, 9),
        });
        newFiles.push(fileWithPreview);
      });

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
      setUploadError('');

      // Auto-upload if handler provided
      if (onUpload && newFiles.every((f) => !f.error)) {
        handleUpload(newFiles);
      }
    };

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    };

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    };

    // Handle upload
    const handleUpload = async (filesToUpload: FileWithPreview[]) => {
      if (!onUpload) return;

      try {
        // Simulate upload progress (replace with actual upload logic)
        for (const file of filesToUpload) {
          const fileIndex = files.findIndex((f) => f.id === file.id);
          if (fileIndex === -1) continue;

          // Update progress (this should be done by actual upload handler)
          const interval = setInterval(() => {
            setFiles((prev) => {
              const newFiles = [...prev];
              if (newFiles[fileIndex] && newFiles[fileIndex].progress! < 100) {
                newFiles[fileIndex].progress = Math.min((newFiles[fileIndex].progress || 0) + 10, 100);
              }
              return newFiles;
            });
          }, 200);

          // Simulate upload completion
          setTimeout(() => clearInterval(interval), 2000);
        }

        await onUpload(filesToUpload);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : 'Upload failed');
      }
    };

    // Remove file
    const removeFile = (fileId: string) => {
      const updatedFiles = files.filter((f) => f.id !== fileId);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

      // Revoke object URL to avoid memory leaks
      const file = files.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };

    // Cleanup previews on unmount
    React.useEffect(() => {
      return () => {
        files.forEach((file) => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
      };
    }, [files]);

    return (
      <div className={cn('space-y-3', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Drop Zone */}
        <div
          className={cn(fileUploadVariants({ variant, size }), className)}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            id={uploadId}
            className="sr-only"
            onChange={handleFileChange}
            disabled={disabled}
            multiple={maxFiles > 1}
            accept={acceptedFileTypes?.join(',')}
            {...props}
          />
          <label
            htmlFor={uploadId}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center space-y-2 text-center',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {icon || (
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="text-blue-600 dark:text-blue-500">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {acceptedFileTypes && acceptedFileTypes.length > 0
                  ? `Accepted: ${acceptedFileTypes.join(', ')}`
                  : 'Any file type'}
                {' • '}
                Max {formatFileSize(maxSize)}
                {maxFiles > 1 && ` • Up to ${maxFiles} files`}
              </p>
            </div>
          </label>
        </div>

        {/* File Previews */}
        {showPreview && files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-6 w-6 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>

                  {/* Progress Bar */}
                  {showProgress && file.progress !== undefined && file.progress < 100 && !file.error && (
                    <div className="mt-1">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{file.progress}%</p>
                    </div>
                  )}

                  {/* Error */}
                  {file.error && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-500">{file.error}</p>
                  )}

                  {/* Success */}
                  {file.progress === 100 && !file.error && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-500">Upload complete</p>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id!)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 dark:hover:text-red-500"
                  aria-label="Remove file"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Helper/Error Text */}
        {hasError && (
          <p className="text-xs text-red-600 dark:text-red-500">{uploadError || errorText}</p>
        )}
        {!hasError && helperText && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

/**
 * Image Upload - Pre-configured for images only
 */
export const ImageUpload = React.forwardRef<HTMLInputElement, Omit<FileUploadProps, 'acceptedFileTypes'>>(
  (props, ref) => {
    return (
      <FileUpload
        ref={ref}
        acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
        maxSize={5 * 1024 * 1024} // 5MB
        {...props}
      />
    );
  }
);

ImageUpload.displayName = 'ImageUpload';

/**
 * Document Upload - Pre-configured for documents
 */
export const DocumentUpload = React.forwardRef<HTMLInputElement, Omit<FileUploadProps, 'acceptedFileTypes'>>(
  (props, ref) => {
    return (
      <FileUpload
        ref={ref}
        acceptedFileTypes={[
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
        ]}
        maxSize={10 * 1024 * 1024} // 10MB
        {...props}
      />
    );
  }
);

DocumentUpload.displayName = 'DocumentUpload';

/**
 * Avatar Upload - Pre-configured for profile pictures
 */
export const AvatarUpload = React.forwardRef<HTMLInputElement, Omit<FileUploadProps, 'acceptedFileTypes' | 'maxFiles'>>(
  (props, ref) => {
    return (
      <FileUpload
        ref={ref}
        acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
        maxSize={2 * 1024 * 1024} // 2MB
        maxFiles={1}
        size="sm"
        {...props}
      />
    );
  }
);

AvatarUpload.displayName = 'AvatarUpload';

export { FileUpload, fileUploadVariants };
