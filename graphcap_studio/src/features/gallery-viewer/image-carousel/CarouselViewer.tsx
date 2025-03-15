// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Image, preloadImage } from '@/services/images';
import { ResponsiveImage } from '@/common/components/responsive-image';
import { 
  LoadingSpinner, 
  EmptyState, 
  NavigationButton, 
  ImageCounter
} from '@/components/ui';


import { ImageOff, Upload } from 'lucide-react';
import { ThumbnailStrip } from './ThumbnailStrip';
import { ErrorBoundary } from './ErrorBoundary';
import { UploadDropzone } from '@/features/gallery-viewer/image-uploader';
import { 
  useCarouselNavigation, 
  useCarouselControls, 
  useThumbnailScroll,
  useWheelNavigation,
  useCarouselLayout,
  useImagePreloader
} from './hooks';
import { ImageCarouselProvider } from './ImageCarouselContext';
import styles from './CarouselViewer.module.css';

interface CarouselViewerProps {
  readonly images: Image[];
  readonly isLoading?: boolean;
  readonly isEmpty?: boolean;
  readonly className?: string;
  readonly selectedImage?: Image | null;
  readonly onSelectImage: (image: Image) => void;
  readonly datasetName: string;
  readonly onUploadComplete?: () => void;
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
    readonly maxConcurrentPreloads?: number;
  };
}

/**
 * A carousel-based image viewer component with sliding window pagination and upload capability
 * 
 * This component displays images in a carousel view with navigation controls
 * and thumbnails. It uses a sliding window approach to load only a subset of
 * images at a time, improving performance for large image collections.
 * It also provides an option to upload new images directly from the carousel.
 * 
 * @param images - Array of image objects to display
 * @param isLoading - Whether the carousel is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param className - Additional CSS classes
 * @param selectedImage - Currently selected image
 * @param onSelectImage - Callback when an image is selected
 * @param datasetName - Name of the dataset to upload images to
 * @param onUploadComplete - Callback when upload is complete
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
  datasetName,
  onUploadComplete,
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
    preloadCount = 2,
    maxConcurrentPreloads = 3
  } = preloadOptions;

  // State for image loading error
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

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
    enabled: preloadEnabled && !isLoading && !isEmpty && images.length > 0,
    maxConcurrentPreloads
  });

  // Handle retry when image fails to load
  const handleRetry = () => {
    if (selectedImage) {
      setImageLoadError(false);
      // Attempt to reload the image
      preloadImage(selectedImage.path, 'full');
    }
  };

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

  return (
    <ImageCarouselProvider 
      datasetName={datasetName}
      onUploadComplete={onUploadComplete}
    >
      <ErrorBoundary>
        <section 
          ref={containerRef} 
          className={`${styles.container} ${className}`}
          aria-label="Image carousel"
        >
          {/* Main image display */}
          <div 
            ref={imageContainerRef}
            className={styles.imageContainer}
            style={{ 
              height: isCalculating ? 'auto' : `${imageContainerHeight}px` 
            }}
          >
            {selectedImage && (
              <div className={styles.imageWrapper}>
                <ResponsiveImage
                  imagePath={selectedImage.path}
                  alt={selectedImage.name}
                  className="h-full w-full"
                  objectFit="contain"
                  priority={true} // Main image is high priority
                  sizes="(max-width: 768px) 100vw, 80vw"
                  forceContainerAspect={false} // Don't force aspect ratio for main gallery view
                  onError={() => setImageLoadError(true)}
                  aria-labelledby="carousel-image-label"
                />
                
                {/* Hidden label for screen readers */}
                <span id="carousel-image-label" className="sr-only">
                  {selectedImage.name} - Image {currentIndex + 1} of {totalImages}
                </span>
                
                {/* Show error state if image fails to load */}
                {imageLoadError && (
                  <div className={styles.errorContainer}>
                    <div className={styles.errorContent}>
                      <ImageOff className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Failed to load image</p>
                      <button 
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                        onClick={handleRetry}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className={`${styles.navigationButtonContainer} ${styles.navigationButtonLeft}`}>
              <NavigationButton
                direction="prev"
                onClick={() => navigateByDelta(-1)}
                aria-label="Previous image"
                aria-controls="carousel-image-label"
                aria-disabled={images.length <= 1}
              />
            </div>
            <div className={`${styles.navigationButtonContainer} ${styles.navigationButtonRight}`}>
              <NavigationButton
                direction="next"
                onClick={() => navigateByDelta(1)}
                aria-label="Next image"
                aria-controls="carousel-image-label"
                aria-disabled={images.length <= 1}
              />
            </div>
          </div>

          {/* Skip navigation link for keyboard users */}
          <button 
            className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:p-2 focus:bg-white focus:text-black"
            onClick={() => {
              // Find and focus the first interactive element after the carousel
              const carousel = containerRef.current;
              if (carousel) {
                const nextFocusableElement = carousel.nextElementSibling?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (nextFocusableElement instanceof HTMLElement) {
                  nextFocusableElement.focus();
                }
              }
            }}
          >
            Skip carousel navigation
          </button>

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
                  currentIndex={currentIndex + 1} // Display 1-based index to users
                  totalImages={totalImages}
                />
              </div>
            </div>
          </div>
        </section>
      </ErrorBoundary>
    </ImageCarouselProvider>
  );
}
