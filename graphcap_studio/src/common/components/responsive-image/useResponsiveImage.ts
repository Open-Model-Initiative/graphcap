// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, RefObject } from 'react';
import { getThumbnailUrl } from '@/services/images';

interface UseResponsiveImageProps {
  /**
   * Path to the image file
   */
  readonly imagePath: string;
  
  /**
   * Optional aspect ratio to maintain (width/height)
   */
  readonly aspectRatio?: number;
  
  /**
   * Optional reference to the image element
   */
  readonly imageRef?: RefObject<HTMLImageElement>;
  
  /**
   * Optional callback when image loads successfully
   */
  readonly onLoad?: () => void;
  
  /**
   * Optional callback when image fails to load
   */
  readonly onError?: (error: Error) => void;
}

interface UseResponsiveImageResult {
  /**
   * Whether the image is currently loading
   */
  readonly loading: boolean;
  
  /**
   * Error object if image failed to load
   */
  readonly error: Error | null;
  
  /**
   * Generated srcset string for responsive images
   */
  readonly srcSet: string;
  
  /**
   * Handler for successful image load
   */
  readonly handleLoad: () => void;
  
  /**
   * Handler for image load error
   */
  readonly handleError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Custom hook for managing responsive image loading and optimization
 * 
 * Features:
 * - Manages loading and error states
 * - Generates optimal srcset based on image path and aspect ratio
 * - Provides event handlers for load and error events
 * 
 * @param props - Hook configuration options
 * @returns Object with loading states, srcset, and event handlers
 */
export function useResponsiveImage({
  imagePath,
  aspectRatio,
  onLoad,
  onError
}: UseResponsiveImageProps): UseResponsiveImageResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Reset loading state when image path changes
  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [imagePath]);

  // Handle successful image load
  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  // Handle image load error
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const errorMessage = `Failed to load image: ${imagePath}`;
    const error = new Error(errorMessage);
    setError(error);
    setLoading(false);
    onError?.(error);
    console.error(errorMessage);
  };

  // Generate srcset with different sizes
  const generateSrcSet = () => {
    const widths = [200, 400, 800, 1200, 1600];
    return widths
      .map(width => `${getThumbnailUrl(imagePath, width, Math.round(width / (aspectRatio || 1)))} ${width}w`)
      .join(', ');
  };

  return {
    loading,
    error,
    srcSet: generateSrcSet(),
    handleLoad,
    handleError
  };
} 