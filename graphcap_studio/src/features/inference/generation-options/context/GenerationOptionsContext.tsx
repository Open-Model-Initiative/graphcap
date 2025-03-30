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
		selectProvider: (providerId: string) => void;
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

	// Parse initial options through the schema to ensure valid defaults
	const defaultOptions = useMemo(() => {
		// Merge defaults with persisted options and initialOptions (with initialOptions taking precedence)
		const persistedOptions = loadPersistedOptions();
		const mergedOptions = {
			...DEFAULT_OPTIONS,
			...persistedOptions,
			...initialOptions,
		};
		return GenerationOptionsSchema.parse(mergedOptions);
	}, [initialOptions, loadPersistedOptions]);

	// State
	const [options, setOptions] = useState<GenerationOptions>(defaultOptions);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(initialGenerating);

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
	} = useProviderModelOptions(options.provider_id);

	// Save options to localStorage when they change
	useEffect(() => {
		saveOptions(options);
	}, [options, saveOptions]);

	// Update generating state when initialGenerating changes
	useEffect(() => {
		setIsGenerating(initialGenerating);
	}, [initialGenerating]);

	// Initialize provider if available and not already set
	useEffect(() => {
		if (providers.length > 0 && !options.provider_id) {
			const firstProvider = providers[0];
			updateOption("provider_id", firstProvider.id);
		}
	}, [providers, options.provider_id]);

	// Initialize model if available and not already set
	useEffect(() => {
		// If we have a provider but no model, and models are available
		if (options.provider_id && !options.model_id && models.length > 0) {
			// Try to use default model first, otherwise use first available model
			const modelToUse = defaultModel || models[0];
			updateOption("model_id", modelToUse.name);
		}
	}, [options.provider_id, options.model_id, models, defaultModel]);

	// Update a single option
	const updateOption = useCallback(
		<K extends keyof GenerationOptions>(
			key: K,
			value: GenerationOptions[K],
		) => {
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
		setOptions(defaultOptions);
		if (onOptionsChange) {
			onOptionsChange(defaultOptions);
		}
	}, [defaultOptions, onOptionsChange]);

	// Set multiple options at once
	const mergeOptions = useCallback(
		(newOptions: Partial<GenerationOptions>) => {
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
	const selectProvider = useCallback((providerId: string) => {
		updateOption("provider_id", providerId);
		// Clear model when provider changes
		updateOption("model_id", "");
	}, [updateOption]);

	// Model selection
	const selectModel = useCallback((modelName: string) => {
		updateOption("model_id", modelName);
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
			toggleDialog
		],
	);

	return (
		<GenerationOptionsContext.Provider value={value}>
			{children}
		</GenerationOptionsContext.Provider>
	);
}

/**
 * Hook to access the generation options context
 */
export function useGenerationOptions() {
	const context = useContext(GenerationOptionsContext);

	if (context === undefined) {
		throw new Error(
			"useGenerationOptions must be used within a GenerationOptionsProvider",
		);
	}

	return context;
}

// Export a named export for the context
export { GenerationOptionsContext };
