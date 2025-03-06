// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDynamicThumbnailsProps {
  totalCount: number;
  minThumbnailWidth?: number;
  maxThumbnailWidth?: number;
  gap?: number;
  aspectRatio?: number;
}

interface UseDynamicThumbnailsResult {
  containerRef: React.RefObject<HTMLDivElement>;
  thumbnailWidth: number;
  thumbnailHeight: number;
  visibleCount: number;
  gap: number;
}

/**
 * Custom hook for dynamically sizing thumbnails based on available container space
 * 
 * This hook calculates the optimal thumbnail size and count based on the
 * available container width, ensuring thumbnails are properly sized and spaced.
 * It automatically adjusts when the container is resized.
 * 
 * @param props - The hook properties
 * @returns The calculated thumbnail dimensions and container ref
 */
export function useDynamicThumbnails({
  totalCount,
  minThumbnailWidth = 64,
  maxThumbnailWidth = 120,
  gap = 8,
  aspectRatio = 1
}: UseDynamicThumbnailsProps): UseDynamicThumbnailsResult {
  // Reference for the container element
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for thumbnail dimensions
  const [thumbnailWidth, setThumbnailWidth] = useState(minThumbnailWidth);
  const [thumbnailHeight, setThumbnailHeight] = useState(minThumbnailWidth / aspectRatio);
  const [visibleCount, setVisibleCount] = useState(0);
  
  // Calculate the optimal thumbnail size based on container width
  const calculateThumbnailSize = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    
    // Calculate how many thumbnails can fit at minimum size
    const maxPossibleCount = Math.floor((containerWidth + gap) / (minThumbnailWidth + gap));
    
    // Calculate how many thumbnails can fit at maximum size
    const minPossibleCount = Math.floor((containerWidth + gap) / (maxThumbnailWidth + gap));
    
    // Determine the optimal count based on total available
    // Use a more dynamic approach to determine the optimal count
    let optimalCount;
    
    if (totalCount <= minPossibleCount) {
      // If we have fewer images than can fit at max size, use max size
      optimalCount = totalCount;
    } else if (containerWidth < minThumbnailWidth * 3) {
      // For very small containers, show at least 1 thumbnail
      optimalCount = 1;
    } else {
      // Calculate a balanced number based on container width
      // This creates a smoother transition between sizes
      const availableWidth = containerWidth - ((maxPossibleCount - 1) * gap);
      const idealWidth = Math.min(
        maxThumbnailWidth,
        Math.max(minThumbnailWidth, Math.floor(availableWidth / Math.min(maxPossibleCount, totalCount)))
      );
      
      // Recalculate how many can fit with this ideal width
      optimalCount = Math.min(
        Math.floor((containerWidth + gap) / (idealWidth + gap)),
        totalCount
      );
    }
    
    // Ensure at least one thumbnail is visible
    optimalCount = Math.max(optimalCount, 1);
    
    // Calculate the optimal width based on the count
    const availableWidth = containerWidth - ((optimalCount - 1) * gap);
    const optimalWidth = Math.floor(availableWidth / optimalCount);
    
    // Ensure width is within bounds
    const boundedWidth = Math.min(Math.max(optimalWidth, minThumbnailWidth), maxThumbnailWidth);
    
    // Calculate height based on aspect ratio
    const optimalHeight = Math.floor(boundedWidth / aspectRatio);
    
    // Update state
    setThumbnailWidth(boundedWidth);
    setThumbnailHeight(optimalHeight);
    setVisibleCount(optimalCount);
  }, [minThumbnailWidth, maxThumbnailWidth, gap, totalCount, aspectRatio]);
  
  // Recalculate on resize or when dependencies change
  useEffect(() => {
    calculateThumbnailSize();
    
    const handleResize = () => {
      calculateThumbnailSize();
    };
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(handleResize);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Clean up
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [calculateThumbnailSize]);
  
  return {
    containerRef,
    thumbnailWidth,
    thumbnailHeight,
    visibleCount,
    gap
  };
} 