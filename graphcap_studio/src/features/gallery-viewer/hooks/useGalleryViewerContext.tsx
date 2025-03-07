// SPDX-License-Identifier: Apache-2.0
import  { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
}

interface GalleryViewerProviderProps {
  children: ReactNode;
  images: Image[];
  initialViewMode?: ViewMode;
  initialSelectedImage?: Image | null;
  onImageSelected?: (image: Image) => void;
}

const GalleryViewerContext = createContext<GalleryViewerContextType | undefined>(undefined);

/**
 * Provider component for the GalleryViewer context
 * 
 * This component manages the internal state of the gallery viewer, including:
 * - View mode (grid or carousel)
 * - Selected image
 * - Current index and total images
 * 
 * @param children - Child components
 * @param images - Array of images to display
 * @param initialViewMode - Initial view mode, defaults to DEFAULT_VIEW_MODE
 * @param initialSelectedImage - Initial selected image
 * @param onImageSelected - Callback when an image is selected
 */
export function GalleryViewerProvider({
  children,
  images,
  initialViewMode = DEFAULT_VIEW_MODE,
  initialSelectedImage = null,
  onImageSelected
}: GalleryViewerProviderProps) {
  // Internal state
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [selectedImage, setSelectedImageInternal] = useState<Image | null>(initialSelectedImage);
  
  // Derived values
  const totalImages = images.length;
  const currentIndex = selectedImage 
    ? images.findIndex(img => img.path === selectedImage.path) 
    : -1;
  
  // Handle image selection with callback
  const setSelectedImage = (image: Image | null) => {
    setSelectedImageInternal(image);
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
      setSelectedImage(images[0]);
    }
  }, [images, selectedImage, setSelectedImage]);
  
  const contextValue: GalleryViewerContextType = {
    viewMode,
    setViewMode,
    selectedImage,
    setSelectedImage,
    currentIndex,
    totalImages
  };
  
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