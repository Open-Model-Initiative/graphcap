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

	/**
	 * Endpoint to list all available perspective modules
	 */
	LIST_MODULES: "/perspectives/modules",

	/**
	 * Endpoint to get perspectives for a specific module
	 * Note: This is a template that needs to be interpolated with the module name
	 */
	MODULE_PERSPECTIVES: "/perspectives/modules/{module_name}",
};

/**
 * Cache times for React Query
 */
export const CACHE_TIMES = {
	/**
	 * Stale time for perspectives data (5 minutes)
	 */
	PERSPECTIVES: 5 * 60 * 1000, // 5 minutes

	/**
	 * Stale time for modules data (5 minutes)
	 */
	MODULES: 5 * 60 * 1000, // 5 minutes
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
	SERVER_URL: "http://localhost:32100/",
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
	 * Query key for fetching all modules
	 */
	modules: ["perspectives", "modules"],

	/**
	 * Query key for fetching perspectives in a specific module
	 * 
	 * @param moduleName - Name of the module
	 * @returns Query key array
	 */
	modulePerspectives: (moduleName: string) => ["perspectives", "modules", moduleName],

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
