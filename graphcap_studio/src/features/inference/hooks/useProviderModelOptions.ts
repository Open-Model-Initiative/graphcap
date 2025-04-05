// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Model Options Hook
 *
 * This hook provides access to providers and models data with support for selection.
 * It consolidates provider and model data loading in a single hook.
 */

import { useServerConnectionsContext } from "@/context/ServerConnectionsContext";
import { useProviders } from "@/features/inference/services/providers";
import { SERVER_IDS } from "@/features/server-connections/constants";
import type { Provider, ProviderModelInfo } from "@/types/provider-config-types";
import { useMemo } from "react";

/**
 * Hook for accessing provider and model selection options
 * 
 * @param providerName - The selected provider name
 * @returns Provider and model data with loading states
 */
export function useProviderModelOptions(providerName?: string) {
  // Check connection status outside of the hook call to avoid conditional hooks
  const { connections } = useServerConnectionsContext();
  const dataServiceConnection = connections.find(
    (conn) => conn.id === SERVER_IDS.DATA_SERVICE,
  );
  const isConnected = dataServiceConnection?.status === "connected";
  
  // Use Suspense query with select to transform data
  const providersResult = useProviders();
  
  const selectedProvider = useMemo(() => {
    if (!providerName || !providersResult.data?.length) return null;
    
    // Find provider by name
    return providersResult.data.find((p: Provider) => p.name === providerName) || null;
  }, [providersResult.data, providerName]);
  
  // Process models data directly from the provider
  const models = useMemo<ProviderModelInfo[]>(() => {
    if (!selectedProvider?.models?.length) return [];
    
    // Map provider models to ProviderModelInfo format
    return selectedProvider.models.map((model: { id: string; name: string }) => ({
      id: model.id,
      name: model.name,
      is_default: model.name === selectedProvider.defaultModel
    }));
  }, [selectedProvider]);
  
  // Check for default model
  const defaultModel = useMemo(() => {
    return models.find(model => model.is_default === true) || null;
  }, [models]);
  
  return {
    // Providers data
    providers: providersResult.data || [],
    selectedProvider,
    
    // Models data
    models,
    defaultModel,
    
    hasError: providersResult.error !== null
  };
} 