import { useColorModeValue } from "@/components/ui/theme/color-mode";
// SPDX-License-Identifier: Apache-2.0
/**
 * MissingDataAlert Component
 *
 * Displays an alert when required data is missing from a perspective.
 */
import { Box, Text } from "@chakra-ui/react";

interface MissingDataAlertProps {
	readonly missingFields: string[];
}

export function MissingDataAlert({ missingFields }: MissingDataAlertProps) {
	const errorColor = useColorModeValue("red.500", "red.300");
	const errorBgColor = useColorModeValue("red.50", "red.900");

	if (missingFields.length === 0) return null;

	return (
		<Box
			p={3}
			bg={errorBgColor}
			borderRadius="md"
			borderLeft="4px solid"
			borderColor={errorColor}
		>
			<Text fontWeight="bold" fontSize="sm" color={errorColor}>
				Missing Required Data!
			</Text>
			<Text fontSize="xs" color={errorColor}>
				The following fields are missing: {missingFields.join(", ")}
			</Text>
		</Box>
	);
}
