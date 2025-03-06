// SPDX-License-Identifier: Apache-2.0
import { useState, useCallback, useEffect } from 'react';
import { Image, preloadImage } from '@/services/images';

/**
 * Custom hook for managing image selection
 * 
 * This hook provides functionality for selecting and managing images
 * 
 * @param images - Array of images to select from
 * @returns Image selection functions and state
 */
export function useImageSelection(images: Image[]) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showProperties, setShowProperties] = useState(false);

  // Preload images for better performance
  const preloadImages = useCallback((imagesToPreload: Image[], count = 10) => {
    // Preload the first N images as thumbnails
    imagesToPreload.slice(0, count).forEach(image => {
      preloadImage(image.path, 'thumbnail');
    });
    
    // If we have a selected image, preload it at full resolution
    if (selectedImage) {
      preloadImage(selectedImage.path, 'full');
    }
  }, [selectedImage]);

  // Preload images when the image list changes
  useEffect(() => {
    if (images.length > 0) {
      preloadImages(images);
    }
  }, [images, preloadImages]);

  // Set carousel index to match selected image
  useEffect(() => {
    if (selectedImage && images.length > 0) {
      const index = images.findIndex(img => img.path === selectedImage.path);
      if (index !== -1) {
        setCarouselIndex(index);
      }
    }
  }, [selectedImage, images]);

  /**
   * Handle image selection
   */
  const handleSelectImage = useCallback((image: Image) => {
    setSelectedImage(image);
    
    // Find the index of the selected image for carousel view
    const index = images.findIndex(img => img.path === image.path);
    if (index !== -1) {
      setCarouselIndex(index);
    }
    
    // Preload the full-size image
    preloadImage(image.path, 'full');
    
    // Show properties panel when an image is selected
    setShowProperties(true);
  }, [images]);

  /**
   * Toggle properties panel visibility
   */
  const handleToggleProperties = useCallback(() => {
    setShowProperties(!showProperties);
  }, [showProperties]);

  /**
   * Handle saving properties
   */
  const handleSaveProperties = useCallback((properties: Record<string, any>) => {
    if (!selectedImage) return;
    
    // In a real implementation, this would save to a JSON file or database
    console.log('Saving properties for image:', selectedImage.path, properties);
  }, [selectedImage]);

  return {
    // State
    selectedImage,
    carouselIndex,
    showProperties,
    
    // Actions
    setSelectedImage,
    setCarouselIndex,
    setShowProperties,
    handleSelectImage,
    handleToggleProperties,
    handleSaveProperties,
    preloadImages
  };
} 