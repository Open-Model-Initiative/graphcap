import { useColorModeValue } from "@/components/ui/theme/color-mode";
// SPDX-License-Identifier: Apache-2.0
/**
 * Separator Component
 *
 * A simple horizontal line separator for visual separation between sections.
 */
import { Box } from "@chakra-ui/react";

export function Separator() {
	const borderColor = useColorModeValue("gray.200", "gray.700");

	return <Box height="1px" bg={borderColor} my={1} />;
}
