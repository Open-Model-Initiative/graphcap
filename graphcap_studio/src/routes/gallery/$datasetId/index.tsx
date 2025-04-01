// SPDX-License-Identifier: Apache-2.0
import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner"; // Import LoadingSpinner
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// Define the index route for a dataset, handles redirection to first content item
export const Route = createFileRoute("/gallery/$datasetId")({
	component: DatasetIndexComponent,
});

function DatasetIndexComponent() {
	const { datasetId } = Route.useParams();
	const { selectedDataset, isLoadingDataset } = useDatasetContext();
	const navigate = useNavigate();

	useEffect(() => {
		// Only redirect if the dataset is loaded and has images
		if (selectedDataset && selectedDataset.images.length > 0) {
			const firstImageName = selectedDataset.images[0].name;
			console.log(
				`Index route: Dataset "${datasetId}" loaded. Redirecting to first image: "${firstImageName}"`,
			);
			navigate({
				to: "/gallery/$datasetId/content/$contentId",
				params: { datasetId, contentId: firstImageName },
				replace: true, // Replace history entry, don't push '/gallery/$datasetId/'
			});
		}
		// Check if dataset is loaded but empty
		else if (selectedDataset && selectedDataset.images.length === 0) {
			console.log(`Index route: Dataset "${datasetId}" loaded but is empty.`);
			// Potentially render an 'empty dataset' message here if needed,
			// but for now, we'll rely on EditorContainer to show its empty state.
		}
		// No action needed if still loading (isLoadingDataset)
	}, [selectedDataset, datasetId, navigate]);

	// Render a loading spinner while the dataset context is loading
	// or before the redirect effect runs.
	if (isLoadingDataset || !selectedDataset) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<LoadingSpinner size="md" />
			</div>
		);
	}

	// If dataset is loaded but empty, render nothing specific here,
	// allowing EditorContainer (rendered by the outlet) to handle its empty state.
	// If the redirect effect hasn't run yet, this will be briefly shown.
	return null;
} 