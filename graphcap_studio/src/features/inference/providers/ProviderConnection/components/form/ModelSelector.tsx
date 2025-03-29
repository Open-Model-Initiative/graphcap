// SPDX-License-Identifier: Apache-2.0
import { ModelSelector as GenericModelSelector, ModelOption } from "@/components/common_inference/ModelSelector";
import { useColorMode } from "@/components/ui/theme/color-mode";
import { Box, Heading, Text } from "@chakra-ui/react";

export interface ModelItem {
	label: string;
	value: string;
}

export interface ModelSelectorProps {
	modelItems: ModelItem[];
	selectedModelId: string | null;
	setSelectedModelId: (id: string) => void;
}

/**
 * Component for selecting a model from a list
 */
export function ModelSelector({
	modelItems,
	selectedModelId,
	setSelectedModelId,
}: ModelSelectorProps) {
	const { colorMode } = useColorMode();
	const isDark = colorMode === "dark";

	const cardBg = isDark ? "gray.800" : "white";
	const borderColor = isDark ? "gray.700" : "gray.200";
	const headingColor = isDark ? "gray.100" : "gray.700";
	const labelColor = isDark ? "gray.300" : "gray.600";

	return (
		<Box
			bg={cardBg}
			borderWidth="1px"
			borderColor={borderColor}
			borderRadius="md"
			p={4}
			mb={4}
			boxShadow="sm"
		>
			<Heading as="h3" size="sm" mb={3} color={headingColor}>
				Model
			</Heading>
			<Text mb={2} fontSize="sm" color={labelColor}>
				Select a model to use with this provider
			</Text>
			<GenericModelSelector
				options={modelItems}
				value={selectedModelId}
				onChange={setSelectedModelId}
			/>
		</Box>
	);
}
