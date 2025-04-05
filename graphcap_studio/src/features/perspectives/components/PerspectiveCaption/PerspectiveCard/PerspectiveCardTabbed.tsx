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
import { CopyFieldsComboButton } from "./copy-fields";

// Define a type for perspective data metadata
interface PerspectiveMetadata {
	generatedAt?: string;
	timestamp?: string;
	[key: string]: unknown;
}

export interface PerspectiveCardTabbedProps {
	readonly schema: PerspectiveSchema;
	readonly data: Record<string, unknown> | null;
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

	// Extract and format the timestamp safely
	const timestamp = (() => {
		const metadata = data?.metadata as PerspectiveMetadata | undefined;
		const dateStr = metadata?.generatedAt ?? metadata?.timestamp;

		if (!dateStr) {
			return '';
		}

		try {
			// dateStr is guaranteed to be a string here
			return new Date(dateStr).toLocaleString();
		} catch (e) {
			console.error("Error formatting perspective timestamp:", e); // Log error
			return '';
		}
	})();

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
			height="100%"
			maxHeight="100%"
		>
			<Box flexShrink={0} flexGrow={1} display="flex" flexDirection="column" height="90%">
				<Tabs.Root
					defaultValue={"caption"}
					variant="enclosed"
					colorScheme="blue"
					onClick={(e) => e.stopPropagation()}
					display="flex"
					flexDirection="column"
					height="100%"
				>
					<Tabs.List
						bg={useColorModeValue("gray.100", "gray.700")}
						width="100%"
						flexShrink={0}
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
						flex="1"
						minHeight="0"
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
						{timestamp}
					</Text>
					{/* Replace the ClipboardButton with our new CopyFieldsComboButton */}
					{data && (
						<CopyFieldsComboButton
							schema={schema}
							data={data}
							size="xs"
						/>
					)}
				</Stack>
			</Card.Footer>
		</Card.Root>
	);
}
