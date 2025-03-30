// SPDX-License-Identifier: Apache-2.0
/**
 * Inference Bridge API Client
 *
 * This module provides client functions for interacting with the Inference Bridge API.
 */

import type { ServerConnection } from "@/types/server-connection-types";
import { hc } from "hono/client";
import { DEFAULT_URLS, SERVER_IDS } from "../constants";

/**
 * Interface for the Inference Bridge Provider operations
 */
export interface ProviderClient {
	":provider_name": {
		"test-connection": {
			$post: (options: { 
				param: { provider_name: string };
				json: unknown;
			}) => Promise<Response>;
		};
		"models": {
			$post: (options: { 
				param: { provider_name: string };
				json: unknown;
			}) => Promise<Response>;
		};
	};
}

/**
 * Interface for the Inference Bridge Perspectives operations
 */
export interface PerspectivesClient {
	list: {
		$get: () => Promise<Response>;
	};
	modules: {
		$get: () => Promise<Response>;
		":moduleName": {
			$get: (options: { param: { moduleName: string } }) => Promise<Response>;
		};
	};
	"caption-from-path": {
		$post: (options: { json: unknown }) => Promise<Response>;
	};
	":name": {
		$post: (options: { 
			param: { name: string };
			json: unknown;
			formData?: FormData;
		}) => Promise<Response>;
	};
}

/**
 * Interface for the Inference Bridge client - combines provider and perspectives APIs
 */
export interface InferenceBridgeClient {
	providers: ProviderClient;
	perspectives: PerspectivesClient;
	health: {
		$get: () => Promise<Response>;
	};
}

/**
 * Get the Inference Bridge URL from server connections
 */
export function getInferenceBridgeUrl(connections: ServerConnection[]): string {
	const inferenceBridgeConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.INFERENCE_BRIDGE,
	);

	return (
		inferenceBridgeConnection?.url ||
		import.meta.env.VITE_INFERENCE_BRIDGE_URL ||
		DEFAULT_URLS[SERVER_IDS.INFERENCE_BRIDGE]
	);
}

/**
 * Create a Hono client for the Inference Bridge
 * Automatically appends /api/v1 to the base URL
 */
export function createInferenceBridgeClient(connections: ServerConnection[]): InferenceBridgeClient {
	const baseUrl = getInferenceBridgeUrl(connections);
	// Ensure the URL doesn't already have /api/v1
	const apiUrl = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
	return hc(apiUrl) as unknown as InferenceBridgeClient;
}

/**
 * Create a client for provider operations only
 */
export function createProviderClient(connections: ServerConnection[]): ProviderClient {
	const baseUrl = getInferenceBridgeUrl(connections);
	const apiUrl = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
	return (hc(apiUrl) as unknown as InferenceBridgeClient).providers;
}

/**
 * Create a client for perspectives operations only
 */
export function createPerspectivesClient(connections: ServerConnection[]): PerspectivesClient {
	const baseUrl = getInferenceBridgeUrl(connections);
	const apiUrl = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
	return (hc(apiUrl) as unknown as InferenceBridgeClient).perspectives;
} 