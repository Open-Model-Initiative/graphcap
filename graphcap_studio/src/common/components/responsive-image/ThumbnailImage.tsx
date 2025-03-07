// SPDX-License-Identifier: Apache-2.0
import { ResponsiveImage } from './ResponsiveImage';

interface ThumbnailImageProps {
  readonly imagePath: string;
  readonly alt: string;
  readonly isSelected?: boolean;
  readonly className?: string;
  readonly aspectRatio?: number;
  readonly onClick?: () => void;
}

/**
 * A specialized thumbnail component based on ResponsiveImage
 * 
 * Features:
 * - Optimized for thumbnail display with appropriate sizes attribute
 * - Visual indication for selected state
 * - Click handling for selection
 * - Consistent aspect ratio
 */
export function ThumbnailImage({
  imagePath,
  alt,
  isSelected = false,
  className = '',
  aspectRatio = 1,
  onClick,
}: ThumbnailImageProps) {
  return (
    <button
      type="button"
      className={`relative overflow-hidden rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-400'
      } ${className}`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      <ResponsiveImage
        imagePath={imagePath}
        alt={alt}
        aspectRatio={aspectRatio}
        sizes="150px" // Thumbnails are typically small
        objectFit="cover"
        priority={false}
      />
    </button>
  );
}
