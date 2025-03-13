// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service Constants
 * 
 * This module defines constants used by the perspectives service.
 */

// Query keys for TanStack Query
export const perspectivesQueryKeys = {
  perspectives: ['perspectives'] as const,
  caption: (imagePath: string, perspective: string) => 
    [...perspectivesQueryKeys.perspectives, 'caption', imagePath, perspective] as const,
};

// Constants for API endpoints
export const API_ENDPOINTS = {
  LIST_PERSPECTIVES: '/perspectives/list',
  GENERATE_CAPTION: '/perspectives/caption',
  VIEW_IMAGE: '/images/view',
  REST_LIST_PERSPECTIVES: '/perspectives/list',
  REST_GENERATE_CAPTION: '/perspectives/caption-from-path',
};

// Cache stale times (in milliseconds)
export const CACHE_TIMES = {
  PERSPECTIVES_STALE_TIME: 1000 * 60 * 5, // 5 minutes
};

// Default values
export const DEFAULTS = {
  SERVER_URL: 'http://localhost:32100',
  PROVIDER: 'gemini',
  DEFAULT_FILENAME: 'image.jpg',
}; 