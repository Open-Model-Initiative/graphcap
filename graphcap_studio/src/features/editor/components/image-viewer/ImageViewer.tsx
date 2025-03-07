// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/services/images';

interface ImageViewerProps {
  readonly imagePath: string;
  readonly alt?: string;
  readonly className?: string;
  readonly onLoad?: () => void;
  readonly onError?: (error: Error) => void;
}

/**
 * A component for viewing individual images with loading and error states
 * 
 * This component handles:
 * - Loading states with a spinner
 * - Error states with a message
 * - Image rendering with proper sizing
 * 
 * @param imagePath - Path to the image file
 * @param alt - Alternative text for the image
 * @param className - Additional CSS classes
 * @param onLoad - Callback when image loads successfully
 * @param onError - Callback when image fails to load
 */
export function ImageViewer({
  imagePath,
  alt = 'Image',
  className = '',
  onLoad,
  onError,
}: ImageViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const imageUrl = getImageUrl(imagePath);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [imagePath]);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const error = new Error(`Failed to load image: ${imagePath}`);
    setError(error);
    setLoading(false);
    onError?.(error);
    console.error(`Failed to load image: ${imagePath}`);
  };

  return (
    <div className={`relative flex items-center justify-center h-full w-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-80 z-10 p-4">
          <svg className="w-12 h-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-red-400 text-center">{error.message}</div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
} 