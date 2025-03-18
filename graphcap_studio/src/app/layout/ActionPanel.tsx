import zIndex from "@/common/styles/z-index.module.css";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Box, Button, Stack } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import styles from "./ActionPanel.module.css";
import { useActionPanel } from "./hooks";

/**
 * Action panel section configuration
 */
export interface ActionPanelSection {
	/**
	 * Unique identifier for the section
	 */
	id: string;

	/**
	 * Display title for the section
	 */
	title: string;

	/**
	 * Icon to display in collapsed mode (can be a string or ReactNode)
	 */
	icon: ReactNode;

	/**
	 * Content to display when the section is active
	 */
	content: ReactNode;
}

/**
 * Props for the ActionPanel component
 */
interface ActionPanelProps {
	/**
	 * The side of the panel ('left' or 'right')
	 */
	side: "left" | "right";

	/**
	 * Default expanded state
	 */
	defaultExpanded?: boolean;

	/**
	 * Width of the panel when expanded (in pixels)
	 */
	expandedWidth?: number;

	/**
	 * Width of the panel when collapsed (in pixels)
	 */
	collapsedWidth?: number;

	/**
	 * Sections to display in the panel
	 */
	sections: ActionPanelSection[];

	/**
	 * Default active section ID
	 */
	defaultActiveSection?: string;
}

/**
 * A collapsible action panel component for the left or right side of the layout
 *
 * This component provides:
 * - Collapsible panel
 * - Auto-collapse when clicking outside the panel
 * - Auto-collapse when clicking the current active section
 * - Icon-based navigation in collapsed mode
 * - Multiple sections with contextual content
 * - Persistent expanded/collapsed state
 * - Smooth transition animations
 * - Responsive layout integration
 *
 * @param props - Component props
 */
export function ActionPanel({
	side,
	defaultExpanded = false,
	expandedWidth = 256,
	collapsedWidth = 40,
	sections,
	defaultActiveSection,
}: Readonly<ActionPanelProps>) {
	const { isExpanded, width, expandPanel, collapsePanel } = useActionPanel({
		side,
		defaultExpanded,
		expandedWidth,
		collapsedWidth,
	});

	// Track the active section
	const [activeSection, setActiveSection] = useState<string>(
		defaultActiveSection ?? (sections.length > 0 ? sections[0].id : ""),
	);

	// Reference to the panel element
	const panelRef = useRef<HTMLDivElement>(null);

	// Handle clicks outside the panel
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				panelRef.current &&
				!panelRef.current.contains(event.target as Node) &&
				isExpanded
			) {
				collapsePanel();
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isExpanded, collapsePanel]);

	// Memoize the section change handler to prevent unnecessary re-renders
	const handleSectionChange = useCallback(
		(sectionId: string) => {
			if (activeSection === sectionId && isExpanded) {
				// If clicking the current active section while expanded, collapse the panel
				collapsePanel();
			} else {
				setActiveSection(sectionId);
				expandPanel();
			}
		},
		[activeSection, isExpanded, collapsePanel, expandPanel],
	);

	// Find the current active section
	const currentSection = sections.find(
		(section) => section.id === activeSection,
	);

	// Use colorMode instead of useColorModeValue
	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const buttonTextColor = useColorModeValue("gray.800", "white");
	const buttonBgColor = useColorModeValue("gray.100", "gray.700");
	const buttonHoverBg = useColorModeValue("gray.200", "gray.600");
	const buttonActiveBg = useColorModeValue("gray.300", "gray.500");

	return (
		<Box
			ref={panelRef}
			position="fixed"
			top={0}
			bottom={0}
			left={side === "left" ? 0 : "auto"}
			right={side === "right" ? 0 : "auto"}
			width={`${width}px`}
			bg={bgColor}
			borderLeft={side === "right" ? `1px solid` : undefined}
			borderRight={side === "left" ? `1px solid` : undefined}
			borderColor={borderColor}
			transition="width 0.2s"
			className={`${styles.panel} ${zIndex.sidebar}`}
		>
			<Box className={styles.panelContent} h="100%" overflowY="auto">
				{!isExpanded ? (
					<Stack direction="column" gap={2} align="center" pt={2}>
						{sections.map((section) => (
							<Button
								key={section.id}
								aria-label={section.title}
								onClick={() => {
									handleSectionChange(section.id);
								}}
								data-active={activeSection === section.id}
								color={buttonTextColor}
								bg={buttonBgColor}
								_hover={{ bg: buttonHoverBg }}
								_active={{ bg: buttonActiveBg }}
								size="sm"
								title={section.title}
								p={1}
								minW={8}
								h={8}
							>
								{section.icon}
							</Button>
						))}
					</Stack>
				) : (
					<>
						<Box className={styles.sectionTabs}>
							{sections.map((section) => (
								<Button
									key={section.id}
									color={buttonTextColor}
									bg={
										activeSection === section.id
											? buttonActiveBg
											: buttonBgColor
									}
									_hover={{ bg: buttonHoverBg }}
									_active={{ bg: buttonActiveBg }}
									className={`${styles.sectionTab} ${activeSection === section.id ? styles.activeTab : ""}`}
									onClick={() => handleSectionChange(section.id)}
									display="flex"
									alignItems="center"
									gap={2}
									w="full"
									justifyContent="flex-start"
									p={2}
								>
									{section.icon}
									<Box as="span">{section.title}</Box>
								</Button>
							))}
						</Box>

						{currentSection && (
							<Box className={styles.sectionContent}>
								<Box className={styles.sectionBody}>
									{currentSection.content}
								</Box>
							</Box>
						)}
					</>
				)}
			</Box>
		</Box>
	);
}
