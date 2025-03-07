// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, RefObject, useRef } from 'react';

interface UseCarouselLayoutProps {
  thumbnailHeight?: number;
}

interface UseCarouselLayoutResult {
  containerRef: RefObject<HTMLDivElement | null>;
  imageContainerRef: RefObject<HTMLDivElement | null>;
  thumbnailContainerRef: RefObject<HTMLDivElement | null>;
  imageContainerHeight: number;
  isCalculating: boolean;
}

/**
 * Custom hook to calculate and manage carousel layout dimensions
 * 
 * This hook handles:
 * - Calculating the available height for the image container
 * - Accounting for the thumbnail strip at the bottom
 * - Updating measurements on window resize
 * - Providing refs for the container, image container, and thumbnail container
 * 
 * @param thumbnailHeight - Height of the thumbnail strip in pixels
 * @returns Object containing refs and calculated heights
 */
export function useCarouselLayout({
  thumbnailHeight = 96 // 6rem
}: UseCarouselLayoutProps = {}): UseCarouselLayoutResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  
  const [imageContainerHeight, setImageContainerHeight] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);

  useEffect(() => {
    const calculateHeights = () => {
      setIsCalculating(true);
      
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        
        // Calculate available image container height
        const availableHeight = containerHeight - thumbnailHeight;
        setImageContainerHeight(availableHeight);
      }
      
      setIsCalculating(false);
    };

    // Initial calculation
    calculateHeights();
    
    // Set up resize observer for container
    const resizeObserver = new ResizeObserver(() => {
      calculateHeights();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [thumbnailHeight]);

  return {
    containerRef,
    imageContainerRef,
    thumbnailContainerRef,
    imageContainerHeight,
    isCalculating
  };
} 