import { Perspectives } from "@/features/perspectives";
import { Box, Tabs } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";
import {
	BasicInformation,
	ErrorState,
	FileInformation,
	LoadingState,
	Segments,
} from "./components";
import { useImagePropertiesContext } from "./context";
import { getSelectedTab, saveSelectedTab } from "./utils/localStorage";

/**
 * Component for displaying image properties and metadata
 *
 * This component uses the ImagePropertiesContext to access and manage
 * image properties data.
 */
export function ImageProperties() {
	// Get context data and methods
	const {
		properties,
		isLoading,
		error,
		image,
		newTag,
		isEditing,
		setNewTag,
		handlePropertyChange,
		handleAddTag,
		handleRemoveTag,
		handleSave,
		toggleEditing,
	} = useImagePropertiesContext();

	// Get saved tab from localStorage or default to "basic"
	const [activeTab, setActiveTab] = useState(() => {
		return getSelectedTab() ?? "basic";
	});

	// Save tab selection to localStorage when it changes
	useEffect(() => {
		saveSelectedTab(activeTab);
	}, [activeTab]);

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
