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
	ProviderCreate,
	ProviderModelsResponse,
	ProviderUpdate,
	SuccessResponse,
} from "@/types/provider-config-types";
import { toServerConfig } from "@/types/provider-config-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SERVER_IDS } from "../constants";
import { createDataServiceClient, createInferenceBridgeClient } from "./apiClients";
import { fromApiProvider, toApiProvider } from "./providerAdapters";

// Query keys for TanStack Query
export const queryKeys = {
	providers: ["providers"] as const,
	provider: (id: string) => ["providers", id] as const,
	providerModels: (providerName: string) => ["providers", "models", providerName] as const,
};

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
			console.log("📡 Fetching all providers");
			
			const client = createDataServiceClient(connections);
			const response = await client.providers.$get();

			if (!response.ok) {
				const errorMsg = `Failed to fetch providers: ${response.status}`;
				console.error(`❌ ${errorMsg}`);
				throw new Error(errorMsg);
			}

			// Convert API response to application types
			const apiProviders = await response.json();
			const providers = apiProviders.map(fromApiProvider);
			
			console.log(`✅ Fetched ${providers.length} providers:`, providers);
			return providers;
		},
		enabled: isConnected,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

/**
 * Hook to get a provider by ID
 */
export function useProvider(id: string) {
	const { connections } = useServerConnectionsContext();
	const dataServiceConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.DATA_SERVICE,
	);
	const isConnected = dataServiceConnection?.status === "connected";

	return useQuery({
		queryKey: queryKeys.provider(id),
		queryFn: async () => {
			console.log(`📡 Fetching provider with ID: ${id}`);
			
			const client = createDataServiceClient(connections);
			const response = await client.providers[":id"].$get({
				param: { id },
			});

			if (!response.ok) {
				const errorMsg = `Failed to fetch provider: ${response.status}`;
				console.error(`❌ ${errorMsg}`);
				throw new Error(errorMsg);
			}

			// Convert API response to application types
			const apiProvider = await response.json();
			const provider = fromApiProvider(apiProvider);
			
			console.log("✅ Fetched provider:", provider);
			return provider;
		},
		enabled: isConnected && !!id,
	});
}

/**
 * Hook to create a provider
 */
export function useCreateProvider() {
	const { connections } = useServerConnectionsContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ProviderCreate) => {
			console.log("📡 Creating provider:", data);
			
			const client = createDataServiceClient(connections);
			// Convert application data to API format
			const apiData = toApiProvider(data as Provider);
			console.log("📤 API request data:", apiData);
			
			const response = await client.providers.$post({
				json: apiData,
			});

			if (!response.ok) {
				const errorMsg = `Failed to create provider: ${response.status}`;
				console.error(`❌ ${errorMsg}`);
				throw new Error(errorMsg);
			}

			// Convert API response to application types
			const apiProvider = await response.json();
			const provider = fromApiProvider(apiProvider);
			
			console.log("✅ Provider created:", provider);
			return provider;
		},
		onSuccess: () => {
			console.log("🔄 Invalidating providers cache after create");
			queryClient.invalidateQueries({ queryKey: queryKeys.providers });
		},
		onError: (error: Error) => {
			console.error("❌ Error in useCreateProvider:", error);
		},
	});
}

/**
 * Hook to update a provider
 */
export function useUpdateProvider() {
	const { connections } = useServerConnectionsContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: ProviderUpdate }) => {
			console.log(`📡 Updating provider with ID ${id}:`, data);
			
			const client = createDataServiceClient(connections);
			// Convert application data to API format
			const apiData = toApiProvider(data as Provider);
			// Create a new object without the ID
			const { id: _, ...apiDataWithoutId } = apiData;
			
			console.log("📤 API request data:", apiDataWithoutId);
			
			const response = await client.providers[":id"].$put({
				param: { id },
				json: apiDataWithoutId,
			});

			if (!response.ok) {
				const errorMsg = `Failed to update provider: ${response.status}`;
				console.error(`❌ ${errorMsg}`);
				throw new Error(errorMsg);
			}

			// Convert API response to application types
			const apiProvider = await response.json();
			const provider = fromApiProvider(apiProvider);
			
			console.log("✅ Provider updated:", provider);
			return provider;
		},
		onSuccess: (_data, variables) => {
			console.log(`🔄 Invalidating providers cache after update for ID ${variables.id}`);
			queryClient.invalidateQueries({ queryKey: queryKeys.providers });
			queryClient.invalidateQueries({ queryKey: queryKeys.provider(variables.id) });
		},
		onError: (error: Error, variables) => {
			console.error(`❌ Error in useUpdateProvider for ID ${variables.id}:`, error);
		},
	});
}

