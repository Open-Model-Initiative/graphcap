// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Pager Component
 *
 * This component displays perspectives in a paged layout with a fixed footer that includes navigation controls.
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import {
	usePerspectiveUI,
	usePerspectivesData,
} from "@/features/perspectives/context";
import { Box, Grid, GridItem } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { EmptyPerspectives } from "../EmptyPerspectives";
import { PerspectivesFooter } from "../PerspectiveActions/PerspectivesFooter";
import { PerspectiveCardTabbed } from "../PerspectiveCard/PerspectiveCardTabbed";

/**
 * Component for displaying perspectives in a paged layout
 */
export function PerspectivesPager() {
	// Get data context props
	const {
		schemas,
		isGenerating,
		isPerspectiveGenerated,
		isPerspectiveGenerating,
		getPerspectiveData,
		isPerspectiveVisible,
	} = usePerspectivesData();

	// Get UI-related props from UI context
	const { activeSchemaName, setActiveSchemaName } = usePerspectiveUI();

	// Get the array of schema keys for navigation, filtered to only show visible perspectives
	const schemaKeys = useMemo(() => {
		const allKeys = Object.keys(schemas || {});
		return allKeys.filter((key) => isPerspectiveVisible(key));
	}, [schemas, isPerspectiveVisible]);

	// Find the current index based on active schema
	const currentIndex = activeSchemaName
		? schemaKeys.indexOf(activeSchemaName)
		: -1;

	// Colors
	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");

	// Handle navigation between perspectives
	const handleNavigate = React.useCallback(
		(index: number) => {
			if (index >= 0 && index < schemaKeys.length) {
				setActiveSchemaName(schemaKeys[index]);
			}
		},
		[schemaKeys, setActiveSchemaName],
	);

	// If no schemas are available, show the empty state
	if (!schemas || schemaKeys.length === 0) {
		return <EmptyPerspectives />;
	}

	// Check if we have a valid activeSchemaName that is visible
	if (
		!activeSchemaName ||
		!schemas[activeSchemaName] ||
		!isPerspectiveVisible(activeSchemaName)
	) {
		// If current perspective is hidden or invalid, select the first visible one
		if (schemaKeys.length > 0) {
			setActiveSchemaName(schemaKeys[0]);
			return <EmptyPerspectives />;
		}
		return <EmptyPerspectives />;
	}

	// Get the active schema
	const activeSchema = schemas[activeSchemaName];
	const captionData = getPerspectiveData(activeSchemaName);
	const isGenerated = isPerspectiveGenerated(activeSchemaName);

	return (
		// Main container with Grid layout to prevent content shifting
		<Grid
			templateRows="1fr auto"
			templateAreas={`
				"content"
				"footer"
			`}
			height="100%"
			width="100%"
			overflow="hidden"
		>
			{/* Content area - scrollable content with fixed size */}
			<GridItem 
				gridArea="content"
				overflow="auto"
				width="100%"
				height="100%"
				display="flex"
				flexDirection="column"
				px={2}
				py={2}
				bg={bgColor}
			>
				<Box 
					width="100%" 
					height="auto" 
					overflow="auto"
					flex="1"
				>
					{/* Active Perspective Card */}
					{activeSchema && (
						<PerspectiveCardTabbed
							key={activeSchemaName}
							schema={activeSchema}
							data={captionData}
							isActive={true}
							isGenerated={isGenerated}
							onSetActive={() => setActiveSchemaName(activeSchemaName)}
						/>
					)}
				</Box>
			</GridItem>

			{/* Footer - fixed at bottom */}
			<GridItem
				gridArea="footer"
				bg={bgColor}
				borderTopWidth="1px"
				borderColor={borderColor}
				width="100%"
			>
				<PerspectivesFooter
					isLoading={isGenerating}
					isGenerated={isGenerated}
					totalPerspectives={schemaKeys.length}
					currentIndex={currentIndex}
					currentPerspectiveName={activeSchema?.display_name || "Loading..."}
					onNavigate={handleNavigate}
				/>
			</GridItem>
		</Grid>
	);
}
