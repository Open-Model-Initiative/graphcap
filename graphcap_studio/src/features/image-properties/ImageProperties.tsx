import { Perspectives } from "@/features/perspectives";
import { Box } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import {
	ErrorState,
	LoadingState,
} from "./components";
import { useImagePropertiesContext } from "./context";

/**
 * Component for displaying image properties and metadata
 *
 * This component uses the ImagePropertiesContext to access and manage
 * image properties data.
 */
export function ImageProperties() {
	// Get context data and methods
	const {
		isLoading,
		error,
		image,
	} = useImagePropertiesContext();



	// Render loading state
	if (isLoading) {
		return <LoadingState />;
	}

	// Render error state
	if (error) {
		return <ErrorState message={error} />;
	}

	// Render no image selected state
	if (!image) {
		return (
			<Box p={4} textAlign="center" color="gray.400">
				<p>No image selected</p>
			</Box>
		);
	}

	return (
		<Perspectives image={image} />
	);
}
