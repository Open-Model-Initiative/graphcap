// SPDX-License-Identifier: Apache-2.0
import { ImageErrorBoundary } from './ImageErrorBoundary';
import { ThumbnailComponent } from './ThumbnailComponent';

interface ThumbnailImageProps {
  readonly imagePath: string;
  readonly alt: string;
  readonly isSelected?: boolean;
  readonly className?: string;
  readonly aspectRatio?: number;
  readonly width?: number;
  readonly height?: number;
  readonly maxHeight?: string;
  readonly onClick?: () => void;
}

/**
 * A specialized thumbnail image with selection capabilities
 * 
 * Features:
 * - Visual indication for selected state
 * - Click handling for selection
 * - Efficient suspense-based image loading
 * - Error handling with retry capability
 * - Height constraints for tall images
 */
export function ThumbnailImage({
  imagePath,
  alt,
  isSelected = false,
  className = '',
  aspectRatio = 1,
  width = 150,
  height,
  maxHeight,
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
      <ImageErrorBoundary compact={true}>
        <ThumbnailComponent
          imagePath={imagePath}
          alt={alt}
          aspectRatio={aspectRatio}
          width={width}
          height={height}
          maxHeight={maxHeight}
        />
      </ImageErrorBoundary>
    </button>
  );
}
