// SPDX-License-Identifier: Apache-2.0
import { useMemo } from "react";
import { useProviderModels, useProviders } from "../services/providers";

/**
 * Custom hook to handle provider and model selection logic
 */
export function useProviderModelSelection(providerName: string) {
	// Fetch providers from API
	const {
		data: providers = [],
		isLoading: isLoadingProviders,
		isError: isProvidersError,
	} = useProviders();

	// Fetch models for the selected provider
	const {
		data: providerModelsData,
		isLoading: isLoadingModels,
		isError: isModelsError,
		error: modelsError,
	} = useProviderModels(providerName);

	// Memoize the available providers
	const availableProviders = useMemo(() => {
		return providers.filter((provider) => provider.isEnabled);
	}, [providers]);

	// Determine providers with no models
	const providersWithNoModels = useMemo(() => {
		const noModelsSet = new Set<string>();

		if (providerModelsData?.models?.length === 0) {
			noModelsSet.add(providerName);
		}

		return noModelsSet;
	}, [providerName, providerModelsData]);

	// Get default model if available
	const defaultModel = useMemo(() => {
		if (providerModelsData?.models && providerModelsData.models.length > 0) {
			return (
				providerModelsData.models.find((model) => model.is_default) ||
				providerModelsData.models[0]
			);
		}
		return null;
	}, [providerModelsData]);

	return {
		providers: availableProviders,
		models: providerModelsData?.models || [],
		defaultModel,
		providersWithNoModels,
		isLoading: {
			providers: isLoadingProviders,
			models: isLoadingModels,
		},
		isError: {
			providers: isProvidersError,
			models: isModelsError,
		},
		error: {
			models: modelsError,
		},
	};
}
