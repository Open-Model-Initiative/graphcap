// SPDX-License-Identifier: Apache-2.0
/**
 * Edge Field Component
 *
 * Component for rendering edge fields.
 */

import { Badge, Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import React from "react";
import { BaseField } from "./BaseField";
import { EdgeFieldProps } from "./types";

export const EdgeField: React.FC<EdgeFieldProps> = ({
	field,
	value,
	className,
}) => {
	if (!value || typeof value !== "object") {
		return null;
	}

	const { source, target, type, ...rest } = value;

	return (
		<BaseField field={field} value={value} className={className}>
			<Box
				bg="gray.800"
				borderRadius="lg"
				p="3"
				borderWidth="1px"
				borderColor="gray.700"
			>
				<Flex alignItems="center" gap="2" mb="2">
					<Text fontSize="sm" fontWeight="medium" color="gray.200">
						{source}
					</Text>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
					<Text fontSize="sm" fontWeight="medium" color="gray.200">
						{target}
					</Text>
					{type && (
						<Badge
							bg="gray.700"
							color="gray.400"
							borderRadius="full"
							px="2"
							py="0.5"
							fontSize="xs"
							ml="2"
						>
							{type}
						</Badge>
					)}
				</Flex>
				{Object.entries(rest).length > 0 && (
					<Box mt="2" pt="2" borderTopWidth="1px" borderColor="gray.700">
						<Grid templateColumns="repeat(2, 1fr)" gap="2">
							{Object.entries(rest).map(([key, val]) => (
								<GridItem key={key}>
									<Text fontSize="xs">
										<Text as="span" color="gray.400">
											{key}:{" "}
										</Text>
										<Text as="span" color="gray.300">
											{typeof val === "object"
												? JSON.stringify(val)
												: String(val)}
										</Text>
									</Text>
								</GridItem>
							))}
						</Grid>
					</Box>
				)}
			</Box>
		</BaseField>
	);
};
