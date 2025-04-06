import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/gallery/")({
	component: GalleryIndex,
});

function GalleryIndex() {
	// Get datasets and loading state directly from the context
	const { allDatasets, isLoadingList } = useDatasetContext();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoadingList && allDatasets && allDatasets.length > 0) {
			// Prioritize 'os_img' dataset
			const osImgDataset = allDatasets.find(dataset => dataset.name === "os_img");

			if (osImgDataset) {
				const path = `/gallery/${osImgDataset.name}`;
				navigate({ to: path, replace: true }); 
			} else {
				// Fallback to the first dataset if 'os_img' is not found
				const firstDataset = allDatasets[0];
				const path = `/gallery/${firstDataset.name}`;
				navigate({ to: path, replace: true }); 
			}
		}
	}, [allDatasets, isLoadingList, navigate]);

	if (isLoadingList || !allDatasets || allDatasets.length === 0) {
		return (
			<div className="flex items-center justify-center h-full">
				<p>Loading datasets...</p>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center h-full">
			<p>Loading datasets...</p>
		</div>
	);
}
