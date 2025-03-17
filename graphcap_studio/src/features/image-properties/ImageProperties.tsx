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
		<Box height="full" display="flex" flexDirection="column" overflow="hidden">
			<Tabs.Root
				defaultValue={activeTab}
				variant="line"
				colorPalette="blue"
				size="md"
				height="100%"
				onValueChange={(details) => setActiveTab(details.value)}
			>
				<Tabs.List borderBottomColor="gray.700" flexShrink={0}>
					<Tabs.Trigger value="basic">Basic</Tabs.Trigger>
					<Tabs.Trigger value="file">File</Tabs.Trigger>
					<Tabs.Trigger value="segments">Segments</Tabs.Trigger>
					<Tabs.Trigger value="perspectives">Perspectives</Tabs.Trigger>
					<Tabs.Indicator />
				</Tabs.List>

				<Box flex="1" overflow="auto" p={1}>
					<Tabs.Content value="basic">
						{properties && (
							<BasicInformation
								properties={properties}
								isEditing={isEditing}
								newTag={newTag}
								onNewTagChange={setNewTag}
								onAddTag={handleAddTag}
								onRemoveTag={handleRemoveTag}
								onPropertyChange={handlePropertyChange}
								onSave={handleSave}
								onToggleEdit={toggleEditing}
							/>
						)}
					</Tabs.Content>

					<Tabs.Content value="file">
						<FileInformation image={image} />
					</Tabs.Content>

					<Tabs.Content value="segments">
						<Segments image={image} />
					</Tabs.Content>

					<Tabs.Content value="perspectives">
						<Perspectives image={image} />
					</Tabs.Content>
				</Box>
			</Tabs.Root>
		</Box>
	);
}
