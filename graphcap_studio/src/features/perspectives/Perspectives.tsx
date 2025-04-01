// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Component
 *
 * This component displays and manages image perspectives from GraphCap.
 */

import type { Image } from "@/types";
import { Box, Flex } from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo } from "react";
import {
	DEFAULT_OPTIONS,
	GenerationOptionForm,
} from "../inference/generation-options/components/GenerationOptionForm";
import { EmptyPerspectives } from "./components/PerspectiveCaption/EmptyPerspectives";
import { PerspectivesPager } from "./components/PerspectiveCaption/PerspectiveNavigation/PerspectivesPager";
import { PerspectivesErrorState } from "./components/PerspectivesErrorState";
import { usePerspectiveUI, usePerspectivesData } from "./context";
import type { CaptionOptions } from "./types";

interface PerspectivesProps {
	readonly image: Image | null;
}

/**
 * Component for displaying and managing image perspectives from GraphCap
 */
export function Perspectives({ image }: PerspectivesProps) {
	// Local state for generation options
	const [showOptions, setShowOptions] = React.useState(false);
	const [options, setOptions] = React.useState<CaptionOptions>(DEFAULT_OPTIONS);
	const optionsButtonRef = React.useRef<HTMLButtonElement>(null);

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
			setCurrentImage(image);
		}
	}, [image, currentImage, setCurrentImage]);

	// Effect to set the first schema as active if none is selected
	useEffect(() => {
		if (!activeSchemaName && schemas && Object.keys(schemas).length > 0) {
			setActiveSchemaName(Object.keys(schemas)[0]);
		}
	}, [activeSchemaName, schemas, setActiveSchemaName]);

	const handleOptionsChange = useCallback((newOptions: CaptionOptions) => {
		setOptions(newOptions);
	}, []);

	// Options control button - memoized to avoid recreating on every render
	const optionsControl = useMemo(
		() => ({
			isOpen: showOptions,
			onToggle: () => setShowOptions(!showOptions),
			buttonRef: optionsButtonRef,
			options,
		}),
		[showOptions, options],
	);

	// Show error state if there's an error or server is not connected
	if (!isServerConnected) {
		return (
			<Flex direction="column" height="100%" overflow="hidden">
				<PerspectivesErrorState type="connection" />
			</Flex>
		);
	}

	if (dataError) {
		return (
			<Flex direction="column" height="100%" overflow="hidden">
				<PerspectivesErrorState type="general" error={dataError} />
			</Flex>
		);
	}

	// Show error state if no image is selected
	if (!image) {
		return (
			<Flex direction="column" height="100%" overflow="hidden">
				<PerspectivesErrorState
					type="general"
					error="No image selected. Please select an image to view perspectives."
				/>
			</Flex>
		);
	}

	// Show empty state if no schemas are available
	if (!schemas || Object.keys(schemas).length === 0) {
		return (
			<Flex direction="column" height="100%" overflow="hidden">
				<EmptyPerspectives />
			</Flex>
		);
	}

	// Additional safeguard to ensure we have activeSchemaName and it refers to a valid schema
	if (!activeSchemaName || !schemas[activeSchemaName]) {
		return (
			<Flex
				direction="column"
				height="100%"
				overflow="hidden"
				justifyContent="center"
				alignItems="center"
			>
				<EmptyPerspectives />
			</Flex>
		);
	}

	return (
		<Flex
			direction="column"
			height="100%"
			overflow="hidden"
			position="relative"
			p={0}
		>
			{/* Main Content */}
			<PerspectivesPager optionsControl={optionsControl} />

			{/* Generation Options Dialog */}
			{showOptions && (
				<Box
					position="absolute"
					top={
						optionsButtonRef.current
							? optionsButtonRef.current.offsetHeight + 10
							: 10
					}
					right={4}
					zIndex={20}
					width="300px"
					boxShadow="lg"
					borderRadius="md"
				>
					<GenerationOptionForm
						options={options}
						onChange={handleOptionsChange}
						onClose={() => setShowOptions(false)}
					/>
				</Box>
			)}
		</Flex>
	);
}
