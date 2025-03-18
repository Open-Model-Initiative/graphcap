// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Constants
 *
 * This module exports constants for the perspectives components.
 */

// CSS class names
export const PERSPECTIVE_CLASSES = {
	CARD: {
		BASE: "border rounded-lg overflow-hidden",
		ACTIVE: "border-blue-500",
		INACTIVE: "border-gray-700",
	},
	HEADER: {
		BASE: "p-1 bg-gray-800",
	},
	CONTENT: {
		BASE: "p-1 bg-gray-900 border-t border-gray-700",
	},
	ACTION_BAR: {
		BASE: "p-1 bg-gray-800 border-t border-gray-700 flex justify-between items-center",
	},
	BUTTON: {
		PRIMARY: "bg-blue-600 hover:bg-blue-700 text-white",
		SUCCESS: "bg-green-600 hover:bg-green-700 text-white",
		SECONDARY: "bg-gray-700 text-gray-300 hover:bg-gray-600",
		DISABLED: "bg-gray-600 cursor-not-allowed",
		BASE: "rounded-md flex items-center gap-1",
	},
	SELECT: {
		BASE: "bg-gray-700 text-gray-300 text-xs rounded px-2 py-1",
	},
	LOADING: {
		BASE: "flex items-center space-x-1 bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-300",
	},
};

// Query keys for TanStack Query
export const perspectivesQueryKeys = {
	perspectives: ["perspectives"] as const,
	caption: (imagePath: string, perspective: string) =>
		[
			...perspectivesQueryKeys.perspectives,
			"caption",
			imagePath,
			perspective,
		] as const,
};

// Constants for API endpoints
export const API_ENDPOINTS = {
	LIST_PERSPECTIVES: "/perspectives/list",
	GENERATE_CAPTION: "/perspectives/caption",
	VIEW_IMAGE: "/images/view",
	REST_LIST_PERSPECTIVES: "/perspectives/list",
	REST_GENERATE_CAPTION: "/perspectives/caption-from-path",
};

// Cache stale times (in milliseconds)
export const CACHE_TIMES = {
	PERSPECTIVES_STALE_TIME: 1000 * 60 * 5, // 5 minutes
};

// Default values
export const DEFAULTS = {
	SERVER_URL: "http://localhost:32100",
	PROVIDER: "gemini",
	DEFAULT_FILENAME: "image.jpg",
};
