// SPDX-License-Identifier: Apache-2.0
/**
 * Resize Resolution Field Component
 *
 * This component provides controls for adjusting the image resize resolution.
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { RESOLUTION_PRESETS } from "@/types/generation-option-types";
import { Box, HStack } from "@chakra-ui/react";
import { useGenerationOptions } from "../../context";

/**
 * Field component for adjusting image resize resolution
 */
export function ResizeResolutionField() {
	const { options, actions, uiState } = useGenerationOptions();
	const { updateOption } = actions;
	const { isGenerating } = uiState;

	// Color values for theming
	const labelColor = useColorModeValue("gray.700", "gray.300");
	const inputBgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");

	// Handle preset selection
	const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		updateOption("resize_resolution", value);
	};

	return (
		<Box w="full">
			<Box as="label" display="block" fontSize="xs" mb={1} color={labelColor}>
				Max Image Resolution
			</Box>
			<HStack>
				<Box
					as="select"
					size="xs"
					value={options.resize_resolution}
					onChange={handlePresetChange}
					bg={inputBgColor}
					borderColor={borderColor}
					disabled={isGenerating ? true : undefined}
					fontSize="xs"
					p={2}
					borderWidth="1px"
					borderRadius="md"
					width="full"
				>
					{Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => (
						<option key={key} value={preset.value}>
							{preset.label}
						</option>
					))}
				</Box>
			</HStack>
			<Box fontSize="xs" mt={1} color="gray.500">
				Resize images before sending to model. Choose "No Resize" to send
				original images.
			</Box>
		</Box>
	);
}
