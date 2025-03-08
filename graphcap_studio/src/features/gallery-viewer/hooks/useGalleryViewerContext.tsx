// SPDX-License-Identifier: Apache-2.0
import  { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Image } from '@/services/images';
import { ViewMode, DEFAULT_VIEW_MODE } from '../components/ImageGallery';

interface GalleryViewerContextType {
  // View mode state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Selected image state (internal tracking)
  selectedImage: Image | null;
  setSelectedImage: (image: Image | null) => void;
  
  // Derived values
  currentIndex: number;
  totalImages: number;

  // Dataset information
  datasetName: string;
  
  // Callbacks
  onUploadComplete?: () => void;
}

interface GalleryViewerProviderProps {
  readonly children: ReactNode;
  readonly images: Image[];
  readonly initialViewMode?: ViewMode;
  readonly initialSelectedImage?: Image | null;
  readonly onImageSelected?: (image: Image) => void;
  readonly datasetName: string;
  readonly onUploadComplete?: () => void;
}

const GalleryViewerContext = createContext<GalleryViewerContextType | undefined>(undefined);

/**
 * Provider component for the GalleryViewer context
 * 
 * This component manages the internal state of the gallery viewer, including:
 * - View mode (grid or carousel)
 * - Selected image
 * - Current index and total images
 * - Dataset name for image uploads
 * - Upload callbacks
 * 
 * @param children - Child components
 * @param images - Array of images to display
 * @param initialViewMode - Initial view mode, defaults to DEFAULT_VIEW_MODE
 * @param initialSelectedImage - Initial selected image
 * @param onImageSelected - Callback when an image is selected
 * @param datasetName - Name of the dataset being viewed
 * @param onUploadComplete - Callback when upload is complete
 */
export function GalleryViewerProvider({
  children,
  images,
  initialViewMode = DEFAULT_VIEW_MODE,
  initialSelectedImage = null,
  onImageSelected,
  datasetName,
  onUploadComplete
}: Readonly<GalleryViewerProviderProps>) {
  // Internal state
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [selectedImage, setSelectedImage] = useState<Image | null>(initialSelectedImage);
  
  // Derived values
  const totalImages = images.length;
  const currentIndex = selectedImage 
    ? images.findIndex(img => img.path === selectedImage.path) 
    : -1;
  
  // Handle image selection with callback
  const setSelectedImageInternal = (image: Image | null) => {
    setSelectedImage(image);
    if (image && onImageSelected) {
      onImageSelected(image);
    }
  };

  // Auto-select the first image when images change or on initial load
  useEffect(() => {
    // Only auto-select if there are images, no image is currently selected,
    // and either no initialSelectedImage was provided or it's not in the current images array
    if (
      images.length > 0 && 
      (selectedImage === null || images.findIndex(img => img.path === selectedImage.path) === -1)
    ) {
      setSelectedImageInternal(images[0]);
    }
  }, [images, selectedImage, setSelectedImageInternal]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    viewMode,
    setViewMode,
    selectedImage,
    setSelectedImage: setSelectedImageInternal,
    currentIndex,
    totalImages,
    datasetName,
    onUploadComplete
  }), [viewMode, selectedImage, currentIndex, totalImages, datasetName, onUploadComplete]);
  
  return (
    <GalleryViewerContext.Provider value={contextValue}>
      {children}
    </GalleryViewerContext.Provider>
  );
}

/**
 * Hook to access the GalleryViewer context
 * 
 * @returns The GalleryViewer context
 * @throws Error if used outside of a GalleryViewerProvider
 */
export function useGalleryViewerContext() {
  const context = useContext(GalleryViewerContext);
  
  if (context === undefined) {
    throw new Error('useGalleryViewerContext must be used within a GalleryViewerProvider');
  }
  
  return context;
} 