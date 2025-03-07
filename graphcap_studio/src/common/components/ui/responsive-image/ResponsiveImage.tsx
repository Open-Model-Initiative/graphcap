// SPDX-License-Identifier: Apache-2.0
import { useRef } from 'react';
import { getImageUrl } from '@/services/images';
import { useResponsiveImage } from './useResponsiveImage';

interface ResponsiveImageProps {
  /**
   * Path to the image file
   */
  readonly imagePath: string;
  
  /**
   * Alternative text for the image
   */
  readonly alt: string;
  
  /**
   * Optional CSS class name
   */
  readonly className?: string;
  
  /**
   * Optional aspect ratio to maintain (width/height)
   * e.g. 16/9, 4/3, 1 for square
   */
  readonly aspectRatio?: number;
  
  /**
   * Whether this image is high priority (e.g. above the fold or LCP)
   * When true, disables lazy loading and sets high fetch priority
   */
  readonly priority?: boolean;
  
  /**
   * Optional object-fit style (default: 'cover')
   */
  readonly objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  
  /**
   * Optional sizes attribute for the image
   * Helps browser determine which image size to download before CSS is loaded
   * Default: '(max-width: 768px) 100vw, 50vw'
   */
  readonly sizes?: string;
  
  /**
   * Optional callback when image loads successfully
   */
  readonly onLoad?: () => void;
  
  /**
   * Optional callback when image fails to load
   */
  readonly onError?: (error: Error) => void;
}

/**
 * A performant, responsive image component that optimizes loading and display
 * 
 * Features:
 * - Automatic responsive sizing with srcset
 * - Lazy loading for images below the fold
 * - Proper aspect ratio preservation
 * - Loading states with placeholders
 * - Error handling
 * 
 * Based on best practices from: https://www.builder.io/blog/fast-images
 */
export function ResponsiveImage({
  imagePath,
  alt,
  className = '',
  aspectRatio,
  priority = false,
  objectFit = 'cover',
  sizes = '(max-width: 768px) 100vw, 50vw',
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  
  const { loading, error, srcSet, handleLoad, handleError } = useResponsiveImage({
    imagePath,
    aspectRatio,
    onLoad,
    onError
  });
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : undefined }}
    >
      {/* Loading placeholder */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/20">
          <div className="h-6 w-6 animate-pulse rounded-full bg-gray-700"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/20 p-4">
          <svg className="h-8 w-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm text-red-400 text-center">{error.message}</div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        ref={imageRef}
        src={getImageUrl(imagePath)}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{ objectFit }}
        loading={priority ? undefined : 'lazy'}
        decoding={priority ? undefined : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
} 