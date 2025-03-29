import type { ConnectionDetails, ErrorDetails, Provider, ProviderCreate, ProviderUpdate } from "@/types/provider-config-types";
import { denormalizeProviderId, toServerConfig } from "@/types/provider-config-types";
// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateProvider, useProviders, useTestProviderConnection, useUpdateProvider } from "../../../services/providers";
import { useInferenceProviderContext } from "../../context/InferenceProviderContext";
import { ProviderFormProvider } from "../../context/ProviderFormContext";

// Simplified dialog state type
type DialogType = null | "error" | "success" | "formError" | "save";

interface ProviderFormContainerProps {
	children: ReactNode;
	initialData?: Partial<ProviderCreate | ProviderUpdate>;
}

export function ProviderFormContainer({
	children,
	initialData,
}: ProviderFormContainerProps) {
	// Get required context from parent
	const {
		mode: contextMode,
		setMode: setContextMode,
		selectedProvider: contextSelectedProvider,
		selectedModelId,
		setSelectedModelId,
		providerModelsData,
		isLoadingModels,
		onCancel: onContextCancel,
	} = useInferenceProviderContext();

	// State for the provider form
	const [mode, setMode] = useState(contextMode);
	const [provider, setProvider] = useState(contextSelectedProvider);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [dialog, setDialog] = useState<DialogType>(null);
	const [error, setError] = useState<ErrorDetails | null>(null);
	const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);

	// Form setup
	const { 
		control, 
		handleSubmit: formHandleSubmit, 
		formState: { errors },
		watch,
		reset 
	} = useForm<ProviderCreate | ProviderUpdate>({
		defaultValues: initialData || provider || {},
	});

	// API hooks
	useProviders();
	const testConnection = useTestProviderConnection();
	const createProvider = useCreateProvider();
	const updateProvider = useUpdateProvider();

	// Use either API providers or context providers

	// Handle provider selection
	const handleProviderSelect = useCallback((newProvider: Provider | null) => {
		setProvider(newProvider);
		
		if (newProvider) {
			// Reset form with provider data
			reset({
				name: newProvider.name,
				kind: newProvider.kind,
				environment: newProvider.environment,
				baseUrl: newProvider.baseUrl,
				apiKey: newProvider.apiKey || "",
				isEnabled: newProvider.isEnabled,
				defaultModel: newProvider.defaultModel,
				models: newProvider.models,
				rateLimits: newProvider.rateLimits || { requestsPerMinute: 0, tokensPerMinute: 0 }
			});
		}
	}, [reset]);

	// Dialog handlers
	const openDialog = useCallback((type: DialogType, newError?: ErrorDetails) => {
		setDialog(type);
		if (newError) setError(newError);
	}, []);

	const closeDialog = useCallback(() => {
		setDialog(null);
	}, []);

	// Form submission
	const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
		// If an event was provided, prevent default
		if (e) {
			e.preventDefault();
		}
		
		try {
			setIsSubmitting(true);
			setError(null);
			
			// Use formHandleSubmit to get data from the form
			const formData = await new Promise<ProviderCreate | ProviderUpdate>((resolve) => {
				formHandleSubmit((data) => {
					resolve(data);
				})(e);
			});
			
			if (mode === "edit" && provider?.id) {
				await updateProvider.mutateAsync({
					id: denormalizeProviderId(provider.id),
					data: formData as ProviderUpdate
				});
			} else if (mode === "create") {
				await createProvider.mutateAsync(formData as ProviderCreate);
			}
			
			openDialog("success");
			setMode("view");
			setContextMode("view");
			
		} catch (err) {
			console.error("Provider form submission error:", err);
			const errorDetails: ErrorDetails = err instanceof Error 
				? { message: err.message, code: err.name, details: { error: err.toString() } }
				: { message: String(err), details: { error } };
			
			setError(errorDetails);
			openDialog("formError");
			
			// Re-throw the error so the caller knows something went wrong
			throw err;
		} finally {
			setIsSubmitting(false);
		}
	};

	// Connection test
	const testProviderConnection = async () => {
		if (!provider) return;
		
		if (!provider.apiKey) {
			setError({
				message: "API key is required",
				code: "ValidationError",
				details: { message: "API key is required" }
			});
			openDialog("error");
			return;
		}

		try {
			setIsSubmitting(true);
			setError(null);
			
			const config = toServerConfig(provider);
			const result = await testConnection.mutateAsync({
				providerName: provider.name,
				config,
			});

			setConnectionDetails(result);
			openDialog("success");
		} catch (err) {
			console.error("Connection test failed:", err);
			
			const errorDetails: ErrorDetails = err instanceof Error 
				? { message: err.message, code: err.name, details: { error: err.toString() } }
				: { message: String(err), details: { error } };
			
			setError(errorDetails);
			openDialog("error");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Update mode in both local and context state
	const handleSetMode = useCallback((newMode: "view" | "edit" | "create") => {
		setMode(newMode);
		setContextMode(newMode);
	}, [setContextMode]);

	// Handle model selection with proper type handling
	const handleSetSelectedModelId = useCallback((id: string | null) => {
		if (id !== null) {
			setSelectedModelId(id);
		}
	}, [setSelectedModelId]);

	return (
		<ProviderFormProvider
			value={{
				// Core state
				provider,
				mode,
				
				// Form state
				control,
				errors,
				watch,
				
				// UI state
				isSubmitting,
				dialog,
				error,
				connectionDetails,
				
				// Selected model state
				selectedModelId,
				providerModels: providerModelsData?.models || null,
				isLoadingModels,
				
				// Actions
				setProvider: handleProviderSelect,
				setMode: handleSetMode,
				setSelectedModelId: handleSetSelectedModelId,
				openDialog,
				closeDialog,
				
				// Form actions
				handleSubmit,
				cancelEdit: onContextCancel,
				testConnection: testProviderConnection,
			}}
		>
			{children}
		</ProviderFormProvider>
	);
}
