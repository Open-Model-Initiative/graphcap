// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useCallback } from 'react';
import { ViewMode } from '../context/EditorContext';
import { Image } from '@/services/images';

interface UseViewModeManagerProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showUploader: boolean;
  setShowUploader: (show: boolean) => void;
  filteredImages: Image[];
  selectedImage: Image | null;
  setSelectedImage: (image: Image | null) => void;
}

/**
 * Custom hook for managing view mode transitions and related effects
 * 
 * This hook handles:
 * - Uploader visibility when switching between view modes
 * - Image selection when switching to carousel view
 * - View mode toggle with additional logic
 * 
 * @param props - Properties needed for view mode management
 * @returns Functions and state for view mode management
 */
export function useViewModeManager({
  viewMode,
  setViewMode,
  showUploader,
  setShowUploader,
  filteredImages,
  selectedImage,
  setSelectedImage
}: UseViewModeManagerProps) {
  // Track previous uploader state when switching view modes
  const [wasUploaderVisible, setWasUploaderVisible] = useState(false);

  // Handle carousel view mode specific actions
  const handleCarouselViewMode = useCallback(() => {
    if (showUploader) {
      // Save the current uploader state and hide it
      setWasUploaderVisible(true);
      setShowUploader(false);
    }
  }, [showUploader, setWasUploaderVisible, setShowUploader]);

  // Handle grid view mode specific actions
  const handleGridViewMode = useCallback(() => {
    if (wasUploaderVisible) {
      // Restore uploader state when switching back to grid
      setShowUploader(true);
      setWasUploaderVisible(false);
    }
  }, [wasUploaderVisible, setShowUploader, setWasUploaderVisible]);

  // Handle view mode changes to manage uploader visibility
  useEffect(() => {
    if (viewMode === "carousel") {
      handleCarouselViewMode();
    } else if (viewMode === "grid") {
      handleGridViewMode();
    }
  }, [viewMode, handleCarouselViewMode, handleGridViewMode]);

  // Ensure selected image is set when switching to carousel view
  useEffect(() => {
    if (
      viewMode === "carousel" &&
      filteredImages.length > 0 &&
      !selectedImage
    ) {
      // If no image is selected in carousel view, select the first one
      setSelectedImage(filteredImages[0]);
    }
  }, [viewMode, filteredImages, selectedImage, setSelectedImage]);

  // Handle view mode toggle with additional logic
  const handleViewModeToggle = useCallback((mode: ViewMode) => {
    // Always update the viewMode
    setViewMode(mode);

    // If switching to carousel and we have a selected image, make sure it's visible
    if (mode === "carousel") {
      if (!selectedImage && filteredImages.length > 0) {
        // If no image is selected, select the first one
        setSelectedImage(filteredImages[0]);
      }
    } else if (mode === "grid" && selectedImage) {
      // When switching to grid, maintain the selected image

      // Force a refresh of the selected image to ensure it's displayed correctly
      const currentImage = selectedImage;
      setSelectedImage(null);
      setTimeout(() => {
        setSelectedImage(currentImage);
      }, 50);
    }
  }, [viewMode, filteredImages, selectedImage, setViewMode, setSelectedImage]);

  return {
    wasUploaderVisible,
    setWasUploaderVisible,
    handleViewModeToggle
  };
} 