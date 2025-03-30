// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Module Filter
 *
 * This component displays a single module as an accordion item with checkboxes
 * for toggling the visibility of perspectives within the module.
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { Perspective } from "@/features/perspectives/types";
import { Box, Flex } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

type PerspectiveModuleFilterProps = {
	readonly moduleName: string;
	readonly displayName: string;
	readonly perspectives: Perspective[];
	readonly isOpen: boolean;
	readonly onTogglePanel: (moduleName: string) => void;
	readonly isPerspectiveVisible: (perspectiveName: string) => boolean;
	readonly togglePerspectiveVisibility: (perspectiveName: string) => void;
};

export function PerspectiveModuleFilter({
	moduleName,
	displayName,
	perspectives,
	isOpen,
	onTogglePanel,
	isPerspectiveVisible,
	togglePerspectiveVisibility,
}: PerspectiveModuleFilterProps) {
	// Theme colors
	const headerBgColor = useColorModeValue("gray.50", "#252E3F");
	const borderColor = useColorModeValue("gray.200", "#2D3748");
	const hoverBgColor = useColorModeValue("gray.100", "#2D3748");
	const textColor = useColorModeValue("gray.800", "white");
	const bgColor = useColorModeValue("white", "#1A202C");
	const mutedTextColor = useColorModeValue("gray.500", "gray.400");
	const checkboxActiveBg = useColorModeValue("blue.500", "blue.400");
	const checkboxBorderColor = useColorModeValue("gray.300", "gray.600");
	const itemHoverBg = useColorModeValue("gray.50", "#2A3749");
	const buttonColor = useColorModeValue("blue.500", "blue.400");

	// Compute the module's visibility state
	const moduleVisibilityState = useMemo(() => {
		if (!perspectives || perspectives.length === 0) return { checked: false, indeterminate: false };
		
		const visibleCount = perspectives.filter(p => isPerspectiveVisible(p.name)).length;
		
		if (visibleCount === 0) return { checked: false, indeterminate: false };
		if (visibleCount === perspectives.length) return { checked: true, indeterminate: false };
		return { checked: false, indeterminate: true };
	}, [perspectives, isPerspectiveVisible]);

	// Toggle all perspectives in the module
	const toggleAllPerspectives = () => {
		// If all are visible or indeterminate, hide all; otherwise show all
		const shouldShow = !moduleVisibilityState.checked && !moduleVisibilityState.indeterminate;
		
		for (const perspective of perspectives) {
			// Only toggle if the current state doesn't match what we want
			if (isPerspectiveVisible(perspective.name) !== shouldShow) {
				togglePerspectiveVisibility(perspective.name);
			}
		}
	};

	return (
		<Box
			display="flex"
			flexDirection="column"
			borderWidth="1px"
			borderColor={borderColor}
			borderRadius="md"
			overflow="hidden"
			bg={headerBgColor}
		>
			<Flex
				alignItems="center"
				width="full"
				p={2}
				bg={headerBgColor}
				color={textColor}
			>
				{/* Module toggle checkbox */}
				<Box
					as="label"
					display="flex"
					alignItems="center"
					mr={2}
					cursor="pointer"
					onClick={(e) => e.stopPropagation()}
				>
					<input
						type="checkbox"
						checked={moduleVisibilityState.checked}
						onChange={toggleAllPerspectives}
						style={{ display: "none" }}
					/>
					<Box
						width="16px"
						height="16px"
						borderWidth="1px"
						borderColor={moduleVisibilityState.checked ? checkboxActiveBg : checkboxBorderColor}
						bg={moduleVisibilityState.checked ? checkboxActiveBg : "transparent"}
						borderRadius="sm"
						display="flex"
						alignItems="center"
						justifyContent="center"
						transition="all 0.2s"
						position="relative"
					>
						{moduleVisibilityState.checked && (
							<Box as="span" color="white" fontSize="10px" lineHeight="1">
								✓
							</Box>
						)}
						{moduleVisibilityState.indeterminate && (
							<Box
								position="absolute"
								width="8px"
								height="2px"
								bg={checkboxActiveBg}
								top="50%"
								left="50%"
								transform="translate(-50%, -50%)"
							/>
						)}
					</Box>
				</Box>

				{/* Accordion toggle button */}
				<Box
					as="button"
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					width="full"
					textAlign="left"
					fontSize="sm"
					fontWeight="medium"
					_hover={{ bg: hoverBgColor }}
					onClick={() => onTogglePanel(moduleName)}
					mr={2}
				>
					<Box flex="1">{displayName}</Box>
					<Box
						as="span"
						display="inline-block"
						transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
						transition="transform 0.2s"
					>
						▼
					</Box>
				</Box>
				
				{/* View module button */}
				<Link
					to="/perspectives/module/$moduleName"
					params={{ moduleName }}
					className="flex items-center"
					title="View module details"
				>
					<Box
						as="span"
						fontSize="xs"
						display="inline-flex"
						alignItems="center"
						justifyContent="center"
						color={buttonColor}
						width="60px"
						height="20px"
						borderWidth="1px"
						borderColor="currentColor"
						borderRadius="md"
						ml={1}
						_hover={{ bg: hoverBgColor }}
					>
						View →
					</Box>
				</Link>
			</Flex>
			<Box
				display={isOpen ? "flex" : "none"}
				flexDirection="column"
				gap={1}
				py={1}
				px={0}
				bg={bgColor}
			>
				{perspectives?.map((perspective) => {
					// Extract perspective ID from the full name
					const perspectiveId = perspective.name.includes("/")
						? perspective.name.split("/").pop() ?? perspective.name
						: perspective.name;

					return (
						<Flex
							key={perspective.name}
							alignItems="center"
							px={2}
							py={1}
							_hover={{ bg: itemHoverBg }}
							borderRadius="sm"
						>
							{/* Checkbox for toggling visibility */}
							<Box
								as="label"
								display="flex"
								alignItems="center"
								mr={2}
								cursor="pointer"
							>
								<input
									type="checkbox"
									checked={isPerspectiveVisible(perspective.name)}
									onChange={() => togglePerspectiveVisibility(perspective.name)}
									style={{ display: "none" }}
								/>
								<Box
									width="14px"
									height="14px"
									borderWidth="1px"
									borderColor={
										isPerspectiveVisible(perspective.name)
											? checkboxActiveBg
											: checkboxBorderColor
									}
									bg={
										isPerspectiveVisible(perspective.name)
											? checkboxActiveBg
											: "transparent"
									}
									borderRadius="sm"
									display="flex"
									alignItems="center"
									justifyContent="center"
									transition="all 0.2s"
								>
									{isPerspectiveVisible(perspective.name) && (
										<Box as="span" color="white" fontSize="10px" lineHeight="1">
											✓
										</Box>
									)}
								</Box>
							</Box>
							
							{/* Perspective name (not a link) */}
							<Box
								flex="1"
								fontSize="xs"
								color={mutedTextColor}
							>
								{perspective.display_name}
							</Box>
							
							{/* View perspective button */}
							<Link
								to="/perspectives/module/$moduleName/perspective/$perspectiveName"
								params={{ 
									moduleName,
									perspectiveName: perspectiveId,
								}}
								className="flex items-center"
								title="View perspective details"
							>
								<Box
									as="span"
									fontSize="xs"
									display="inline-flex"
									alignItems="center"
									justifyContent="center"
									color={buttonColor}
									width="16px"
									height="16px"
									borderWidth="1px"
									borderColor="currentColor"
									borderRadius="md"
									_hover={{ bg: itemHoverBg }}
								>
									→
								</Box>
							</Link>
						</Flex>
					);
				})}
			</Box>
		</Box>
	);
}
