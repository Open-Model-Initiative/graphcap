// SPDX-License-Identifier: Apache-2.0
/**
 * Tag Field Component
 *
 * Component for rendering tag fields.
 */

import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { BaseField } from "./BaseField";
import { TagFieldProps } from "./types";

export const TagField: React.FC<TagFieldProps> = ({
	field,
	value,
	className,
}) => {
	if (!Array.isArray(value)) {
		return null;
	}

	return (
		<BaseField field={field} value={value} className={className}>
			<Flex flexWrap="wrap" gap="2">
				{value.map((tag, index) => (
					<Box
						key={`${tag}-${index}`}
						bg="gray.800"
						borderRadius="lg"
						p="1"
						borderWidth="1px"
						borderColor="gray.700"
						
					>
						<Text fontSize="xs">{tag}</Text>
					</Box>
				))}
			</Flex>
		</BaseField>
	);
};
