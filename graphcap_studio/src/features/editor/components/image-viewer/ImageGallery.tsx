// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';
import { useEditorContext } from '../../context/EditorContext';
import { GridViewer } from './GridViewer';
import { CarouselViewer } from './carousel';
import { CompactActionBar } from './CompactActionBar';

interface ImageGalleryProps {
  readonly images: Image[];
  readonly isLoading?: boolean;
  readonly isEmpty?: boolean;
  readonly thumbnailOptions?: {
    readonly minWidth?: number;
    readonly maxWidth?: number;
    readonly gap?: number;
  };
}

/**
 * A component for browsing and selecting images with different view modes
 * 
 * Features:
 * - Supports both grid and carousel view modes
 * - Displays compact info bar with image actions
 * - Handles loading and empty states
 * - Configurable thumbnail options for carousel view
 * 
 * @param images - Array of image objects to display
 * @param isLoading - Whether the gallery is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param thumbnailOptions - Optional configuration for thumbnail display in carousel mode
 */
export function ImageGallery({ 
  images, 
  isLoading,
  isEmpty,
  thumbnailOptions
}: ImageGalleryProps) {
  const { 
    viewMode,
    selectedImage
  } = useEditorContext();
  
  const totalImages = images.length;
  const currentIndex = selectedImage ? images.findIndex(img => img.path === selectedImage.path) : -1;

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 overflow-hidden">
      {/* Compact action bar at the top */}
      <div className="shrink-0">
        <CompactActionBar
          totalImages={totalImages}
          currentIndex={currentIndex}
          className="border-b border-gray-700"
        />
      </div>
      
      {/* Main content area - flex-grow to take available space */}
      <div className="flex-grow overflow-hidden">
        {viewMode === 'grid' ? (
          <GridViewer
            images={images}
            isLoading={isLoading}
            isEmpty={isEmpty}
            className="h-full w-full"
          />
        ) : (
          <CarouselViewer
            images={images}
            isLoading={isLoading}
            isEmpty={isEmpty}
            thumbnailOptions={thumbnailOptions}
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  );
} 