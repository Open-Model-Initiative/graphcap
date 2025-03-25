// SPDX-License-Identifier: Apache-2.0
/**
 * Server Connections Service
 *
 * This module provides functions for checking the health of server connections
 * such as the Media Server and Inference Bridge.
 */

import { SERVER_IDS } from "../constants";

/**
 * Interface for health check response
 */
interface HealthCheckResponse {
	status: string;
}

/**
 * Check the health of a server by making a request to its health endpoint
 *
 * @param url - The base URL of the server
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkServerHealth(url: string): Promise<boolean> {
	try {
		// Normalize URL by removing trailing slash if present
		const normalizedUrl = url.endsWith("/") ? url.slice(0, -1) : url;

		// Make request to health endpoint
		const response = await fetch(`${normalizedUrl}/health`, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			// Set a timeout to prevent long-hanging requests
			signal: AbortSignal.timeout(5000),
		});

		if (!response.ok) {
			console.error(`Health check failed with status: ${response.status}`);
			return false;
		}

		const data = (await response.json()) as HealthCheckResponse;

		// Check if the response contains a valid status
		return data.status === "ok" || data.status === "healthy";
	} catch (error) {
		console.error("Error checking server health:", error);
		return false;
	}
}

/**
 * Check the health of the Media Server
 *
 * @param url - The base URL of the Media Server
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkMediaServerHealth(url: string): Promise<boolean> {
	return checkServerHealth(url);
}

/**
 * Check the health of the Inference Bridge
 *
 * @param url - The base URL of the Inference Bridge
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkInferenceBridgeHealth(url: string): Promise<boolean> {
	try {
		// Normalize URL by removing trailing slash if present
		const normalizedUrl = url.endsWith("/") ? url.slice(0, -1) : url;

		// First try the /api/v1/health endpoint
		try {
			const response = await fetch(`${normalizedUrl}/api/v1/health`, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
				// Set a timeout to prevent long-hanging requests
				signal: AbortSignal.timeout(3000),
			});

			if (response.ok) {
				const data = (await response.json()) as HealthCheckResponse;
				// Check if the response contains a valid status
				return data.status === "ok" || data.status === "healthy";
			}
		} catch (apiError) {
			console.warn("Error checking Inference Bridge at /api/v1/health, trying /health next:", apiError);
		}

		// Fallback to the /health endpoint
		const fallbackResponse = await fetch(`${normalizedUrl}/health`, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			// Set a timeout to prevent long-hanging requests
			signal: AbortSignal.timeout(3000),
		});

		if (!fallbackResponse.ok) {
			console.error(`Both health check endpoints failed. Last status: ${fallbackResponse.status}`);
			return false;
		}

		const fallbackData = (await fallbackResponse.json()) as HealthCheckResponse;
		// Check if the response contains a valid status
		return fallbackData.status === "ok" || fallbackData.status === "healthy";
	} catch (error) {
		console.error("Error checking Inference Bridge health:", error);
		return false;
	}
}

/**
 * Check the health of the Data Service
 *
 * @param url - The base URL of the Data Service
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkDataServiceHealth(url: string): Promise<boolean> {
	return checkServerHealth(url);
}

/**
 * Check the health of a server by its ID
 *
 * @param id - The ID of the server (from SERVER_IDS)
 * @param url - The base URL of the server
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkServerHealthById(
	id: string,
	url: string,
): Promise<boolean> {
	switch (id) {
		case SERVER_IDS.MEDIA_SERVER:
			return checkMediaServerHealth(url);
		case SERVER_IDS.INFERENCE_BRIDGE:
			return checkInferenceBridgeHealth(url);
		case SERVER_IDS.DATA_SERVICE:
			return checkDataServiceHealth(url);
		default:
			console.error(`Unknown server ID: ${id}`);
			return false;
	}
}
