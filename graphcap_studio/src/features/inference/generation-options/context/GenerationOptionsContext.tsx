// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Context
 *
 * This module provides a context for managing generation options state,
 * including provider and model selection.
 */

import { useServerConnectionsContext } from "@/context/ServerConnectionsContext";
import { queryKeys } from "@/features/inference/services/providers";
import { SERVER_IDS } from "@/features/server-connections/constants";
import {
	DEFAULT_OPTIONS,
	type GenerationOptions,
	GenerationOptionsSchema,
} from "@/types/generation-option-types";
import type { Provider, ProviderModelInfo } from "@/types/provider-config-types";
import { debugLog } from "@/utils/logger";
import { useQueryClient } from "@tanstack/react-query";
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
	const queryClient = useQueryClient();
	const { connections } = useServerConnectionsContext();

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
	const [providerInitAttempts, setProviderInitAttempts] = useState(0);

	debugLog(COMPONENT_NAME, "Initial options state:", options);

	// Monitor connection status directly
	const dataServiceConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.DATA_SERVICE,
	);
	const isConnected = dataServiceConnection?.status === "connected";

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

	// Watch for connection changes to reset provider init attempts
	useEffect(() => {
		if (isConnected) {
			debugLog(COMPONENT_NAME, "Data service connection established");
			// Reset init attempts when connection is established so we can retry initialization
			setProviderInitAttempts(0);
		}
	}, [isConnected]);

	// Initialize provider if available and not already set, with retry logic
	useEffect(() => {
		const MAX_RETRY_ATTEMPTS = 3;
		const RETRY_DELAY = 500; // ms

		// Skip initialization if not connected
		if (!isConnected) {
			debugLog(COMPONENT_NAME, "Skipping provider initialization - data service not connected");
			return;
		}

		const initializeProvider = async () => {
			debugLog(COMPONENT_NAME, "Checking for default provider. Providers:", providers.length, 
				"Current provider:", options.provider_name, 
				"Loading:", isLoadingProviders,
				"Attempt:", providerInitAttempts + 1);
			
			// If we already have a provider, skip initialization
			if (options.provider_name || providerInitAttempts >= MAX_RETRY_ATTEMPTS) {
				return;
			}
			
			// Wait until loading is complete to check
			if (isLoadingProviders) {
				return;
			}
			
			// If providers are available, set the first one
			if (providers.length > 0) {
				const firstProvider = providers[0];
				debugLog(COMPONENT_NAME, "Setting default provider:", firstProvider.name);
				updateOption("provider_name", firstProvider.name);
				return;
			}
			
			// No providers found, retry if under attempt limit
			if (providerInitAttempts < MAX_RETRY_ATTEMPTS - 1) {
				setProviderInitAttempts(prev => prev + 1);
				debugLog(COMPONENT_NAME, `No providers found, retrying (${providerInitAttempts + 1}/${MAX_RETRY_ATTEMPTS})...`);
				
				// Wait before retrying
				setTimeout(async () => {
					try {
						// Trigger a refetch by invalidating the providers query
						await queryClient.invalidateQueries({ queryKey: queryKeys.providers });
						await queryClient.refetchQueries({ queryKey: queryKeys.providers });
					} catch (error) {
						debugLog(COMPONENT_NAME, "Error refetching providers:", error);
					}
				}, RETRY_DELAY);
			} else {
				debugLog(COMPONENT_NAME, `Max provider initialization attempts (${MAX_RETRY_ATTEMPTS}) reached.`);
			}
		};
		
		initializeProvider();
	}, [providers, options.provider_name, isLoadingProviders, providerInitAttempts, queryClient, isConnected]);

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

