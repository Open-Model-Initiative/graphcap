// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { GalleryContainer } from "@/pages/gallery/GalleryContainer";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// The route path is automatically derived from the file path
export const Route = createFileRoute("/gallery/$datasetId")({
	component: DatasetLayoutComponent,
});

function DatasetLayoutComponent() {
	const { datasetId } = Route.useParams();
	const { selectDatasetById } = useDatasetContext();

	useEffect(() => {
		console.log(`Setting current dataset from route: ${datasetId}`);
		selectDatasetById(datasetId);
	}, [datasetId, selectDatasetById]);

	// Render the GalleryContainer as layout, and Outlet for nested content route
	return (
		<GalleryContainer>
			<Outlet />
		</GalleryContainer>
	);
}
