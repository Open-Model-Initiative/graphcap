// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateProvider, useProviders, useTestProviderConnection, useUpdateProvider } from "../../../services/providers";
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
}: ProviderFormContainerProps) {
	// Get model selection and provider state from the InferenceProviderContext
	const {
		mode,
		setMode,
		selectedProvider,
		setSelectedProvider,
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
	// Add hooks for creating and updating providers
	const createProvider = useCreateProvider();
	const updateProvider = useUpdateProvider();

	const handleSelectProvider = (provider: Provider | null) => {
		setSelectedProvider(provider);
		
		// If a provider is selected, reset the form with its data
		if (provider) {
			// Debug log to check if API key is present
			console.log("Provider selected for edit:", {
				...provider,
				apiKey: provider.apiKey ? "[PRESENT]" : "[MISSING]"
			});
			
			// Reset the form with the selected provider's data
			const providerData: ProviderUpdate = {
				name: provider.name,
				kind: provider.kind,
				environment: provider.environment,
				baseUrl: provider.baseUrl,
				apiKey: provider.apiKey || "", // Ensure apiKey is included and not null/undefined
				isEnabled: provider.isEnabled,
				defaultModel: provider.defaultModel,
				fetchModels: provider.fetchModels,
				models: provider.models,
				rateLimits: provider.rateLimits || { requestsPerMinute: 0, tokensPerMinute: 0 }
			};
			
			// Log the data being used to reset the form
			console.log("Resetting form with:", {
				...providerData,
				apiKey: providerData.apiKey ? "[PRESENT]" : "[MISSING]"
			});
			
			reset(providerData);
		}
	};

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
			
			if (mode === "edit" && selectedProvider?.id) {
				// Update existing provider
				await updateProvider.mutateAsync({
					id: selectedProvider.id,
					data: data as ProviderUpdate
				});
			} else if (mode === "create") {
				// Create new provider
				await createProvider.mutateAsync(data as ProviderCreate);
			} else {

			}
			
			setSaveSuccess(true);
			openSaveDialog();
			
			// Switch back to view mode after successful save
			setMode("view");
			
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

	// Handle cancel - use context's cancel handler
	const onCancel = useCallback(() => {
		onContextCancel();
	}, [onContextCancel]);

	// Handle test connection
	const handleTestConnection = async () => {
		if (!selectedProvider) return;

		// Validate API key is present
		if (!selectedProvider.apiKey) {
			setConnectionError({
				message: "API key is required",
				code: "ValidationError",
				details: {
					title: "Connection failed",
					timestamp: new Date().toISOString(),
					message: "API key is required",
					name: "ValidationError",
					details: "Please provide an API key in the provider configuration.",
					suggestions: [
						"Edit the provider to add an API key",
						"API keys should be non-empty strings",
					],
				}
			});
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

			let errorObj: ErrorDetails = {
				message: "Connection failed",
				code: "ConnectionError",
				details: {
					title: "Connection failed",
					timestamp: new Date().toISOString(),
				}
			};

			if (error instanceof Error) {
				errorObj.message = error.message;
				errorObj.code = error.name;

				if (error.message?.includes("[object Object]")) {
					errorObj.message = "Invalid provider configuration";
					errorObj.details = {
						...errorObj.details,
						details: "The server rejected the request due to invalid parameters.",
						suggestions: [
							"Check API key and endpoint URL",
							"Verify the provider is correctly configured",
							"Check server logs for more details",
						]
					};
				}

				const errorWithCause = error as ErrorWithCause;
				if ('cause' in error && errorWithCause.cause !== undefined) {
					errorObj.details = {
						...errorObj.details,
						cause: errorWithCause.cause
					};
				}
			} else if (typeof error === "object" && error !== null) {
				errorObj = {
					...errorObj,
					...(error as ErrorDetails),
				};
			} else {
				errorObj.message = String(error);
			}

			setConnectionError(errorObj);
			setDialogs(prev => ({ ...prev, error: true }));
		} finally {
			setIsTestingConnection(false);
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

	return (
		<ProviderFormProvider
			value={{
				mode,
				isSubmitting,
				isCreating: mode === "create",
				saveSuccess,
				isTestingConnection,
				selectedProvider,
				setSelectedProvider: handleSelectProvider,
				formError,
				connectionError,
				connectionDetails,
				dialogs,
				saveError: undefined,
				savedProvider: null,
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
