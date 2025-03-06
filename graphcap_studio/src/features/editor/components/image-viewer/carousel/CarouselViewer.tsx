// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { Image } from '@/services/images';
import { ImageViewer } from '../ImageViewer';
import { 
  LoadingSpinner, 
  EmptyState, 
  NavigationButton, 
  ImageCounter
} from '../../ui';
// Import ThumbnailStrip directly from the file to avoid circular dependencies
import { ThumbnailStrip } from './ThumbnailStrip';
import { useCarouselNavigation, useCarouselControls, useThumbnailScroll } from './hooks';
import { useEditorContext } from '../../../context/EditorContext';

interface CarouselViewerProps {
  images: Image[];
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
  thumbnailOptions?: {
    minWidth?: number;
    maxWidth?: number;
    gap?: number;
    aspectRatio?: number;
  };
}

/**
 * A carousel-based image viewer component with sliding window pagination
 * 
 * This component displays images in a carousel view with navigation controls
 * and thumbnails. It uses a sliding window approach to load only a subset of
 * images at a time, improving performance for large image collections.
 */
export function CarouselViewer({
  images,
  isLoading = false,
  isEmpty = false,
  className = '',
  thumbnailOptions = {}
}: CarouselViewerProps) {
  const {
    selectedImage,
    handleSelectImage,
    handleEditImage
  } = useEditorContext();
  
  const { 
    minWidth = 64, 
    maxWidth = 120, 
    gap = 8,
    aspectRatio = 1
  } = thumbnailOptions;

  // Use custom hook for carousel navigation
  const {
    currentIndex,
    visibleImages,
    visibleStartIndex,
    totalImages,
    navigateToIndex,
    navigateByDelta,
    handleThumbnailSelect
  } = useCarouselNavigation({
    images,
    selectedImage,
    onSelectImage: handleSelectImage
  });

  // Use custom hook for keyboard and wheel navigation
  const { handleWheel } = useCarouselControls({
    navigateByDelta,
    enabled: !isLoading && !isEmpty && images.length > 0
  });

  // Use custom hook for thumbnail scrolling
  const thumbnailsRef = useThumbnailScroll({
    selectedIndex: selectedImage ? Math.max(0, currentIndex - visibleStartIndex) : 0,
    totalCount: visibleImages.length
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show empty state
  if (isEmpty || images.length === 0) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <EmptyState
          title="No images found"
          description="Try selecting a different dataset or uploading new images."
        />
      </div>
    );
  }

  return (
    <div 
      className={`flex h-full w-full flex-col ${className}`}
      onWheel={handleWheel}
    >
      {/* Main carousel image */}
      <div className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        {selectedImage && (
          <ImageViewer
            imagePath={selectedImage.path}
            alt={selectedImage.name}
            className="max-h-full max-w-full object-contain"
          />
        )}
        
        {/* Navigation buttons */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <NavigationButton
            direction="prev"
            onClick={() => navigateByDelta(-1)}
          />
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <NavigationButton
            direction="next"
            onClick={() => navigateByDelta(1)}
          />
        </div>
      </div>

      {/* Thumbnails row with navigation controls */}
      <div className="h-24 border-t border-gray-700 bg-gray-800 flex items-center px-4 relative shrink-0">
        {/* Previous button */}
        <NavigationButton
          direction="prev"
          onClick={() => navigateByDelta(-1)}
        />
        
        {/* Thumbnails container with counter */}
        <div className="flex-1 mx-14 relative" ref={thumbnailsRef}>
          <ThumbnailStrip
            images={visibleImages}
            selectedIndex={selectedImage ? Math.max(0, currentIndex - visibleStartIndex) : 0}
            onSelect={handleThumbnailSelect}
            minThumbnailWidth={minWidth}
            maxThumbnailWidth={maxWidth}
            gap={gap}
            aspectRatio={aspectRatio}
          />
          
          {/* Navigation counter - centered below thumbnails */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mt-1">
            <ImageCounter
              currentIndex={currentIndex}
              totalImages={totalImages}
            />
          </div>
        </div>
        
        {/* Next button */}
        <NavigationButton
          direction="next"
          onClick={() => navigateByDelta(1)}
        />
      </div>
    </div>
  );
} 