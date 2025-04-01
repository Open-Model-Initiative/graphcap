import {
	EditButton,
} from "@/components/ui/buttons";
// SPDX-License-Identifier: Apache-2.0
import { Tooltip } from "@/components/ui/tooltip"; // Import custom Tooltip
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { useImageEditor } from "@/features/editor/hooks";
import { useAddImageToDataset, useDeleteImage } from "@/services/dataset"; // Corrected import

import { toast } from "@/utils/toast"; // Import project toast utility
import {
	ButtonGroup,
	Flex,
	IconButton,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router"; // Import useNavigate
import { Download, Trash2 } from "lucide-react"; // Keep Download, Add Trash2
import { useCallback } from "react";
import { AddToDatasetMenu } from "./AddToDatasetMenu";
import { DeleteImageDialog } from "./DeleteImageDialog"; // Import the new dialog component

interface CompactActionBarProps {
	readonly currentIndex: number;
	readonly className?: string;
}

/**
 * A compact action bar for image operations using icons
 *
 * @param currentIndex - Current image index
 * @param className - Additional CSS classes
 */
export function CompactActionBar({
	currentIndex,
	className = "",
}: CompactActionBarProps) {
	// Get dataset context
	const {
		selectedDataset,
		selectedImage,
		allDatasets,
	} = useDatasetContext();
	const navigate = useNavigate();

	// Derive total images from context
	const totalImages = selectedDataset?.images?.length ?? 0;

	// Get mutation hooks/services
	const {
		mutate: addImageToDataset,
	} = useAddImageToDataset();
	const {
		mutate: deleteImageMutate,
		isPending: isDeleting,
	} = useDeleteImage();
	const { handleEditImage: startEditing } = useImageEditor({
		selectedDataset: selectedDataset?.name ?? null,
	});

	const {
		open: isDeleteDialogOpen,
		onOpen: onDeleteOpen,
		onClose: onDeleteClose,
	} = useDisclosure(); // Keep for DeleteImageDialog

	// Handle edit button click
	const handleEditClick = useCallback(() => {
		if (selectedImage) {
			startEditing(selectedImage);
		}
	}, [selectedImage, startEditing]);

	// Handle add to dataset from the menu component
	const handleAddToDataset = useCallback(
		(imagePath: string, datasetName: string) => {
			addImageToDataset({ imagePath, datasetName }, {
				onSuccess: () => toast.success({ title: `Image added to ${datasetName}`}),
				onError: (err) => toast.error({ title: "Failed to add image", description: err.message })
			});
		},
		[addImageToDataset],
	);

	// Handler for download (Placeholder)
	const handleDownloadClick = () => {
		if (selectedImage) {
			console.warn("Download functionality not implemented yet.");
			toast.info({
				title: "Not Implemented",
				description: "Download functionality is not yet available.",
			});
			// Example: window.open(selectedImage.url, '_blank'); // Needs proper URL
		}
	};

	// Callback passed to DeleteImageDialog to perform the actual deletion
	const handleDeleteConfirmed = useCallback(
		async (datasetName: string, imageName: string) => {
			// Find the current image index *before* mutation invalidates queries
			const currentImages = selectedDataset?.images ?? [];
			const deletedImageIndex = currentImages.findIndex(
				(img) => img.name === imageName,
			);

			return new Promise<void>((resolve, reject) => {
				deleteImageMutate(
					{ datasetName, imageName },
					{
						onSuccess: () => {
							console.log(`Successfully deleted ${imageName}`);
							toast.success({
								title: "Image Deleted",
								description: `${imageName} has been removed.`,
							});

							// --- Post-deletion Navigation Logic ---
							// We refetch the list via query invalidation, so access it *after* mutation
							// This requires the component to re-render before navigation can calculate correctly
							// A slightly simpler approach is to use the OLD list for navigation immediately

							const remainingImages = currentImages.filter(
								(img) => img.name !== imageName,
							);

							if (remainingImages.length > 0) {
								let nextImageIndex = -1;
								if (deletedImageIndex !== -1) {
									nextImageIndex = Math.min(
										deletedImageIndex,
										remainingImages.length - 1,
									);
								} else {
									nextImageIndex = 0; // Fallback
								}

								const nextImage = remainingImages[nextImageIndex];
								console.log("Navigating to next image:", nextImage.name);
								navigate({
									to: "/gallery/$datasetId/content/$contentId",
									params: { datasetId: datasetName, contentId: nextImage.name },
									search: (prev) => ({ ...prev }),
									replace: true,
								});
							} else {
								console.log("No images left, navigating to dataset root.");
								navigate({
									to: "/gallery/$datasetId",
									params: { datasetId: datasetName },
									search: (prev) => ({ ...prev }),
									replace: true,
								});
							}
							onDeleteClose(); 
							resolve(); 
						},
						onError: (error) => {
							console.error("Failed to delete image mutation:", error);
							reject(error); 
						},
					},
				);
			});
		},
		[deleteImageMutate, selectedDataset, navigate, onDeleteClose], // Added dependencies
	);

	// If no image is selected, show minimal info
	if (!selectedImage) {
		return (
			<Flex
				h="8"
				px="2"
				py="0.5"
				justify="flex-start" 
				alignItems="center"
				bg="blackAlpha.700"
				className={className}
			>
				<Text fontSize="xs" color="gray.400">
					{totalImages > 0 ? `${totalImages} images in dataset` : "No images selected"}
				</Text>
			</Flex>
		);
	}

	return (
		<>
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
				<ButtonGroup variant="outline" size="sm" gap="0.5" attached>
					{/* Edit button */}
					<Tooltip content="Edit Image">
						<EditButton
							aria-label="Edit Image"
							onClick={handleEditClick}
							disabled={!selectedImage}
							size="sm"
						/>
					</Tooltip>

					{/* Add to dataset button */}
					{allDatasets && allDatasets.length > 1 && selectedDataset && (
						<AddToDatasetMenu
							image={selectedImage}
							datasets={allDatasets}
							currentDataset={selectedDataset.name}
							onAddToDataset={handleAddToDataset}
						/>
					)}

					{/* Download button */}
					<Tooltip content="Download Image">
						<IconButton
							aria-label="Download Image"
							onClick={handleDownloadClick}
							disabled={!selectedImage}
							size="sm"
						> <Download size="1em" /> </IconButton>
					</Tooltip>

					{/* Delete button */}
					<Tooltip content="Delete Image">
						<IconButton
							aria-label="Delete Image"
							onClick={onDeleteOpen}
							disabled={!selectedImage || isDeleting}
							loading={isDeleting}
							size="sm"
						> <Trash2 size="1em" /> </IconButton>
					</Tooltip>
				</ButtonGroup>
			</Flex>

			{/* Render the Delete Confirmation Dialog */}
			<DeleteImageDialog
				isOpen={isDeleteDialogOpen}
				onClose={onDeleteClose}
				imageName={selectedImage?.name}
				datasetName={selectedDataset?.name}
				isDeleting={isDeleting}
				onConfirmDelete={handleDeleteConfirmed}
			/>
		</>
	);
}
