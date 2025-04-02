// SPDX-License-Identifier: Apache-2.0
/**
 * Base Field Component
 *
 * Base component for rendering schema fields.
 */

import { ClipboardButton } from "@/features/clipboard";
// Import common formatters from the clipboard feature
import {
	formatArrayAsList,
	formatEdge,
	formatNodeLabel,
	isEdge,
	isNode,
} from "@/features/clipboard/clipboardFormatters";
import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { BaseFieldProps } from "./types";

export const BaseField: React.FC<BaseFieldProps> = ({
	field,
	value,
	className = "",
	children,
}) => {
	// Determine the specific formatter to use, if any
	let specificFormatter: ((data: any) => string) | undefined = undefined;

	if (field.is_list || Array.isArray(value)) {
		// Use formatArrayAsList for all arrays now, it handles subtypes internally
		specificFormatter = formatArrayAsList;
	} else if (isNode(value)) {
		specificFormatter = formatNodeLabel;
	} else if (isEdge(value)) {
		specificFormatter = formatEdge;
	}

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
						content={value} 
						formatValue={specificFormatter}
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
