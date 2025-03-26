// SPDX-License-Identifier: Apache-2.0
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useProviders, useTestProviderConnection } from "../../../services/providers";
import { useInferenceProviderContext } from "../../context/InferenceProviderContext";
import { ProviderFormProvider } from "../../context/ProviderFormContext";
import type { ConnectionDetails, ErrorDetails, Provider, ProviderCreate, ProviderUpdate } from "../../types";
import { toServerConfig } from "../../types";

// Extended Error interface with cause property
interface ErrorWithCause extends Error {
	cause?: unknown;
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
	// Get model selection and provider state from the InferenceProviderContext
	const {
		mode,
		setMode,
		selectedProvider,
		providers: contextProviders,
		selectedModelId,
		setSelectedModelId, 
		providerModelsData,
		isLoadingModels,
		isModelsError,
		modelsError,
		handleModelSelect,
		onCancel: onContextCancel,
	} = useInferenceProviderContext();

	// Setup react-hook-form for provider form
	const { 
		control, 
		handleSubmit: hookHandleSubmit, 
		formState: { errors },
		watch,
		reset 
	} = useForm<ProviderCreate | ProviderUpdate>({
		defaultValues: initialData,
	});

	// Local state for the provider form
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [isTestingConnection, setIsTestingConnection] = useState(false);
	const [formError, setFormError] = useState<ErrorDetails | null>(null);
	const [connectionError, setConnectionError] = useState<ErrorDetails | null>(null);
	const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
	const [savedProvider, setSavedProvider] = useState<Provider | null>(null);
	const [saveError, setSaveError] = useState<string | undefined>(undefined);
	const [dialogs, setDialogs] = useState({
		error: false,
		success: false,
		formError: false,
		save: false,
	});

	// Fetch providers
	const { data: providers = [] } = useProviders();

	// API connection test hook
	const testConnection = useTestProviderConnection();

	// Function to close any dialog
	const closeDialog = (dialog: "error" | "success" | "formError" | "save") => {
		setDialogs(prev => ({ ...prev, [dialog]: false }));
	};

	// Function to open the save dialog
	const openSaveDialog = useCallback(() => {
		setDialogs(prev => ({ ...prev, save: true }));
	}, []);

	// Handle form submission
	const onSubmit = async (data: ProviderCreate | ProviderUpdate) => {
		try {
			setIsSubmitting(true);
			setFormError(null);
			setSaveSuccess(false);
			
			await onSubmitProp(data);
			
			setSaveSuccess(true);
			openSaveDialog();
			
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
		} finally {
			setIsSubmitting(false);
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
				code: "ValidationError",
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

	// Handler for cancel operation
	const onCancel = () => {
		reset();
		onContextCancel();
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
				dialogs,
				saveError,
				savedProvider,
				providers: providers.length > 0 ? providers : contextProviders,
				
				// Form related properties
				control,
				errors,
				watch,
				
				// Model selection properties
				providerModelsData,
				isLoadingModels,
				isModelsError,
				modelsError,
				selectedModelId: selectedModelId || null,
				setSelectedModelId: (id: string | null) => {
					if (id !== null) {
						setSelectedModelId(id);
					}
				},
				handleModelSelect,
				
				onSubmit,
				onCancel,
				handleSubmit,
				handleTestConnection,
				setMode,
				closeDialog,
				openSaveDialog,
			}}
		>
			{children}
		</ProviderFormProvider>
	);
}
