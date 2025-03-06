// SPDX-License-Identifier: Apache-2.0
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

interface CarouselViewerProps {
  images: Image[];
  selectedImage: Image | null;
  onSelectImage: (image: Image) => void;
  onEditImage?: () => void;
  onAddToDataset?: () => void;
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
  selectedImage,
  onSelectImage,
  onEditImage,
  onAddToDataset,
  isLoading = false,
  isEmpty = false,
  className = '',
  thumbnailOptions = {}
}: CarouselViewerProps) {
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
    navigateByDelta,
    handleThumbnailSelect
  } = useCarouselNavigation({
    images,
    selectedImage,
    onSelectImage
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

  // Calculate the local index within the visible window
  const localIndex = selectedImage 
    ? Math.max(0, currentIndex - visibleStartIndex)
    : 0;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900">
        <LoadingSpinner size="md" color="primary" />
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <EmptyState
        title="No images"
        description="No images found in this location."
        className="bg-gray-900"
      />
    );
  }
  
  return (
    <div 
      className={`flex h-full w-full flex-col bg-gray-900 ${className}`}
      onWheel={handleWheel}
    >
      {/* Static info bar at the top */}
      <div className="bg-gray-800 border-b border-gray-700 py-2 px-4 flex justify-between items-center">
        <div className="text-sm text-gray-300">
          {selectedImage?.name || 'No image selected'}
        </div>
        
        {/* Image counter */}
        <div className="text-sm text-gray-400">
          {totalImages > 0 ? `${currentIndex + 1} of ${totalImages}` : '0 images'}
        </div>
      </div>
      
      {/* Main carousel image */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {selectedImage && (
          <ImageViewer
            imagePath={selectedImage.path}
            alt={selectedImage.name}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>
      
      {/* Thumbnails row with navigation controls */}
      <div className="h-24 border-t border-gray-700 bg-gray-800 flex items-center px-4 relative">
        {/* Previous button */}
        <NavigationButton
          direction="prev"
          onClick={() => navigateByDelta(-1)}
        />
        
        {/* Thumbnails container with counter */}
        <div className="flex-1 mx-14 relative" ref={thumbnailsRef}>
          <ThumbnailStrip
            images={visibleImages}
            selectedIndex={localIndex}
            onSelect={handleThumbnailSelect}
            minThumbnailWidth={minWidth}
            maxThumbnailWidth={maxWidth}
            gap={gap}
            aspectRatio={aspectRatio}
          />
          
          {/* Navigation counter - centered below thumbnails */}
          <ImageCounter
            currentIndex={currentIndex + 1}
            totalImages={totalImages}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mt-1"
          />
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