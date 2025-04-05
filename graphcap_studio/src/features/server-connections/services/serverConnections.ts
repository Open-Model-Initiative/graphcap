// SPDX-License-Identifier: Apache-2.0
/**
 * Server Connections Service
 *
 * This module provides functions for checking the health of server connections
 * such as the Media Server and Inference Bridge.
 */

import type { ServerConnection } from "@/types/server-connection-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CONNECTION_STATUS, SERVER_IDS } from "../constants";
import { createDataServiceClient, createInferenceBridgeClient } from "./apiClients";

/**
 * Interface for health check response
 */
interface HealthCheckResponse {
	status: string;
}

// Track last health check time per server to implement client-side throttling
const lastHealthCheckTime = new Map<string, number>();
const THROTTLE_DURATION = 15 * 1000; // 15 seconds throttle

// Health check query keys
export const healthQueryKeys = {
	all: ["health"] as const,
	server: (url: string) => [...healthQueryKeys.all, "server", url] as const,
	mediaServer: (url: string) => [...healthQueryKeys.all, "mediaServer", url] as const,
	inferenceServer: (url: string) => [...healthQueryKeys.all, "inferenceServer", url] as const,
	dataService: (url: string) => [...healthQueryKeys.all, "dataService", url] as const,
	// Add a key for checking by server ID
	serverById: (id: string, url: string) => [...healthQueryKeys.all, "serverById", id, url] as const,
};

/**
 * Throttle health check requests to prevent hammering servers
 * 
 * @param key - Throttle key (usually server ID + URL)
 * @returns True if the request should be throttled, false otherwise
 */
function shouldThrottleRequest(key: string): boolean {
	const now = Date.now();
	const lastCheck = lastHealthCheckTime.get(key) || 0;
	
	// Check if we've checked recently
	if (now - lastCheck < THROTTLE_DURATION) {
		console.debug(`Health check for ${key} throttled, last checked ${(now - lastCheck)/1000}s ago`);
		return true;
	}
	
	// Update last check time
	lastHealthCheckTime.set(key, now);
	return false;
}

/**
 * Check the health of a server by making a request to its health endpoint
 *
 * @param url - The base URL of the server
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkServerHealth(url: string): Promise<boolean> {
	if (!url) return false;
	
	const throttleKey = `server:${url}`;
	if (shouldThrottleRequest(throttleKey)) {
		// Return a cached result if available
		return true; // Assume healthy if throttled
	}
	
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
 * React hook for checking server health with caching
 * 
 * @param url - The base URL of the server
 * @returns Query result with the server health status
 */
export function useServerHealth(url: string) {
	return useQuery({
		queryKey: healthQueryKeys.server(url),
		queryFn: () => checkServerHealth(url),
		// Disable the query if URL is not provided
		enabled: !!url,
		// Extend cache time to reduce request frequency
		staleTime: 60 * 1000, // Consider data fresh for 60 seconds
		gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes
		// Retry failed requests 1 time
		retry: 1,
		retryDelay: 2000, // 2 second delay between retries
		// Return false for data if query is disabled
		placeholderData: false,
		// Don't refetch on window focus to reduce requests
		refetchOnWindowFocus: false,
	});
}

/**
 * Check the health of the Media Server
 *
 * @param url - The base URL of the Media Server
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkMediaServerHealth(url: string): Promise<boolean> {
	if (!url) return false;
	
	const throttleKey = `media_server:${url}`;
	if (shouldThrottleRequest(throttleKey)) {
		return true; // Assume healthy if throttled
	}
	
	return checkServerHealth(url);
}

/**
 * React hook for checking Media Server health with caching
 * 
 * @param url - The base URL of the Media Server
 * @returns Query result with the Media Server health status
 */
export function useMediaServerHealth(url: string) {
	return useQuery({
		queryKey: healthQueryKeys.mediaServer(url),
		queryFn: () => checkMediaServerHealth(url),
		// Disable the query if URL is not provided
		enabled: !!url,
		// Extend cache time to reduce request frequency
		staleTime: 60 * 1000, // Consider data fresh for 60 seconds
		gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes
		// Retry failed requests 1 time
		retry: 1,
		retryDelay: 2000, // 2 second delay between retries
		// Return false for data if query is disabled
		placeholderData: false,
		// Don't refetch on window focus to reduce requests
		refetchOnWindowFocus: false,
	});
}

