// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';
import { ViewMode, DEFAULT_VIEW_MODE } from './components/ImageGallery';
import { ViewModeToggle } from './components';
import { useViewerContainer } from './hooks';
import { GalleryViewerProvider } from './hooks/useGalleryViewerContext';
import { ImageGalleryContent } from './ImageGalleryContent';

interface ViewerContainerProps {
  readonly images: Image[];
  readonly isLoading?: boolean;
  readonly isEmpty?: boolean;
  readonly className?: string;
  readonly initialViewMode?: ViewMode;
  readonly selectedImage?: Image | null;
  readonly onImageSelected: (image: Image) => void;
  readonly onEditImage?: (image: Image) => void;
  readonly onAddToDataset?: (imagePath: string, datasetName: string) => void;
  readonly onDownload?: (image: Image) => void;
  readonly onDelete?: (image: Image) => void;
  readonly showViewModeToggle?: boolean;
  readonly title?: string;
  readonly onUpload?: () => void;
  readonly onClose?: () => void;
  readonly onUploadComplete?: () => void;
}

/**
 * A container component for the image viewer that handles responsive layout
 * 
 * This component renders the ImageGallery component and handles responsive layout
 * adjustments for different screen sizes and zoom levels. The first image is 
 * automatically selected when the component loads or when the images array changes.
 * The default view mode is 'carousel'.
 * 
 * @param images - Array of images to display
 * @param isLoading - Whether the gallery is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param className - Additional CSS classes
 * @param initialViewMode - Initial view mode ('grid' or 'carousel'), defaults to 'carousel'
 * @param selectedImage - Currently selected image
 * @param onImageSelected - Callback when an image is selected
 * @param onEditImage - Callback when edit button is clicked
 * @param onAddToDataset - Callback when add to dataset button is clicked
 * @param onDownload - Callback when download button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param showViewModeToggle - Whether to show the view mode toggle
 * @param title - Title to display in the header bar
 * @param onUpload - Callback when upload button is clicked
 * @param onClose - Callback when close button is clicked
 * @param onUploadComplete - Callback when upload is complete
 */
export function ViewerContainer({
  images,
  isLoading = false,
  isEmpty = false,
  className = '',
  initialViewMode = DEFAULT_VIEW_MODE,
  selectedImage,
  onImageSelected,
  onEditImage,
  onAddToDataset,
  onDownload,
  onDelete,
  showViewModeToggle = true,
  title = 'Image Viewer',
  onUpload,
  onClose,
  onUploadComplete,
}: ViewerContainerProps) {
  // Use our custom hook for container management
  const { setContainerRef, thumbnailOptions } = useViewerContainer();

  return (
    <GalleryViewerProvider
      images={images}
      initialViewMode={initialViewMode}
      initialSelectedImage={selectedImage}
      onImageSelected={onImageSelected}
      onUploadComplete={onUploadComplete}
    >
      <div 
        ref={setContainerRef}
        className={`h-full w-full overflow-hidden flex flex-col ${className}`}
      >
        {/* Header bar with title, upload button, close button, and view mode toggle */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h4 className="text-xl font-semibold">{title}</h4>
          </div>
          <div className="flex items-center space-x-2">
            {showViewModeToggle && (
              <ViewModeToggle />
            )}
            {onUpload && (
              <button
                onClick={onUpload}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Upload Images
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-grow relative">
          <ImageGalleryContent
            images={images}
            isLoading={isLoading}
            isEmpty={isEmpty}
            onEditImage={onEditImage}
            onAddToDataset={onAddToDataset}
            onDownload={onDownload}
            onDelete={onDelete}
            thumbnailOptions={thumbnailOptions}
          />
        </div>
      </div>
    </GalleryViewerProvider>
  );
} 