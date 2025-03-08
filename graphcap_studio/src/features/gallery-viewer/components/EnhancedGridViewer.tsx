// SPDX-License-Identifier: Apache-2.0
import { memo, useCallback} from 'react';
import type { Image } from '@/services/images';
import { LazyImage } from './LazyImage';

interface EnhancedGridViewerProps {
  readonly images: Image[];
  readonly selectedImage: Image | null;
  readonly onSelectImage: (image: Image) => void;
  readonly className?: string;
  readonly isLoading?: boolean;
  readonly isEmpty?: boolean;
}

/**
 * An enhanced grid viewer component with optimized performance
 * 
 * Features:
 * - Responsive grid layout with CSS Grid
 * - Lazy loading of images with Intersection Observer
 * - Low-quality image placeholders
 * - Memoization to prevent unnecessary re-renders
 * 
 * @param images - Array of images to display
 * @param selectedImage - Currently selected image
 * @param onSelectImage - Callback when an image is selected
 * @param onEditImage - Callback when edit button is clicked
 * @param className - Additional CSS classes
 * @param isLoading - Whether the grid is in loading state
 * @param isEmpty - Whether there are no images to display
 */
export const EnhancedGridViewer = memo(function EnhancedGridViewer({
  images,
  selectedImage,
  onSelectImage,
  className = '',
  isLoading = false,
  isEmpty = false
}: EnhancedGridViewerProps) {
  // Memoize the handler to prevent unnecessary re-renders
  const handleSelectImage = useCallback((image: Image) => {
    onSelectImage(image);
  }, [onSelectImage]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full w-full ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Empty state
  if (isEmpty || images.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full w-full ${className}`}>
        <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-400">No images found</p>
      </div>
    );
  }
  
  return (
    <div 
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 overflow-auto h-full ${className}`}
      style={{ 
        gridAutoRows: 'minmax(150px, 1fr)',
        scrollbarWidth: 'thin',
        scrollbarColor: '#4B5563 #1F2937'
      }}
    >
      {images.map((image) => (
        <LazyImage
          key={image.path}
          image={image}
          isSelected={selectedImage?.path === image.path}
          onSelect={handleSelectImage}
        />
      ))}
    </div>
  );
}); 