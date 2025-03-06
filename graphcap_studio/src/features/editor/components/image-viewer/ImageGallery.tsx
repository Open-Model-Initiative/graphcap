// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';
import { useEditorContext } from '../../context/EditorContext';
import { GridViewer } from './GridViewer';
import { CarouselViewer } from './carousel';
import { ImageActionBar } from './ImageActionBar';

interface ImageGalleryProps {
  images: Image[];
  onSelectImage: (image: Image) => void;
  selectedImage: Image | null;
  isLoading?: boolean;
  isEmpty?: boolean;
  onEditImage?: () => void;
  onAddToDataset?: () => void;
  thumbnailOptions?: {
    minWidth?: number;
    maxWidth?: number;
    gap?: number;
  };
}

/**
 * A component for browsing and selecting images with different view modes
 * 
 * Features:
 * - Supports both grid and carousel view modes
 * - Displays action bar for the selected image
 * - Handles loading and empty states
 * - Configurable thumbnail options for carousel view
 * 
 * @param images - Array of image objects to display
 * @param onSelectImage - Callback when an image is selected
 * @param selectedImage - Currently selected image
 * @param isLoading - Whether the gallery is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param onEditImage - Optional callback for edit action
 * @param onAddToDataset - Optional callback for adding to dataset
 * @param thumbnailOptions - Optional configuration for thumbnail display in carousel mode
 */
export function ImageGallery({ 
  images, 
  onSelectImage, 
  selectedImage,
  isLoading,
  isEmpty,
  onEditImage,
  onAddToDataset,
  thumbnailOptions
}: ImageGalleryProps) {
  const { viewMode } = useEditorContext();

  return (
    <div className="h-full w-full overflow-auto bg-gray-900 relative">
      {/* Action bar at the top when an image is selected */}
      {selectedImage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <ImageActionBar 
            image={selectedImage}
            onEdit={onEditImage || (() => {})}
            onAddToDataset={onAddToDataset}
            className="shadow-lg"
          />
        </div>
      )}
      
      {viewMode === 'grid' ? (
        <GridViewer
          images={images}
          selectedImage={selectedImage}
          onSelectImage={onSelectImage}
          onEditImage={onEditImage}
          onAddToDataset={onAddToDataset}
          isLoading={isLoading}
          isEmpty={isEmpty}
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