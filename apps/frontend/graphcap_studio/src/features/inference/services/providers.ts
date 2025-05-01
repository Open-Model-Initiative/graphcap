// SPDX-License-Identifier: Apache-2.0
/**
 * Providers Service
 *
 * This module provides functions for interacting with the Data Service's
 * provider management API using TanStack Query and Hono's RPC client.
 */

import { useServerConnectionsContext } from "@/context/ServerConnectionsContext";
import { SERVER_IDS } from "@/features/server-connections/constants";
import {
	createDataServiceClient,
	createInferenceBridgeClient,
} from "@/features/server-connections/services/apiClients";
import type {
	Provider,
	ProviderCreate,
	ProviderUpdate,
	ServerProviderConfig,
	SuccessResponse
} from "@/types/provider-config-types";
import type { ServerConnection } from "@/types/server-connection-types";
import { debugError, debugLog } from "@/utils/logger";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Component name for logging
const COMPONENT_NAME = "ProvidersService";

// Query keys for TanStack Query
export const queryKeys = {
	providers: ["providers"] as const,
	provider: (id: number) => ["providers", id] as const,
	providerModels: (providerName: string) =>
		["providers", "models", providerName] as const,
};

/**
 * Extended Error interface with cause property
 */
interface ErrorWithCause extends Error {
	cause?: unknown;
}

/**
 * Custom error for service connection issues
 */
export class ServiceConnectionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ServiceConnectionError";
	}
}

/**
 * Helper function to check if the data service is connected
 */
function getDataServiceConnectionStatus(connections: ServerConnection[]) {
	const dataServiceConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.DATA_SERVICE,
	);
	
	return {
		isConnected: dataServiceConnection?.status === "connected",
		connection: dataServiceConnection
	};
}

/**
 * React Hook to wait for data service connection.
 * This hook returns true once the data service is connected.
 */
export function useDataServiceConnected() {
	const { connections } = useServerConnectionsContext();
	const [isConnected, setIsConnected] = useState(false);
	
	useEffect(() => {
		const { isConnected: connected } = getDataServiceConnectionStatus(connections);
		if (connected && !isConnected) {
			debugLog(COMPONENT_NAME, "Data service connected");
			setIsConnected(true);
		}
	}, [connections, isConnected]);
	
	return isConnected;
}

/**
 * Hook to get all providers
 * 
 * Note: This uses Suspense, so wrap the component using this in a Suspense boundary.
 * The query function handles the case where data service is not connected.
 */
