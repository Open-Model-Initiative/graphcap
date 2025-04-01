// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { EditorContainer } from "@/features/editor/containers/EditorContainer"; // Import EditorContainer
import type { Image } from "@/types"; // Import Image type
import { createFileRoute, useNavigate } from "@tanstack/react-router"; // Import useNavigate
import { useEffect } from "react";

// Define the route structure, inheriting parent params automatically
export const Route = createFileRoute("/gallery/$datasetId/content/$contentId")({
	component: SelectedContentComponent,
});

function SelectedContentComponent() {
	// Get datasetId (from parent) and contentId (from this route segment)
	// Use the type-safe Route.useParams() hook instead of the general useParams()
	const { datasetId, contentId } = Route.useParams();
	const { selectedDataset, setSelectedImage, selectedSubfolder } =
		useDatasetContext(); // Add selectedSubfolder
	const navigate = useNavigate(); // Get the navigate function

	useEffect(() => {
		console.log(
			`Content route effect: datasetId=${datasetId}, contentId=${contentId}`,
		);
		if (selectedDataset && contentId) {
			// Find the image matching the contentId in the URL
			// TODO: Adapt for different content types (video) later if needed
			const imageToSelect: Image | undefined = selectedDataset.images.find(
				(img) => img.name === contentId,
			);

			if (imageToSelect) {
				console.log("Setting selected image from route:", imageToSelect.name);
				setSelectedImage(imageToSelect);
			} else {
				// Content ID is invalid for this dataset.
				// Redirect to the first image if available.
				if (selectedDataset.images && selectedDataset.images.length > 0) {
					const firstImageName = selectedDataset.images[0].name;
					console.warn(
						`Content ID "${contentId}" not found. Redirecting to first image: "${firstImageName}" `,
					);
					navigate({ // Use navigate to redirect
						to: "/gallery/$datasetId/content/$contentId",
						params: { datasetId, contentId: firstImageName },
						replace: true, // Replace the invalid URL in history
					});
				} else {
					// Dataset has no images, set selection to null
					console.warn(
						`Content ID "${contentId}" not found and dataset is empty. Resetting selection.`,
					);
					setSelectedImage(null);
				}
			}
		} else if (!contentId) {
			// This case might occur during initial load or if URL is manually altered
			setSelectedImage(null);
		}
		// Dependency array: run effect if dataset changes or contentId changes
	}, [
		selectedDataset,
		contentId,
		setSelectedImage,
		datasetId,
		navigate, // Add navigate to dependency array
	]);

	// Render EditorContainer, passing the selected dataset and subfolder from context
	return (
		<EditorContainer
			dataset={selectedDataset} // Pass the dataset object from context
			directory={selectedSubfolder ?? undefined} // Pass the subfolder from context
		/>
	);
} 