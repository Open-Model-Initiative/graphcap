// SPDX-License-Identifier: Apache-2.0
/**
 * Data Service API Client
 *
 * This module provides client functions for interacting with the Data Service API.
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
	health: {
		$get: () => Promise<Response>;
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