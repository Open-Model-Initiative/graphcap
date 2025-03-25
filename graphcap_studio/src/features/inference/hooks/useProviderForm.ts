// SPDX-License-Identifier: Apache-2.0
import type {
	ProviderCreate,
	ProviderUpdate,
} from "@/features/inference/providers/types";
import {
	useCreateProvider,
	useUpdateProvider,
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

	// Handle form submission
	const onSubmit = useCallback(
		async (data: FormData, isCreating: boolean, providerId?: number) => {
			try {
				// Ensure required fields are present
				if (!data.name || !data.kind || !data.environment || !data.baseUrl || !data.apiKey) {
					throw new Error("Missing required fields");
				}

				if (isCreating) {
					await createProvider.mutateAsync(data as ProviderCreate);
				} else if (providerId) {
					await updateProvider.mutateAsync({
						id: providerId,
						data: data as ProviderUpdate,
					});
				}
				reset(DEFAULT_PROVIDER_FORM_DATA);
				return { success: true };
			} catch (error) {
				return {
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},
		[createProvider, updateProvider, reset],
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

		// Loading state
		isSubmitting: createProvider.isPending || updateProvider.isPending,
	};
}
