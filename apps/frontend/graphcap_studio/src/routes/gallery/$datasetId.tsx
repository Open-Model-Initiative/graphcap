// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { GalleryContainer } from "@/pages/gallery/GalleryContainer";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

// The route path is automatically derived from the file path
export const Route = createFileRoute("/gallery/$datasetId")({
	component: DatasetLayoutComponent,
});

function DatasetLayoutComponent() {
	const { datasetId } = Route.useParams();
	const { selectDatasetById } = useDatasetContext();
	const initializedRef = useRef(false);

	useEffect(() => {
		if (datasetId && !initializedRef.current) {
			console.debug(`[DatasetRoute] Setting dataset from route param: datasetId=${datasetId}`);
			selectDatasetById(datasetId);
			initializedRef.current = true;
		}
	}, [datasetId, selectDatasetById]);

	console.debug('[DatasetRoute] Rendering DatasetLayoutComponent');

	return (
		<GalleryContainer>
			<Outlet />
		</GalleryContainer>
	);
}
