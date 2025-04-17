// SPDX-License-Identifier: Apache-2.0
/**
 * CaptionTabContent Component
 *
 * Renders the content for the "Caption" tab within PerspectiveCardTabbed,
 * including a custom clipboard formatter and collapsible sections for each field.
 */
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { PerspectiveSchema } from "@/types/perspective-types";
import { Badge, Box, Collapsible, Flex, Stack, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { SchemaFieldFactory } from "./schema-fields/SchemaFieldFactory";

// --- Local Storage Utilities (Integrated here for demonstration) ---

const getStorageKey = (schemaId: string): string => `perspective-collapse-state-${schemaId}`;

const getPerspectiveCollapseStates = (schemaId: string): Record<string, boolean> => {
	if (typeof window === 'undefined') return {}; // Guard against SSR
	try {
		const storedState = localStorage.getItem(getStorageKey(schemaId));
		return storedState ? JSON.parse(storedState) : {};
	} catch (error) {
		console.error("Error reading collapse state from localStorage:", error);
		return {};
	}
};

const setPerspectiveCollapseState = (schemaId: string, fieldName: string, isExpanded: boolean): void => {
	if (typeof window === 'undefined') return; // Guard against SSR
	try {
		const currentState = getPerspectiveCollapseStates(schemaId);
		const newState = { ...currentState, [fieldName]: isExpanded };
		localStorage.setItem(getStorageKey(schemaId), JSON.stringify(newState));
	} catch (error) {
		console.error("Error saving collapse state to localStorage:", error);
	}
};

// --- Component Interfaces and Implementation ---

export interface CaptionTabContentProps {
	readonly schema: PerspectiveSchema;
	readonly data: Record<string, any> | null;
}

/**
 * Renders the content for the "Caption" tab within PerspectiveCardTabbed.
 */
export function CaptionTabContent({ schema, data }: CaptionTabContentProps) {
	const mutedTextColor = useColorModeValue("gray.600", "gray.400");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const triggerBg = useColorModeValue("gray.100", "gray.700");
	const triggerHoverBg = useColorModeValue("gray.200", "gray.600");

	// State to manage collapse states, initialized from localStorage
	const [collapseStates, setCollapseStates] = useState<Record<string, boolean>>({});
	const schemaId = useMemo(() => `${schema.name}-${schema.version}`, [schema]);

	// Load initial state from localStorage on mount
	useEffect(() => {
		setCollapseStates(getPerspectiveCollapseStates(schemaId));
	}, [schemaId]);

	// Handler to toggle collapse state for a field
	const handleToggleCollapse = (fieldName: string, isOpen: boolean) => {
		setCollapseStates(prev => ({ ...prev, [fieldName]: isOpen }));
		setPerspectiveCollapseState(schemaId, fieldName, isOpen);
	};

	// Use content safely, it might be null/undefined if data is null
	const content = data?.content;

	return (
		<Box>
			{/* Iterate and render each field in a collapsible section */}
			<Stack gap={1}>
				{schema.schema_fields
					.map((field) => {
						const fieldName = field.name;
						// fieldValue might be undefined if content is null
						const fieldValue = content?.[fieldName]; 
						const isInitiallyOpen = collapseStates[fieldName] ?? true;
						const isOpen = collapseStates[fieldName] ?? isInitiallyOpen;
						return (
							<Collapsible.Root
								key={fieldName}
								defaultOpen={isInitiallyOpen}
								onOpenChange={(detail) => handleToggleCollapse(fieldName, detail.open)}
								style={{ width: '100%' }} // Ensure it takes full width
							>
								<Collapsible.Trigger asChild>
									<Box
										as="button"
										w="full"
										p={2}
										bg={triggerBg}
										_hover={{ bg: triggerHoverBg }}
										textAlign="left"
										fontSize="sm"
										borderBottom="1px"
										borderColor={borderColor}
										cursor="pointer"
										display="flex"
										justifyContent="space-between"
										alignItems="center"
									>
										<Box flexGrow={1} mr={2} display="flex" alignItems="center">
											{isOpen ? (
												<LuChevronDown 
													aria-hidden="true"
													style={{ marginRight: '8px', flexShrink: 0 }} 
												/>
											) : (
												<LuChevronRight 
													aria-hidden="true"
													style={{ marginRight: '8px', flexShrink: 0 }} 
												/>
											)}
											<Box>
												<Text fontWeight="medium">{fieldName}</Text>
												{field.description && (
													<Text fontSize="xs" color={mutedTextColor} fontWeight="normal">
														{field.description}
													</Text>
												)}
											</Box>
										</Box>
										<Flex alignItems="center" gap={1} flexShrink={0}>
											{field.type && (
												<Badge
													variant="subtle"
													colorScheme="gray"
													borderRadius="full"
													px="2"
													py="0.5"
													fontSize="xs"
												>
													{String(field.type)}
													{field.is_list && " []"}
												</Badge>
											)}
										</Flex>
									</Box>
								</Collapsible.Trigger>
								<Collapsible.Content>
									<Box p={2} borderBottom="1px" borderColor={borderColor}>
										<SchemaFieldFactory
											field={field}
											value={fieldValue}
											hideHeader={true}
										/>
									</Box>
								</Collapsible.Content>
							</Collapsible.Root>
						);
					})}
			</Stack>
		</Box>
	);
} 