/**
 * Hook to delete a provider
 */
export function useDeleteProvider() {
	const { connections } = useServerConnectionsContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			console.log(`📡 Deleting provider with ID: ${id}`);
			
			const client = createDataServiceClient(connections);
			
			const response = await client.providers[":id"].$delete({
				param: { id },
			});

			if (!response.ok) {
				const errorMsg = `Failed to delete provider: ${response.status}`;
				console.error(`❌ ${errorMsg}`);
				throw new Error(errorMsg);
			}

			const result = await response.json() as SuccessResponse;
			console.log("✅ Provider deleted:", result);
			return result;
		},
		onSuccess: (_data, id) => {
			console.log(`🔄 Invalidating providers cache after delete for ID ${id}`);
			queryClient.invalidateQueries({ queryKey: queryKeys.providers });
			queryClient.invalidateQueries({ queryKey: queryKeys.provider(id) });
		},
		onError: (error: Error, id) => {
			console.error(`❌ Error in useDeleteProvider for ID ${id}:`, error);
		},
	});
}

/**
 * Hook to get provider models
 */
export function useProviderModels(providerName: string | Provider) {
	const { connections } = useServerConnectionsContext();
	const graphcapServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.INFERENCE_BRIDGE,
	);
	const isConnected = graphcapServerConnection?.status === "connected";
	
	// Extract the provider name and data if an object was passed
	const isProviderObject = typeof providerName === 'object' && providerName !== null;
	const name = isProviderObject ? providerName.name : providerName;
	const provider = isProviderObject ? providerName : null;

	return useQuery({
		queryKey: queryKeys.providerModels(name),
		queryFn: async () => {
			console.log(`📡 Fetching models for provider: ${name}`);
			
			try {
				const client = createInferenceBridgeClient(connections);
				
				// If we have the full provider object, use it to create a server config
				// Otherwise, use a minimal configuration
				const config = provider 
					? toServerConfig(provider)
					: {
						name,
						kind: "unknown",
						environment: "cloud" as const,
						base_url: "",
						api_key: "",
						models: [],
						fetch_models: true
					};
				
				console.log("📤 API request data:", config);
				
				// Use the POST endpoint with provider_name param and config body
				const response = await client.providers[":provider_name"].models.$post({
					param: { provider_name: name },
					json: config,
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch provider models from API: ${response.status}`);
				}

				const models = await response.json() as ProviderModelsResponse;
				console.log(`✅ Fetched ${models.models.length} models from API for provider ${name}:`, models);
				return models;
			} catch (error) {
				// If we have a provider object with models, use them as fallback
				if (provider?.models && provider.models.length > 0) {
					const modelCount = provider.models.length;
					console.log(`⚠️ API request failed. Using ${modelCount} saved models from provider`);
					
					// Convert the provider models to the expected ProviderModelsResponse format
					const fallbackModels: ProviderModelsResponse = {
						provider: name,
						models: provider.models.map(model => ({
							id: model.id ? (typeof model.id === 'string' ? model.id : String(model.id)) : String(model.name),
							name: model.name,
							is_default: model.name === provider.defaultModel
						}))
					};
					
					return fallbackModels;
				}
				
				// If no fallback is available, re-throw the error
				console.error("❌ Failed to fetch models and no fallback available:", error);
				throw error;
			}
		},
		enabled: isConnected && !!name,
	});
}

/**
 * Hook to test a provider connection
 */
export function useTestProviderConnection() {
	const { connections } = useServerConnectionsContext();

	return useMutation({
		mutationFn: async (provider: Provider) => {
			console.log(`📡 Testing connection for provider: ${provider.name}`, provider);
			
			const client = createInferenceBridgeClient(connections);
			
			// Convert to server config format
			const serverConfig = toServerConfig(provider);
			console.log("📤 API request data:", serverConfig);
			
			const response = await client.providers[":provider_name"].models.$post({
				param: { provider_name: provider.name },
				json: serverConfig,
			});

			if (!response.ok) {
				const errorData = await response.json();
				const errorMsg = errorData.message || `Failed to test provider connection: ${response.status}`;
				console.error(`❌ ${errorMsg}`, errorData);
				throw new Error(errorMsg);
			}

			const result = await response.json();
			console.log("✅ Provider connection test successful:", result);
			return result;
		},
		onError: (error: Error, provider) => {
			console.error(`❌ Error in useTestProviderConnection for provider ${provider.name}:`, error);
		},
	});
} 