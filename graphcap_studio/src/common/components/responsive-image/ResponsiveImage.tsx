// SPDX-License-Identifier: Apache-2.0
import { useRef, useMemo } from 'react';
import { getImageUrl, getThumbnailUrl } from '@/services/images';
import { useResponsiveImage } from './useResponsiveImage';

interface ResponsiveImageProps {
  readonly imagePath: string;
  readonly alt: string;
  readonly className?: string;
  readonly aspectRatio?: number;
  readonly priority?: boolean;
  readonly objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  readonly sizes?: string;
  readonly onLoad?: () => void;
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
    onError,
  });

  // Memoize srcset strings for next-gen formats (assuming getThumbnailUrl accepts a format parameter)
  const avifSrcSet = useMemo(() => {
    const widths = [200, 400, 800, 1200, 1600];
    return widths
      .map(width =>
        `${getThumbnailUrl(imagePath, width, Math.round(width / (aspectRatio ?? 1)), 'avif')} ${width}w`
      )
      .join(', ');
  }, [imagePath, aspectRatio]);

  const webpSrcSet = useMemo(() => {
    const widths = [200, 400, 800, 1200, 1600];
    return widths
      .map(width =>
        `${getThumbnailUrl(imagePath, width, Math.round(width / (aspectRatio ?? 1)), 'webp')} ${width}w`
      )
      .join(', ');
  }, [imagePath, aspectRatio]);

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
          <svg
            className="h-8 w-8 text-red-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="text-sm text-red-400 text-center">{error.message}</div>
        </div>
      )}

      {/* Picture element for modern formats */}
      <picture>
        <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
        <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
        <img
          ref={imageRef}
          src={getImageUrl(imagePath)}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full transition-opacity duration-300 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ objectFit }}
          loading={priority ? undefined : 'lazy'}
          decoding={priority ? undefined : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          onLoad={handleLoad}
          onError={handleError}
        />
      </picture>
    </div>
  );
}
