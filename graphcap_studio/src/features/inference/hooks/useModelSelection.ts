import type { Provider, ProviderModelInfo } from "@/types/provider-config-types";
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Custom hook for managing model selection
 *
 * @param provider - Provider to use models from, can be null or undefined
 * @param onModelSelect - Callback function when a model is selected
 * @returns Model selection state and handlers
 */
export function useModelSelection(
	provider: Provider | null | undefined,
	onModelSelect?: (providerName: string, modelId: string) => void,
) {
	// State for model selection
	const [selectedModelId, setSelectedModelId] = useState<string>("");

	// Process provider models
	const models = useMemo<ProviderModelInfo[]>(() => {
		if (!provider?.models?.length) return [];
		
		// Map provider models to ProviderModelInfo format
		return provider.models.map(model => ({
			id: model.id,
			name: model.name,
			is_default: model.name === provider.defaultModel
		}));
	}, [provider]);

	// Update selected model ID when provider changes
	useEffect(() => {
		if (provider?.defaultModel) {
			// Try to find the model with the default name
			const defaultModel = provider.models?.find(m => m.name === provider.defaultModel);
			if (defaultModel) {
				setSelectedModelId(defaultModel.id);
				return;
			}
		}
		
		// If no default or default not found, use first model or reset
		if (provider?.models?.length) {
			setSelectedModelId(provider.models[0].id);
		} else {
			setSelectedModelId("");
		}
	}, [provider]);

	// Handle model selection
	const handleModelSelect = useCallback(() => {
		if (onModelSelect && provider?.name && selectedModelId) {
			onModelSelect(provider.name, selectedModelId);
		}
	}, [onModelSelect, provider, selectedModelId]);

	return {
		selectedModelId,
		setSelectedModelId,
		models,
		handleModelSelect,
	};
}
