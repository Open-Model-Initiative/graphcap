// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useCallback } from 'react';
import { Image } from '@/services/images';

interface UseCarouselNavigationProps {
  images: Image[];
  selectedImage: Image | null;
  onSelectImage: (image: Image) => void;
  windowSize?: number;
  preloadCount?: number;
}

interface UseCarouselNavigationResult {
  currentIndex: number;
  visibleImages: Image[];
  visibleStartIndex: number;
  totalImages: number;
  navigateToIndex: (index: number) => void;
  navigateByDelta: (delta: number) => void;
  handleThumbnailSelect: (localIndex: number) => void;
}

/**
 * Custom hook for carousel navigation with sliding window pagination
 * 
 * This hook manages the state and logic for navigating through images in a carousel,
 * using a sliding window approach to load only a subset of images at a time.
 * 
 * @param props - The hook properties
 * @returns The carousel navigation state and functions
 */
export function useCarouselNavigation({
  images,
  selectedImage,
  onSelectImage,
  windowSize = 10,
  preloadCount = 3
}: UseCarouselNavigationProps): UseCarouselNavigationResult {
  // The global index of the currently selected image
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // The starting index of the current visible window
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

  // Calculate the visible images based on the current window
  const getVisibleImages = useCallback(() => {
    return images.slice(
      visibleStartIndex, 
      Math.min(visibleStartIndex + windowSize, images.length)
    );
  }, [images, visibleStartIndex, windowSize]);

  // Get the current visible images
  const visibleImages = getVisibleImages();

  // Update the current index when the selected image changes
  useEffect(() => {
    if (selectedImage && images.length > 0) {
      const index = images.findIndex(img => img.path === selectedImage.path);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [selectedImage, images, currentIndex]);

  // Adjust the visible window when the current index changes
  useEffect(() => {
    // If the current index is outside the visible window, adjust the window
    if (currentIndex < visibleStartIndex) {
      // User navigated backward, adjust window to show images before current index
      const newStart = Math.max(0, currentIndex - preloadCount);
      setVisibleStartIndex(newStart);
    } else if (currentIndex >= visibleStartIndex + windowSize) {
      // User navigated forward, adjust window to show images after current index
      const newStart = Math.min(
        images.length - windowSize,
        currentIndex - windowSize + preloadCount + 1
      );
      setVisibleStartIndex(Math.max(0, newStart));
    }
  }, [currentIndex, visibleStartIndex, windowSize, images.length, preloadCount]);

  // Navigate to a specific global index
  const navigateToIndex = useCallback((index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, images.length - 1));
    setCurrentIndex(boundedIndex);
    onSelectImage(images[boundedIndex]);
  }, [images, onSelectImage]);

  // Navigate by a delta (positive or negative)
  const navigateByDelta = useCallback((delta: number) => {
    if (images.length === 0) return;
    
    // Calculate new index with wrapping
    const newIndex = (currentIndex + delta + images.length) % images.length;
    navigateToIndex(newIndex);
  }, [currentIndex, images.length, navigateToIndex]);

  // Handle thumbnail selection (using local index within visible window)
  const handleThumbnailSelect = useCallback((localIndex: number) => {
    const globalIndex = visibleStartIndex + localIndex;
    navigateToIndex(globalIndex);
  }, [visibleStartIndex, navigateToIndex]);

  return {
    currentIndex,
    visibleImages,
    visibleStartIndex,
    totalImages: images.length,
    navigateToIndex,
    navigateByDelta,
    handleThumbnailSelect
  };
} 