// SPDX-License-Identifier: Apache-2.0
import { Suspense, memo } from 'react';
import { formatAspectRatioForCSS } from '@/utils/aspectRatio';
import { useThumbnailSuspenseQuery } from '@/hooks/useThumbnailSuspenseQuery';

interface ThumbnailComponentProps {
  readonly imagePath: string;
  readonly alt: string;
  readonly className?: string;
  readonly aspectRatio?: number;
  readonly width?: number;
  readonly height?: number;
  readonly maxHeight?: string;
}

/**
 * A loading skeleton component specifically for thumbnails
 */
const ThumbnailSkeleton = ({ className = '', aspectRatio }: { className?: string, aspectRatio?: string }) => (
  <div 
    className={`relative overflow-hidden bg-gray-800/10 flex items-center justify-center ${className}`}
    style={aspectRatio ? { aspectRatio } : undefined}
  >
    <div className="h-4 w-4 animate-pulse rounded-full bg-gray-600/50"></div>
  </div>
);

/**
 * The actual thumbnail component that gets rendered after suspense resolves
 */
function InnerThumbnailComponent({
  imagePath,
  alt,
  className = '',
  aspectRatio = 1,
  width = 150,
  height,
  maxHeight,
}: ThumbnailComponentProps) {
  const { data: src } = useThumbnailSuspenseQuery(imagePath, {
    width,
    height,
    aspectRatio
  });
  
  // Format aspect ratio for CSS
  const cssAspectRatio = formatAspectRatioForCSS(aspectRatio);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ 
        aspectRatio: cssAspectRatio,
        ...(maxHeight ? { maxHeight } : {})
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full transition-opacity duration-200"
        style={{ 
          objectFit: 'cover',
          ...(maxHeight ? { maxHeight } : {})
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

// Use memo to prevent unnecessary re-renders
const MemoizedThumbnailComponent = memo(InnerThumbnailComponent);

/**
 * A performant thumbnail component that uses Suspense for loading
 * 
 * Features:
 * - Efficient loading with Suspense
 * - Consistent aspect ratio handling
 * - Height constraints for tall images
 */
export function ThumbnailComponent(props: ThumbnailComponentProps) {
  const cssAspectRatio = formatAspectRatioForCSS(props.aspectRatio ?? 1);
  
  return (
    <Suspense fallback={<ThumbnailSkeleton className={props.className} aspectRatio={cssAspectRatio} />}>
      <MemoizedThumbnailComponent {...props} />
    </Suspense>
  );
} 