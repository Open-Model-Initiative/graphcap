// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { GalleryContainer } from "@/pages/gallery/GalleryContainer";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// The route path is automatically derived from the file path
export const Route = createFileRoute("/gallery/$datasetId")({
	component: GalleryWithDataset,
});

function GalleryWithDataset() {
	const { datasetId } = Route.useParams();
	const { setCurrentDataset } = useDatasetContext();

	useEffect(() => {
		console.log(`Setting current dataset from route: ${datasetId}`);
		setCurrentDataset(datasetId);
	}, [datasetId, setCurrentDataset]);

	return <GalleryContainer />;
}
