// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import { Image } from '@/services/images';
import { GridViewer } from '../image-viewer/GridViewer';
import { CarouselViewer } from '../image-viewer/carousel/CarouselViewer';
import { useEditorContext } from '../../context/EditorContext';

interface ViewerContainerProps {
  images: Image[];
  selectedImage: Image | null;
  onSelectImage: (image: Image) => void;
  onEditImage?: () => void;
  onAddToDataset?: () => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
}

/**
 * A container component for the image viewer that handles responsive layout
 * 
 * This component renders either a GridViewer or CarouselViewer based on the
 * current view mode in the EditorContext. It also handles responsive layout
 * adjustments for different screen sizes and zoom levels.
 */
export function ViewerContainer({
  images,
  selectedImage,
  onSelectImage,
  onEditImage,
  onAddToDataset,
  isLoading = false,
  isEmpty = false,
  className = '',
}: ViewerContainerProps) {
  const { viewMode } = useEditorContext();
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
    aspectRatio: 1, // Square thumbnails by default
  };

  return (
    <div 
      ref={setContainerRef}
      className={`h-full w-full overflow-hidden ${className}`}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {viewMode === 'grid' ? (
        <GridViewer
          images={images}
          selectedImage={selectedImage}
          onSelectImage={onSelectImage}
          onEditImage={onEditImage}
          onAddToDataset={onAddToDataset}
          isLoading={isLoading}
          isEmpty={isEmpty}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          className="flex-grow"
        />
      ) : (
        <CarouselViewer
          images={images}
          selectedImage={selectedImage}
          onSelectImage={onSelectImage}
          onEditImage={onEditImage}
          onAddToDataset={onAddToDataset}
          isLoading={isLoading}
          isEmpty={isEmpty}
          thumbnailOptions={thumbnailOptions}
        />
      )}
    </div>
  );
} 