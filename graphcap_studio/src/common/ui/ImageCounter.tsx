// SPDX-License-Identifier: Apache-2.0

interface ImageCounterProps {
  readonly currentIndex: number;
  readonly totalImages: number;
  readonly className?: string;
}

/**
 * A component for displaying the current image position in a collection
 */
export function ImageCounter({
  currentIndex,
  totalImages,
  className = '',
}: ImageCounterProps) {
  if (totalImages <= 0) {
    return null;
  }

  return (
    <div className={`text-xs text-gray-400 ${className}`}>
      {currentIndex + 1} / {totalImages}
    </div>
  );
} 