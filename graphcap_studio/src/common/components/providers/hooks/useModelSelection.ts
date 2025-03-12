// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useCallback } from 'react';
import { useProviderModels } from '../../../../services/providers';

/**
 * Custom hook for managing model selection
 * 
 * @param providerName - Name of the provider to fetch models for
 * @param onModelSelect - Callback function when a model is selected
 * @returns Model selection state and handlers
 */
export function useModelSelection(
  providerName: string,
  onModelSelect?: (providerName: string, modelId: string) => void
) {
  // State for model selection
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  
  // Get models for the current provider
  const {
    data: providerModelsData,
    isLoading: isLoadingModels,
    isError: isModelsError,
    error: modelsError,
  } = useProviderModels(providerName);
  
  // Update selected model when models are loaded
  useEffect(() => {
    if (providerModelsData?.models && providerModelsData.models.length > 0) {
      const defaultModel = providerModelsData.models.find(model => model.is_default);
      setSelectedModelId(defaultModel?.id ?? providerModelsData.models[0].id);
    }
  }, [providerModelsData]);
  
  // Handle model selection
  const handleModelSelect = useCallback(() => {
    if (onModelSelect && providerName && selectedModelId) {
      onModelSelect(providerName, selectedModelId);
    }
  }, [onModelSelect, providerName, selectedModelId]);
  
  return {
    selectedModelId,
    setSelectedModelId,
    providerModelsData,
    isLoadingModels,
    isModelsError,
    modelsError,
    handleModelSelect
  };
} 