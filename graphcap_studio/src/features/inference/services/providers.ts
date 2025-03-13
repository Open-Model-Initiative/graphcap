// SPDX-License-Identifier: Apache-2.0
/**
 * Providers Service
 * 
 * This module provides functions for interacting with the Data Service's
 * provider management API using TanStack Query and Hono's RPC client.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hc } from 'hono/client';
import type { AppType } from '../../../../../data_service/src/app';
import { SERVER_IDS } from '../../../common/constants';
import { useServerConnectionsContext } from '../../../common/context/ServerConnectionsContext';
import { 
  Provider, 
  ProviderCreate, 
  ProviderUpdate, 
  ProviderApiKey,
  SuccessResponse,
  ProviderModelsResponse
} from '../providers/types';

// Query keys for TanStack Query
export const queryKeys = {
  providers: ['providers'] as const,
  provider: (id: number) => [...queryKeys.providers, id] as const,
  providerModels: (providerName: string) => [...queryKeys.providers, 'models', providerName] as const,
};

// Define a more specific type for the client
interface DataServiceClient {
  providers: {
    $get: () => Promise<Response>;
    $post: (options: { json: ProviderCreate }) => Promise<Response>;
    [':id']: {
      $get: (options: { param: { id: string } }) => Promise<Response>;
      $put: (options: { param: { id: string }, json: ProviderUpdate }) => Promise<Response>;
      $delete: (options: { param: { id: string } }) => Promise<Response>;
      'api-key': {
        $put: (options: { param: { id: string }, json: ProviderApiKey }) => Promise<Response>;
      };
    };
  };
}

/**
 * Get the Data Service URL from server connections context
 */
function getDataServiceUrl(connections: any[]): string {
  const dataServiceConnection = connections.find(
    conn => conn.id === SERVER_IDS.DATA_SERVICE
  );
  
  return dataServiceConnection?.url || import.meta.env.VITE_DATA_SERVICE_URL || 'http://localhost:32550';
}

/**
 * Create a Hono client for the Data Service
 */
function createDataServiceClient(connections: any[]): DataServiceClient {
  const baseUrl = getDataServiceUrl(connections);
  return hc<AppType>(`${baseUrl}/api/v1`) as DataServiceClient;
}

/**
 * Hook to get all providers
 */
export function useProviders() {
  const { connections } = useServerConnectionsContext();
  const dataServiceConnection = connections.find(conn => conn.id === SERVER_IDS.DATA_SERVICE);
  const isConnected = dataServiceConnection?.status === 'connected';
  
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
  const dataServiceConnection = connections.find(conn => conn.id === SERVER_IDS.DATA_SERVICE);
  const isConnected = dataServiceConnection?.status === 'connected';
  
  return useQuery({
    queryKey: queryKeys.provider(id),
    queryFn: async () => {
      const client = createDataServiceClient(connections);
      const response = await client.providers[':id'].$get({
        param: { id: id.toString() }
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
        json: provider
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create provider: ${response.status}`);
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
      const client = createDataServiceClient(connections);
      const response = await client.providers[':id'].$put({
        param: { id: id.toString() },
        json: data
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update provider: ${response.status}`);
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
      const response = await client.providers[':id'].$delete({
        param: { id: id.toString() }
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
      const response = await client.providers[':id']['api-key'].$put({
        param: { id: id.toString() },
        json: { apiKey } as ProviderApiKey
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update API key: ${response.status}`);
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
 * Get the GraphCap Server URL from server connections context
 */
function getGraphCapServerUrl(connections: any[]): string {
  const graphcapServerConnection = connections.find(
    conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER
  );
  
  return graphcapServerConnection?.url || import.meta.env.VITE_GRAPHCAP_SERVER_URL || 'http://localhost:32100';
}

/**
 * Hook to get available models for a provider from the GraphCap server
 */
export function useProviderModels(providerName: string) {
  const { connections } = useServerConnectionsContext();
  const graphcapServerConnection = connections.find(conn => conn.id === SERVER_IDS.GRAPHCAP_SERVER);
  const isConnected = graphcapServerConnection?.status === 'connected';
  
  return useQuery({
    queryKey: queryKeys.providerModels(providerName),
    queryFn: async () => {
      const baseUrl = getGraphCapServerUrl(connections);
      const response = await fetch(`${baseUrl}/providers/${providerName}/models`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch provider models: ${response.status}`);
      }
      
      return response.json() as Promise<ProviderModelsResponse>;
    },
    enabled: isConnected && !!providerName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 