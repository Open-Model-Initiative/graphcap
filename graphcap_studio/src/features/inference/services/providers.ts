// SPDX-License-Identifier: Apache-2.0
/**
 * Providers Service
 *
 * This module provides functions for interacting with the Data Service's
 * provider management API using TanStack Query and Hono's RPC client.
 */

import { useServerConnectionsContext } from "@/context/ServerConnectionsContext";
import { SERVER_IDS } from "@/features/server-connections/constants";
import { createDataServiceClient, createInferenceBridgeClient } from "@/features/server-connections/services/apiClients";
import type {
	Provider,
	ProviderCreate,
	ProviderModelsResponse,
	ProviderUpdate,
	ServerProviderConfig,
	SuccessResponse,
} from "@/types/provider-config-types";
import { toServerConfig } from "@/types/provider-config-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for TanStack Query
export const queryKeys = {
	providers: ["providers"] as const,
	provider: (id: number) => ["providers", id] as const,
	providerModels: (providerName: string) => ["providers", "models", providerName] as const,
};



/**
 * Extended Error interface with cause property
 */
interface ErrorWithCause extends Error {
	cause?: unknown;
}

/**
 * Hook to get all providers
 */
export function useProviders() {
	const { connections } = useServerConnectionsContext();
	const dataServiceConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.DATA_SERVICE,
	);
	const isConnected = dataServiceConnection?.status === "connected";

	return useQuery({
		queryKey: queryKeys.providers,
		queryFn: async () => {
			const client = createDataServiceClient(connections);
			const response = await client.providers.$get();

			if (!response.ok) {
				throw new Error(`Failed to fetch providers: ${response.status}`);
			}

			return response.json() as Promise<Provider[]>;
		},
		enabled: isConnected,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to get a provider by ID
 */
export function useProvider(id: number) {
	const { connections } = useServerConnectionsContext();
	const dataServiceConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.DATA_SERVICE,
	);
	const isConnected = dataServiceConnection?.status === "connected";

	return useQuery({
		queryKey: queryKeys.provider(id),
		queryFn: async () => {
			const client = createDataServiceClient(connections);
			const response = await client.providers[":id"].$get({
				param: { id: id.toString() },
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch provider: ${response.status}`);
			}

			return response.json() as Promise<Provider>;
		},
		enabled: isConnected && !!id,
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
			const response = await client.providers.$post({
				json: provider,
			});

			if (!response.ok) {
				// Try to get detailed error information
				try {
					const errorData = await response.json();
					console.error("Provider creation error:", errorData);
					
					// Check if we have a structured error response
					if (errorData.status === 'error' || errorData.validationErrors) {
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
					if (parseError instanceof Error && parseError.message !== 'Failed to create provider') {
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
			const client = createDataServiceClient(connections);
			const response = await client.providers[":id"].$put({
				param: { id: id.toString() },
				json: data,
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Provider update error:", errorData);
				throw errorData;
			}

			return response.json() as Promise<Provider>;
		},
		onSuccess: (data) => {
			// Invalidate specific provider query
			queryClient.invalidateQueries({ queryKey: queryKeys.provider(data.id) });
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
			const response = await client.providers[":id"].$delete({
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
		mutationFn: async ({ providerName, config }: { providerName: string; config: ServerProviderConfig }) => {
			const client = createInferenceBridgeClient(connections);
			
			// Add console logging to debug
			console.log('Testing connection with config:', JSON.stringify(config));
			
			// Make sure api_key is properly set and not null or undefined
			if (!config.api_key) {
				throw new Error("API key is required for testing provider connection");
			}
			
			const response = await client.providers[":provider_name"]["test-connection"].$post({
				param: { provider_name: providerName },
				json: config,
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Error response:', errorData);
				
				// Check if this is our enhanced error format
				if (errorData.status === 'error' && errorData.details) {
					// Use the structured error data with cause property
					const error = new Error(errorData.message || 'Connection test failed') as ErrorWithCause;
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
				
				if (typeof errorData === 'object') {
					// For raw objects, don't wrap in Error, just throw the object directly
					// This prevents "[object Object]" in the error message
					throw { ...errorData };
				}
				
				// Fallback to simple error
				throw new Error(`Connection test failed: ${response.status}`);
			}

			return response.json();
		},
	});
}

/**
 * Hook to fetch provider models
 */
export function useProviderModels(provider: Provider) {
	const { connections } = useServerConnectionsContext();
	const inferenceBridgeConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.INFERENCE_BRIDGE,
	);
	const isConnected = inferenceBridgeConnection?.status === "connected";

	return useQuery({
		queryKey: queryKeys.providerModels(provider.name),
		queryFn: async () => {
			const client = createInferenceBridgeClient(connections);
			const serverConfig = toServerConfig(provider);
			
			const response = await client.providers[":provider_name"]["models"].$post({
				param: { provider_name: provider.name },
				json: serverConfig,
			});

			if (!response.ok) {
				throw new Error(
					`Failed to fetch models for ${provider.name}: ${response.status}`,
				);
			}

			return response.json() as Promise<ProviderModelsResponse>;
		},
		enabled: isConnected && provider.fetchModels,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}
