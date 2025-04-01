// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { ViewerContainer } from "@/features/gallery-viewer/ViewerContainer";
import { PropertiesContainer } from "@/features/image-properties";
import { GalleryLayout } from "@/pages/gallery/GalleryLayout";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

// Define the search parameter schema using Zod
const gallerySearchSchema = z.object({
	view: z.enum(["grid", "carousel", "edit"]).optional().catch("carousel"),
});

export const Route = createFileRoute("/gallery/$datasetId/content/$contentId")({
	validateSearch: gallerySearchSchema,
	component: SelectedContentComponent,
});

/**
 * Route component for displaying a specific image from a dataset
 * 
 * Handles:
 * - Syncing the selected image with the route parameters
 * - Redirecting to valid images if the contentId is invalid
 * - Displaying the appropriate viewer based on view mode
 */
function SelectedContentComponent() {
	const { datasetId, contentId } = Route.useParams();
	const { view } = Route.useSearch();
	const {
		selectedDataset,
		setSelectedImage,
		selectedImage,
		isLoadingDataset,
		datasetError,
	} = useDatasetContext();
	const navigate = useNavigate();

	// Sync the selected image with the route parameters
	useEffect(() => {
		if (!selectedDataset || !contentId) {
			if (selectedImage !== null) {
				setSelectedImage(null);
			}
			return;
		}

		const imageToSelect = selectedDataset.images.find(
			(img) => img.name === contentId,
		);

		if (imageToSelect) {
			if (selectedImage?.name !== imageToSelect.name) {
				setSelectedImage(imageToSelect);
			}
		} else if (selectedDataset.images.length > 0) {
			// Invalid contentId - redirect to first image
			navigate({
				to: "/gallery/$datasetId/content/$contentId",
				params: { datasetId, contentId: selectedDataset.images[0].name },
				search: { view },
				replace: true,
			});
		} else {
			// Dataset is empty
			setSelectedImage(null);
		}
	}, [
		selectedDataset,
		contentId,
		setSelectedImage,
		datasetId,
		navigate,
		view,
		selectedImage,
	]);

	if (isLoadingDataset) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-pulse text-gray-400">Loading dataset...</div>
			</div>
		);
	}

	if (datasetError) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-red-400 bg-red-950/50 p-4 rounded-lg">
					<h3 className="font-semibold mb-2">Error Loading Dataset</h3>
					<p>{datasetError.message}</p>
				</div>
			</div>
		);
	}

	if (!selectedDataset) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-yellow-400 bg-yellow-950/50 p-4 rounded-lg">
					Dataset not found
				</div>
			</div>
		);
	}

	return (
		<GalleryLayout
			viewer={
				<ViewerContainer
					title={selectedDataset.name}
					showViewModeToggle={selectedDataset.images.length > 0}
				/>
			}
			properties={
				<PropertiesContainer
					selectedImage={selectedImage}
					className="h-full"
				/>
			}
		/>
	);
} 