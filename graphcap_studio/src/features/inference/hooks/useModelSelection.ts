import { useProviderModels } from "@/features/server-connections/services/providers";
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useState } from "react";
import type { Provider } from "../providers/types";

/**
 * Custom hook for managing model selection
 *
 * @param provider - Provider to fetch models for, can be null or undefined
 * @param onModelSelect - Callback function when a model is selected
 * @returns Model selection state and handlers
 */
export function useModelSelection(
	provider: Provider | null | undefined,
	onModelSelect?: (providerName: string, modelId: string) => void,
) {
	// State for model selection
	const [selectedModelId, setSelectedModelId] = useState<string>("");

	// Update selected model ID when provider changes
	useEffect(() => {
		if (provider?.defaultModel) {
			setSelectedModelId(provider.defaultModel);
		} else {
			setSelectedModelId("");
		}
	}, [provider]);

	// Get models for the current provider
	const {
		data: providerModelsData,
		isLoading: isLoadingModels,
		isError: isModelsError,
		error: modelsError,
	} = useProviderModels(provider);

	// Update selected model when models are loaded
	useEffect(() => {
		if (!selectedModelId && providerModelsData?.models && providerModelsData.models.length > 0) {
			const defaultModel = providerModelsData.models.find(
				(model) => model.is_default
			);
			setSelectedModelId(defaultModel?.id ?? providerModelsData.models[0].id);
		}
	}, [providerModelsData, selectedModelId]);

	// Handle model selection
	const handleModelSelect = useCallback(() => {
		if (onModelSelect && provider?.name && selectedModelId) {
			onModelSelect(provider.name, selectedModelId);
		}
	}, [onModelSelect, provider, selectedModelId]);

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
