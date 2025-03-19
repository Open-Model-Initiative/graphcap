// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service Utilities
 *
 * This module provides utility functions for the perspectives service.
 */

import { DEFAULTS } from "@/features/perspectives/constants/index";
import type { ServerConnection } from "@/features/perspectives/types";
import { SERVER_IDS } from "@/features/server-connections/constants";

/**
 * Get the GraphCap Server URL from server connections context
 */
export function getGraphCapServerUrl(connections: ServerConnection[]): string {
	const graphcapServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.GRAPHCAP_SERVER,
	);

	// Get URL from connection, environment variable, or default
	const serverUrl =
		graphcapServerConnection?.url ??
		import.meta.env.VITE_GRAPHCAP_SERVER_URL ??
		import.meta.env.VITE_API_URL ??
		DEFAULTS.SERVER_URL;

	// Log the server URL being used for debugging
	console.debug(`Using GraphCap server URL: ${serverUrl}`);

	return serverUrl;
}

/**
 * Ensure path starts with /workspace if it doesn't already
 */
export function ensureWorkspacePath(path: string): string {
	// If path already starts with /workspace, return it as is
	if (path.startsWith("/workspace/")) {
		return path;
	}

	// If path starts with /datasets, replace with /workspace/datasets
	if (path.startsWith("/datasets/")) {
		return `/workspace${path}`;
	}

	// If path doesn't start with /, add it
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	// Add /workspace prefix if not already present
	return `/workspace${normalizedPath}`;
}

/**
 * Check if a path is a URL
 */
export function isUrl(path: string): boolean {
	return path.startsWith("http://") || path.startsWith("https://");
}

/**
 * Parse JSON error data into a readable error message
 */
function parseJsonErrorData(errorData: Record<string, unknown>): {
	message: string;
	details: Record<string, unknown>;
} {
	let message = "";

	// FastAPI error format
	if (errorData.detail) {
		if (typeof errorData.detail === "string") {
			message = errorData.detail;
		} else if (Array.isArray(errorData.detail)) {
			// Handle validation errors
			message = errorData.detail
				.map(
					(err: { loc: string[]; msg: string }) =>
						`${err.loc.join(".")}: ${err.msg}`,
				)
				.join(", ");
		} else {
			message = JSON.stringify(errorData.detail);
		}
	} else if (errorData.message && typeof errorData.message === "string") {
		message = errorData.message;
	} else {
		message = JSON.stringify(errorData);
	}

	return { message, details: errorData };
}

/**
 * Handle API error responses
 */
export async function handleApiError(
	response: Response,
	defaultMessage: string,
): Promise<never> {
	let errorMessage = `${defaultMessage}: ${response.status}`;
	let errorDetails: Record<string, unknown> | null = null;

	try {
		const contentType = response.headers.get("content-type") ?? "";

		// Handle response based on content type
		if (contentType.includes("application/json")) {
			const errorData = await response.json();
			const parsedError = parseJsonErrorData(errorData);
			errorMessage = parsedError.message;
			errorDetails = parsedError.details;
		} else if (contentType.includes("text/html")) {
			const textError = await response.text();
			const excerpt =
				textError.substring(0, 200) + (textError.length > 200 ? "..." : "");
			errorMessage = `${defaultMessage}: Received HTML response (Status: ${response.status})`;
			errorDetails = { htmlExcerpt: excerpt };
			console.warn("Received HTML response instead of expected JSON:", excerpt);
		} else {
			const textError = await response.text();
			if (textError) {
				errorMessage = textError.substring(0, 500); // Limit size
				errorDetails = { text: textError };
			}
		}
	} catch (e) {
		console.error("Error parsing API error response", e);
		errorMessage = `${defaultMessage}: ${response.statusText} (Status: ${response.status})`;
		errorDetails = {
			parseError: e instanceof Error ? e.message : "Unknown error",
		};
	}

	// Log error details
	console.error(`API Error: ${errorMessage}`, {
		status: response.status,
		url: response.url,
		details: errorDetails,
	});

	// Create and throw error with additional properties
	const error = new Error(errorMessage) as Error & {
		status?: number;
		details?: Record<string, unknown> | null;
		url?: string;
	};
	error.status = response.status;
	error.details = errorDetails;
	error.url = response.url;

	throw error;
}