/**
 * Check the health of the Inference Bridge
 *
 * @param url - The base URL of the Inference Bridge
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkInferenceBridgeHealth(url: string): Promise<boolean> {
	if (!url) return false;
	
	const throttleKey = `inference_bridge:${url}`;
	if (shouldThrottleRequest(throttleKey)) {
		return true; // Assume healthy if throttled
	}
	
	try {
		// Normalize URL once at the beginning
		const normalizedUrl = url.endsWith("/") ? url.slice(0, -1) : url;

		// Try the most common API endpoint first - just make one attempt
		try {
			const apiResponse = await fetch(`${normalizedUrl}/api/v1/health`, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
				// Set a timeout to prevent long-hanging requests
				signal: AbortSignal.timeout(5000),
			});

			if (apiResponse.ok) {
				const data = (await apiResponse.json()) as HealthCheckResponse;
				// Check if the response contains a valid status
				return data.status === "ok" || data.status === "healthy";
			}
		} catch (error) {
			console.warn("Error checking Inference Bridge at /api/v1/health:", error);
		}

		// Fallback to the standard /health endpoint
		return checkServerHealth(url);
	} catch (error) {
		console.error("Error checking Inference Bridge health:", error);
		return false;
	}
}

/**
 * React hook for checking Inference Bridge health with caching
 * 
 * @param url - The base URL of the Inference Bridge
 * @returns Query result with the Inference Bridge health status
 */
export function useInferenceBridgeHealth(url: string) {
	return useQuery({
		queryKey: healthQueryKeys.inferenceServer(url),
		queryFn: () => checkInferenceBridgeHealth(url),
		// Disable the query if URL is not provided
		enabled: !!url,
		// Extend cache time to reduce request frequency
		staleTime: 60 * 1000, // Consider data fresh for 60 seconds
		gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes
		// Retry failed requests 1 time
		retry: 1,
		retryDelay: 2000, // 2 second delay between retries
		// Return false for data if query is disabled
		placeholderData: false,
		// Don't refetch on window focus to reduce requests
		refetchOnWindowFocus: false,
	});
}

/**
 * Check the health of the Data Service
 *
 * @param url - The base URL of the Data Service
 * @returns A promise that resolves to a boolean indicating if the server is healthy
 */
export async function checkDataServiceHealth(url: string): Promise<boolean> {
	if (!url) return false;
	
	const throttleKey = `data_service:${url}`;
	if (shouldThrottleRequest(throttleKey)) {
		return true; // Assume healthy if throttled
	}
	
	try {
		// Normalize URL once at the beginning
		const normalizedUrl = url.endsWith("/") ? url.slice(0, -1) : url;

		// Try the main API endpoint directly - just make one attempt
		try {
			const apiResponse = await fetch(`${normalizedUrl}/api/v1/health`, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
				// Set a timeout to prevent long-hanging requests
				signal: AbortSignal.timeout(5000),
			});

			if (apiResponse.ok) {
				const data = (await apiResponse.json()) as HealthCheckResponse;
				// Check if the response contains a valid status
				return data.status === "ok" || data.status === "healthy";
			}
		} catch (error) {
			console.warn("Error checking Data Service at /api/v1/health:", error);
		}

		// Fallback to the standard /health endpoint
		return checkServerHealth(url);
	} catch (error) {
		console.error("Error checking Data Service health:", error);
		return false;
	}
}

/**
 * React hook for checking Data Service health with caching
 * 
 * @param url - The base URL of the Data Service
 * @returns Query result with the Data Service health status
 */
export function useDataServiceHealth(url: string) {
	return useQuery({
		queryKey: healthQueryKeys.dataService(url),
		queryFn: () => checkDataServiceHealth(url),
		// Disable the query if URL is not provided
		enabled: !!url,
		// Extend cache time to reduce request frequency
		staleTime: 60 * 1000, // Consider data fresh for 60 seconds
		gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes
		// Retry failed requests 1 time
		retry: 1,
		retryDelay: 2000, // 2 second delay between retries
		// Return false for data if query is disabled
		placeholderData: false,
		// Don't refetch on window focus to reduce requests
		refetchOnWindowFocus: false,
	});
}

/**
 * React hook for checking any server's health by ID
 * 
 * @param id - The server ID 
 * @param url - The server URL
 * @returns Query result with the server health status
 */
export function useServerHealthById(id: string, url: string) {
	const queryClient = useQueryClient();
	
	return useQuery({
		queryKey: healthQueryKeys.serverById(id, url),
		queryFn: () => checkServerHealthById(id, url),
		// Disable the query if URL is not provided
		enabled: !!url,
		// Extend cache time to reduce request frequency
		staleTime: 60 * 1000, // Consider data fresh for 60 seconds
		gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes
		// Retry failed requests 1 time
		retry: 1,
		retryDelay: 2000, // 2 second delay between retries
		// Return false for data if query is disabled
		placeholderData: false,
		// Don't refetch on window focus to reduce requests
		refetchOnWindowFocus: false,
	});
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
	if (!url) return false;
	
	const throttleKey = `server_by_id:${id}:${url}`;
	if (shouldThrottleRequest(throttleKey)) {
		return true; // Assume healthy if throttled
	}
	
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

/**
 * Force clear the health check throttling cache
 * Call this when server configuration changes to ensure fresh checks
 */
export function clearHealthCheckThrottling(): void {
	lastHealthCheckTime.clear();
}
