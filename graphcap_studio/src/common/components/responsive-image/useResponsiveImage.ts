// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getThumbnailUrl } from '@/services/images';
import { generateSrcSet } from '@/common/utils/imageSrcSet';

interface UseResponsiveImageProps {
  readonly imagePath: string;
  readonly aspectRatio?: number;
  readonly onLoad?: () => void;
  readonly onError?: (error: Error) => void;
}

interface UseResponsiveImageResult {
  readonly loading: boolean;
  readonly error: Error | null;
  readonly srcSet: string;
  readonly handleLoad: () => void;
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
  onError,
}: UseResponsiveImageProps): UseResponsiveImageResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Reset loading state when imagePath changes
  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [imagePath]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const err = new Error(`Failed to load image: ${imagePath}`);
      setError(err);
      setLoading(false);
      onError?.(err);
      console.error(err.message);
    },
    [imagePath, onError]
  );

  // Memoize the srcset string (default format, e.g., JPEG)
  const srcSet = useMemo(() => {
    return generateSrcSet(imagePath, getThumbnailUrl, undefined, aspectRatio);
  }, [imagePath, aspectRatio]);

  return {
    loading,
    error,
    srcSet,
    handleLoad,
    handleError,
  };
}
