import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Badge, Box, Heading, Stack, Text } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
/**
 * DataStatistics Component
 *
 * Displays data statistics for a perspective, including data type, content type, and keys.
 */
import React from "react";

interface DataStats {
	readonly dataType: string;
	readonly contentType: string | null;
	readonly dataKeys: string[];
	readonly contentKeys: string[];
}

interface DataStatisticsProps {
	readonly stats: DataStats;
}

export function DataStatistics({ stats }: DataStatisticsProps) {
	const labelColor = useColorModeValue("blue.600", "blue.300");
	const valueColor = useColorModeValue("gray.800", "gray.200");

	return (
		<Box>
			<Heading size="xs" mb={2} color={labelColor}>
				Data Information
			</Heading>
			<Stack direction="column" gap={1}>
				<DataItem
					label="Data Type:"
					value={stats.dataType}
					isBadge
					labelColor={labelColor}
					valueColor={valueColor}
				/>
				<DataItem
					label="Content Type:"
					value={stats.contentType || "MISSING"}
					isBadge
					labelColor={labelColor}
					valueColor={valueColor}
				/>
				<DataItem
					label="Top-level Keys:"
					value={stats.dataKeys.join(", ")}
					labelColor={labelColor}
					valueColor={valueColor}
				/>
				{stats.contentKeys.length > 0 && (
					<DataItem
						label="Content Keys:"
						value={stats.contentKeys.join(", ")}
						labelColor={labelColor}
						valueColor={valueColor}
					/>
				)}
			</Stack>
		</Box>
	);
}

interface DataItemProps {
	readonly label: string;
	readonly value: string;
	readonly isBadge?: boolean;
	readonly labelColor: string;
	readonly valueColor: string;
}

function DataItem({
	label,
	value,
	isBadge = false,
	labelColor,
	valueColor,
}: DataItemProps) {
	return (
		<Box display="flex" justifyContent="space-between">
			<Text fontSize="xs" color={labelColor}>
				{label}
			</Text>
			{isBadge ? (
				<Badge fontSize="xs">{value}</Badge>
			) : (
				<Text fontSize="xs" color={valueColor}>
					{value}
				</Text>
			)}
		</Box>
	);
}
