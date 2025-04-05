// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Model Options Hook
 *
 * This hook provides access to providers and models data with support for selection.
 * It consolidates provider and model data loading in a single hook.
 */

import { useServerConnectionsContext } from "@/context/ServerConnectionsContext";
import { useDataServiceConnected, useProvidersWhenConnected } from "@/features/inference/services/providers";
import { SERVER_IDS } from "@/features/server-connections/constants";
import type { Provider, ProviderModelInfo } from "@/types/provider-config-types";
import { debugLog } from "@/utils/logger";
import { useEffect, useMemo } from "react";

// Component name for logging
const COMPONENT_NAME = "useProviderModelOptions";

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
  
  debugLog(COMPONENT_NAME, "Init:", { providerName, isConnected });
  
  // Use connection-aware provider fetching
  const providersResult = useProvidersWhenConnected();
  
  // Debug logging for providers - simplified
  useEffect(() => {
    const hasError = providersResult.error !== null;
    const providerCount = providersResult.data?.length || 0;
    
    debugLog(COMPONENT_NAME, "Providers update:", {
      count: providerCount,
      status: providersResult.status,
      fetchStatus: providersResult.fetchStatus,
      hasError
    });
  }, [providersResult.data, providersResult.error, providersResult.status, providersResult.fetchStatus]);
  
  const selectedProvider = useMemo(() => {
    if (!providerName || !providersResult.data?.length) {
      return null;
    }
    
    // Find provider by name
    const provider = providersResult.data.find((p: Provider) => p.name === providerName) || null;
    if (provider) {
      debugLog(COMPONENT_NAME, "Provider selected:", { name: provider.name });
    }
    return provider;
  }, [providersResult.data, providerName]);
  
  // Process models data directly from the provider
  const models = useMemo<ProviderModelInfo[]>(() => {
    if (!selectedProvider?.models?.length) {
      return [];
    }
    
    // Map provider models to ProviderModelInfo format
    const mappedModels = selectedProvider.models.map((model: { id: string; name: string }) => ({
      id: model.id,
      name: model.name,
      is_default: model.name === selectedProvider.defaultModel
    }));
    
    debugLog(COMPONENT_NAME, "Models:", { count: mappedModels.length });
    return mappedModels;
  }, [selectedProvider]);
  
  // Check for default model
  const defaultModel = useMemo(() => {
    const defModel = models.find(model => model.is_default === true) || null;
    if (defModel) {
      debugLog(COMPONENT_NAME, "Default model:", defModel.name);
    }
    return defModel;
  }, [models]);
  
  // Check if data is loading
  const isLoading = providersResult.fetchStatus === 'fetching';
  
  const result = {
    // Providers data
    providers: providersResult.data || [],
    selectedProvider,
    isLoadingProviders: isLoading,
    
    // Models data
    models,
    defaultModel,
    isLoading,
    
    // Provides error state
    hasError: providersResult.error !== null,
    providersError: providersResult.error
  };
  
  return result;
} 