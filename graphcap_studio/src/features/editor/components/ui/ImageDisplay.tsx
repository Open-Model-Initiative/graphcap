// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Image, getImageUrl } from '@/services/images';

interface ImageDisplayProps {
  readonly image: Image | null;
  readonly size?: 'small' | 'medium' | 'large' | 'custom';
  readonly customSize?: {
    readonly maxWidth?: string | number;
    readonly maxHeight?: string | number;
  };
  readonly className?: string;
  readonly containerClassName?: string;
  readonly onLoad?: () => void;
  readonly onError?: (error: Error) => void;
}

/**
 * A component for displaying images with error handling
 */
export function ImageDisplay({
  image,
  size = 'medium',
  customSize,
  className = '',
  containerClassName = '',
  onLoad,
  onError,
}: ImageDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Size presets
  const sizeMap = {
    small: { maxWidth: '20%', maxHeight: '20%' },
    medium: { maxWidth: '50%', maxHeight: '50%' },
    large: { maxWidth: '80%', maxHeight: '80%' },
    custom: customSize || { maxWidth: '100%', maxHeight: '100%' },
  };

  const selectedSize = sizeMap[size];

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const errorMessage = `Failed to load image: ${image?.path || 'unknown'}`;
    const error = new Error(errorMessage);
    setError(error);
    setLoading(false);
    onError?.(error);
    console.error(errorMessage);
  };

  if (!image) {
    return (
      <div className={`text-gray-500 flex flex-col items-center justify-center ${containerClassName}`}>
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>No image selected</span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${containerClassName}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500"></div>
        </div>
      )}
      
      {error ? (
        <div className="text-red-500 flex flex-col items-center justify-center">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Failed to load image</span>
        </div>
      ) : (
        <img
          src={getImageUrl(image.path)}
          alt={image.name || 'Image'}
          className={`object-contain ${className}`}
          style={{
            maxWidth: selectedSize.maxWidth,
            maxHeight: selectedSize.maxHeight,
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
} 