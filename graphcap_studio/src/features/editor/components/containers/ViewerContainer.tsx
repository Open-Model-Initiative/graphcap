// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import { Image } from '@/services/images';
import { ImageGallery } from '../image-viewer';
import { useEditorContext } from '../../context/EditorContext';

interface ViewerContainerProps {
  images: Image[];
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
}

/**
 * A container component for the image viewer that handles responsive layout
 * 
 * This component renders the ImageGallery component and handles responsive layout
 * adjustments for different screen sizes and zoom levels.
 */
export function ViewerContainer({
  images,
  isLoading = false,
  isEmpty = false,
  className = '',
}: ViewerContainerProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Update container dimensions on resize
  useEffect(() => {
    if (!containerRef) return;

    const updateDimensions = () => {
      const rect = containerRef.getBoundingClientRect();
      setContainerSize({
        width: rect.width,
        height: rect.height,
      });
    };
    
    // Initial update
    updateDimensions();
    
    // Create ResizeObserver to track container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef);
    
    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Calculate thumbnail options based on container size
  const thumbnailOptions = {
    // Dynamically adjust min and max width based on container size
    minWidth: Math.max(
      48, // Absolute minimum
      Math.floor(containerSize.width / 24) // Relative to container
    ),
    maxWidth: Math.max(
      96, // Absolute minimum for max width
      Math.min(
        180, // Absolute maximum
        Math.floor(containerSize.width / 8) // Relative to container
      )
    ),
    gap: Math.max(4, Math.min(12, Math.floor(containerSize.width / 200))), // Dynamic gap
  };

  return (
    <div 
      ref={setContainerRef}
      className={`h-full w-full overflow-hidden ${className}`}
    >
      <ImageGallery
        images={images}
        isLoading={isLoading}
        isEmpty={isEmpty}
        thumbnailOptions={thumbnailOptions}
      />
    </div>
  );
} 