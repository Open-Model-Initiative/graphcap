// SPDX-License-Identifier: Apache-2.0
/**
 * Base Field Component
 *
 * Base component for rendering schema fields.
 */

import { ClipboardButton } from "@/features/clipboard";
import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { formatValueForClipboard } from "./formatters";
import { BaseFieldProps } from "./types";

export const BaseField: React.FC<BaseFieldProps> = ({
	field,
	value,
	className = "",
	children,
}) => {
	// Format the value for clipboard copying
	const clipboardValue = formatValueForClipboard(value);

	return (
		<Box className={className} mb="4">
			<Flex alignItems="center" justifyContent="space-between" mb="1">
				<Flex alignItems="center" gap="2">
					<Text fontSize="sm" fontWeight="medium" color="gray.300">
						{field.name
							.split("_")
							.map(
								(word: string) => word.charAt(0).toUpperCase() + word.slice(1),
							)
							.join(" ")}
					</Text>
					<ClipboardButton
						content={clipboardValue}
						label="Copy field value"
						size="xs"
						variant="ghost"
						p="1"
						iconOnly
					/>
				</Flex>
				{field.type && (
					<Badge
						variant="subtle"
						colorScheme="gray"
						borderRadius="full"
						px="2"
						py="0.5"
						fontSize="xs"
					>
						{field.type as React.ReactNode}
						{field.is_list && " []"}
					</Badge>
				)}
			</Flex>
			{field.description && (
				<Text fontSize="xs" color="gray.400" mb="2">
					{field.description}
				</Text>
			)}
			<Box>{children}</Box>
		</Box>
	);
};
