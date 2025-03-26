// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";
import type { ReactNode } from "react";
import { useModelSelection } from "../../../hooks/useModelSelection";
import { useProviderForm } from "../../../hooks/useProviderForm";
import { useProviders } from "../../../services/providers";
import { useTestProviderConnection } from "../../../services/providers";
import { ProviderFormProvider } from "../../context/ProviderFormContext";
import type { ConnectionDetails, ErrorDetails, Provider, ProviderCreate, ProviderModelsResponse, ProviderUpdate } from "../../types";
import { toServerConfig } from "../../types";

// Extended Error interface with cause property
interface ErrorWithCause extends Error {
	cause?: unknown;
}

// Model data type definition matching the context type exactly
interface ProviderModelData {
	models: Array<{ id: string; name: string; is_default?: boolean }>;
}

interface ProviderFormContainerProps {
	children: ReactNode;
	initialData?: Partial<ProviderCreate | ProviderUpdate>;
	onSubmit: (data: ProviderCreate | ProviderUpdate) => Promise<void>;
}

/**
 * Container component that provides the ProviderFormContext
 */
export function ProviderFormContainer({
	children,
	initialData,
	onSubmit: onSubmitProp,
}: ProviderFormContainerProps) {
	// Form state from useProviderForm
	const {
		control,
		handleSubmit: hookHandleSubmit,
		errors,
		watch,
		providerName,
		fetchModels,
		defaultModel,
		reset,
		dialogs: formDialogs,
		closeDialog: closeFormDialog,
		savedProvider,
		saveError,
		onSubmit: hookOnSubmit,
		updateApiKey,
		isSubmitting,
	} = useProviderForm(initialData);

	// Local state for the provider form
	const [mode, setMode] = useState<"view" | "edit" | "create">("view");
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [isTestingConnection, setIsTestingConnection] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
		initialData as Provider || null
	);
	const [formError, setFormError] = useState<ErrorDetails | null>(null);
	const [connectionError, setConnectionError] = useState<ErrorDetails | null>(null);
	const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
	const [dialogs, setDialogs] = useState({
		error: false,
		success: false,
		formError: false,
		save: formDialogs.save || false,
	});

	// Fetch providers
	const { data: providers = [] } = useProviders();

	// Model selection - handle special case to fix type issues
	// Extract values first but handle type casting
	const modelSelectionHook = selectedProvider ? useModelSelection(selectedProvider) : null;
	
	// Now create properly typed values
	const selectedModelId = modelSelectionHook ? modelSelectionHook.selectedModelId : null;
	
	// Explicitly type the model data
	const providerModelsData: ProviderModelData | null = modelSelectionHook?.providerModelsData 
		? { models: modelSelectionHook.providerModelsData.models || [] } 
		: null;
	
	// Type-safe setter function
	const setSelectedModelId = (id: string | null) => {
		if (modelSelectionHook?.setSelectedModelId && typeof id === 'string') {
			modelSelectionHook.setSelectedModelId(id);
		}
	};
	
	// Other model selection properties
	const isLoadingModels = !!modelSelectionHook?.isLoadingModels;
	const isModelsError = !!modelSelectionHook?.isModelsError;
	const modelsError = modelSelectionHook?.modelsError || null;
	const handleModelSelect = modelSelectionHook?.handleModelSelect || (() => {});

	// API connection test hook
	const testConnection = useTestProviderConnection();

	// Function to close any dialog
	const closeDialog = (dialog: "error" | "success" | "formError" | "save") => {
		if (dialog === "save") {
			closeFormDialog("save"); // Handle this through the form hook
		} else {
			setDialogs(prev => ({ ...prev, [dialog]: false }));
		}
	};


	// Handle form submission
	const onSubmit = async (data: ProviderCreate | ProviderUpdate) => {
		try {
			setFormError(null);
			setSaveSuccess(false);
			await onSubmitProp(data);
			setSaveSuccess(true);
			
			// Show the save dialog
			setDialogs(prev => ({ ...prev, save: true }));
			
			// Reset success message after 3 seconds
			setTimeout(() => {
				setSaveSuccess(false);
			}, 3000);
		} catch (error) {
			console.error("Provider form submission error:", error);
			
			// Convert error to ErrorDetails format
			let errorObj: ErrorDetails;
			if (error instanceof Error) {
				errorObj = {
					message: error.message,
					code: error.name,
					details: {
						error: error.toString()
					}
				};
				
				// Try to extract cause if it exists
				const errorWithCause = error as ErrorWithCause;
				if ('cause' in error && errorWithCause.cause !== undefined) {
					errorObj.details = {
						...errorObj.details,
						cause: errorWithCause.cause
					};
				}
			} else if (typeof error === 'object' && error !== null) {
				errorObj = error as ErrorDetails;
			} else {
				errorObj = {
					message: String(error),
					details: { error }
				};
			}
			
			setFormError(errorObj);
			setDialogs(prev => ({ ...prev, formError: true }));
		}
	};

	// Form submission handler
	const handleSubmit = (handler: (data: ProviderCreate | ProviderUpdate) => Promise<void>) => {
		return hookHandleSubmit(async (data) => {
			try {
				await handler(data);
			} catch (error) {
				console.error("Form submission error:", error);
			}
		});
	};

	// Test connection handler
	const handleTestConnection = async () => {
		if (!selectedProvider) return;

		// Validate API key is present
		if (!selectedProvider.apiKey) {
			setConnectionError({
				message: "API key is required",
				name: "ValidationError",
				details: {
					reason: "Please provide an API key in the provider configuration."
				},
				suggestions: [
					"Edit the provider to add an API key",
					"API keys should be non-empty strings",
				],
			} as ErrorDetails);
			setDialogs(prev => ({ ...prev, error: true }));
			return;
		}

		setIsTestingConnection(true);
		setConnectionError(null);

		try {
			const config = toServerConfig(selectedProvider);
			const result = await testConnection.mutateAsync({
				providerName: selectedProvider.name,
				config,
			});

			setConnectionDetails(result);
			setDialogs(prev => ({ ...prev, success: true }));
		} catch (error) {
			console.error("Connection test failed:", error);
			
			// Convert error to ErrorDetails format
			let errorObj: ErrorDetails;
			if (error instanceof Error) {
				errorObj = {
					message: error.message,
					code: error.name,
					details: {
						error: error.toString()
					}
				};
				
				// Try to extract cause if it exists
				const errorWithCause = error as ErrorWithCause;
				if ('cause' in error && errorWithCause.cause !== undefined) {
					errorObj.details = {
						...errorObj.details,
						cause: errorWithCause.cause
					};
				}
			} else if (typeof error === 'object' && error !== null) {
				errorObj = error as ErrorDetails;
			} else {
				errorObj = {
					message: String(error),
					details: { error }
				};
			}
			
			setConnectionError(errorObj);
			setDialogs(prev => ({ ...prev, error: true }));
		} finally {
			setIsTestingConnection(false);
		}
	};

	return (
		<ProviderFormProvider
			value={{
				mode,
				isSubmitting,
				isCreating: mode === "create",
				saveSuccess,
				isTestingConnection,
				selectedProvider,
				formError,
				connectionError,
				connectionDetails,
				dialogs: {
					...dialogs,
					save: formDialogs.save,
				},
				saveError,
				savedProvider,
				providers,
				
				// Form related properties
				control,
				errors,
				watch,
				
				// Model selection properties
				providerModelsData,
				isLoadingModels,
				isModelsError,
				modelsError,
				selectedModelId,
				setSelectedModelId,
				handleModelSelect,
				
				onSubmit,
				onCancel: () => {
					reset();
					setMode("view");
				},
				handleSubmit,
				handleTestConnection,
				setMode,
				closeDialog,
			}}
		>
			{children}
		</ProviderFormProvider>
	);
}
