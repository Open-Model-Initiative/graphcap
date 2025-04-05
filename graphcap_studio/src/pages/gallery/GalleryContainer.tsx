// SPDX-License-Identifier: Apache-2.0
import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner";
import { useDatasets } from "@/features/datasets/hooks/useDatasets";

import { useParams } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

/**
 * Container component for the gallery page.
 * Directly uses useDatasets hook based on route params.
 * Accepts children to render content from nested routes.
 */
export function GalleryContainer({ children }: { children: ReactNode }) {
	const { datasetId } = useParams({ from: "/gallery/$datasetId" });

	// Debug log for component renders
	useEffect(() => {
		console.debug(`[GalleryContainer] Rendered with datasetId=${datasetId}`);
	}, [datasetId]);

	const { isLoading, error, selectedDataset } = useDatasets(datasetId);

	// Debug log state changes
	useEffect(() => {
		console.debug(
			`[GalleryContainer] State updated: isLoading=${isLoading}, hasError=${!!error}, selectedDataset=${selectedDataset?.name || "null"}`,
		);
	}, [isLoading, error, selectedDataset]);

	if (isLoading) {
		console.debug("[GalleryContainer] Rendering loading state");
		return (
			<div className="flex h-full w-full items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (error) {
		console.debug(`[GalleryContainer] Rendering error state: ${error.message}`);
		return (
			<div className="flex h-full w-full items-center justify-center text-destructive">
				Error loading dataset: {error.message}
			</div>
		);
	}

	console.debug("[GalleryContainer] Rendering children");
	return <>{children}</>;
}
