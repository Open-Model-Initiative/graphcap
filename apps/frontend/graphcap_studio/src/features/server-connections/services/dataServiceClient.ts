// SPDX-License-Identifier: Apache-2.0
/**
 * Data Service API Client
 *
 * This module provides client functions for interacting with the Data Service API.
 */

import type { ServerConnection } from "@/types/server-connection-types";
import { hc } from "hono/client";
import type { AppType } from "../../../../../../servers/data_service/src/app";
import { DEFAULT_URLS, SERVER_IDS } from "../constants";

// ---------------------------------------------------------------------------
// Derived type for the RPC client – we get full typing directly from AppType.
// ---------------------------------------------------------------------------
export type DataServiceClient = ReturnType<typeof hc<AppType>>;

/**
 * Resolve the base URL for the data-service.
 *
 * During local development Vite proxies any request starting with `/api` to
 * the backend (see `vite.config.ts`). Therefore, when `baseUrl` is an empty
 * string the client will make calls such as `/api/providers`, which are
 * automatically proxied.  When a server connection is supplied (e.g. a remote
 * deployment), we fall back to that absolute URL so the same client works in
 * production.
 */
export function getDataServiceBaseUrl(
	connections: ServerConnection[] = [],
): string {
	const dataServiceConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.DATA_SERVICE,
	);

	return (
		dataServiceConnection?.url ??
		import.meta.env.VITE_DATA_SERVICE_URL ??
		DEFAULT_URLS[SERVER_IDS.DATA_SERVICE] ??
		"" // Fallback to same-origin + Vite proxy
	);
}

/**
 * Factory that returns a fully-typed RPC client for the GraphCap Data Service.
 *
 * Example usage:
 * ```ts
 * const client = createDataServiceClient();
 * const providers = await (await client.api.providers.$get()).json();
 * ```
 */
export function createDataServiceClient(
	connections: ServerConnection[] = [],
	baseUrlOverride?: string,
): DataServiceClient {
	const baseUrl = baseUrlOverride ?? getDataServiceBaseUrl(connections);
	// NOTE: `hc` automatically appends route paths like `/api/providers`, so we
	// should NOT include the `/api` prefix in the baseUrl.
	return hc<AppType>(baseUrl);
} 