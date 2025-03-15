// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { NavigationButton } from '@/components/ui/buttons/NavigationButton';
import { useImageCarousel } from '../ImageCarouselContext';

interface NavigationControlsProps {
  className?: string;
}

/**
 * Navigation controls for the carousel
 * 
 * This component displays the previous and next buttons for navigating through images.
 */
export function NavigationControls({ className = '' }: NavigationControlsProps) {
  const { navigateByDelta, images } = useImageCarousel();
  
  // Don't render navigation if there's only one image or no images
  if (images.length <= 1) {
    return null;
  }
  
  return (
    <>
      {/* Left navigation button */}
      <div className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 ${className}`}>
        <NavigationButton
          direction="prev"
          onClick={() => navigateByDelta(-1)}
          aria-label="Previous image"
          aria-controls="carousel-image-label"
        />
      </div>
      
      {/* Right navigation button */}
      <div className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 ${className}`}>
        <NavigationButton
          direction="next"
          onClick={() => navigateByDelta(1)}
          aria-label="Next image"
          aria-controls="carousel-image-label"
        />
      </div>
    </>
  );
} 