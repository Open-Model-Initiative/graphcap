// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service Utilities
 *
 * This module provides utility functions for the perspectives service.
 */

import { DEFAULTS } from "@/features/perspectives/constants/index";
import { ServerConnection } from "@/features/perspectives/types";
import { SERVER_IDS } from "@/features/server-connections/constants";

/**
 * Get the GraphCap Server URL from server connections context
 */
export function getGraphCapServerUrl(connections: ServerConnection[]): string {
	const graphcapServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.GRAPHCAP_SERVER,
	);

	// Get URL from connection, environment variable, or default
	const serverUrl = graphcapServerConnection?.url ||
		import.meta.env.VITE_GRAPHCAP_SERVER_URL ||
		import.meta.env.VITE_API_URL ||
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
 * Handle API error responses
 */
export async function handleApiError(
	response: Response,
	defaultMessage: string,
): Promise<never> {
	let errorMessage = `${defaultMessage}: ${response.status}`;
	let errorDetails = null;

	try {
		const contentType = response.headers.get("content-type") || "";

		// Handle different content types appropriately
		if (contentType.includes("application/json")) {
			// JSON response - parse and extract error details
			const errorData = await response.json();

			// FastAPI error format
			if (errorData.detail) {
				if (typeof errorData.detail === "string") {
					errorMessage = errorData.detail;
				} else if (Array.isArray(errorData.detail)) {
					// Handle validation errors
					errorMessage = errorData.detail
						.map((err: any) => `${err.loc.join(".")}: ${err.msg}`)
						.join(", ");
				} else {
					errorMessage = JSON.stringify(errorData.detail);
				}
				errorDetails = errorData;
			} else if (errorData.message) {
				errorMessage = errorData.message;
				errorDetails = errorData;
			} else {
				errorMessage = JSON.stringify(errorData);
				errorDetails = errorData;
			}
		} else if (contentType.includes("text/html")) {
			// HTML response - likely a server error page or redirect
			const textError = await response.text();
			// Extract just a small portion to avoid huge error messages
			const excerpt = textError.substring(0, 200) + (textError.length > 200 ? "..." : "");
			errorMessage = `${defaultMessage}: Received HTML response (Status: ${response.status})`;
			errorDetails = { htmlExcerpt: excerpt };
			console.warn("Received HTML response instead of expected JSON:", excerpt);
		} else {
			// Other content type - try to get text
			const textError = await response.text();
			if (textError) {
				errorMessage = textError.substring(0, 500); // Limit size
				errorDetails = { text: textError };
			}
		}
	} catch (e) {
		// If we can't parse the error, use the status text
		console.error("Error parsing API error response", e);
		errorMessage = `${defaultMessage}: ${response.statusText} (Status: ${response.status})`;
		errorDetails = { parseError: e instanceof Error ? e.message : "Unknown error" };
	}

	// Create a more informative error
	console.error(`API Error: ${errorMessage}`, { 
		status: response.status, 
		url: response.url,
		details: errorDetails
	});
	
	// Create an error with additional properties
	const error = new Error(errorMessage) as Error & { 
		status?: number; 
		details?: any;
		url?: string;
	};
	error.status = response.status;
	error.details = errorDetails;
	error.url = response.url;
	
	throw error;
}
