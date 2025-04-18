import { DEFAULT_PROVIDER_FORM_DATA } from "@/features/inference/constants";
import type { ConnectionDetails, ErrorDetails, Provider, ProviderCreate, ProviderUpdate } from "@/types/provider-config-types";
import { denormalizeProviderId, toServerConfig } from "@/types/provider-config-types";
import { useQueryClient } from '@tanstack/react-query';
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
	readonly children: ReactNode;
	readonly initialData?: Partial<ProviderCreate | ProviderUpdate>;
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
		onCancel: onContextCancel,
	} = useInferenceProviderContext();

	// State for the provider form
	const [mode, setMode] = useState(contextMode);
	const [provider, setProvider] = useState(contextSelectedProvider);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [dialog, setDialog] = useState<DialogType>(null);
	const [error, setError] = useState<ErrorDetails | null>(null);
	const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);

	// Get query client for cache invalidation
	const queryClient = useQueryClient();

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

	// Handle provider selection
	const handleProviderSelect = useCallback((newProvider: Provider | null) => {
		setProvider(newProvider);
		
		if (newProvider) {
			// Reset form with the selected provider's data instead of default data
			reset({
				name: newProvider.name,
				kind: newProvider.kind,
				environment: newProvider.environment,
				baseUrl: newProvider.baseUrl,
				apiKey: newProvider.apiKey ?? "",
				isEnabled: newProvider.isEnabled,
				defaultModel: newProvider.defaultModel,
				models: newProvider.models
			});
		} else {
			// Reset to default data if no provider is selected
			reset(DEFAULT_PROVIDER_FORM_DATA);
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
			
			let savedProvider: Provider | null = null;
			
			if (mode === "edit" && provider?.id) {
				savedProvider = await updateProvider.mutateAsync({
					id: denormalizeProviderId(provider.id),
					data: formData as ProviderUpdate
				});
			} else if (mode === "create") {
				// Create the provider
				savedProvider = await createProvider.mutateAsync(formData as ProviderCreate);
			}
			
			if (savedProvider) {
				setProvider(savedProvider);
			}
			
			await queryClient.invalidateQueries({ queryKey: ['providers'] });
			
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
		
		// When switching to create mode, reset the form to empty values
		if (newMode === "create") {
			reset({
				name: "",
				kind: "openai", // Default to the first provider kind
				environment: "cloud",
				baseUrl: "",
				apiKey: "",
				isEnabled: true,
				defaultModel: "",
				models: []
			});
		}
	}, [setContextMode, reset]);

	// Handle model selection with proper type handling
	const handleSetSelectedModelId = useCallback((id: string | null) => {
		if (id !== null) {
			setSelectedModelId(id);
		}
	}, [setSelectedModelId]);
	
	// Enhanced cancel handler to properly reset the form
	const handleCancel = useCallback(() => {
		// Reset the form data to the original provider values
		if (provider) {
			reset({
				name: provider.name,
				kind: provider.kind,
				environment: provider.environment,
				baseUrl: provider.baseUrl,
				apiKey: provider.apiKey ?? "",
				isEnabled: provider.isEnabled,
				defaultModel: provider.defaultModel,
				models: provider.models
			});
		}
		
		// Switch mode back to view
		setMode("view");
		setContextMode("view");
		
		// Call the parent context cancel if provided
		onContextCancel();
	}, [provider, reset, setContextMode, onContextCancel]);

	// Provide context value to ProviderFormContext
	const providerFormValue = {
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
		providerModels: provider?.models || null,
		
		// Actions
		setProvider: handleProviderSelect,
		setMode: handleSetMode,
		setSelectedModelId: handleSetSelectedModelId,
		openDialog,
		closeDialog,
		
		// Form actions
		handleSubmit,
		cancelEdit: handleCancel,
		testConnection: testProviderConnection
	};

	return (
		<ProviderFormProvider
			value={providerFormValue}
		>
			{children}
		</ProviderFormProvider>
	);
}
