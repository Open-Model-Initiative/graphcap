// SPDX-License-Identifier: Apache-2.0
import { Box, BoxProps, Heading, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface EmptyStateProps extends BoxProps {
	readonly title: string;
	readonly description?: string;
	readonly icon?: ReactNode;
	readonly children?: ReactNode;
}

/**
 * A component for displaying an empty state with an optional icon and description
 */
export function EmptyState({
	title,
	description,
	icon,
	children,
	...props
}: EmptyStateProps) {
	return (
		<Box textAlign="center" py={10} px={6} {...props}>
			{icon && (
				<Box display="inline-block" mb={4}>
					{icon}
				</Box>
			)}
			<VStack gap={3}>
				<Heading as="h2" size="lg">
					{title}
				</Heading>
				{description && <Text color="gray.500">{description}</Text>}
				{children}
			</VStack>
		</Box>
	);
}
