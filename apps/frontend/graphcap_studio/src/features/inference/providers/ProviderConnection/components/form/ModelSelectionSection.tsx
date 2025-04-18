import { ActionButton } from "@/components/ui/buttons/ActionButton";
import { StatusMessage } from "@/components/ui/status/StatusMessage";
// SPDX-License-Identifier: Apache-2.0
import { Box, Heading, VStack } from "@chakra-ui/react";
import { useProviderFormContext } from "../../../context/ProviderFormContext";
import { ProviderModelActions } from "../actions/ProviderModelActions";
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
		provider,
		providerModels,
		selectedModelId,
		setSelectedModelId,
		isSubmitting,
		mode,
		watch,
	} = useProviderFormContext();

	const providerName = provider?.name;
	const isEditMode = mode === "edit" || mode === "create";
	const customModels = watch("models") || [];

	// Prepare an array with all models to display
	const allModels = [];
	
	// Always add custom/user-defined models
	if (customModels && customModels.length > 0) {
		// Map custom models to the format expected by the model selector
		for (const model of customModels) {
			// Generate a stable ID for custom models
			allModels.push({
				// Generate a stable ID for custom models
				id: `${model.name}`,
				name: model.name,
				is_default: provider?.defaultModel === model.name,
				isCustom: true
			});
		}
	}
	
	// Add API-fetched models
	if (providerModels && providerModels.length > 0) {
		// Map API models to the format expected by the model selector
		for (const model of providerModels) {
			// Only add if not already included in custom models
			if (!customModels.some(m => m.name === model.name)) {
				allModels.push({
					id: model.id,
					name: model.name,
					is_default: model.is_default,
					isApiModel: true
				});
			}
		}
	}

	// Handle different states
	if (!providerName) {
		return (
			<StatusMessage
				type="warning"
				message="Please enter a provider name to view available models."
			/>
		);
	}

	// When in edit mode, show model management section
	if (isEditMode) {
		return (
			<VStack align="stretch" gap={4}>
				<Box>
					<Heading size="md" mb={4}>Model Configuration</Heading>
					<ProviderModelActions />
				</Box>
				
				{allModels.length > 0 && (
					<Box pt={2}>
						<Heading size="sm" mb={3}>Default Model Selection</Heading>
						<ModelSelector
							modelItems={allModels.map(model => ({
								label: `${model.name}${model.is_default ? " (Default)" : ""}${model.isCustom ? " (Custom)" : ""}${model.isApiModel ? " (API)" : ""}`,
								value: model.id,
								id: model.id,
							}))}
							selectedModelId={selectedModelId}
							setSelectedModelId={setSelectedModelId}
						/>
					</Box>
				)}
			</VStack>
		);
	}

	// View mode
	if (allModels.length === 0) {
		return (
			<StatusMessage
				type="warning"
				title="No models available"
				message="This provider has no available models. Add custom models."
			/>
		);
	}

	// Convert all models to the format expected by SelectRoot
	const modelItems = allModels.map(model => ({
		label: `${model.name}${model.is_default ? " (Default)" : ""}${model.isCustom ? " (Custom)" : ""}${model.isApiModel ? " (API)" : ""}`,
		value: model.id,
		id: model.id,
	}));

	return (
		<Box>
			<ModelSelector
				modelItems={modelItems}
				selectedModelId={selectedModelId}
				setSelectedModelId={setSelectedModelId}
			/>

			<ActionButton
				onClick={() => console.log("Selected model:", selectedModelId)}
				disabled={!selectedModelId}
				isLoading={isSubmitting}
			/>
		</Box>
	);
}
