// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect } from 'react';
import { Image } from '@/services/images';
import { ViewMode } from '../context/EditorContext';

interface UseViewModeProps {
  selectedImage: Image | null;
  setSelectedImage: (image: Image | null) => void;
  filteredImages: Image[];
  setShowProperties: (show: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

/**
 * Custom hook for managing view mode
 * 
 * This hook provides functionality for switching between grid and carousel view modes
 * 
 * @param props - Hook properties
 * @returns View mode functions and state
 */
export function useViewMode({
  selectedImage,
  setSelectedImage,
  filteredImages,
  setShowProperties,
  viewMode,
  setViewMode
}: UseViewModeProps) {
  // Ensure selected image is set when switching to carousel view
  useEffect(() => {
    if (viewMode === 'carousel' && filteredImages.length > 0 && !selectedImage) {
      // If no image is selected in carousel view, select the first one
      setSelectedImage(filteredImages[0]);
    }
  }, [viewMode, filteredImages, selectedImage, setSelectedImage]);

  /**
   * Set the view mode
   */
  const handleSetViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    
    // If switching to carousel and we have a selected image, make sure it's visible
    if (mode === 'carousel') {
      if (!selectedImage && filteredImages.length > 0) {
        // If no image is selected, select the first one
        setSelectedImage(filteredImages[0]);
      }
      // Always ensure properties are visible in carousel mode
      setShowProperties(true);
    } else if (mode === 'grid' && selectedImage) {
      // When switching to grid, maintain the selected image and properties panel
      setShowProperties(true);
      
      // Force a refresh of the selected image to ensure it's displayed correctly
      const currentImage = selectedImage;
      setSelectedImage(null);
      setTimeout(() => {
        setSelectedImage(currentImage);
      }, 50);
    }
  }, [viewMode, selectedImage, filteredImages, setSelectedImage, setShowProperties, setViewMode]);

  return {
    viewMode,
    setViewMode: handleSetViewMode
  };
} 