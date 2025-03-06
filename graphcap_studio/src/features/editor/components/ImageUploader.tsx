// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { uploadImage } from '@/services/images';

interface ImageUploaderProps {
  datasetName: string;
  onUploadComplete: () => void;
  className?: string;
}

/**
 * A component for uploading images to a dataset with drag and drop functionality
 */
export function ImageUploader({ 
  datasetName, 
  onUploadComplete,
  className = ''
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!datasetName) {
      toast.error('Please select a dataset first');
      return;
    }

    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    const totalFiles = acceptedFiles.length;
    let uploadedCount = 0;
    const failedUploads: string[] = [];

    // Initialize progress for each file
    const initialProgress: Record<string, number> = {};
    acceptedFiles.forEach(file => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);

    // Process files sequentially to avoid overwhelming the server
    for (const file of acceptedFiles) {
      try {
        // Update progress to show we're starting this file
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 10 // Start at 10%
        }));

        // Upload the file to the specified dataset
        await uploadImage(file, datasetName);
        
        // Update progress and count
        uploadedCount++;
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
        
        // Show success toast for each file
        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        failedUploads.push(file.name);
        
        // Update progress to show failure
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: -1 // Use -1 to indicate failure
        }));
        
        // Show error toast
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // Show summary toast
    if (failedUploads.length === 0) {
      if (totalFiles > 1) {
        toast.success(`Successfully uploaded all ${totalFiles} images`);
      }
    } else {
      toast.error(`Failed to upload ${failedUploads.length} of ${totalFiles} images`);
    }

    setIsUploading(false);
    onUploadComplete();
  }, [datasetName, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    disabled: isUploading || !datasetName,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div className={`${className}`}>
      <div
        {...getRootProps()}
        className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700'
        } ${isUploading || !datasetName ? 'opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        <svg
          className="mb-2 h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        
        {isDragActive ? (
          <p className="text-center text-sm text-blue-300">Drop the images here...</p>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-300">
              {datasetName 
                ? 'Drag & drop images here, or click to select files' 
                : 'Please select a dataset first'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Supports: PNG, JPG, GIF, WebP (max 50MB)
            </p>
          </div>
        )}
      </div>

      {/* Upload progress */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Uploading...</h3>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 truncate max-w-[80%]">{fileName}</span>
                <span className="text-xs text-gray-400">
                  {progress === -1 ? 'Failed' : progress === 100 ? 'Complete' : `${progress}%`}
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-gray-700">
                <div
                  className={`h-1 rounded-full ${
                    progress === -1
                      ? 'bg-red-500'
                      : progress === 100
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress === -1 ? 100 : progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 