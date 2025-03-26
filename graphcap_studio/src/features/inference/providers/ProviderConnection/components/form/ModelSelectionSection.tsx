import { ActionButton } from "@/components/ui/buttons/ActionButton";
import { StatusMessage } from "@/components/ui/status/StatusMessage";
// SPDX-License-Identifier: Apache-2.0
import { Box } from "@chakra-ui/react";
import { useProviderFormContext } from "../../../context/ProviderFormContext";
import { ModelSelector } from "./ModelSelector";

// Define the model type
export interface ProviderModel {
	id: string;
	name: string;
	is_default?: boolean;
}

/**
 * Component for selecting a model from a provider
 */
export function ModelSelectionSection() {
	const {
		selectedProvider,
		providerModelsData,
		isLoadingModels,
		isModelsError,
		modelsError,
		selectedModelId,
		setSelectedModelId,
		handleModelSelect,
		isSubmitting,
	} = useProviderFormContext();

	const providerName = selectedProvider?.name;

	// Handle different states
	if (!providerName) {
		return (
			<StatusMessage
				type="warning"
				message="Please enter a provider name to view available models."
			/>
		);
	}

	if (isLoadingModels) {
		return <StatusMessage type="loading" message="Loading models..." />;
	}

	if (isModelsError) {
		return (
			<StatusMessage
				type="error"
				title="Error loading models"
				message={
					modelsError instanceof Error ? modelsError.message : "Unknown error"
				}
			/>
		);
	}

	if (!providerModelsData?.models || providerModelsData.models.length === 0) {
		return (
			<StatusMessage
				type="error"
				title="No models available"
				message="This provider has no available models."
			/>
		);
	}

	// Convert models to the format expected by SelectRoot
	const modelItems = providerModelsData.models.map((model: ProviderModel) => ({
		label: `${model.name}${model.is_default ? " (Default)" : ""}`,
		value: model.id,
	}));

	return (
		<Box>
			<ModelSelector
				modelItems={modelItems}
				selectedModelId={selectedModelId}
				setSelectedModelId={setSelectedModelId}
			/>

			<ActionButton
				onClick={handleModelSelect}
				disabled={!selectedModelId}
				isLoading={isSubmitting}
			/>
		</Box>
	);
}
