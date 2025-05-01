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
	SuccessResponse,
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
 * Common query configuration options
 */
const defaultQueryOptions = {
	staleTime: 1000 * 60 * 5, // 5 minutes
	retry: 1,
	retryDelay: 2000, // 2 second delay between retries
	refetchOnWindowFocus: false,
};

/**
 * Generic function to handle API response errors
 */
async function handleApiError(response: Response, errorContext: string): Promise<never> {
	try {
		const errorData = await response.json();
		debugError(COMPONENT_NAME, `${errorContext} error:`, errorData);
		
		// Check if we have a structured error response
		if (errorData && typeof errorData === 'object') {
			if ('status' in errorData && errorData.status === "error") {
				throw errorData;
			}
			
			if ('validationErrors' in errorData) {
				throw errorData;
			}
			
			if ('message' in errorData) {
				throw new Error(errorData.message as string);
			}
			
			if ('detail' in errorData) {
				throw new Error(errorData.detail as string);
			}
		}
		
		// Fallback error
		throw new Error(`${errorContext}: ${response.status}`);
	} catch (parseError) {
		// If we can't parse the error as JSON, throw the original error or a general one
		if (parseError instanceof Error && !parseError.message.includes(errorContext)) {
			throw parseError;
		}
		throw new Error(`${errorContext}: ${response.status}`);
	}
}

/**
 * Type transformer for API results
 * This function handles any necessary type conversions between backend and frontend
 */
function transformApiResult<T>(data: unknown): T {
	// For Provider and Provider[], we need to ensure id is a string
	if (Array.isArray(data)) {
		// Handle array of providers
		return data.map(item => ({
			...item,
			id: item.id?.toString() ?? "",
			isEnabled: item.isEnabled ?? false,
			environment: item.environment as "cloud" | "local",
			createdAt: item.createdAt ?? new Date().toISOString(),
			updatedAt: item.updatedAt ?? new Date().toISOString(),
		})) as T;
	}
	
	if (data && typeof data === 'object' && 'id' in data) {
		// Handle single provider
		const item = data as Record<string, unknown>;
		return {
			...item,
			id: item.id?.toString() ?? "",
			isEnabled: item.isEnabled ?? false,
			environment: item.environment as "cloud" | "local",
			createdAt: item.createdAt ?? new Date().toISOString(),
			updatedAt: item.updatedAt ?? new Date().toISOString(),
		} as T;
	}
	
	// For other types, just cast
	return data as T;
}

/**
 * Generic function to fetch data from the Data Service API
 */
async function fetchFromDataService<T>(
	connections: ServerConnection[],
	apiCall: (client: ReturnType<typeof createDataServiceClient>) => Promise<Response>,
	errorContext: string
): Promise<T> {
	// Check connection status
	const { isConnected } = getDataServiceConnectionStatus(connections);
	
	if (!isConnected) {
		debugLog(COMPONENT_NAME, "Data service not connected");
		throw new ServiceConnectionError("Data service not connected");
	}
	
	try {
		const client = createDataServiceClient(connections);
		const response = await apiCall(client);
		
		if (!response.ok) {
			return handleApiError(response, errorContext);
		}

		const data = await response.json();
		return transformApiResult<T>(data);
	} catch (error) {
		debugError(COMPONENT_NAME, `Error in ${errorContext}:`, error);
		throw error;
	}
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
	
	debugLog(COMPONENT_NAME, "useProviders init");
	
	return useSuspenseQuery({
		queryKey: queryKeys.providers,
		queryFn: async () => {
			try {
				return await fetchFromDataService<Provider[]>(
					connections,
					(client) => client.api.providers.$get(),
					"Failed to fetch providers"
				);
			} catch (error) {
				if (error instanceof ServiceConnectionError) {
					// Return empty array when not connected
					return [] as Provider[];
				}
				throw error;
			}
		},
		...defaultQueryOptions,
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
			return await fetchFromDataService<Provider[]>(
				connections,
				(client) => client.api.providers.$get(),
				"Failed to fetch providers"
			);
		},
		enabled: isConnected,
		...defaultQueryOptions,
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
			if (!id) {
				return null;
			}
			
			try {
				return await fetchFromDataService<Provider>(
					connections,
					(client) => client.api.providers[":id"].$get({
						param: { id },
					}),
					`Failed to fetch provider ${id}`
				);
			} catch (error) {
				if (error instanceof ServiceConnectionError) {
					return null;
				}
				throw error;
			}
		},
		...defaultQueryOptions,
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
			return await fetchFromDataService<Provider>(
				connections,
				(client) => client.api.providers.$post({
					json: provider,
				}),
				"Failed to create provider"
			);
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
			
			// We need to handle this separately due to the typing issue with $put
			try {
				const client = createDataServiceClient(connections);
				// Use .patch instead of .put, as the API supports PATCH operations for partial updates
				const response = await client.api.providers[":id"].$patch({
					param: { id },
					json: apiData,
				});

				if (!response.ok) {
					return handleApiError(response, "Provider update failed");
				}

				const data = await response.json();
				return transformApiResult<Provider>(data);
			} catch (error) {
				debugError(COMPONENT_NAME, "Error updating provider:", error);
				throw error;
			}
		},
		onSuccess: (data) => {
			// Convert string ID to number for query invalidation
			const numericId = typeof data.id === 'string' ? Number.parseInt(data.id, 10) : data.id as number;
			
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
			return await fetchFromDataService<SuccessResponse>(
				connections,
				(client) => client.api.providers[":id"].$delete({
					param: { id },
				}),
				"Failed to delete provider"
			);
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
			try {
				const client = createInferenceBridgeClient(connections);
				console.log("Testing connection with config:", JSON.stringify(config));

				const response = await client.providers[":provider_name"][
					"test-connection"
				].$post({
					param: { provider_name: providerName },
					json: config,
				});

				if (!response.ok) {
					return handleApiError(response, "Connection test failed");
				}

				return await response.json();
			} catch (error) {
				debugError(COMPONENT_NAME, "Error testing provider connection:", error);
				throw error;
			}
		},
	});
}
