// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Component
 *
 * This component displays and manages image perspectives from graphcap.
 */

import type { Image } from "@/types";
import { Grid } from "@chakra-ui/react";
import { useEffect } from "react";
import { EmptyPerspectives } from "./components/PerspectiveCaption/EmptyPerspectives";
import { PerspectivesPager } from "./components/PerspectiveCaption/PerspectiveNavigation/PerspectivesPager";
import { PerspectivesErrorState } from "./components/PerspectivesErrorState";
import { usePerspectiveUI, usePerspectivesData } from "./context";

interface PerspectivesProps {
	readonly image: Image | null;
}

/**
 * Component for displaying and managing image perspectives from graphcap
 */
export function Perspectives({ image }: PerspectivesProps) {
	// Get data from perspectives data context
	const {
		isServerConnected,
		schemas,
		perspectivesError: dataError,
		setCurrentImage,
		currentImage,
	} = usePerspectivesData();

	const { activeSchemaName, setActiveSchemaName } = usePerspectiveUI();

	// Effect to update current image in context when image prop changes
	useEffect(() => {
		if (image && (!currentImage || image.path !== currentImage.path)) {
			console.debug("[Perspectives] Setting current image:", image.path);
			setCurrentImage(image);
		}
	}, [image, currentImage, setCurrentImage]);

	// Effect to handle schema selection, ensuring a valid schema is always selected when available
	useEffect(() => {
		// Only proceed if we have schemas
		if (schemas && Object.keys(schemas).length > 0) {
			const schemaKeys = Object.keys(schemas);
			
			// Case 1: No active schema is selected - select the first available one
			if (!activeSchemaName) {
				console.debug("[Perspectives] No active schema - setting first schema as active:", schemaKeys[0]);
				setActiveSchemaName(schemaKeys[0]);
				return;
			}
			
			// Case 2: Selected schema no longer exists - select a new valid one
			if (!schemas[activeSchemaName]) {
				console.debug("[Perspectives] Active schema no longer exists:", activeSchemaName);
				console.debug("[Perspectives] Selecting new schema:", schemaKeys[0]);
				setActiveSchemaName(schemaKeys[0]);
				return;
			}
			
			// Case 3: Active schema is valid - nothing to do
			console.debug("[Perspectives] Active schema is valid:", activeSchemaName);
		}
	}, [activeSchemaName, schemas, setActiveSchemaName]);

	// Logging render state for debugging
	console.debug("[Perspectives] Render state:", {
		isServerConnected,
		hasError: !!dataError,
		hasImage: !!image,
		hasSchemas: schemas && Object.keys(schemas).length > 0,
		activeSchemaName,
		activeSchemaExists: activeSchemaName && schemas ? !!schemas[activeSchemaName] : false,
	});

	// Show error state if there's an error or server is not connected
	if (!isServerConnected) {
		console.debug("[Perspectives] Rendering: Server not connected");
		return (
			<Grid 
				height="100%" 
				width="100%"
				overflow="hidden"
				templateRows="1fr"
			>
				<PerspectivesErrorState type="connection" />
			</Grid>
		);
	}

	if (dataError) {
		console.debug("[Perspectives] Rendering: Data error", dataError);
		return (
			<Grid 
				height="100%" 
				width="100%"
				overflow="hidden"
				templateRows="1fr"
			>
				<PerspectivesErrorState type="general" error={dataError} />
			</Grid>
		);
	}

	// Show error state if no image is selected
	if (!image) {
		console.debug("[Perspectives] Rendering: No image selected");
		return (
			<Grid 
				height="100%" 
				width="100%"
				overflow="hidden"
				templateRows="1fr"
			>
				<PerspectivesErrorState
					type="general"
					error="No image selected. Please select an image to view perspectives."
				/>
			</Grid>
		);
	}

	// Show empty state if no schemas are available
	if (!schemas || Object.keys(schemas).length === 0) {
		console.debug("[Perspectives] Rendering: No schemas available", { schemas });
		return (
			<Grid 
				height="100%" 
				width="100%"
				overflow="hidden"
				templateRows="1fr"
			>
				<EmptyPerspectives />
			</Grid>
		);
	}

	// Additional safeguard to ensure we have activeSchemaName and it refers to a valid schema
	if (!activeSchemaName || !schemas[activeSchemaName]) {
		console.debug("[Perspectives] Rendering: Invalid active schema", { 
			activeSchemaName, 
			hasActiveSchema: !!activeSchemaName,
			activeSchemaInSchemas: activeSchemaName ? activeSchemaName in schemas : false,
			availableSchemas: Object.keys(schemas)
		});
		
		// This shouldn't typically happen since our useEffect should handle schema selection
		// But including as a safeguard with more detailed logging
		return (
			<Grid
				height="100%"
				width="100%"
				overflow="hidden"
				templateRows="1fr"
				placeItems="center"
			>
				<EmptyPerspectives />
			</Grid>
		);
	}

	console.debug("[Perspectives] Rendering: Normal perspectives view", { activeSchemaName });
	return (
		<Grid
			height="100%"
			width="100%"
			overflow="hidden"
			templateRows="1fr"
		>
			{/* Main Content */}
			<PerspectivesPager />
		</Grid>
	);
}
