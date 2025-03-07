// SPDX-License-Identifier: Apache-2.0
import { Image, getThumbnailUrl } from '@/services/images';
import { useThumbnailScroll, useDynamicThumbnails } from './hooks';

interface ThumbnailStripProps {
  readonly images: Image[];
  readonly selectedIndex: number;
  readonly onSelect: (index: number) => void;
  readonly className?: string;
  readonly minThumbnailWidth?: number;
  readonly maxThumbnailWidth?: number;
  readonly gap?: number;
  readonly aspectRatio?: number;
}

/**
 * A horizontal strip of thumbnails for navigating between images
 * 
 * This component displays a scrollable strip of image thumbnails,
 * highlighting the currently selected image and allowing users to
 * click on thumbnails to navigate to specific images. The thumbnails
 * are dynamically sized based on the available container width.
 */
export function ThumbnailStrip({
  images,
  selectedIndex,
  onSelect,
  className = '',
  minThumbnailWidth = 32,
  maxThumbnailWidth = 64,
  gap = 4,
  aspectRatio = 1
}: ThumbnailStripProps) {
  // Use custom hook for dynamic thumbnail sizing
  const {
    containerRef,
    thumbnailWidth,
    thumbnailHeight,
    gap: calculatedGap
  } = useDynamicThumbnails({
    totalCount: images.length,
    minThumbnailWidth,
    maxThumbnailWidth,
    gap,
    aspectRatio
  });

  // Use custom hook for thumbnail scrolling
  const scrollRef = useThumbnailScroll({
    selectedIndex,
    totalCount: images.length,
    thumbnailWidth: thumbnailWidth + calculatedGap
  });

  // Combine refs
  const setRefs = (element: HTMLDivElement | null) => {
    if (element) {
      // @ts-ignore - This is a valid way to set multiple refs
      containerRef.current = element;
      // @ts-ignore
      scrollRef.current = element;
    }
  };

  return (
    <div 
      ref={setRefs}
      className={`flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 py-2 ${className}`}
      style={{ gap: `${calculatedGap}px` }}
    >
      {images.map((image, index) => (
        <button
          key={image.path}
          className={`relative flex-shrink-0 cursor-pointer overflow-hidden rounded border-2 transition-all ${
            index === selectedIndex
              ? 'border-blue-500 shadow-md'
              : 'border-transparent hover:border-gray-600'
          }`}
          style={{ 
            width: `${thumbnailWidth}px`, 
            height: `${thumbnailHeight}px` 
          }}
          onClick={() => onSelect(index)}
          aria-label={`Select image ${image.name}`}
          aria-pressed={index === selectedIndex}
        >
          <img
            src={getThumbnailUrl(image.path, thumbnailWidth, thumbnailHeight)}
            alt={image.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* Add a subtle indicator for the selected thumbnail */}
          {index === selectedIndex && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
          )}
        </button>
      ))}
    </div>
  );
} 