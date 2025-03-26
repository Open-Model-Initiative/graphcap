// SPDX-License-Identifier: Apache-2.0
/**
 * API Clients Service
 *
 * This module provides centralized client functions for interacting with various server APIs.
 */

import { hc } from "hono/client";
import { DEFAULT_URLS, SERVER_IDS } from "../constants";
import type { ServerConnection } from "../types";

/**
 * Interface for the Data Service client
 */
export interface DataServiceClient {
	providers: {
		$get: () => Promise<Response>;
		$post: (options: { json: unknown }) => Promise<Response>;
		":id": {
			$get: (options: { param: { id: string } }) => Promise<Response>;
			$put: (options: {
				param: { id: string };
				json: unknown;
			}) => Promise<Response>;
			$delete: (options: { param: { id: string } }) => Promise<Response>;
		};
	};
}

/**
 * Interface for the Inference Bridge client
 */
export interface InferenceBridgeClient {
	providers: {
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
	};
	perspectives: {
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
	};
}

/**
 * Get the Data Service URL from server connections
 */
export function getDataServiceUrl(connections: ServerConnection[]): string {
	const dataServiceConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.DATA_SERVICE,
	);

	return (
		dataServiceConnection?.url ||
		import.meta.env.VITE_DATA_SERVICE_URL ||
		DEFAULT_URLS[SERVER_IDS.DATA_SERVICE]
	);
}

/**
 * Create a Hono client for the Data Service
 */
export function createDataServiceClient(connections: ServerConnection[]): DataServiceClient {
	const baseUrl = getDataServiceUrl(connections);
	return hc(`${baseUrl}/api/v1`) as unknown as DataServiceClient;
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