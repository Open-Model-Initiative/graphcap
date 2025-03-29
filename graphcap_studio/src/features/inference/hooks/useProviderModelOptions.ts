// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Model Options Hook
 *
 * This hook provides access to providers and models data with support for selection.
 * It consolidates provider and model data loading in a single hook.
 */

import { useProviders } from "@/features/server-connections/services/providers";
import type { Provider, ProviderModelInfo } from "@/types/provider-config-types";
import { useMemo } from "react";

/**
 * Hook for accessing provider and model selection options
 * 
 * @param providerId - The selected provider ID
 * @returns Provider and model data with loading states
 */
export function useProviderModelOptions(providerId?: string) {
  // Fetch all providers
  const { 
    data: providers = [], 
    isLoading: isLoadingProviders,
    error: providersError
  } = useProviders();
  
  // Find the selected provider object
  const selectedProvider = useMemo(() => {
    if (!providerId) return null;
    return providers.find((p: Provider) => p.id === providerId) || null;
  }, [providers, providerId]);
  
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
    providers,
    selectedProvider,
    isLoadingProviders,
    providersError,
    
    // Models data
    models,
    defaultModel,
    
    // Helper for status checking
    isLoading: isLoadingProviders,
    hasError: !!providersError
  };
} 