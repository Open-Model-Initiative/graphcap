import { GalleryContainer } from "@/pages/gallery/GalleryContainer";
// SPDX-License-Identifier: Apache-2.0
import { createFileRoute } from "@tanstack/react-router";

// The route path is automatically derived from the file path
export const Route = createFileRoute("/gallery/$datasetId")({
	component: GalleryWithDataset,
});

function GalleryWithDataset() {
	const { datasetId } = Route.useParams();
	return <GalleryContainer initialDataset={datasetId} />;
}
