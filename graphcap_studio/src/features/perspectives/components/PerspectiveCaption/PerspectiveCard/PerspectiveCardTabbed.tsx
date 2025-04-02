import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { ClipboardButton } from "@/features/clipboard";
import type { PerspectiveSchema } from "@/types/perspective-types";
// SPDX-License-Identifier: Apache-2.0
/**
 * PerspectiveCardTabbed Component
 *
 * A card component for displaying a perspective with tabbed content for caption, prompt, and schema.
 * This component uses Chakra UI tabs for the tabbed interface.
 */
import { Box, Card, Stack, Tabs, Text } from "@chakra-ui/react";
import { CaptionTabContent } from "./CaptionTabContent";
import { PerspectiveDebug } from "./PerspectiveDebug";
import { SchemaView } from "./SchemaView";

// --- Add formatter unction here ---
const formatCaptionForClipboard = (
	data: Record<string, any> | null,
	schema: PerspectiveSchema | null,
): string => {
	if (!data?.content || !schema?.schema_fields) {
		return data?.content ? JSON.stringify(data.content, null, 2) : "";
	}
	const { content } = data;
	const schemaFields = schema.schema_fields;
	const parts: string[] = [];
	for (const field of schemaFields) {
		const key = field.name;
		const label = key;
		if (content.hasOwnProperty(key) && content[key] !== null && content[key] !== undefined) {
			const value = content[key];
			if (field.is_list && Array.isArray(value)) {
				parts.push(`${label}:\n- ${value.join("\n- ")}`);
			} else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
				parts.push(`${label}: ${value}`);
			} else if (typeof value === 'object') {
				parts.push(`${label}: ${JSON.stringify(value, null, 2)}`);
			}
		}
	}
	return parts.join("\n");
};
// -----------------------------------

export interface PerspectiveCardTabbedProps {
	readonly schema: PerspectiveSchema;
	readonly data: Record<string, any> | null;
	readonly isActive: boolean;
	readonly isGenerated: boolean;
	readonly onSetActive: () => void;
	readonly className?: string;
}

/**
 * Card component for displaying a perspective with tabbed controls
 */
export function PerspectiveCardTabbed({
	schema,
	data,
	isActive,
	isGenerated,
	onSetActive,
	className = "",
}: PerspectiveCardTabbedProps) {
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const mutedTextColor = useColorModeValue("gray.600", "gray.400");

	const activeBorderColor = useColorModeValue("blue.500", "blue.400");

	return (
		<Card.Root
			variant="outline"
			borderColor={isActive ? activeBorderColor : borderColor}
			borderWidth="1px"
			borderLeftWidth={isActive ? "4px" : "1px"}
			overflow="hidden"
			className={className}
			onClick={onSetActive}
			cursor="pointer"
			transition="border-color 0.2s"
			_hover={{
				borderColor: isActive
					? activeBorderColor
					: useColorModeValue("gray.300", "gray.600"),
			}}
			display="flex"
			flexDirection="column"
			maxHeight="100%"
		>
			<Box flexShrink={0}>
				<Tabs.Root
					defaultValue={"caption"}
					variant="enclosed"
					colorScheme="blue"
					onClick={(e) => e.stopPropagation()}
				>
					<Tabs.List
						bg={useColorModeValue("gray.100", "gray.700")}
						width="100%"
					>
						<Tabs.Trigger value="caption" disabled={!isGenerated}>
							Caption
						</Tabs.Trigger>
						<Tabs.Trigger value="prompt">Prompt</Tabs.Trigger>
						<Tabs.Trigger value="schema">Schema</Tabs.Trigger>
						<Tabs.Trigger value="debug">Debug</Tabs.Trigger>
						<Tabs.Indicator />
					</Tabs.List>

					<Box
						bg={useColorModeValue("white", "gray.900")}
						p={2}
						overflow="auto"
						minHeight="150px"
						maxHeight="415px"
					>
						{/* Caption Tab */}
						<Tabs.Content value="caption">
							<CaptionTabContent data={data} schema={schema} />
						</Tabs.Content>

						{/* Prompt Tab */}
						<Tabs.Content value="prompt">
							<Box position="relative">
								<Box position="absolute" top="0" right="0" zIndex="1">
									<ClipboardButton
										content={schema.prompt}
										label="Copy prompt to clipboard"
										size="xs"
										iconOnly
									/>
								</Box>
								<Box
									whiteSpace="pre-wrap"
									fontSize="sm"
									p={1}
									bg={useColorModeValue("gray.50", "gray.800")}
									borderRadius="md"
								>
									{schema.prompt}
								</Box>
							</Box>
						</Tabs.Content>

						{/* Schema Tab */}
						<Tabs.Content value="schema">
							<Box position="relative">
								<Box position="absolute" top="0" right="0" zIndex="1">
									<ClipboardButton
										content={schema}
										label="Copy schema to clipboard"
										size="xs"
										iconOnly
									/>
								</Box>
								<SchemaView schema={schema} />
							</Box>
						</Tabs.Content>

						{/* Debug Tab */}
						<Tabs.Content value="debug">
							<PerspectiveDebug data={data} schema={schema} />
						</Tabs.Content>
					</Box>
				</Tabs.Root>
			</Box>

			<Card.Footer
				bg={useColorModeValue("gray.50", "gray.800")}
				p={2}
				borderTop="1px"
				borderColor={borderColor}
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				onClick={(e) => e.stopPropagation()}
				flexShrink={0}
			>
				{/* Left side: Generation status */}
				<Stack direction="row" gap={2} align="center">
					{isGenerated ? (
						<Text fontSize="xs" color={mutedTextColor}>
							Generated from {schema.name}
						</Text>
					) : (
						<Text fontSize="xs" fontStyle="italic" color={mutedTextColor}>
							Not generated yet
						</Text>
					)}
				</Stack>

				{/* Right side: Timestamp and Copy Button */}
				<Stack direction="row" gap={2} align="center">
					<Text fontSize="xs" color={mutedTextColor}>
						{data?.metadata?.generatedAt || data?.metadata?.timestamp ?
							new Date(data?.metadata?.generatedAt || data?.metadata?.timestamp || '').toLocaleString() :
							''}
					</Text>
					{/* Add Copy Button here, only if data exists */}
					{data && (
						<ClipboardButton
							content={data}
							formatValue={(d) => formatCaptionForClipboard(d, schema)}
							label="Copy formatted caption to clipboard"
							buttonText="Copy Fields"
							size="xs"
						/>
					)}
				</Stack>
			</Card.Footer>
		</Card.Root>
	);
}