export function useProviders() {
	const { connections } = useServerConnectionsContext();
	const { isConnected } = getDataServiceConnectionStatus(connections);
	
	debugLog(COMPONENT_NAME, "useProviders init:", { isConnected });
	
	return useSuspenseQuery({
		queryKey: queryKeys.providers,
		queryFn: async () => {
			// Check connection status directly inside query function
			// instead of using the value captured from the hook closure
			const currentConnectionStatus = getDataServiceConnectionStatus(connections);
			const currentIsConnected = currentConnectionStatus.isConnected;
			
			debugLog(COMPONENT_NAME, "Executing providers query:", { isConnected: currentIsConnected });
			
			if (!currentIsConnected) {
				// When data service is not connected, return empty array
				debugLog(COMPONENT_NAME, "Data service not connected, returning empty array");
				return [];
			}
			
			try {
				const client = createDataServiceClient(connections);
				const response = await client.api.providers.$get();
				
				if (!response.ok) {
					debugError(COMPONENT_NAME, "Failed response:", response.status);
					throw new Error(`Failed to fetch providers: ${response.status}`);
				}
	
				const data = await response.json() as Provider[];
				debugLog(COMPONENT_NAME, "Received providers:", { count: data.length });
				return data;
			} catch (error) {
				debugError(COMPONENT_NAME, "Error in providers query:", error);
				throw error;
			}
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Non-suspense version of the providers hook that respects connection status
 * This is useful for components that need to wait for a connection before fetching
 */
export function useProvidersWhenConnected() {
	const { connections } = useServerConnectionsContext();
	const { isConnected } = getDataServiceConnectionStatus(connections);
	const queryClient = useQueryClient();
	
	debugLog(COMPONENT_NAME, "useProvidersWhenConnected init:", { isConnected });
	
	// Use standard useQuery which supports the enabled option
	const result = useQuery({
		queryKey: queryKeys.providers,
		queryFn: async () => {
			try {
				const client = createDataServiceClient(connections);
				const response = await client.api.providers.$get();
				
				if (!response.ok) {
					debugError(COMPONENT_NAME, "Failed response:", response.status);
					throw new Error(`Failed to fetch providers: ${response.status}`);
				}
	
				const data = await response.json() as Provider[];
				debugLog(COMPONENT_NAME, "Received providers:", { count: data.length });
				return data;
			} catch (error) {
				debugError(COMPONENT_NAME, "Error in providers query:", error);
				throw error;
			}
		},
		enabled: isConnected,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
	
	// When connection state changes to connected, trigger a providers refetch
	useEffect(() => {
		if (isConnected) {
			debugLog(COMPONENT_NAME, "Data service connected, refreshing providers");
			queryClient.invalidateQueries({ queryKey: queryKeys.providers });
		}
	}, [isConnected, queryClient]);
	
	return result;
}

/**
 * Hook to get a provider by ID
 * 
 * Note: This uses Suspense, so wrap the component using this in a Suspense boundary.
 * The query function handles the case where data service is not connected or ID is invalid.
 */
export function useProvider(id: number) {
	const { connections } = useServerConnectionsContext();
	
	return useSuspenseQuery({
		queryKey: queryKeys.provider(id),
		queryFn: async () => {
			// Check connection status directly inside query function
			const { isConnected } = getDataServiceConnectionStatus(connections);
			
			if (!isConnected || !id) {
				// Return null when not connected or no valid ID
				return null;
			}
			
			try {
				const client = createDataServiceClient(connections);
				const response = await client.api.providers[":id"].$get({
					param: { id: id.toString() },
				});
	
				if (!response.ok) {
					throw new Error(`Failed to fetch provider: ${response.status}`);
				}
	
				return response.json() as Promise<Provider>;
			} catch (error) {
				console.error(`Error fetching provider ${id}:`, error);
				throw error;
			}
		},
	});
}

/**
 * Hook to create a provider
 */
export function useCreateProvider() {
	const queryClient = useQueryClient();
	const { connections } = useServerConnectionsContext();

	return useMutation({
		mutationFn: async (provider: ProviderCreate) => {
			const client = createDataServiceClient(connections);
			const response = await client.api.providers.$post({
				json: provider,
			});

			if (!response.ok) {
				// Try to get detailed error information
				try {
					const errorData = await response.json();
					console.error("Provider creation error:", errorData);

					// Check if we have a structured error response
					if (errorData.status === "error" || errorData.validationErrors) {
						throw errorData;
					}

					// Simple error with a message
					if (errorData.message) {
						throw new Error(errorData.message);
					}

					// Fallback error
					throw new Error(`Failed to create provider: ${response.status}`);
				} catch (parseError) {
					// If we can't parse the error as JSON, throw a general error
					if (
						parseError instanceof Error &&
						parseError.message !== "Failed to create provider"
					) {
						throw parseError;
					}
					throw new Error(`Failed to create provider: ${response.status}`);
				}
			}

			return response.json() as Promise<Provider>;
		},
		onSuccess: () => {
			// Invalidate providers query to refetch the list
			queryClient.invalidateQueries({ queryKey: queryKeys.providers });
		},
	});
}

/**
 * Hook to update a provider
 */
export function useUpdateProvider() {
	const queryClient = useQueryClient();
	const { connections } = useServerConnectionsContext();

	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: ProviderUpdate }) => {
			console.log("Updating provider with data:", data);
			
			const apiData = { ...data };
			
			const client = createDataServiceClient(connections);
			const response = await client.api.providers[":id"].$put({
				param: { id: id.toString() },
				json: apiData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Provider update error:", errorData);
				throw errorData;
			}

			return response.json() as Promise<Provider>;
		},
		onSuccess: (data) => {
			// Convert string ID to number for query invalidation
			const numericId = typeof data.id === 'string' ? Number.parseInt(data.id, 10) : data.id;
			
			// Invalidate specific provider query
			queryClient.invalidateQueries({ queryKey: queryKeys.provider(numericId) });
			// Invalidate providers list
			queryClient.invalidateQueries({ queryKey: queryKeys.providers });
		},
	});
}

/**
 * Hook to delete a provider
 */
export function useDeleteProvider() {
	const queryClient = useQueryClient();
	const { connections } = useServerConnectionsContext();

	return useMutation({
		mutationFn: async (id: number) => {
			const client = createDataServiceClient(connections);
			const response = await client.api.providers[":id"].$delete({
				param: { id: id.toString() },
			});

			if (!response.ok) {
				throw new Error(`Failed to delete provider: ${response.status}`);
			}

			return response.json() as Promise<SuccessResponse>;
		},
		onSuccess: (_, id) => {
			// Invalidate specific provider query
			queryClient.invalidateQueries({ queryKey: queryKeys.provider(id) });
			// Invalidate providers list
			queryClient.invalidateQueries({ queryKey: queryKeys.providers });
		},
	});
}

/**
 * Hook to test provider connection
 */
export function useTestProviderConnection() {
	const { connections } = useServerConnectionsContext();

	return useMutation({
		mutationFn: async ({
			providerName,
			config,
		}: { providerName: string; config: ServerProviderConfig }) => {
			const client = createInferenceBridgeClient(connections);

			console.log("Testing connection with config:", JSON.stringify(config));

			const response = await client.providers[":provider_name"][
				"test-connection"
			].$post({
				param: { provider_name: providerName },
				json: config,
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Error response:", errorData);

				if (errorData.status === "error" && errorData.details) {
					const error = new Error(
						errorData.message || "Connection test failed",
					) as ErrorWithCause;
					error.cause = errorData;
					throw error;
				}

				// Handle different error formats
				if (errorData.detail) {
					throw new Error(errorData.detail);
				}

				if (errorData.message) {
					throw new Error(errorData.message);
				}

				if (typeof errorData === "object") {
					const error = new Error("Connection test failed") as ErrorWithCause;
					error.cause = errorData;
					throw error;
				}

				// Fallback to simple error
				throw new Error(`Connection test failed: ${response.status}`);
			}

			return response.json();
		},
	});
}
