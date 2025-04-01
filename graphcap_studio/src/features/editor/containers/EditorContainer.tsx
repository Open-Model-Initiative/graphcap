// SPDX-License-Identifier: Apache-2.0
// import { useEditorContext } from "@/features/editor/context/EditorContext"; // Removed import
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { ViewerContainer } from "@/features/gallery-viewer";
import { Center, Spinner, Text } from "@chakra-ui/react"; // Added for loading/error states
import { ImageEditor } from "../components/ImageEditor";
import { useImageEditor } from "../hooks"; // Keep hooks for now

/**
 * Container for the main content area when view === 'edit'
 * Renders either the ImageEditor or the ViewerContainer (if not actively editing).
 */
export function EditorContainer(

) {
	// Get necessary state from DatasetContext
	const { selectedDataset, selectedImage, isLoadingDataset, datasetError } =
		useDatasetContext();

	// Use custom hook for image editing state
	const { isEditing, handleSave, handleCancel } = useImageEditor({
		selectedDataset: selectedDataset?.name ?? null,
	});

	// Handle Loading State
	if (isLoadingDataset) {
		return (
			<Center h="full" w="full">
				<Spinner size="xl" />
			</Center>
		);
	}

	// Handle Error State
	if (datasetError) {
		return (
			<Center h="full" w="full">
				<Text color="red.500">
					Error loading dataset: {datasetError.message}
				</Text>
			</Center>
		);
	}

	// Handle Dataset Not Found (selectedDataset is null after loading and no error)
	if (!selectedDataset) {
		return (
			<Center h="full" w="full">
				<Text color="gray.500">Dataset not found or no dataset selected.</Text>
			</Center>
		);
	}

	// Get images from the selected dataset
	const images = selectedDataset.images || []; // selectedDataset guaranteed non-null here


	const isEmpty = images.length === 0;

	return (
		<div className="h-full w-full flex flex-col">
			<div className="flex-grow relative">
				{/* Main content area */} 
				{isEditing && selectedImage ? (
					<ImageEditor
						imagePath={selectedImage.path}
						onSave={handleSave}
						onCancel={handleCancel}
					/>
				) : (

					<ViewerContainer
						images={images} 
						isLoading={false} 
						isEmpty={isEmpty}
						selectedImage={selectedImage}
						title="Image Editor (Viewer)" 

					/>
				)}
			</div>
		</div>
	);
}
