// SPDX-License-Identifier: Apache-2.0
/**
 * Provider Model Options Hook
 *
 * This hook provides access to providers and models data with support for selection.
 * It consolidates provider and model data loading in a single hook.
 */

import { useProviderModels, useProviders } from "@/features/server-connections/services/providers";
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
  
  // Fetch models for the selected provider
  const {
    data: modelData,
    isLoading: isLoadingModels,
    error: modelsError
  } = useProviderModels(selectedProvider?.name || "");
  
  // Process models data
  const models = useMemo<ProviderModelInfo[]>(() => {
    if (!modelData?.models) return [];
    return modelData.models;
  }, [modelData]);
  
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
    isLoadingModels,
    modelsError,
    
    // Helper for status checking
    isLoading: isLoadingProviders || isLoadingModels,
    hasError: !!providersError || !!modelsError
  };
} 