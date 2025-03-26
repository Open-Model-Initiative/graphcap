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
 * - Form state and validation
 * - Model selection state
 * - Form actions and callbacks
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
import { DEFAULT_PROVIDER_FORM_DATA } from "../../constants";
import { useModelSelection, useProviderForm } from "../../hooks";
import type { Provider, ProviderCreate, ProviderUpdate } from "../types";

// Local storage key for selected provider
const SELECTED_PROVIDER_STORAGE_KEY = "graphcap-selected-provider";

type ViewMode = "view" | "edit" | "create";
type FormData = ProviderCreate | ProviderUpdate;

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

	// Form state
	control: any;
	handleSubmit: any;
	errors: any;
	watch: any;
	providerName: string | undefined;
	reset: any;

	// Model selection state
	selectedModelId: string;
	setSelectedModelId: (id: string) => void;
	providerModelsData: any;
	isLoadingModels: boolean;
	isModelsError: boolean;
	modelsError: any;

	// Form actions
	handleModelSelect: () => void;
	isSubmitting: boolean;
	isCreating: boolean;

	// Form callbacks
	onSubmit: (data: FormData) => Promise<void>;
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

	// Form state
	control: null,
	handleSubmit: () => ({}),
	errors: {},
	watch: () => undefined,
	providerName: undefined,
	reset: () => {},

	// Model selection state
	selectedModelId: "",
	setSelectedModelId: () => {},
	providerModelsData: null,
	isLoadingModels: false,
	isModelsError: false,
	modelsError: null,

	// Form actions
	handleModelSelect: () => {},
	isSubmitting: false,
	isCreating: false,

	// Form callbacks
	onSubmit: async () => Promise.resolve(),
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

// For backward compatibility
export const useProviderFormContext = useInferenceProviderContext;

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
	readonly initialData?: Partial<ProviderCreate | ProviderUpdate>;
	readonly isCreating: boolean;
	readonly onSubmit: (data: FormData) => void;
	readonly onCancel: () => void;
	readonly isSubmitting: boolean;
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
 * - Form state and validation
 * - Model selection
 * - Form submission and cancellation
 *
 * @param props - The provider props
 * @returns A context provider component
 */
export function InferenceProviderProvider({
	children,
	initialData = {},
	isCreating,
	onSubmit: onSubmitProp,
	onCancel,
	isSubmitting,
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
		if (selectedProviderProp) {
			setSelectedProvider(selectedProviderProp);
		}
	}, [selectedProviderProp]);

	// Save selected provider to localStorage when it changes
	useEffect(() => {
		saveProviderToStorage(selectedProvider);
	}, [selectedProvider]);

	// Update providers when prop changes
	useEffect(() => {
		setProviders(providersProp);
	}, [providersProp]);

	// Use the form hook
	const {
		control,
		handleSubmit,
		errors,
		providerName,
		onSubmit: onSubmitForm,
		watch,
		reset,
		updateApiKey,
	} = useProviderForm({
		...initialData,
		// If we're editing an existing provider, ensure its data is properly passed
		...(selectedProvider && mode === "edit" ? {
			name: selectedProvider.name,
			kind: selectedProvider.kind,
			environment: selectedProvider.environment,
			baseUrl: selectedProvider.baseUrl,
			apiKey: selectedProvider.apiKey || '',
			isEnabled: selectedProvider.isEnabled,
			defaultModel: selectedProvider.defaultModel || '',
			fetchModels: selectedProvider.fetchModels,
		} : {}),
	});

	// Reset form data when selected provider changes
	useEffect(() => {
		if (selectedProvider && mode !== "create") {
			reset({
				name: selectedProvider.name,
				kind: selectedProvider.kind,
				environment: selectedProvider.environment,
				baseUrl: selectedProvider.baseUrl,
				isEnabled: selectedProvider.isEnabled,
				// If apiKey is null from the server, use an empty string to avoid React controlled/uncontrolled issues
				// Don't include apiKey if in view mode to prevent showing empty field
				...(mode === "edit" ? { apiKey: selectedProvider.apiKey || "" } : {}),
				defaultModel: selectedProvider.defaultModel || "",
				fetchModels: selectedProvider.fetchModels,
				rateLimits: selectedProvider.rateLimits || {
					requestsPerMinute: 0,
					tokensPerMinute: 0,
				},
			});
		} else if (mode === "create") {
			reset(DEFAULT_PROVIDER_FORM_DATA);
		}
	}, [selectedProvider, mode, reset]);

	// Use the model selection hook with null check
	const {
		selectedModelId,
		setSelectedModelId,
		providerModelsData,
		isLoadingModels,
		isModelsError,
		modelsError,
		handleModelSelect: handleModelSelectBase,
	} = useModelSelection(selectedProvider?.name ?? "", onModelSelect);

	// Create a memoized version of handleModelSelect
	const handleModelSelect = useCallback(() => {
		handleModelSelectBase();
	}, [handleModelSelectBase]);

	// Create a memoized version of onSubmit that calls both form and prop handlers
	const onSubmitHandler = useCallback(
		async (data: FormData) => {
			try {
				console.log("InferenceProviderContext onSubmitHandler called with data:", data);
				console.log("isSubmitting state:", isSubmitting);
				
				// Extract apiKey if present - we need to update it separately
				const { apiKey, ...providerData } = data;

				// First update the provider without the API key
				const result = await onSubmitForm(
					providerData,
					isCreating,
					selectedProvider?.id
				);

				if (result.success) {
					// If we're editing and have a new API key, update it separately
					if (!isCreating && selectedProvider?.id && apiKey) {
						console.log("Updating API key separately");
						await updateApiKey(selectedProvider.id, apiKey);
					}

					// Notify the parent component that we've submitted successfully
					onSubmitProp(data);
					setMode("view");
				}
			} catch (error) {
				console.error("Error updating provider:", error);
				throw error; // Re-throw the error so it can be caught by the form's error handler
			}
		},
		[onSubmitForm, onSubmitProp, setMode, isCreating, selectedProvider?.id, updateApiKey, isSubmitting],
	);

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

			// Form state
			control,
			handleSubmit,
			errors,
			watch,
			providerName,
			reset,

			// Model selection state
			selectedModelId,
			setSelectedModelId,
			providerModelsData,
			isLoadingModels,
			isModelsError,
			modelsError,

			// Form actions
			handleModelSelect,
			isSubmitting,
			isCreating,

			// Form callbacks
			onSubmit: onSubmitHandler,
			onCancel: onCancelHandler,
		}),
		[
			mode,
			selectedProvider,
			providers,
			control,
			handleSubmit,
			errors,
			watch,
			providerName,
			reset,
			selectedModelId,
			setSelectedModelId,
			providerModelsData,
			isLoadingModels,
			isModelsError,
			modelsError,
			handleModelSelect,
			isSubmitting,
			isCreating,
			onSubmitHandler,
			onCancelHandler,
		],
	);

	return (
		<InferenceProviderContext.Provider value={contextValue}>
			{children}
		</InferenceProviderContext.Provider>
	);
}
