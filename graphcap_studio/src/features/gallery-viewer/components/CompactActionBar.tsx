import {
	DeleteButton,
	DownloadButton,
	EditButton,
} from "@/components/ui/buttons";
// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { useImageEditor } from "@/features/editor/hooks";
import { useAddImageToDataset } from "@/services/dataset"; // Corrected import
// import { useDeleteImage } from "@/services/images"; // Commented out
import type { Image } from "@/types";
import { Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { AddToDatasetMenu } from "./AddToDatasetMenu";

interface CompactActionBarProps {
	readonly totalImages: number;
	readonly currentIndex: number;
	readonly className?: string;
}

/**
 * A compact action bar for image operations using icons
 *
 * @param totalImages - Total number of images
 * @param currentIndex - Current image index
 * @param className - Additional CSS classes
 */
export function CompactActionBar({
	totalImages,
	currentIndex,
	className = "",
}: CompactActionBarProps) {
	// Get dataset context
	const {
		selectedDataset,
		selectedImage,
		allDatasets,
	} = useDatasetContext();

	// Get mutation hooks/services
	const { mutate: addImageToDataset } = useAddImageToDataset(); // Correct hook usage
	const { handleEditImage: startEditing } = useImageEditor({
		selectedDataset: selectedDataset?.name ?? null,
	});

	// Handle delete button click (Commented out implementation)
	const onDeleteClick = useCallback(() => {
		if (selectedImage && selectedDataset) {
			console.warn("Delete functionality not implemented yet.");
		}
	}, [selectedImage, selectedDataset]);

	// Handle edit button click
	const onEditClick = useCallback(() => {
		if (selectedImage) {
			startEditing(selectedImage);
		}
	}, [selectedImage, startEditing]);

	// Handle add to dataset from the menu component
	const handleAddToDataset = useCallback(
		(imagePath: string, datasetName: string) => {
			addImageToDataset({ imagePath, datasetName }); // Use the mutation hook
		},
		[addImageToDataset],
	);

	// If no image is selected, show minimal info
	if (!selectedImage) {
		return (
			<Flex
				h="8"
				px="2"
				py="0.5"
				justify="space-between"
				alignItems="center"
				bg="blackAlpha.700"
				className={className}
			>
				<Text fontSize="xs" color="gray.400">
					{totalImages > 0 ? `${totalImages} images` : "No images"}
				</Text>
			</Flex>
		);
	}

	return (
		<Flex
			h="8"
			px="2"
			py="0.5"
			justify="space-between"
			alignItems="center"
			bg="blackAlpha.700"
			className={className}
		>
			{/* Left side - Image info */}
			<Flex alignItems="center" gap="1">
				<Text fontSize="xs" color="gray.300" truncate maxW="200px">
					<Text as="span" fontWeight="medium">
						{selectedImage.name}
					</Text>
					<Text as="span" mx="1" color="gray.500">
						•
					</Text>
					<Text as="span" color="gray.400">
						{currentIndex + 1}/{totalImages}
					</Text>
				</Text>
			</Flex>

			{/* Right side - Actions */}
			<Flex alignItems="center" gap="0.5">
				{/* Edit button */}
				<EditButton onClick={onEditClick} size="xs" title="Edit image" />

				{/* Add to dataset button with dropdown */}
				{allDatasets && allDatasets.length > 1 && selectedDataset && (
					<AddToDatasetMenu
						image={selectedImage}
						datasets={allDatasets}
						currentDataset={selectedDataset.name} // Correct prop name and ensure value
						onAddToDataset={handleAddToDataset}
					/>
				)}

				{/* Download button with built-in functionality */}
				<DownloadButton image={selectedImage} size="xs" title="Download image" />

				{/* Delete button */}
				<DeleteButton
					onClick={onDeleteClick} // Still calls the handler, which logs a warning
					size="xs"
					title="Delete image (Not Implemented)"
					disabled // Disable button until implemented
				/>
			</Flex>
		</Flex>
	);
}
