// SPDX-License-Identifier: Apache-2.0
/**
 * Empty Perspectives Component
 *
 * This component displays a message when no perspectives are available.
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Center, Icon, Stack, Text } from "@chakra-ui/react";
import { LuFileQuestion } from "react-icons/lu";

/**
 * Component for displaying when no perspectives are available
 */
export function EmptyPerspectives() {
	const textColor = useColorModeValue("gray.600", "gray.400");
	const iconColor = useColorModeValue("gray.400", "gray.600");

	return (
		<Center py={8}>
			<Stack direction="column" gap={2} align="center" textAlign="center">
				<Icon as={LuFileQuestion} boxSize={10} color={iconColor} />
				<Text fontWeight="medium" fontSize="sm">
					No perspectives available
				</Text>
				<Text fontSize="xs" color={textColor}>
					Perspectives will appear here when they are loaded
				</Text>
			</Stack>
		</Center>
	);
}
