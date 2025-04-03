// SPDX-License-Identifier: Apache-2.0
import { Tooltip } from "@/components/ui/tooltip";
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import { useDeleteImage } from "@/services/dataset";
import type { Image } from "@/types/image-types";
import { toast } from "@/utils/toast";
import { IconButton, useDisclosure } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useCallback } from "react";
import { DeleteImageDialog } from "../DeleteImageDialog"; // Import the dialog

interface DeleteActionProps {
	readonly selectedImage: Image | null;
	// isDeleting and onDeleteClick props are removed
}

export function DeleteAction({ selectedImage }: DeleteActionProps) {
	const { selectedDataset } = useDatasetContext(); 
	const navigate = useNavigate();
	const { connections } = useServerConnections(); 
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? ""; 

	const {
		mutate: deleteImageMutate,
		isPending: isDeleting, // Internal deletion state
	} = useDeleteImage(mediaServerUrl); 
	const {
		open: isDeleteDialogOpen,
		onOpen: onDeleteOpen,
		onClose: onDeleteClose,
	} = useDisclosure(); // Dialog state managed here

	// --- Helper Function for Success --- 
	const handleDeleteSuccess = useCallback(
		(datasetName: string, imageName: string, currentImages: Image[], deletedImageIndex: number) => {
			console.log(`Successfully deleted ${imageName}`);
			toast.success({
				title: "Image Deleted",
				description: `${imageName} has been removed.`,
			});

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
		},
		[navigate, onDeleteClose] // Dependencies for this helper
	);

	// --- Helper Function for Error --- 
	const handleDeleteError = useCallback((error: Error) => {
		console.error("Failed to delete image mutation:", error);
		// Potentially show an error toast here as well
		// toast.error({ title: "Deletion Failed", description: error.message });
	}, []);

	// --- Main Confirmation Handler --- 
	const handleDeleteConfirmed = useCallback(
		async (datasetName: string, imageName: string) => {
			const currentImages = selectedDataset?.images ?? [];
			const deletedImageIndex = currentImages.findIndex(
				(img) => img.name === imageName,
			);

			// Call the mutation, passing the helper callbacks
			deleteImageMutate(
				{ datasetName, imageName },
				{
					onSuccess: () => handleDeleteSuccess(datasetName, imageName, currentImages, deletedImageIndex),
					onError: handleDeleteError,
				},
			);
		},
		[
			deleteImageMutate,
			selectedDataset,
			handleDeleteSuccess,
			handleDeleteError,
		], // Dependencies for the main handler
	);

	return (
		<>
			<Tooltip content="Delete Image">
				<IconButton
					aria-label="Delete Image"
					onClick={onDeleteOpen} // Open the dialog managed by this component
					disabled={!selectedImage || isDeleting}
					loading={isDeleting}
					size="sm"
				>
					<Trash2 size="1em" />
				</IconButton>
			</Tooltip>

			{/* Render the Delete Confirmation Dialog Here */}
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