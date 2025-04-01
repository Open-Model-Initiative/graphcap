// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { EditorContainer } from "@/features/editor/containers/EditorContainer"; // Import EditorContainer
import { ViewerContainer } from "@/features/gallery-viewer/ViewerContainer";
import { PropertiesContainer } from "@/features/image-properties";
import { EditorLayout } from "@/pages/gallery/GalleryLayout";
import type { Image } from "@/types"; // Import Image type
import { createFileRoute, useNavigate } from "@tanstack/react-router"; // Import useNavigate
import { useEffect } from "react";
import { z } from "zod"; // Import zod for validation

// Define the valid view modes
type ViewMode = "grid" | "carousel" | "edit";

// Define the search parameter schema using Zod
const gallerySearchSchema = z.object({
	view: z.enum(["grid", "carousel", "edit"]).optional().catch("carousel"), // Default to 'carousel' if missing or invalid
});

// Define the route structure, inheriting parent params automatically
export const Route = createFileRoute("/gallery/$datasetId/content/$contentId")({
	// Add search parameter validation
	validateSearch: gallerySearchSchema,
	component: SelectedContentComponent,
});

function SelectedContentComponent() {
	// Get datasetId (from parent) and contentId (from this route segment)
	const { datasetId, contentId } = Route.useParams();
	// Get validated search params
	const { view } = Route.useSearch();
	const {
		selectedDataset,
		setSelectedImage,
		selectedImage,
		isLoadingDataset,
		datasetError,
	} = useDatasetContext();
	const navigate = useNavigate();

	useEffect(() => {
		console.log(
			`Content route effect: datasetId=${datasetId}, contentId=${contentId}, view=${view}`,
		);
		if (selectedDataset && contentId) {
			const imageToSelect: Image | undefined = selectedDataset.images.find(
				(img) => img.name === contentId,
			);

			if (imageToSelect) {
				// Check if the image in context already matches the route
				if (selectedImage?.name !== imageToSelect.name) {
					console.log("Setting selected image from route:", imageToSelect.name);
					setSelectedImage(imageToSelect);
				}
			} else {
				// Content ID is invalid for this dataset.
				if (selectedDataset.images && selectedDataset.images.length > 0) {
					const firstImageName = selectedDataset.images[0].name;
					console.warn(
						`Content ID "${contentId}" not found. Redirecting to first image: "${firstImageName}" `,
					);
					navigate({
						to: "/gallery/$datasetId/content/$contentId",
						params: { datasetId, contentId: firstImageName },
						search: { view },
						replace: true,
					});
				} else {
					console.warn(
						`Content ID "${contentId}" not found and dataset is empty. Resetting selection.`,
					);
					if (selectedImage !== null) { // Avoid unnecessary state updates
						setSelectedImage(null);
					}
				}
			}
		} else if (!contentId) {
			if (selectedImage !== null) { // Avoid unnecessary state updates
				setSelectedImage(null);
			}
		}
	}, [
		selectedDataset,
		contentId,
		setSelectedImage,
		datasetId,
		navigate,
		view,
		selectedImage, // Add selectedImage to dependencies to prevent infinite loop if redirect occurs
	]);

	// Handle loading and error states from context
	if (isLoadingDataset) {
		// TODO: Add a proper loading skeleton/spinner component
		return <div>Loading dataset...</div>;
	}

	if (datasetError) {
		// TODO: Add a proper error display component
		return <div>Error loading dataset: {datasetError.message}</div>;
	}

	if (!selectedDataset) {
		// This case should ideally be handled by parent route or loader, but as a fallback:
		return <div>Dataset not found.</div>;
	}

	// Determine the main viewer component based on view mode
	const viewerComponent = view === "edit" ? (
		<EditorContainer />
	) : (
		<ViewerContainer
			images={selectedDataset.images}
			selectedImage={selectedImage}
			isLoading={false} // Loading handled above
			isEmpty={selectedDataset.images.length === 0}
			title={selectedDataset.name}
		/>
	);

	// Render the EditorLayout with viewer and properties slots
	return (
		<EditorLayout
			viewer={viewerComponent}
			properties={
				<PropertiesContainer
					selectedImage={selectedImage}
					className="h-full"
				/>
			}
		/>
	);
} 