// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef } from 'react';
import { Image, preloadImage } from '@/services/images';

interface UseImagePreloaderProps {
  readonly images: Image[];
  readonly currentIndex: number;
  readonly preloadCount?: number;
  readonly enabled?: boolean;
}

/**
 * Custom hook for preloading images in a carousel
 * 
 * This hook preloads a specified number of images before and after the current image
 * to improve the user experience when navigating through the carousel.
 * 
 * @param images - Array of images in the carousel
 * @param currentIndex - Index of the currently displayed image
 * @param preloadCount - Number of images to preload before and after the current image (default: 2)
 * @param enabled - Whether preloading is enabled (default: true)
 */
export function useImagePreloader({
  images,
  currentIndex,
  preloadCount = 20,
  enabled = true
}: UseImagePreloaderProps): void {
  // Use a ref to track which images we've already preloaded
  // This persists across renders and prevents unnecessary preloading
  const preloadedImagesRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!enabled || images.length === 0) return;
    
    // Function to preload an image if it exists and hasn't been preloaded yet
    const preloadImageAtIndex = (index: number, priority: 'high' | 'low' = 'low') => {
      if (index >= 0 && index < images.length) {
        const imagePath = images[index].path;
        if (!preloadedImagesRef.current.has(imagePath)) {
          // For high priority images (next/prev), preload both thumbnail and full
          if (priority === 'high') {
            // Preload thumbnail first for quick display
            preloadImage(imagePath, 'thumbnail');
            
            // Then preload the full image with a slight delay to prioritize nearby thumbnails
            setTimeout(() => {
              preloadImage(imagePath, 'full');
            }, 100);
          } else {
            // For low priority images, just preload thumbnails
            preloadImage(imagePath, 'thumbnail');
          }
          
          preloadedImagesRef.current.add(imagePath);
        }
      }
    };

    // Create a queue of images to preload in order of priority
    const preloadQueue: Array<{ index: number; priority: 'high' | 'low' }> = [];
    
    // Add current image with highest priority
    preloadQueue.push({ index: currentIndex, priority: 'high' });
    
    // Add next and previous images with high priority
    preloadQueue.push({ index: currentIndex + 1, priority: 'high' });
    preloadQueue.push({ index: currentIndex - 1, priority: 'high' });
    
    // Add remaining images with lower priority
    for (let i = 2; i <= preloadCount; i++) {
      preloadQueue.push({ index: currentIndex + i, priority: 'low' });
      preloadQueue.push({ index: currentIndex - i, priority: 'low' });
    }
    
    // Process the queue with staggered timing to avoid overwhelming the browser
    preloadQueue.forEach(({ index, priority }, queueIndex) => {
      setTimeout(() => {
        preloadImageAtIndex(index, priority);
      }, queueIndex * 5); // Stagger by 5ms per image
    });
    
    // Clean up the preloaded images set when the component unmounts
    return () => {
      preloadedImagesRef.current.clear();
    };
  }, [images, currentIndex, preloadCount, enabled]);
} 