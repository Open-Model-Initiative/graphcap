// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Context
 *
 * This module provides a context for managing generation options state,
 * including provider and model selection.
 */

import {
	DEFAULT_OPTIONS,
	type GenerationOptions,
	GenerationOptionsSchema,
} from "@/types/generation-option-types";
import type { Provider, ProviderModelInfo } from "@/types/provider-config-types";
import { debugLog } from "@/utils/logger";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useProviderModelOptions } from "../../hooks/useProviderModelOptions";
import { usePersistGenerationOptions } from "../persist-generation-options";

// Component name for logging
const COMPONENT_NAME = "GenerationOptionsContext";

// Define the context interface
interface GenerationOptionsContextValue {
	// State groups
	options: GenerationOptions;
	providers: {
		items: Provider[];
		selected: Provider | null;
		isLoading: boolean;
		error: unknown;
	};
	models: {
		items: ProviderModelInfo[];
		defaultModel: ProviderModelInfo | null;
		isLoading: boolean;
		error: unknown;
	};
	uiState: {
		isDialogOpen: boolean;
		isGenerating: boolean;
	};

	// Action groups
	actions: {
		updateOption: <K extends keyof GenerationOptions>(key: K, value: GenerationOptions[K]) => void;
		resetOptions: () => void;
		setOptions: (options: Partial<GenerationOptions>) => void;
		selectProvider: (providerName: string) => void;
		selectModel: (modelName: string) => void;
	};
	uiActions: {
		openDialog: () => void;
		closeDialog: () => void;
		toggleDialog: () => void;
		setIsGenerating: (isGenerating: boolean) => void;
	};
}

// Create the context with undefined default
const GenerationOptionsContext = createContext<
	GenerationOptionsContextValue | undefined
>(undefined);

// Provider props interface
interface GenerationOptionsProviderProps {
	readonly children: React.ReactNode;
	readonly initialOptions?: Partial<GenerationOptions>;
	readonly onOptionsChange?: (options: GenerationOptions) => void;
	readonly initialGenerating?: boolean;
}

/**
 * Provider component for generation options
 */
