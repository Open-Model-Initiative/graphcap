// SPDX-License-Identifier: Apache-2.0
/**
 * Model Selector Field Component
 *
 * This component provides controls for selecting a provider and model.
 */

import { Field } from "@/components/ui/field";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Box } from "@chakra-ui/react";
import { CompactModelSelector, CompactProviderSelector } from "../selectors/ModelProviderSelectors";

/**
 * Field component for selecting model and provider
 */	
export function ModelSelectorField() {
	// Color values for theming
	const labelColor = useColorModeValue("gray.700", "gray.300");
	const helperTextColor = useColorModeValue("gray.500", "gray.400");
	
	return (
		<Box w="full">
			<Box as="label" display="block" fontSize="xs" mb={1} color={labelColor}>
				Provider & Model
			</Box>

			<Box mb={3}>
				<Field label="Provider">
					<CompactProviderSelector
						size="sm"
						placeholder="Select provider"
					/>
				</Field>
			</Box>

			<Box mb={3}>
				<Field label="Model">
					<CompactModelSelector
						size="sm"
						placeholder="Select model"
					/>
				</Field>
			</Box>

			<Box fontSize="xs" mt={1} color={helperTextColor}>
				Select provider and model for generation
			</Box>
		</Box>
	);
}
