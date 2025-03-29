// SPDX-License-Identifier: Apache-2.0
/**
 * usePerspectives Hook
 *
 * This hook fetches available perspectives from the server.
 * It includes improved error handling and reporting.
 */

import { useServerConnectionsContext } from "@/context";
import { SERVER_IDS } from "@/features/server-connections/constants";
import { createInferenceBridgeClient } from "@/features/server-connections/services/apiClients";
import type { Perspective, PerspectiveListResponse } from "@/types";
import type { ServerConnection } from "@/types/server-connection-types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
	CACHE_TIMES,
	perspectivesQueryKeys
} from "../services/constants";
import { handleApiError } from "../services/utils";

/**
 * Custom error class for perspective fetching errors
 */
export class PerspectiveError extends Error {
	public readonly code: string;
	public readonly statusCode?: number;
	public readonly context?: Record<string, any>;

	constructor(
		message: string,
		options: {
			code: string;
			statusCode?: number;
			context?: Record<string, any>;
		},
	) {
		super(message);
		this.name = "PerspectiveError";
		this.code = options.code;
		this.statusCode = options.statusCode;
		this.context = options.context;
	}
}

/**
 * Hook to fetch available perspectives from the server
 *
 * @returns A query result with perspectives data
 */
export function usePerspectives() {
	const { connections } = useServerConnectionsContext();
	const graphcapServerConnection = connections.find(
		(conn: ServerConnection) => conn.id === SERVER_IDS.INFERENCE_BRIDGE,
	);
	const isConnected = graphcapServerConnection?.status === "connected";

	const query = useQuery<Perspective[], Error>({
		queryKey: perspectivesQueryKeys.perspectives,
		queryFn: async () => {
			try {
				// Handle case when server connection is not established
				if (!isConnected) {
					console.warn("Server connection not established");
					throw new PerspectiveError("Server connection not established", {
						code: "SERVER_CONNECTION_ERROR",
						context: { connections },
					});
				}

				// Use the inference bridge client instead of direct fetch
				const client = createInferenceBridgeClient(connections);

				console.debug("Fetching perspectives from server using API client");

				try {
					const response = await client.perspectives.list.$get();

					if (!response.ok) {
						return handleApiError(response, "Failed to fetch perspectives");
					}

					const data = (await response.json()) as PerspectiveListResponse;

					console.debug(
						`Successfully fetched ${data.perspectives.length} perspectives`,
					);

					return data.perspectives;
				} catch (error) {
					console.error("API client error:", error);
					throw error;
				}
			} catch (error) {
				// Improve error handling - log the error and rethrow
				console.error("Error fetching perspectives:", error);

				// If it's already a PerspectiveError, just rethrow it
				if (error instanceof PerspectiveError) {
					throw error;
				}

				// Otherwise, wrap it in a PerspectiveError
				throw new PerspectiveError(
					error instanceof Error
						? error.message
						: "Unknown error fetching perspectives",
					{
						code: "PERSPECTIVE_FETCH_ERROR",
						context: { error },
					},
				);
			}
		},
		// Only enable the query when the server is connected
		enabled: isConnected,
		staleTime: CACHE_TIMES.PERSPECTIVES,
		retry: (failureCount, error) => {
			// Don't retry for connection errors or missing URLs
			if (error instanceof PerspectiveError) {
				if (
					["SERVER_CONNECTION_ERROR", "MISSING_SERVER_URL"].includes(error.code)
				) {
					return false;
				}
			}

			// Retry other errors up to 3 times
			return failureCount < 3;
		},
		retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
	});

	// Watch for changes in connection status and refetch when connected
	useEffect(() => {
		if (isConnected && query.isError) {
			query.refetch();
		}
	}, [isConnected, query]);

	return query;
}
