// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Service Utilities
 *
 * This module provides utility functions for the perspectives service.
 */

import type { ServerConnection } from "@/features/perspectives/types";
import { SERVER_IDS } from "@/features/server-connections/constants";

/**
 * Get the Inference Bridge URL from server connections context
 */
export function getGraphCapServerUrl(connections: ServerConnection[]): string {
	const serverConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.INFERENCE_BRIDGE,
	);

	// Use connection URL or fallback to environment variable or default
	const serverUrl =
		serverConnection?.url ??
		import.meta.env.VITE_INFERENCE_BRIDGE_URL ??
		"http://localhost:32100";

	console.debug(`Using Inference Bridge URL: ${serverUrl}`);
	return serverUrl;
}

/**
 * Get the full Inference Bridge API URL (including /api/v1)
 */
export function getInferenceBridgeApiUrl(connections: ServerConnection[]): string {
	const baseUrl = getGraphCapServerUrl(connections);
	// Ensure the URL doesn't already have /api/v1
	return baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
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
