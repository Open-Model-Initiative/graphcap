// SPDX-License-Identifier: Apache-2.0
import { useEffect, useCallback } from 'react';

interface UseCarouselControlsProps {
  navigateByDelta: (delta: number) => void;
  enabled?: boolean;
}

interface UseCarouselControlsResult {
  handleWheel: (e: React.WheelEvent) => void;
}

/**
 * Custom hook for handling keyboard and wheel navigation in the carousel
 * 
 * This hook sets up event listeners for keyboard navigation and provides
 * a handler for wheel events to navigate through the carousel.
 * 
 * @param props - The hook properties
 * @returns Handlers for wheel events
 */
export function useCarouselControls({
  navigateByDelta,
  enabled = true
}: UseCarouselControlsProps): UseCarouselControlsResult {
  // Handle keyboard navigation
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          navigateByDelta(-1);
          e.preventDefault();
          break;
        case 'ArrowRight':
          navigateByDelta(1);
          e.preventDefault();
          break;
        case 'ArrowUp':
          navigateByDelta(-1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          navigateByDelta(1);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigateByDelta, enabled]);

  // Handle mouse wheel for carousel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enabled) return;
    
    // Determine direction (positive deltaY means scrolling down)
    const delta = e.deltaY > 0 ? 1 : -1;
    navigateByDelta(delta);
    e.preventDefault();
  }, [navigateByDelta, enabled]);

  return {
    handleWheel
  };
} 