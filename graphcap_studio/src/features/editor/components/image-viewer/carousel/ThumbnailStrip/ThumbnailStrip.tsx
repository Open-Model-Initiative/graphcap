// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { Image } from '@/services/images';
import { ThumbnailImage } from '@/common/components/ui/responsive-image';
import { useDynamicThumbnails } from '../hooks';
import styles from './ThumbnailStrip.module.css';

interface ThumbnailStripProps {
  readonly images: Image[];
  readonly selectedIndex: number;
  readonly onSelect: (index: number) => void;
  readonly className?: string;
  readonly minThumbnailWidth?: number;
  readonly maxThumbnailWidth?: number;
  readonly gap?: number;
  readonly aspectRatio?: number;
  readonly maxHeight?: number;
}

/**
 * A horizontal strip of thumbnails for navigating between images
 * 
 * This component displays a scrollable strip of image thumbnails,
 * highlighting the currently selected image and allowing users to
 * click on thumbnails to navigate to specific images. The thumbnails
 * are dynamically sized based on the available container width.
 */
function ThumbnailStripBase({
  images,
  selectedIndex,
  onSelect,
  className = '',
  minThumbnailWidth = 32,
  maxThumbnailWidth = 64,
  gap = 4,
  aspectRatio = 1,
  maxHeight = 70
}: Readonly<ThumbnailStripProps>) {
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
    aspectRatio,
    maxHeight
  });

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={{ gap: `${calculatedGap}px` }}
      data-testid="thumbnail-strip"
    >
      {images.map((image, index) => (
        <div
          key={image.path}
          style={{ 
            width: `${thumbnailWidth}px`, 
            height: `${thumbnailHeight}px`,
            flexShrink: 0
          }}
        >
          <ThumbnailImage
            imagePath={image.path}
            alt={image.name}
            isSelected={index === selectedIndex}
            aspectRatio={aspectRatio}
            className="h-full w-full"
            onClick={() => onSelect(index)}
          />
        </div>
      ))}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const ThumbnailStrip = memo(ThumbnailStripBase); 