// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';

interface CarouselNavigationProps {
  readonly currentIndex: number;
  readonly totalImages: number;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly className?: string;
}

/**
 * Navigation controls for the carousel view
 * 
 * Provides simple previous/next navigation with current position indicator
 * for browsing through a collection of images in carousel mode.
 * 
 * @param currentIndex - Zero-based index of the current image
 * @param totalImages - Total number of images in the collection
 * @param onPrevious - Callback when previous button is clicked
 * @param onNext - Callback when next button is clicked
 * @param className - Additional CSS classes
 */
export function CarouselNavigation({
  currentIndex,
  totalImages,
  onPrevious,
  onNext,
  className = ''
}: CarouselNavigationProps) {
  if (totalImages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={onPrevious}
        className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded p-1"
        title="Previous image"
      >
        ←
      </button>
      
      <span className="text-xs text-gray-300">
        {currentIndex + 1} / {totalImages}
      </span>
      
      <button
        onClick={onNext}
        className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded p-1"
        title="Next image"
      >
        →
      </button>
    </div>
  );
} 