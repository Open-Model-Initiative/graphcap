import { useColorModeValue } from "@/components/ui/theme/color-mode";
// SPDX-License-Identifier: Apache-2.0
/**
 * MetadataSection Component
 *
 * Displays metadata information for a perspective, including provider, model, version, etc.
 */
import { Badge, Box, Heading, Stack, Text } from "@chakra-ui/react";

interface PerspectiveMetadata {
	readonly provider?: string;
	readonly model?: string;
	readonly version?: string;
	readonly config_name: string;
	readonly generatedAt: string | null;
}

interface MetadataSectionProps {
	readonly metadata: PerspectiveMetadata;
}

export function MetadataSection({ metadata }: MetadataSectionProps) {
	const labelColor = useColorModeValue("blue.600", "blue.300");
	const valueColor = useColorModeValue("gray.800", "gray.200");

	return (
		<Box>
			<Heading size="xs" mb={2} color={labelColor}>
				Perspective Metadata
			</Heading>
			<Stack direction="column" gap={1}>
				<MetadataItem
					label="Provider:"
					value={metadata.provider}
					labelColor={labelColor}
					valueColor={valueColor}
				/>
				<MetadataItem
					label="Model:"
					value={metadata.model}
					labelColor={labelColor}
					valueColor={valueColor}
				/>
				<MetadataItem
					label="Version:"
					value={metadata.version}
					labelColor={labelColor}
					valueColor={valueColor}
				/>
				<MetadataItem
					label="Config:"
					value={metadata.config_name}
					labelColor={labelColor}
					valueColor={valueColor}
				/>
				<MetadataItem
					label="Generated:"
					value={metadata.generatedAt}
					labelColor={labelColor}
					valueColor={valueColor}
				/>
			</Stack>
		</Box>
	);
}

interface MetadataItemProps {
	readonly label: string;
	readonly value?: string | null;
	readonly labelColor: string;
	readonly valueColor: string;
}

function MetadataItem({
	label,
	value,
	labelColor,
	valueColor,
}: MetadataItemProps) {
	// Format date if this is the Generated timestamp field
	const formattedValue = label === "Generated:" && value 
		? new Date(value).toLocaleString() 
		: value;

	return (
		<Box display="flex" justifyContent="space-between">
			<Text fontSize="xs" color={labelColor}>
				{label}
			</Text>
			{value ? (
				<Text fontSize="xs" color={valueColor}>
					{formattedValue}
				</Text>
			) : (
				<Badge colorScheme="red" fontSize="xs">
					MISSING
				</Badge>
			)}
		</Box>
	);
}
