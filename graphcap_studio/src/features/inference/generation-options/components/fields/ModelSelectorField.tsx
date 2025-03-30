// SPDX-License-Identifier: Apache-2.0
/**
 * Model Selector Field Component
 *
 * This component provides controls for selecting a provider and model.
 */

import { Field } from "@/components/ui/field";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Box, Portal, Select, createListCollection } from "@chakra-ui/react";
import { useGenerationOptions } from "../../context";

/**
 * Field component for selecting model and provider
 */	
export function ModelSelectorField() {
	const { 
		options, 
		providers, 
		models,
		actions,
		uiState
	} = useGenerationOptions();
	
	const { selectProvider, selectModel } = actions;
	const { isGenerating } = uiState;

	// Color values for theming
	const labelColor = useColorModeValue("gray.700", "gray.300");
	const helperTextColor = useColorModeValue("gray.500", "gray.400");

	// Create collections for selects - always include at least one item
	const providerCollection = createListCollection({
		items: providers.items.length > 0
			? providers.items.map((provider) => ({
				label: provider.name,
				value: provider.id,
				disabled: false,
			}))
			: [{ label: "No providers available", value: "none", disabled: false }]
	});

	// Create model collection using names as both label and value
	const modelCollection = createListCollection({
		items: models.items.length > 0
			? models.items.map((model) => ({
				label: model.name,
				value: model.name,
				disabled: false,
			}))
			: [{ label: "No models available", value: "none", disabled: false }]
	});

	// Handle provider change
	const handleProviderChange = (details: { value: string[] }) => {
		if (details.value.length > 0 && details.value[0] !== "none") {
			selectProvider(details.value[0]);
		}
	};

	// Handle model change
	const handleModelChange = (details: { value: string[] }) => {
		if (details.value.length > 0 && details.value[0] !== "none") {
			selectModel(details.value[0]);
		}
	};

	// Check if any providers are available
	const hasProviders = providers.items.length > 0;
	
	// Check if any models are available for the selected provider
	
	// Loading state
	const isProvidersLoading = providers.isLoading;
	const isModelsLoading = models.isLoading;
	
	return (
		<Box w="full">
			<Box as="label" display="block" fontSize="xs" mb={1} color={labelColor}>
				Provider & Model
			</Box>

			<Box mb={3}>
				<Field label="Provider">
					<Select.Root
						collection={providerCollection}
						value={options.provider_id ? [options.provider_id] : []}
						onValueChange={handleProviderChange}
						disabled={isProvidersLoading || isGenerating}
						size="sm"
					>
						<Select.HiddenSelect />
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText placeholder="Select provider" />
							</Select.Trigger>
							<Select.IndicatorGroup>
								<Select.Indicator />
							</Select.IndicatorGroup>
						</Select.Control>

						<Portal>
							<Select.Positioner>
								<Select.Content>
									{providerCollection.items.map((provider) => (
										<Select.Item key={provider.value} item={provider}>
											{provider.label}
											<Select.ItemIndicator />
										</Select.Item>
									))}
								</Select.Content>
							</Select.Positioner>
						</Portal>
					</Select.Root>
				</Field>
			</Box>

			<Box mb={3}>
				<Field label="Model">
					<Select.Root
						collection={modelCollection}
						value={options.model_id ? [options.model_id] : []}
						onValueChange={handleModelChange}
						disabled={isModelsLoading || !hasProviders || isGenerating}
						size="sm"
					>
						<Select.HiddenSelect />
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText placeholder="Select model" />
							</Select.Trigger>
							<Select.IndicatorGroup>
								<Select.Indicator />
							</Select.IndicatorGroup>
						</Select.Control>

						<Portal>
							<Select.Positioner>
								<Select.Content>
									{modelCollection.items.map((model) => (
										<Select.Item key={model.value} item={model}>
											{model.label}
											<Select.ItemIndicator />
										</Select.Item>
									))}
								</Select.Content>
							</Select.Positioner>
						</Portal>
					</Select.Root>
				</Field>
			</Box>

			<Box fontSize="xs" mt={1} color={helperTextColor}>
				Select provider and model for generation
			</Box>
		</Box>
	);
}
