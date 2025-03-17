// SPDX-License-Identifier: Apache-2.0
import { Suspense, memo } from 'react';
import { useImageSuspenseQuery } from '@/hooks/useImageSuspenseQuery';
import { formatAspectRatioForCSS } from '@/utils/aspectRatio';
import { ImageErrorBoundary } from './ImageErrorBoundary';

interface ResponsiveImageProps {
  readonly imagePath: string;
  readonly alt: string;
  readonly className?: string;
  readonly aspectRatio?: number;
  readonly priority?: boolean;
  readonly objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  readonly sizes?: string;
  readonly onLoad?: () => void;
  readonly onError?: (error: Error) => void;
  readonly forceContainerAspect?: boolean;
  readonly maxHeight?: string;
}

/**
 * A loading skeleton component for images
 */
const ImageSkeleton = ({ className = '', aspectRatio }: { className?: string, aspectRatio?: string }) => (
  <div 
    className={`relative overflow-hidden bg-gray-800/20 flex items-center justify-center ${className}`}
    style={aspectRatio ? { aspectRatio } : undefined}
  >
    <div className="h-6 w-6 animate-pulse rounded-full bg-gray-700"></div>
  </div>
);

/**
 * The actual image component that gets rendered after suspense resolves
 */
function ImageComponent({
  imagePath,
  alt,
  className = '',
  aspectRatio,
  priority = false,
  objectFit = 'cover',
  sizes,
  onLoad,
  onError,
  forceContainerAspect = true,
  maxHeight,
}: ResponsiveImageProps) {
  const { data: src } = useImageSuspenseQuery(imagePath, {
    size: 'full',
    aspectRatio
  });
  
  // Format aspect ratio for CSS
  const cssAspectRatio = forceContainerAspect ? formatAspectRatioForCSS(aspectRatio) : undefined;

  const handleError = (_event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError) {
      onError(new Error(`Failed to load image: ${imagePath}`));
    }
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        ...(cssAspectRatio ? { aspectRatio: cssAspectRatio } : {}),
        ...(maxHeight ? { maxHeight } : {})
      }}
    >
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          forceContainerAspect ? 'w-full h-full' : 'max-w-full max-h-full w-auto h-auto'
        }`}
        style={{ 
          objectFit,
          ...(maxHeight && !forceContainerAspect ? { maxHeight } : {})
        }}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? undefined : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={() => onLoad?.()}
        onError={handleError}
      />
    </div>
  );
}

// Use memo to prevent unnecessary re-renders
const MemoizedImageComponent = memo(ImageComponent);

/**
 * A performant, responsive image component that optimizes loading and display
 * using React Suspense
 * 
 * Features:
 * - Automatic responsive sizing
 * - Lazy loading for images below the fold
 * - Proper aspect ratio preservation
 * - Loading states with suspense fallback
 * - Error handling with error boundaries
 * - Automatic retry for failed image loads
 * - Constrains tall images with maxHeight property
 */
export function ResponsiveImage(props: ResponsiveImageProps) {
  const cssAspectRatio = props.forceContainerAspect ? formatAspectRatioForCSS(props.aspectRatio) : undefined;
  
  return (
    <ImageErrorBoundary className={props.className}>
      <Suspense fallback={<ImageSkeleton className={props.className} aspectRatio={cssAspectRatio} />}>
        <MemoizedImageComponent {...props} />
      </Suspense>
    </ImageErrorBoundary>
  );
}
