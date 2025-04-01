// SPDX-License-Identifier: Apache-2.0
import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner";
import { useDatasets } from "@/features/datasets/hooks/useDatasets";
import { EditorContainer } from "@/features/editor/containers/EditorContainer";
import type { Dataset } from "@/types";
import { useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";


	
/**
 * Inner component now receives state via props and renders children
 */
function GalleryContainerInner({ currentDataset, selectedSubfolder, children }: {
	readonly currentDataset: Dataset | null;
	readonly selectedSubfolder: string | null;
	readonly children: ReactNode;
}) {
	return (
			<div className="h-full w-full overflow-hidden">
				{children}
			</div>
	);
}

/**
 * Container component for the gallery page.
 * Directly uses useDatasets hook based on route params.
 * Accepts children to render content from nested routes.
 */
export function GalleryContainer({ children }: { children: ReactNode }) {
	const { datasetId } = useParams({ from: "/gallery/$datasetId" });

	const {
		selectedDataset,
		selectedSubfolder,
		isLoading,
		error,
	} = useDatasets(datasetId);

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full w-full items-center justify-center text-destructive">
				Error loading dataset: {error.message}
			</div>
		);
	}

	return (
		<GalleryContainerInner
			currentDataset={selectedDataset}
			selectedSubfolder={selectedSubfolder}
		>
			{children}
		</GalleryContainerInner>
	);
}
