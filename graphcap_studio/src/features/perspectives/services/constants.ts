// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service Constants
 *
 * This module provides constants used by the perspectives service.
 */

/**
 * API endpoints for the perspectives service
 */
export const API_ENDPOINTS = {
	/**
	 * Endpoint to list all available perspectives
	 */
	LIST_PERSPECTIVES: "/perspectives/list",

	/**
	 * Endpoint to generate a caption for an image using a perspective
	 */
	REST_GENERATE_CAPTION: "/perspectives/caption-from-path",
};

/**
 * Cache times for React Query
 */
export const CACHE_TIMES = {
	/**
	 * Stale time for perspectives data (5 minutes)
	 */
	PERSPECTIVES: 5 * 60 * 1000, // 5 minutes
};

/**
 * Default values for the perspectives service
 */
export const DEFAULTS = {
	/**
	 * Default provider to use for caption generation
	 */
	PROVIDER: "default",

	/**
	 * Default server URL
	 */
	SERVER_URL: "http://localhost:32100/api",
};

/**
 * Query keys for React Query
 */
export const perspectivesQueryKeys = {
	/**
	 * Query key for fetching all perspectives
	 */
	perspectives: ["perspectives"],

	/**
	 * Query key for fetching a caption for an image using a perspective
	 *
	 * @param imagePath - Path to the image
	 * @param perspective - Name of the perspective
	 * @returns Query key array
	 */
	caption: (imagePath: string, perspective: string) => [
		"perspectives",
		"caption",
		imagePath,
		perspective,
	],
};
