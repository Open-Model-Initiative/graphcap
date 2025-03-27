// SPDX-License-Identifier: Apache-2.0
/**
 * Model Selector Field Component
 *
 * This component provides controls for selecting a provider and model.
 */

import { Field } from "@/components/ui/field";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { useProviderModelSelection } from "@/features/inference/hooks";
import { useInferenceProviderContext } from "@/features/inference/providers/context/InferenceProviderContext";
import { Box } from "@chakra-ui/react";
import { Portal, Select, createListCollection } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import { useGenerationOptions } from "../../context";

/**
 * Field component for selecting model and provider
 */	
export function ModelSelectorField() {
	const { options, updateOption, isGenerating } = useGenerationOptions();
	const { providers: contextProviders } = useInferenceProviderContext();

	// Extract provider from context
	const currentProvider = useMemo(() => {
		if (!options.provider_id) return null;
		const providerId = Number.parseInt(options.provider_id, 10);
		return contextProviders.find(p => p.id === providerId) || null;
	}, [contextProviders, options.provider_id]);

	// Use the hook to get providers and models
	const {
		providers,
		models,
		isLoading,
	} = useProviderModelSelection(currentProvider);

	// Color values f or theming
	const labelColor = useColorModeValue("gray.700", "gray.300");
	const helperTextColor = useColorModeValue("gray.500", "gray.400");

	// Initialize provider if needed
	useEffect(() => {
		if (providers.length > 0 && !options.provider_id) {
			const provider = providers[0];
			updateOption("provider_id", provider.id.toString());
		}
	}, [providers, options.provider_id, updateOption]);

	// Update model when provider changes or when models are loaded
	useEffect(() => {
		if (models.length > 0 && !options.model_id) {
			updateOption("model_id", models[0]?.name || "");
		}
	}, [models, options.model_id, updateOption]);

	// Create collections for selects - always include at least one item
	const providerCollection = useMemo(() => {
		const items = providers.length > 0
			? providers.map((provider) => ({
				label: provider.name,
				value: provider.id.toString(),
				disabled: false,
			}))
			: [{ label: "No providers available", value: "none", disabled: false }];

		return createListCollection({ items });
	}, [providers]);

	const modelCollection = useMemo(() => {
		const items = models.length > 0
			? models.map((model) => ({
				label: model.name,
				value: model.id,
				disabled: false,
			}))
			: [{ label: "No models available", value: "none", disabled: false }];

		return createListCollection({ items });
	}, [models]);

	// Handle provider change
	const handleProviderChange = useCallback((newValue: string[]) => {
		if (newValue.length > 0 && newValue[0] !== "none") {
			const providerId = newValue[0];
			updateOption("provider_id", providerId);
			updateOption("model_id", "");
		}
	}, [updateOption]);

	// Handle model change
	const handleModelChange = useCallback((newValue: string[]) => {
		if (newValue.length > 0 && newValue[0] !== "none") {
			updateOption("model_id", newValue[0]);
		}
	}, [updateOption]);

	console.log('Providers:', providers);
	console.log('IsLoading:', isLoading);
	console.log('CurrentProvider:', currentProvider);

	return (
		<Box w="full">
			<Box as="label" display="block" fontSize="xs" mb={1} color={labelColor}>
				Provider & Model
			</Box>

			<Box mb={2}>
				<Field label="Provider">
					<Select.Root
						collection={providerCollection}
						value={options.provider_id ? [options.provider_id] : []}
						onValueChange={(e) => handleProviderChange(e.value)}
						disabled={false} // Never disable this
						size="sm"
					>
						<Select.HiddenSelect />
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText placeholder="Click to select provider" />
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

			<Box>
				<Field label="Model">
					<Select.Root
						collection={modelCollection}
						value={options.model_id ? [options.model_id] : []}
						onValueChange={(e) => handleModelChange(e.value)}
						disabled={false} // Never disable this
						size="sm"
					>
						<Select.HiddenSelect />
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText placeholder="Click to select model" />
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
				Click on the dropdowns to select provider and model
			</Box>
		</Box>
	);
}
