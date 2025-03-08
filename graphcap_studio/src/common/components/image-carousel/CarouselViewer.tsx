// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';
import { ResponsiveImage } from '@/common/components/responsive-image';
import { 
  LoadingSpinner, 
  EmptyState, 
  NavigationButton, 
  ImageCounter
} from '@/common/components/ui';
import { ThumbnailStrip } from './ThumbnailStrip';
import { 
  useCarouselNavigation, 
  useCarouselControls, 
  useThumbnailScroll,
  useWheelNavigation,
  useCarouselLayout,
  useImagePreloader
} from './hooks';
import styles from './CarouselViewer.module.css';

interface CarouselViewerProps {
  readonly images: Image[];
  readonly isLoading?: boolean;
  readonly isEmpty?: boolean;
  readonly className?: string;
  readonly selectedImage?: Image | null;
  readonly onSelectImage: (image: Image) => void;
  readonly thumbnailOptions?: {
    readonly minWidth?: number;
    readonly maxWidth?: number;
    readonly gap?: number;
    readonly aspectRatio?: number;
    readonly maxHeight?: number;
  };
  readonly preloadOptions?: {
    readonly enabled?: boolean;
    readonly preloadCount?: number;
  };
}

/**
 * A carousel-based image viewer component with sliding window pagination
 * 
 * This component displays images in a carousel view with navigation controls
 * and thumbnails. It uses a sliding window approach to load only a subset of
 * images at a time, improving performance for large image collections.
 * 
 * @param images - Array of image objects to display
 * @param isLoading - Whether the carousel is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param className - Additional CSS classes
 * @param selectedImage - Currently selected image
 * @param onSelectImage - Callback when an image is selected
 * @param thumbnailOptions - Optional configuration for thumbnail display
 * @param preloadOptions - Optional configuration for image preloading
 */
export function CarouselViewer({
  images,
  isLoading = false,
  isEmpty = false,
  className = '',
  selectedImage,
  onSelectImage,
  thumbnailOptions = {},
  preloadOptions = {}
}: Readonly<CarouselViewerProps>) {
  const { 
    minWidth = 64, 
    maxWidth = 120, 
    gap = 8,
    aspectRatio = 1,
    maxHeight = 70
  } = thumbnailOptions;

  const {
    enabled: preloadEnabled = true,
    preloadCount = 2
  } = preloadOptions;

  // Use custom hook for carousel layout
  const {
    containerRef,
    imageContainerRef,
    thumbnailContainerRef,
    imageContainerHeight,
    isCalculating
  } = useCarouselLayout({
    thumbnailHeight: 96 // 6rem
  });

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
    selectedImage: selectedImage || null,
    onSelectImage
  });

  // Use custom hook for keyboard navigation
  useCarouselControls({
    navigateByDelta,
    enabled: !isLoading && !isEmpty && images.length > 0
  });

  // Use custom hook for wheel navigation
  useWheelNavigation({
    containerRef: imageContainerRef,
    navigateByDelta,
    enabled: !isLoading && !isEmpty && images.length > 0
  });

  // Use custom hook for thumbnail scrolling
  const thumbnailsRef = useThumbnailScroll({
    selectedIndex: selectedImage ? Math.max(0, currentIndex - visibleStartIndex) : 0,
    totalCount: visibleImages.length
  });

  // Use custom hook for image preloading
  useImagePreloader({
    images,
    currentIndex,
    preloadCount,
    enabled: preloadEnabled && !isLoading && !isEmpty && images.length > 0
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${styles.loadingContainer} ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show empty state
  if (isEmpty || images.length === 0) {
    return (
      <div className={`${styles.emptyContainer} ${className}`}>
        <EmptyState
          title="No images found"
          description="Try selecting a different dataset or uploading new images."
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      {/* Main image display */}
      <div 
        ref={imageContainerRef}
        className={styles.imageContainer}
        style={{ 
          height: isCalculating ? 'auto' : `${imageContainerHeight}px` 
        }}
      >
        {selectedImage && (
          <div className="relative h-full w-full p-4">
            <ResponsiveImage
              imagePath={selectedImage.path}
              alt={selectedImage.name}
              className="h-full w-full"
              objectFit="contain"
              priority={true} // Main image is high priority
              sizes="(max-width: 768px) 100vw, 80vw"
              forceContainerAspect={false} // Don't force aspect ratio for main gallery view
            />
          </div>
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

      {/* Thumbnails row - positioned absolutely at the bottom */}
      <div ref={thumbnailContainerRef} className={styles.thumbnailContainer}>
        {/* Thumbnails with counter */}
        <div className={styles.thumbnailWrapper} ref={thumbnailsRef}>
          <ThumbnailStrip
            images={visibleImages}
            selectedIndex={selectedImage ? Math.max(0, currentIndex - visibleStartIndex) : 0}
            onSelect={handleThumbnailSelect}
            minThumbnailWidth={minWidth}
            maxThumbnailWidth={maxWidth}
            gap={gap}
            aspectRatio={aspectRatio}
            maxHeight={maxHeight}
            className="w-full"
          />
          
          {/* Navigation counter - centered below thumbnails */}
          <div className={styles.counterContainer}>
            <ImageCounter
              currentIndex={currentIndex}
              totalImages={totalImages}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 