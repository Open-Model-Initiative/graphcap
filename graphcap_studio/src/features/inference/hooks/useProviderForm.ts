// SPDX-License-Identifier: Apache-2.0
import type {
	ProviderCreate,
	ProviderUpdate,
} from "@/features/inference/providers/types";
import {
	useCreateProvider,
	useUpdateProvider,
	useUpdateProviderApiKey,
} from "@/features/server-connections/services/providers";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { DEFAULT_PROVIDER_FORM_DATA } from "../constants";

type FormData = ProviderCreate | ProviderUpdate;

/**
 * Custom hook for managing provider form state and operations
 */
export function useProviderForm(initialData: Partial<FormData> = {}) {
	// Initialize react-hook-form with validation
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
		watch,
	} = useForm<FormData>({
		defaultValues: {
			...DEFAULT_PROVIDER_FORM_DATA,
			...initialData,
			// Ensure apiKey is always a string, never undefined
			apiKey: initialData.apiKey || '',
		},
		mode: "onBlur",
	});

	// Watch the provider name and other fields for use in UI
	const providerName = watch("name");
	const fetchModels = watch("fetchModels");
	const defaultModel = watch("defaultModel");

	// Mutations
	const createProvider = useCreateProvider();
	const updateProvider = useUpdateProvider();
	const updateApiKeyMutation = useUpdateProviderApiKey();

	// Update API key separately (needed because the server has a separate endpoint)
	const updateApiKey = useCallback(async (providerId: number, apiKey: string) => {
		if (!apiKey.trim()) {
			console.warn("Attempted to update with empty API key, skipping");
			return { success: false, error: "API key cannot be empty" };
		}
		
		try {
			await updateApiKeyMutation.mutateAsync({ id: providerId, apiKey });
			return { success: true };
		} catch (error) {
			console.error("Error updating API key:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}, [updateApiKeyMutation]);

	// Handle form submission
	const onSubmit = useCallback(
		async (data: FormData, isCreating: boolean, providerId?: number) => {
			try {
				// For create, we need all required fields
				if (isCreating) {
					// Ensure required fields are present
					if (!data.name || !data.kind || !data.environment || !data.baseUrl) {
						throw new Error("Missing required fields");
					}
					
					// For create, we need the API key in the initial request
					await createProvider.mutateAsync(data as ProviderCreate);
				} else if (providerId) {
					// For update, we only need the fields that changed
					// apiKey should be handled separately
					const { apiKey, ...updateData } = data;
					
					await updateProvider.mutateAsync({
						id: providerId,
						data: updateData as ProviderUpdate,
					});
					
					// If apiKey is provided and not empty, update it separately
					if (apiKey && apiKey.trim() !== '') {
						await updateApiKey(providerId, apiKey);
					}
				}
				
				reset(DEFAULT_PROVIDER_FORM_DATA);
				return { success: true };
			} catch (error) {
				console.error("Error submitting provider form:", error);
				
				// Propagate the error so it can be handled by the UI
				throw error;
			}
		},
		[createProvider, updateProvider, updateApiKey, reset],
	);

	return {
		// Form state
		control,
		handleSubmit,
		errors,
		watch,
		providerName,
		fetchModels,
		defaultModel,
		reset,

		// Form submission
		onSubmit,
		updateApiKey,

		// Loading state
		isSubmitting: createProvider.isPending || updateProvider.isPending || updateApiKeyMutation.isPending,
	};
}
