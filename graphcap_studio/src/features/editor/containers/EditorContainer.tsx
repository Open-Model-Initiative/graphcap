// SPDX-License-Identifier: Apache-2.0
// import { useEditorContext } from "@/features/editor/context/EditorContext"; // Removed import
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { ViewerContainer } from "@/features/gallery-viewer";
import { PropertiesContainer } from "@/features/image-properties";
import { EditorLayout } from "@/pages/gallery/GalleryLayout";
import { Center, Spinner, Text } from "@chakra-ui/react"; // Added for loading/error states
import { ImageEditor } from "../components/ImageEditor";
import { useImageEditor } from "../hooks"; // Keep hooks for now

interface EditorContainerProps {
	readonly directory?: string;
	readonly onClose?: () => void;
}

/**
 * A container component that integrates the image editor with the gallery
 */
export function EditorContainer({
	directory,
	onClose,
}: EditorContainerProps) {
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

	// Filter images by directory if provided
	const filteredImages = directory
		? images.filter((img) => img.directory === directory)
		: images;

	// Determine if the gallery is empty (within the selected dataset/directory)
	const isEmpty = filteredImages.length === 0;

	return (
		<div className="h-full w-full flex flex-col bg-gray-900 text-white">
			<EditorLayout
				viewer={
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
								<>
									{/* Image gallery */}
									<ViewerContainer
										images={filteredImages}
										isLoading={false} // Pass false, as EditorContainer handles overall loading
										isEmpty={isEmpty}
										selectedImage={selectedImage}
										title="Image Editor"
										onClose={onClose}
									/>
								</>
							)}
						</div>
					</div>
				}
				properties={
					<PropertiesContainer
						selectedImage={selectedImage}
						className="h-full"
					/>
				}
			/>
		</div>
	);
}
