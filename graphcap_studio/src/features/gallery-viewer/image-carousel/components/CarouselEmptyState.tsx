// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { Upload } from 'lucide-react';
import { EmptyState } from '@/components/ui/status/EmptyState';
import { UploadDropzone } from '@/features/gallery-viewer/image-uploader';
import { useImageCarousel } from '../ImageCarouselContext';

interface CarouselEmptyStateProps {
  className?: string;
}

/**
 * Empty state component for the carousel
 * 
 * This component displays a message when no images are available,
 * along with an upload dropzone to add new images.
 */
export function CarouselEmptyState({ className = '' }: CarouselEmptyStateProps) {
  const { datasetName, onUploadComplete } = useImageCarousel();
  
  return (
    <div className={`flex items-center justify-center w-full h-full min-h-[320px] ${className}`}>
      <div className="w-full max-w-md p-6">
        <EmptyState
          title="No images found"
          description="Upload new images or select a different dataset."
          icon={<Upload className="h-12 w-12 text-gray-400" />}
        />
        <div className="mt-6">
          <UploadDropzone
            datasetName={datasetName}
            className="w-64 h-12 mx-auto"
            onUploadComplete={onUploadComplete}
          />
        </div>
      </div>
    </div>
  );
} 