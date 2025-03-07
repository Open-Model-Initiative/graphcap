// SPDX-License-Identifier: Apache-2.0
import { useEffect } from 'react';

interface UseCarouselControlsProps {
  navigateByDelta: (delta: number) => void;
  enabled?: boolean;
}

/**
 * Custom hook for handling keyboard navigation in the carousel
 * 
 * This hook sets up event listeners for keyboard navigation.
 * 
 * @param props - The hook properties
 */
export function useCarouselControls({
  navigateByDelta,
  enabled = true
}: UseCarouselControlsProps): void {
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
} 