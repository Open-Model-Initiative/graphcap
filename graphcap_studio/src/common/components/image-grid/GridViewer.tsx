// SPDX-License-Identifier: Apache-2.0
import { useState, useRef, useEffect, useCallback } from 'react';
import { FixedSizeGrid } from 'react-window';
import { Image } from '@/services/images';
import { LazyImage } from '@/common/components/image-grid/LazyImage';
import { LoadingSpinner, EmptyState } from '@/common/ui';
import { UploadDropzone } from '../image-uploader';

/**
 * Props for the image renderer component
 */
interface ImageRendererProps {
  readonly imagePath: string;
  readonly alt?: string;
  readonly className?: string;
  readonly onLoad?: () => void;
  readonly onError?: (error: Error) => void;
}

interface GridViewerProps {
  readonly images: Image[];
  readonly isLoading?: boolean;
  readonly isEmpty?: boolean;
  readonly className?: string;
  readonly containerWidth?: number;
  readonly containerHeight?: number;
  readonly selectedImage?: Image | null;
  readonly onSelectImage: (image: Image) => void;
  readonly onEditImage?: (image: Image) => void;
  readonly datasetName?: string;
  /**
   * Optional custom component to render individual images
   * If not provided, a default img element will be used
   */
  readonly ImageComponent?: React.ComponentType<ImageRendererProps>;
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
 * - Customizable image rendering via ImageComponent prop
 * 
 * @param images - Array of image objects to display
 * @param isLoading - Whether the grid is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param className - Additional CSS classes
 * @param containerWidth - Optional explicit container width
 * @param containerHeight - Optional explicit container height
 * @param selectedImage - Currently selected image
 * @param onSelectImage - Callback when an image is selected
 * @param onEditImage - Callback when edit button is clicked
 * @param ImageComponent - Optional custom component to render individual images
 * @param datasetName - Name of the dataset to upload images to
 */
export function GridViewer({
  images,
  isLoading = false,
  isEmpty = false,
  className = '',
  containerWidth: externalWidth,
  containerHeight: externalHeight,
  selectedImage,
  onSelectImage,
  onEditImage,
  ImageComponent,
  datasetName
}: GridViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [itemSize, setItemSize] = useState(180); // Default item size
  const [columnCount, setColumnCount] = useState(1);

  // Update dimensions when container size changes
  useEffect(() => {
    if (!containerRef.current && !externalWidth && !externalHeight) return;

    const updateDimensions = () => {
      // Use external dimensions if provided, otherwise measure container
      const width = externalWidth ?? (containerRef.current?.clientWidth ?? 0);
      const height = externalHeight ?? (containerRef.current?.clientHeight ?? 0);
      
      setContainerSize({ width, height });
      
      // Calculate optimal item size and column count based on container width
      // Aim for items between 120px and 200px
      const minItemSize = 120;
      const maxItemSize = 200;
      const gap = 8;
      
      // Calculate how many items we can fit at maximum size
      const columnsAtMaxSize = Math.floor((width - gap) / (maxItemSize + gap));
      
      // Calculate how many items we can fit at minimum size
      const columnsAtMinSize = Math.floor((width - gap) / (minItemSize + gap));
      
      // Choose column count that gives us closest to target size
      const targetColumns = Math.max(1, columnsAtMaxSize > 0 ? columnsAtMaxSize : columnsAtMinSize);
      setColumnCount(targetColumns);
      
      // Calculate item size based on column count
      const calculatedItemSize = Math.floor((width - (gap * (targetColumns + 1))) / targetColumns);
      setItemSize(calculatedItemSize);
    };
    
    updateDimensions();
    
    // Set up resize observer if using container ref
    if (containerRef.current && !externalWidth && !externalHeight) {
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [externalWidth, externalHeight]);

  // Calculate row count based on number of images and column count
  const rowCount = Math.ceil(images.length / columnCount);
  
  // Cell renderer for the virtualized grid
  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= images.length) return null;
    
    const image = images[index];
    const isSelected = selectedImage?.path === image.path;
    
    return (
      <div style={style} className="p-2" key={`${rowIndex}-${columnIndex}`}>
        <LazyImage
          image={image}
          isSelected={isSelected}
          onSelect={onSelectImage}
          ImageComponent={ImageComponent}
        />
      </div>
    );
  }, [images, columnCount, selectedImage, onSelectImage, onEditImage, ImageComponent]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Show empty state
  if (isEmpty || images.length === 0) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <EmptyState
          title="No images found"
          description="Try selecting a different dataset or uploading new images."
        />
        <UploadDropzone
          datasetName={datasetName}
          onUploadComplete={() => {}}
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`h-full w-full overflow-hidden ${className}`}
    >
      {containerSize.width > 0 && containerSize.height > 0 && (
        <FixedSizeGrid
          columnCount={columnCount}
          columnWidth={itemSize}
          height={containerSize.height}
          rowCount={rowCount}
          rowHeight={itemSize}
          width={containerSize.width}
          itemData={images}
        >
          {Cell}
        </FixedSizeGrid>
      )}
    </div>
  );
} 