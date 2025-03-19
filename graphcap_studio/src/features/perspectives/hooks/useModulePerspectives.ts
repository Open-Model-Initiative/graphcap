// SPDX-License-Identifier: Apache-2.0
/**
 * useModulePerspectives Hook
 *
 * This hook fetches perspectives for a specific module from the server.
 */

import { useServerConnectionsContext } from "@/context";
import { SERVER_IDS } from "@/features/server-connections/constants";
import { ServerConnection } from "@/features/server-connections/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
	API_ENDPOINTS,
	CACHE_TIMES,
	perspectivesQueryKeys,
} from "../services/constants";
import { getGraphCapServerUrl, handleApiError } from "../services/utils";
import { ModulePerspectivesResponse, Perspective } from "../types";
import { PerspectiveError } from "./usePerspectives";

/**
 * Hook to fetch perspectives for a specific module from the server
 *
 * @param moduleName - Name of the module to fetch perspectives for
 * @returns A query result with the module and its perspectives
 */
export function useModulePerspectives(moduleName: string) {
	const { connections } = useServerConnectionsContext();
	const graphcapServerConnection = connections.find(
		(conn: ServerConnection) => conn.id === SERVER_IDS.GRAPHCAP_SERVER,
	);
	const isConnected = graphcapServerConnection?.status === "connected";

	const query = useQuery<{ module: ModulePerspectivesResponse['module'], perspectives: Perspective[] }, Error>({
		queryKey: perspectivesQueryKeys.modulePerspectives(moduleName),
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

				const baseUrl = getGraphCapServerUrl(connections);
				if (!baseUrl) {
					console.warn("No GraphCap server URL available");
					throw new PerspectiveError("No GraphCap server URL available", {
						code: "MISSING_SERVER_URL",
						context: { connections },
					});
				}

				const endpoint = API_ENDPOINTS.MODULE_PERSPECTIVES.replace(
					"{module_name}",
					moduleName
				);
				const url = `${baseUrl}${endpoint}`;

				console.debug(`Fetching perspectives for module '${moduleName}' from server: ${url}`);

				const response = await fetch(url);

				if (!response.ok) {
					return handleApiError(response, `Failed to fetch perspectives for module '${moduleName}'`);
				}

				const data = (await response.json()) as ModulePerspectivesResponse;

				console.debug(
					`Successfully fetched ${data.perspectives.length} perspectives for module '${moduleName}'`,
				);

				return {
					module: data.module,
					perspectives: data.perspectives
				};
			} catch (error) {
				// Improve error handling - log the error and rethrow
				console.error(`Error fetching perspectives for module '${moduleName}':`, error);

				// If it's already a PerspectiveError, just rethrow it
				if (error instanceof PerspectiveError) {
					throw error;
				}

				// Otherwise, wrap it in a PerspectiveError
				throw new PerspectiveError(
					error instanceof Error
						? error.message
						: `Unknown error fetching perspectives for module '${moduleName}'`,
					{
						code: "MODULE_PERSPECTIVES_FETCH_ERROR",
						context: { error, moduleName },
					},
				);
			}
		},
		// Only enable the query when the server is connected and a module name is provided
		enabled: isConnected && !!moduleName,
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
		if (isConnected && query.isError && moduleName) {
			query.refetch();
		}
	}, [isConnected, moduleName, query]);

	return query;
} 