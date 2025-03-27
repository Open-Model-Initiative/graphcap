import { useProviderModels, useProviders } from "@/features/server-connections/services/providers";
// SPDX-License-Identifier: Apache-2.0
import { useMemo } from "react";
import type { Provider } from "../providers/types";

/**
 * Custom hook to handle provider and model selection logic
 */
export function useProviderModelSelection(provider: Provider | null | undefined) {
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
	} = useProviderModels(provider);

	// Memoize the available providers
	const availableProviders = useMemo(() => {
		return providers.filter((provider) => provider.isEnabled);
	}, [providers]);

	// Determine providers with no models
	const providersWithNoModels = useMemo(() => {
		const noModelsSet = new Set<string>();

		if (providerModelsData?.models?.length === 0 && provider?.fetchModels && provider?.name) {
			noModelsSet.add(provider.name);
		}

		return noModelsSet;
	}, [provider?.name, provider?.fetchModels, providerModelsData]);

	// Get default model if available
	const defaultModel = useMemo(() => {
		if (provider?.defaultModel) {
			return {
				id: provider.defaultModel,
				name: provider.defaultModel,
				is_default: true,
			};
		}
		if (providerModelsData?.models && providerModelsData.models.length > 0) {
			return (
				providerModelsData.models.find((model) => model.is_default) ||
				providerModelsData.models[0]
			);
		}
		return null;
	}, [provider?.defaultModel, providerModelsData]);

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
