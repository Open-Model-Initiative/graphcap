// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { ThumbnailStrip } from '../ThumbnailStrip';
import { ImageCounter } from '@/components/ui/ImageCounter';
import { useImageCarousel } from '../ImageCarouselContext';

interface ThumbnailSectionProps {
  className?: string;
}

/**
 * Thumbnail section component
 * 
 * This component displays the thumbnail strip and image counter.
 */
export function ThumbnailSection({ className = '' }: ThumbnailSectionProps) {
  const { 
    thumbnailsRef, 
    thumbnailContainerRef,
    visibleImages, 
    currentIndex, 
    visibleStartIndex, 
    totalImages, 
    selectedImage,
    handleThumbnailSelect,
    thumbnailOptions 
  } = useImageCarousel();

  const { 
    minWidth, 
    maxWidth, 
    gap, 
    aspectRatio, 
    maxHeight 
  } = thumbnailOptions;

  return (
    <ErrorBoundary>
      <div 
        ref={thumbnailContainerRef} 
        className={`w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 ${className}`}
      >
        {/* Thumbnails with counter */}
        <div ref={thumbnailsRef} className="w-full">
          <ThumbnailStrip
            images={visibleImages}
            selectedIndex={selectedImage ? Math.max(0, currentIndex - visibleStartIndex) : 0}
            onSelect={handleThumbnailSelect}
            minThumbnailWidth={minWidth}
            maxThumbnailWidth={maxWidth}
            gap={gap}
            aspectRatio={aspectRatio}
            maxHeight={maxHeight}
            className="w-full mb-2"
          />
          
          {/* Navigation counter - centered below thumbnails */}
          <div className="w-full flex justify-center mt-1">
            <ImageCounter
              currentIndex={currentIndex + 1} // Display 1-based index to users
              totalImages={totalImages}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 