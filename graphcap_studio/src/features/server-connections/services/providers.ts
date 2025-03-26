// SPDX-License-Identifier: Apache-2.0
/**
 * Providers Service
 *
 * This module provides functions for interacting with the Data Service's
 * provider management API using TanStack Query and Hono's RPC client.
 */

import { useServerConnectionsContext } from "@/context/ServerConnectionsContext";
import type {
	Provider,
	ProviderApiKey,
	ProviderCreate,
	ProviderModelsResponse,
	ProviderUpdate,
	ServerProviderConfig,
	SuccessResponse,
} from "@/features/inference/providers/types";
import { toServerConfig } from "@/features/inference/providers/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDataServiceClient, createInferenceBridgeClient } from "./apiClients";

// Query keys for TanStack Query
export const queryKeys = {
	providers: ["providers"] as const,
	provider: (id: number) => ["providers", id] as const,
	providerModels: (providerName: string) => ["providers", "models", providerName] as const,
};

/**
 * Hook to get all providers
 */
export function useProviders() {
	const { connections } = useServerConnectionsContext();
	const dataServiceConnection = connections.find(
		(conn) => conn.id === "data-service",
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
		(conn) => conn.id === "data-service",
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
			const updateData = Object.entries(data).reduce((acc, [key, value]) => {
				// Only include defined values
				if (value !== null && value !== undefined) {
					acc[key] = value;
				}
				return acc;
			}, {} as Record<string, unknown>);
			console.log("updateData", updateData);
			const client = createDataServiceClient(connections);
			const response = await client.providers[":id"].$put({
				param: { id: id.toString() },
				json: updateData,
			});

			if (!response.ok) {
				// Try to get detailed error information
				try {
					const errorData = await response.json();
					console.error("Provider update error:", errorData);
					
					// Check if we have a structured error response
					if (errorData.status === 'error' || errorData.validationErrors) {
						throw errorData;
					}
					
					// Simple error with a message
					if (errorData.message) {
						throw new Error(errorData.message);
					}
					
					// Fallback error
					throw new Error(`Failed to update provider: ${response.status}`);
				} catch (parseError) {
					// If we can't parse the error as JSON, throw a general error
					if (parseError instanceof Error && parseError.message !== 'Failed to update provider') {
						throw parseError;
					}
					throw new Error(`Failed to update provider: ${response.status}`);
				}
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
 * Hook to update a provider's API key
 */
export function useUpdateProviderApiKey() {
	const queryClient = useQueryClient();
	const { connections } = useServerConnectionsContext();

	return useMutation({
		mutationFn: async ({ id, apiKey }: { id: number; apiKey: string }) => {
			const client = createDataServiceClient(connections);
			const response = await client.providers[":id"]["api-key"].$put({
				param: { id: id.toString() },
				json: { apiKey } as ProviderApiKey,
			});

			if (!response.ok) {
				// Try to get detailed error information
				try {
					const errorData = await response.json();
					console.error("API key update error:", errorData);
					
					// Check if we have a structured error response
					if (errorData.status === 'error' || errorData.validationErrors) {
						throw errorData;
					}
					
					// Simple error with a message
					if (errorData.message) {
						throw new Error(errorData.message);
					}
					
					// Fallback error
					throw new Error(`Failed to update API key: ${response.status}`);
				} catch (parseError) {
					// If we can't parse the error as JSON, throw a general error
					if (parseError instanceof Error && parseError.message !== 'Failed to update API key') {
						throw parseError;
					}
					throw new Error(`Failed to update API key: ${response.status}`);
				}
			}

			return response.json() as Promise<SuccessResponse>;
		},
		onSuccess: (_, { id }) => {
			// Invalidate specific provider query
			queryClient.invalidateQueries({ queryKey: queryKeys.provider(id) });
		},
	});
}

/**
 * Hook to get available models for a provider
 */
export function useProviderModels(provider: Provider) {
	const { connections } = useServerConnectionsContext();
	const inferenceBridgeConnection = connections.find(
		(conn) => conn.id === "inference-bridge",
	);
	const isConnected = inferenceBridgeConnection?.status === "connected";

	return useQuery({
		queryKey: queryKeys.providerModels(provider.name),
		queryFn: async () => {
			const client = createInferenceBridgeClient(connections);
			const serverConfig = toServerConfig(provider);
			
			const response = await client.models.$post({
				json: serverConfig,
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch models: ${response.status}`);
			}

			return response.json() as Promise<ProviderModelsResponse>;
		},
		enabled: isConnected && !!provider && provider.fetchModels,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
} 