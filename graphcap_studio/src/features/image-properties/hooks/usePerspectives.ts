// SPDX-License-Identifier: Apache-2.0
/**
 * @deprecated Use useImagePerspectives from @/services/perspectives/hooks instead
 * 
 * This hook is maintained for backward compatibility.
 * It will be removed in a future version.
 */

import { Image } from '@/services/images';
import { useImagePerspectives, PerspectiveType } from '@/features/perspectives/services';

// Re-export the PerspectiveType for backward compatibility
export type { PerspectiveType };

/**
 * Hook for fetching and managing perspective data for an image
 * 
 * @deprecated Use useImagePerspectives from @/services/perspectives/hooks instead
 */
export function usePerspectives(image: Image | null) {
  return useImagePerspectives(image);
} 