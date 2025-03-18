import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Image } from "@/services/images";
// SPDX-License-Identifier: Apache-2.0
import { Box, Heading, Text } from "@chakra-ui/react";

interface FileInformationProps {
	readonly image: Image;
}

/**
 * Component for displaying file information
 */
export function FileInformation({ image }: FileInformationProps) {
	const bgColor = useColorModeValue("gray.50", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const labelColor = useColorModeValue("gray.600", "gray.400");
	const textColor = useColorModeValue("gray.800", "gray.200");

	return (
		<Box
			borderRadius="lg"
			bg={bgColor}
			p={4}
			shadow="sm"
			borderWidth="1px"
			borderColor={borderColor}
		>
			<Heading size="sm" mb={2} color={textColor}>
				File Information
			</Heading>
			<Box display="flex" flexDirection="column" gap={2}>
				<Box>
					<Text fontSize="sm" fontWeight="medium" color={labelColor}>
						Filename:
					</Text>
					<Text fontSize="sm" wordBreak="break-all" color={textColor}>
						{image.name}
					</Text>
				</Box>
				<Box>
					<Text fontSize="sm" fontWeight="medium" color={labelColor}>
						Path:
					</Text>
					<Text fontSize="sm" wordBreak="break-all" color={textColor}>
						{image.path}
					</Text>
				</Box>
				<Box>
					<Text fontSize="sm" fontWeight="medium" color={labelColor}>
						Directory:
					</Text>
					<Text fontSize="sm" wordBreak="break-all" color={textColor}>
						{image.directory}
					</Text>
				</Box>
			</Box>
		</Box>
	);
}
