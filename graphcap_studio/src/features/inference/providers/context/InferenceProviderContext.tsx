// SPDX-License-Identifier: Apache-2.0
/**
 * Inference Provider Context
 *
 * This context manages the state for provider configuration forms in the inference feature.
 * It centralizes provider data, form state, and model selection to avoid prop drilling.
 *
 * The context includes:
 * - View state (mode, selected provider)
 * - Providers data
 * - Model selection state
 * - Basic view actions
 */
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useModelSelection } from "../../hooks";
import type { Provider } from "../types";

// Local storage key for selected provider
const SELECTED_PROVIDER_STORAGE_KEY = "graphcap-selected-provider";

type ViewMode = "view" | "edit" | "create";

// Type for provider models data from the API
interface ProviderModel {
	id: string;
	name: string;
	is_default?: boolean;
}

interface ProviderModelsResponse {
	models: ProviderModel[];
}

/**
 * Type definition for the Inference Provider Context
 * Contains all state and functions needed for provider management
 */
type InferenceProviderContextType = {
	// View state
	mode: ViewMode;
	setMode: (mode: ViewMode) => void;
	selectedProvider: Provider | null;
	setSelectedProvider: (provider: Provider | null) => void;
	isEditing: boolean;

	// Providers state
	providers: Provider[];
	setProviders: (providers: Provider[]) => void;

	// Model selection state
	selectedModelId: string;
	setSelectedModelId: (id: string) => void;
	providerModelsData: ProviderModelsResponse | null;
	isLoadingModels: boolean;
	isModelsError: boolean;
	modelsError: Error | null;
	handleModelSelect: () => void;

	// Basic actions
	onCancel: () => void;
};

// Default context value with no-op functions
const defaultContextValue: InferenceProviderContextType = {
	// View state
	mode: "view",
	setMode: () => {},
	selectedProvider: null,
	setSelectedProvider: () => {},
	isEditing: false,

	// Providers state
	providers: [],
	setProviders: () => {},

	// Model selection state
	selectedModelId: "",
	setSelectedModelId: () => {},
	providerModelsData: null,
	isLoadingModels: false,
	isModelsError: false,
	modelsError: null,
	handleModelSelect: () => {},

	// Basic actions
	onCancel: () => {},
};

/**
 * Create the Inference Provider Context with default values
 * This context provides state and functions for managing provider configuration
 */
const InferenceProviderContext =
	createContext<InferenceProviderContextType>(defaultContextValue);

/**
 * Custom hook to access the Inference Provider Context
 * Throws an error if used outside of an InferenceProviderProvider
 *
 * @returns The Inference Provider Context value
 */
export function useInferenceProviderContext() {
	const context = useContext(InferenceProviderContext);
	if (!context) {
		throw new Error(
			"useInferenceProviderContext must be used within an InferenceProviderProvider",
		);
	}
	return context;
}

/**
 * Save provider to localStorage
 * @param provider - The provider to save
 */
const saveProviderToStorage = (provider: Provider | null) => {
	try {
		if (provider) {
			localStorage.setItem(
				SELECTED_PROVIDER_STORAGE_KEY,
				JSON.stringify(provider),
			);
		} else {
			localStorage.removeItem(SELECTED_PROVIDER_STORAGE_KEY);
		}
	} catch (error) {
		console.error("Error saving provider to localStorage:", error);
	}
};

/**
 * Load provider from localStorage
 * @returns The saved provider or null
 */
const loadProviderFromStorage = (): Provider | null => {
	try {
		const savedProvider = localStorage.getItem(SELECTED_PROVIDER_STORAGE_KEY);
		return savedProvider ? JSON.parse(savedProvider) : null;
	} catch (error) {
		console.error("Error loading provider from localStorage:", error);
		return null;
	}
};

/**
 * Props for the InferenceProviderProvider component
 */
type InferenceProviderProviderProps = {
	readonly children: ReactNode;
	readonly isCreating?: boolean;
	readonly onCancel?: () => void;
	readonly onModelSelect?: (providerName: string, modelId: string) => void;
	readonly selectedProvider?: Provider | null;
	readonly providers?: Provider[];
};

/**
 * Provider component for the Inference Provider context
 *
 * This component manages the state for provider configuration forms and makes it
 * available to all child components through the context. It handles:
 *
 * - Provider selection and management
 * - Model selection
 * - Basic view actions
 *
 * @param props - The provider props
 * @returns A context provider component
 */
export function InferenceProviderProvider({
	children,
	isCreating = false,
	onCancel = () => {},
	onModelSelect,
	selectedProvider: selectedProviderProp,
	providers: providersProp = [],
}: InferenceProviderProviderProps) {
	// View state
	const [mode, setMode] = useState<ViewMode>(isCreating ? "create" : "view");
	const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
		() => {
			// Use the prop if provided, otherwise try to load from localStorage
			return selectedProviderProp || loadProviderFromStorage();
		},
	);
	const [providers, setProviders] = useState<Provider[]>(providersProp);

	// Update selected provider when prop changes
	useEffect(() => {
		if (selectedProviderProp && JSON.stringify(selectedProviderProp) !== JSON.stringify(selectedProvider)) {
			setSelectedProvider(selectedProviderProp);
		}
	}, [selectedProviderProp, selectedProvider]);

	// Save selected provider to localStorage when it changes
	useEffect(() => {
		if (selectedProvider) {
			saveProviderToStorage(selectedProvider);
		}
	}, [selectedProvider]);

	// Update providers when prop changes - only if we have providers and they're different
	useEffect(() => {
		const hasProviders = Array.isArray(providersProp) && providersProp.length > 0;
		const providersChanged = JSON.stringify(providersProp) !== JSON.stringify(providers);
		
		if (hasProviders && providersChanged) {
			setProviders(providersProp);
		}
	}, [providersProp, providers]);

	// Use the model selection hook with selectedProvider
	const {
		selectedModelId,
		setSelectedModelId,
		providerModelsData,
		isLoadingModels,
		isModelsError,
		modelsError,
		handleModelSelect: handleModelSelectBase,
	} = useModelSelection(selectedProvider, onModelSelect);

	// Create a memoized version of handleModelSelect
	const handleModelSelect = useCallback(() => {
		if (selectedProvider) {
			handleModelSelectBase();
		}
	}, [handleModelSelectBase, selectedProvider]);

	// Create a memoized version of onCancel that resets mode
	const onCancelHandler = useCallback(() => {
		setMode("view");
		onCancel();
	}, [onCancel]);

	// Create the context value
	const contextValue = useMemo(
		() => ({
			// View state
			mode,
			setMode,
			selectedProvider,
			setSelectedProvider,
			isEditing: mode === "edit" || mode === "create",

			// Providers state
			providers,
			setProviders,

			// Model selection state
			selectedModelId,
			setSelectedModelId,
			providerModelsData: providerModelsData || null,
			isLoadingModels,
			isModelsError,
			modelsError,
			handleModelSelect,

			// Basic actions
			onCancel: onCancelHandler,
		}),
		[
			mode,
			selectedProvider,
			providers,
			selectedModelId,
			setSelectedModelId,
			providerModelsData,
			isLoadingModels,
			isModelsError,
			modelsError,
			handleModelSelect,
			onCancelHandler,
		],
	);

	return (
		<InferenceProviderContext.Provider value={contextValue}>
			{children}
		</InferenceProviderContext.Provider>
	);
}
