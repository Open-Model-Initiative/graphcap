import { useProviderModels } from "@/features/server-connections/services/providers";
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useState } from "react";
import type { Provider } from "../providers/types";

/**
 * Custom hook for managing model selection
 *
 * @param provider - Provider to fetch models for
 * @param onModelSelect - Callback function when a model is selected
 * @returns Model selection state and handlers
 */
export function useModelSelection(
	provider: Provider,
	onModelSelect?: (providerName: string, modelId: string) => void,
) {
	// State for model selection
	const [selectedModelId, setSelectedModelId] = useState<string>(
		provider.defaultModel || ""
	);

	// Get models for the current provider
	const {
		data: providerModelsData,
		isLoading: isLoadingModels,
		isError: isModelsError,
		error: modelsError,
	} = useProviderModels(provider);

	// Update selected model when models are loaded or default model changes
	useEffect(() => {
		if (provider.defaultModel) {
			setSelectedModelId(provider.defaultModel);
		} else if (providerModelsData?.models && providerModelsData.models.length > 0) {
			const defaultModel = providerModelsData.models.find(
				(model) => model.is_default
			);
			setSelectedModelId(defaultModel?.id ?? providerModelsData.models[0].id);
		}
	}, [providerModelsData, provider.defaultModel]);

	// Handle model selection
	const handleModelSelect = useCallback(() => {
		if (onModelSelect && provider.name && selectedModelId) {
			onModelSelect(provider.name, selectedModelId);
		}
	}, [onModelSelect, provider.name, selectedModelId]);

	return {
		selectedModelId,
		setSelectedModelId,
		providerModelsData,
		isLoadingModels,
		isModelsError,
		modelsError,
		handleModelSelect,
	};
}
