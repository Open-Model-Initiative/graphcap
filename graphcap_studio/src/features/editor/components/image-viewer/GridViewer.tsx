// SPDX-License-Identifier: Apache-2.0
import { useState, useRef, useEffect, useCallback } from 'react';
import { FixedSizeGrid } from 'react-window';
import { Image } from '@/services/images';
import { LazyImage } from './LazyImage';
import { LoadingSpinner, EmptyState } from '../ui';

interface GridViewerProps {
  images: Image[];
  selectedImage: Image | null;
  onSelectImage: (image: Image) => void;
  onEditImage?: () => void;
  onAddToDataset?: () => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
  containerWidth?: number;
  containerHeight?: number;
}

/**
 * A grid-based image viewer component with virtualization
 * 
 * Features:
 * - Virtualized grid for efficient rendering of large image collections
 * - Responsive layout that adapts to container dimensions
 * - Loading and empty states
 * - Selection handling
 * - Automatic resizing with ResizeObserver
 * 
 * @param images - Array of image objects to display
 * @param selectedImage - Currently selected image
 * @param onSelectImage - Callback when an image is selected
 * @param onEditImage - Optional callback for edit action
 * @param onAddToDataset - Optional callback for adding to dataset
 * @param isLoading - Whether the grid is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param className - Additional CSS classes
 * @param containerWidth - Optional explicit container width
 * @param containerHeight - Optional explicit container height
 */
export function GridViewer({
  images,
  selectedImage,
  onSelectImage,
  onEditImage,
  onAddToDataset,
  isLoading = false,
  isEmpty = false,
  className = '',
  containerWidth: externalWidth,
  containerHeight: externalHeight,
}: GridViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(externalWidth || 0);
  const [containerHeight, setContainerHeight] = useState(externalHeight || 0);
  
  // Image dimensions
  const imageHeight = 200;
  const imageWidth = 200;
  const gap = 16; // 4 in Tailwind units = 16px
  
  // Update container dimensions on resize if external dimensions are not provided
  useEffect(() => {
    if (externalWidth && externalHeight) {
      setContainerWidth(externalWidth);
      setContainerHeight(externalHeight);
      return;
    }
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
        setContainerHeight(rect.height);
      }
    };
    
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [externalWidth, externalHeight]);
  
  // Calculate columns based on container width
  const columnCount = Math.max(1, Math.floor((containerWidth - gap) / (imageWidth + gap)));
  
  // Calculate row count
  const rowCount = Math.ceil(images.length / columnCount);
  
  // Cell renderer for the grid
  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    
    if (index >= images.length) {
      return null;
    }
    
    const image = images[index];
    const isSelected = selectedImage?.path === image.path;
    
    // Adjust style to account for gap
    const adjustedStyle = {
      ...style,
      left: `${parseFloat(style.left as string) + gap}px`,
      top: `${parseFloat(style.top as string) + gap}px`,
      width: `${parseFloat(style.width as string) - gap}px`,
      height: `${parseFloat(style.height as string) - gap}px`,
    };
    
    return (
      <div style={adjustedStyle}>
        <LazyImage
          key={image.path}
          image={image}
          isSelected={isSelected}
          onSelect={onSelectImage}
          onEdit={isSelected ? onEditImage : undefined}
          onAddToDataset={isSelected ? onAddToDataset : undefined}
        />
      </div>
    );
  }, [images, columnCount, selectedImage, onSelectImage, onEditImage, onAddToDataset]);
  
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
      ref={containerRef}
      className={`h-full w-full overflow-auto bg-gray-900 p-6 ${className}`}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {containerWidth > 0 && containerHeight > 0 && (
        <FixedSizeGrid
          columnCount={columnCount}
          columnWidth={imageWidth + gap}
          rowCount={rowCount}
          rowHeight={imageHeight + gap}
          height={Math.max(200, containerHeight - 48)} // Ensure minimum height and account for padding
          width={containerWidth - 48} // Account for padding
          itemData={images}
          className="flex-grow"
        >
          {Cell}
        </FixedSizeGrid>
      )}
    </div>
  );
} 