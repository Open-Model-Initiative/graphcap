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
  thumbnailHeight = 96 // 6rem - keep this in sync with CSS
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
        
        // Ensure we have a positive height and account for the thumbnail container
        // Add a small buffer (2px) to prevent potential scrollbars
        const availableHeight = Math.max(0, containerHeight - thumbnailHeight - 2);
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
    
    // Also observe window resize events for more reliable updates
    const handleWindowResize = () => {
      calculateHeights();
    };
    
    window.addEventListener('resize', handleWindowResize);
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
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