export function GenerationOptionsProvider({
	children,
	initialOptions = {},
	onOptionsChange,
	initialGenerating = false,
}: Readonly<GenerationOptionsProviderProps>) {
	const { loadPersistedOptions, saveOptions } = usePersistGenerationOptions();

	debugLog(COMPONENT_NAME, "Provider initializing with options:", initialOptions);

	// Parse initial options through the schema to ensure valid defaults
	const defaultOptions = useMemo(() => {
		// Merge defaults with persisted options and initialOptions (with initialOptions taking precedence)
		const persistedOptions = loadPersistedOptions();
		debugLog(COMPONENT_NAME, "Persisted options:", persistedOptions);
		
		const mergedOptions = {
			...DEFAULT_OPTIONS,
			...persistedOptions,
			...initialOptions,
		};
		debugLog(COMPONENT_NAME, "Merged options:", mergedOptions);
		
		return GenerationOptionsSchema.parse(mergedOptions);
	}, [initialOptions, loadPersistedOptions]);

	// State
	const [options, setOptions] = useState<GenerationOptions>(defaultOptions);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(initialGenerating);

	debugLog(COMPONENT_NAME, "Initial options state:", options);

	// Provider and model data
	const {
		providers,
		selectedProvider,
		isLoadingProviders,
		providersError,
		models,
		defaultModel,
		isLoading,
		hasError
	} = useProviderModelOptions(options.provider_name);

	debugLog(COMPONENT_NAME, "Provider model options:", {
		providerCount: providers.length,
		selectedProvider,
		isLoadingProviders,
		modelCount: models.length,
		defaultModel
	});

	// Save options to localStorage when they change
	useEffect(() => {
		debugLog(COMPONENT_NAME, "Options changed, saving:", options);
		saveOptions(options);
	}, [options, saveOptions]);

	// Update generating state when initialGenerating changes
	useEffect(() => {
		setIsGenerating(initialGenerating);
	}, [initialGenerating]);

	// Initialize provider if available and not already set
	useEffect(() => {
		debugLog(COMPONENT_NAME, "Checking for default provider. Providers:", providers.length, 
			"Current provider:", options.provider_name, 
			"Loading:", isLoadingProviders);
		
		if (providers.length > 0 && !options.provider_name && !isLoadingProviders) {
			const firstProvider = providers[0];
			debugLog(COMPONENT_NAME, "Setting default provider:", firstProvider.name);
			updateOption("provider_name", firstProvider.name);
		}
	}, [providers, options.provider_name, isLoadingProviders]);


	useEffect(() => {
		// Only set model if we have a provider and no model is selected yet
		debugLog(COMPONENT_NAME, "Checking for default model. Provider:", options.provider_name, 
			"Current model:", options.model_name, 
			"Models:", models.length);
		
		if (options.provider_name && !options.model_name && models.length > 0) {
			// Try to use default model first, otherwise use first available model
			const modelToUse = defaultModel || models[0];
			debugLog(COMPONENT_NAME, "Setting default model:", modelToUse.name);
			updateOption("model_name", modelToUse.name);
		}
	}, [options.provider_name, options.model_name, models, defaultModel]);

	// Update a single option
	const updateOption = useCallback(
		<K extends keyof GenerationOptions>(
			key: K,
			value: GenerationOptions[K],
		) => {
			debugLog(COMPONENT_NAME, "Updating option:", key, value);
			setOptions((prev) => {
				const newOptions = { ...prev, [key]: value };
				// Notify parent if callback is provided
				if (onOptionsChange) {
					onOptionsChange(newOptions);
				}
				return newOptions;
			});
		},
		[onOptionsChange],
	);

	// Reset options to defaults
	const resetOptions = useCallback(() => {
		debugLog(COMPONENT_NAME, "Resetting options to defaults");
		setOptions(defaultOptions);
		if (onOptionsChange) {
			onOptionsChange(defaultOptions);
		}
	}, [defaultOptions, onOptionsChange]);

	// Set multiple options at once
	const mergeOptions = useCallback(
		(newOptions: Partial<GenerationOptions>) => {
			debugLog(COMPONENT_NAME, "Merging options:", newOptions);
			setOptions((prev) => {
				const updatedOptions = { ...prev, ...newOptions };
				if (onOptionsChange) {
					onOptionsChange(updatedOptions);
				}
				return updatedOptions;
			});
		},
		[onOptionsChange],
	);

	// Provider selection
	const selectProvider = useCallback((providerName: string) => {
		debugLog(COMPONENT_NAME, "Provider selection requested:", providerName);
		if (providerName !== options.provider_name) {
			debugLog(COMPONENT_NAME, "Changing provider from", options.provider_name, "to", providerName);
			updateOption("provider_name", providerName);
			updateOption("model_name", "");
		}
	}, [updateOption, options.provider_name]);

	// Model selection
	const selectModel = useCallback((modelName: string) => {
		debugLog(COMPONENT_NAME, "Model selection requested:", modelName);
		updateOption("model_name", modelName);
	}, [updateOption]);

	// Dialog controls
	const openDialog = useCallback(() => setIsDialogOpen(true), []);
	const closeDialog = useCallback(() => setIsDialogOpen(false), []);
	const toggleDialog = useCallback(() => setIsDialogOpen((prev) => !prev), []);

	// Context value using grouped structure
	const value = useMemo(
		() => ({
			// State groups
			options,
			providers: {
				items: providers,
				selected: selectedProvider,
				isLoading: isLoadingProviders,
				error: providersError
			},
			models: {
				items: models,
				defaultModel,
				isLoading: isLoading,
				error: hasError ? new Error("Failed to load models") : null
			},
			uiState: {
				isDialogOpen,
				isGenerating
			},

			// Action groups
			actions: {
				updateOption,
				resetOptions,
				setOptions: mergeOptions,
				selectProvider,
				selectModel
			},
			uiActions: {
				openDialog,
				closeDialog,
				toggleDialog,
				setIsGenerating
			}
		}),
		[
			options,
			providers,
			selectedProvider,
			isLoadingProviders,
			providersError,
			models,
			defaultModel,
			isLoading,
			hasError,
			isDialogOpen,
			isGenerating,
			updateOption,
			resetOptions,
			mergeOptions,
			selectProvider,
			selectModel,
			openDialog,
			closeDialog,
			toggleDialog,
		]
	);

	debugLog(COMPONENT_NAME, "Final context value:", {
		providerItems: value.providers.items.length,
		modelItems: value.models.items.length,
		selectedProvider: value.providers.selected?.name,
		providerName: value.options.provider_name,
		modelName: value.options.model_name
	});

	return (
		<GenerationOptionsContext.Provider value={value}>
			{children}
		</GenerationOptionsContext.Provider>
	);
}

/**
 * Hook to use generation options context
 *
 * Must be used within a GenerationOptionsProvider
 */
export function useGenerationOptions() {
	const context = useContext(GenerationOptionsContext);
	if (!context) {
		throw new Error(
			"useGenerationOptions must be used within a GenerationOptionsProvider",
		);
	}
	
	// Debug logging
	debugLog("useGenerationOptions", "Context accessed:", {
		providerCount: context.providers.items.length,
		modelCount: context.models.items.length,
		providerName: context.options.provider_name,
		modelName: context.options.model_name
	});
	
	return context;
}

// Export a named export for the context
export { GenerationOptionsContext };

