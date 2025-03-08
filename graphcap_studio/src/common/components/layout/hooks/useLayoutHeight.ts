// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState, useRef, RefObject } from 'react';

interface UseLayoutHeightResult {
  containerRef: RefObject<HTMLDivElement>;
  headerRef: RefObject<HTMLDivElement>;
  contentRef: RefObject<HTMLDivElement>;
  footerRef: RefObject<HTMLDivElement>;
  contentHeight: number;
  isCalculating: boolean;
}

/**
 * Custom hook to calculate and manage layout heights
 * 
 * This hook handles:
 * - Calculating the available height for content between header and footer
 * - Updating measurements on window resize
 * - Providing refs for the container, header, content, and footer elements
 * 
 * @returns Object containing refs and calculated heights
 */
export function useLayoutHeight(): UseLayoutHeightResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);

  useEffect(() => {
    const calculateHeights = () => {
      setIsCalculating(true);
      
      if (containerRef.current && headerRef.current && footerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const headerHeight = headerRef.current.clientHeight;
        const footerHeight = footerRef.current.clientHeight;
        
        // Calculate available content height
        const availableHeight = containerHeight - headerHeight - footerHeight;
        setContentHeight(availableHeight);
      }
      
      setIsCalculating(false);
    };

    // Initial calculation
    calculateHeights();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateHeights);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', calculateHeights);
    };
  }, []);

  return {
    containerRef,
    headerRef,
    contentRef,
    footerRef,
    contentHeight,
    isCalculating
  };
} 