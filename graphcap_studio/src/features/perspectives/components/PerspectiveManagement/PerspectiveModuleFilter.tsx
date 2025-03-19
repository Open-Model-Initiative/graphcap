// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Module Filter
 *
 * This component displays a single module as an accordion item with checkboxes
 * for toggling the visibility of perspectives within the module.
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { Perspective } from "@/features/perspectives/types";
import { Box } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

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
			<Box
				as="button"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				width="full"
				textAlign="left"
				fontSize="sm"
				fontWeight="medium"
				p={2}
				bg={headerBgColor}
				color={textColor}
				_hover={{ bg: hoverBgColor }}
				onClick={() => onTogglePanel(moduleName)}
			>
				<Link
					to="/perspectives/module/$moduleName"
					params={{ moduleName }}
					className="hover:underline flex-1"
				>
					{displayName}
				</Link>
				<Box
					as="span"
					display="inline-block"
					transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
					transition="transform 0.2s"
				>
					▼
				</Box>
			</Box>
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
						<Box
							as="div"
							key={perspective.name}
							display="flex"
							alignItems="center"
							px={2}
							py={1}
							_hover={{ bg: itemHoverBg }}
							borderRadius="sm"
						>
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
							<Link
								to="/perspectives/module/$moduleName/perspective/$perspectiveName"
								params={{
									moduleName,
									perspectiveName: perspectiveId,
								}}
								className="text-xs hover:underline flex-1"
								style={{ color: mutedTextColor }}
							>
								{perspective.display_name}
							</Link>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
