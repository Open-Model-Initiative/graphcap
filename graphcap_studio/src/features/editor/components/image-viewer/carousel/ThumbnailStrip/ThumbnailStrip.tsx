// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback, memo } from 'react';
import { Image, getThumbnailUrl } from '@/services/images';
import { useThumbnailScroll, useDynamicThumbnails } from '../hooks';
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
  aspectRatio = 1
}: Readonly<ThumbnailStripProps>) {
  // Track loading state for each image
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    Object.fromEntries(images.map(img => [img.path, true]))
  );

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

  // Handle image load completion
  const handleImageLoaded = useCallback((path: string) => {
    setLoadingStates(prev => ({ ...prev, [path]: false }));
  }, []);

  return (
    <div 
      ref={setRefs}
      className={`${styles.container} ${className}`}
      style={{ gap: `${calculatedGap}px` }}
    >
      {images.map((image, index) => (
        <button
          key={image.path}
          className={`${styles.thumbnailButton} ${index === selectedIndex ? styles.selected : ''}`}
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
            className={`${styles.thumbnailImage} ${loadingStates[image.path] ? styles.loading : ''}`}
            loading="lazy"
            onLoad={() => handleImageLoaded(image.path)}
          />
          {index === selectedIndex && (
            <div className={styles.selectedIndicator}></div>
          )}
        </button>
      ))}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const ThumbnailStrip = memo(ThumbnailStripBase); 