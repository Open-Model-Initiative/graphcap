// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';
import { GridViewer } from '@/features/gallery-viewer/image-grid/GridViewer';
import { CarouselViewer } from '@/features/gallery-viewer/image-carousel';
import { CompactActionBar } from './components/CompactActionBar';
import { useGalleryViewerContext } from './hooks';
import { ImageViewer } from './ImageViewer';

interface ImageGalleryContentProps {
  readonly images: Image[];
  readonly isLoading?: boolean;
  readonly isEmpty?: boolean;
  readonly onEditImage?: (image: Image) => void;
  readonly onAddToDataset?: (imagePath: string, datasetName: string) => void;
  readonly onDownload?: (image: Image) => void;
  readonly onDelete?: (image: Image) => void;
  readonly thumbnailOptions?: {
    readonly minWidth?: number;
    readonly maxWidth?: number;
    readonly gap?: number;
  };
}

/**
 * Internal component that uses the GalleryViewerContext
 * 
 * This component is meant to be used within a GalleryViewerProvider.
 * It accesses the context to get the current view mode and selected image.
 * 
 * @param images - Array of images to display
 * @param isLoading - Whether the gallery is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param onEditImage - Callback when edit button is clicked
 * @param onAddToDataset - Callback when add to dataset button is clicked
 * @param onDownload - Callback when download button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param thumbnailOptions - Optional configuration for thumbnail display in carousel mode
 */
export function ImageGalleryContent({
  images,
  isLoading,
  isEmpty,
  onEditImage,
  onAddToDataset,
  onDownload,
  onDelete,
  thumbnailOptions
}: ImageGalleryContentProps) {
  const {
    viewMode,
    selectedImage,
    setSelectedImage,
    currentIndex,
    totalImages,
    onUploadComplete
  } = useGalleryViewerContext();

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 overflow-hidden">
      {/* Compact action bar at the top */}
      <div className="shrink-0">
        <CompactActionBar
          totalImages={totalImages}
          currentIndex={currentIndex}
          selectedImage={selectedImage}
          onEditImage={onEditImage}
          onAddToDataset={onAddToDataset}
          onDownload={onDownload}
          onDelete={onDelete}
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
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            onEditImage={onEditImage}
            ImageComponent={ImageViewer}
            className="h-full w-full"
          />
        ) : (
          <CarouselViewer
            images={images}
            isLoading={isLoading}
            isEmpty={isEmpty}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            onUploadComplete={onUploadComplete}
            thumbnailOptions={thumbnailOptions}
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  );
} 