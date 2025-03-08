// SPDX-License-Identifier: Apache-2.0
import { calculateHeightFromAspectRatio } from './aspectRatio';

/**
 * Generates a srcSet string for responsive images
 * 
 * This utility function creates a properly formatted srcSet string
 * for use with responsive images. It handles calculating heights
 * based on aspect ratio and supports different image formats.
 * 
 * When no aspect ratio is provided, it will preserve the original image's aspect ratio
 * by passing 0 as the height parameter to the URL function, which should signal
 * to the image service to maintain the original aspect ratio.
 * 
 * @param imagePath - Path to the image
 * @param getUrlFn - Function that returns a URL for the given parameters
 * @param widths - Array of widths to generate srcSet entries for (default: [200, 400, 800, 1200, 1600])
 * @param aspectRatio - Optional aspect ratio (width/height) for calculating height
 * @param format - Optional image format (e.g., 'webp', 'jpeg')
 * @returns A properly formatted srcSet string
 */
export function generateSrcSet(
  imagePath: string,
  getUrlFn: (imagePath: string, width: number, height: number, format?: string) => string,
  widths: number[] = [200, 400, 800, 1200, 1600],
  aspectRatio?: number,
  format?: string
): string {
  return widths
    .map(width => {
      const height = calculateHeightFromAspectRatio(width, aspectRatio, 'generateSrcSet');
      // If height is undefined (no aspect ratio provided), pass 0 to signal "preserve original aspect ratio"
      const heightParam = height ?? 0;
      return `${getUrlFn(imagePath, width, heightParam, format)} ${width}w`;
    })
    .join(', ');
} 