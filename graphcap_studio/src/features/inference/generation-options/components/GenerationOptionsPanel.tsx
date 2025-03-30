// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Panel
 *
 * This component displays generation options in the left action drawer.
 */

import { Box, Button, VStack } from "@chakra-ui/react";
import { useGenerationOptions } from "../context";
import {
	GlobalContextField,
	MaxTokensField,
	ModelSelectorField,
	RepetitionPenaltyField,
	ResizeResolutionField,
	TemperatureField,
	TopPField,
} from "./fields";

/**
 * Panel component for generation options in the left action drawer
 */
export function GenerationOptionsPanel() {
	const { actions, uiState } = useGenerationOptions();
	const { resetOptions } = actions;
	const { isGenerating } = uiState;

	return (
		<VStack gap={4} align="stretch" p={3}>
			<GlobalContextField />
			
			<VStack gap={3} align="stretch">
				<TemperatureField />
				<MaxTokensField />
				<TopPField />
				<RepetitionPenaltyField />
				<ResizeResolutionField />
				<ModelSelectorField />
			</VStack>
			
			<Box pt={2}>
				<Button
					variant="outline"
					size="sm"
					onClick={resetOptions}
					disabled={isGenerating}
					width="full"
				>
					Reset to Defaults
				</Button>
			</Box>
		</VStack>
	);
} 