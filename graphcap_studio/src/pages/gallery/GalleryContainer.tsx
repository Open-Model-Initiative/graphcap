// SPDX-License-Identifier: Apache-2.0
import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner";
import { useDatasets } from "@/features/datasets/hooks/useDatasets";
import { EditorContainer } from "@/features/editor/containers/EditorContainer";
import { EditorContextProvider } from "@/features/editor/context/EditorContext";
import type { Dataset } from "@/types";
import { useParams } from "@tanstack/react-router";

/**
 * Inner component now receives state via props
 */
function GalleryContainerInner({ currentDataset, selectedSubfolder }: {
	currentDataset: Dataset | null;
	selectedSubfolder: string | null;
}) {
	return (
		<EditorContextProvider dataset={currentDataset}>
			<div className="h-full w-full overflow-hidden">
				<EditorContainer
					dataset={currentDataset}
					directory={selectedSubfolder ?? undefined}
				/>
			</div>
		</EditorContextProvider>
	);
}

/**
 * Container component for the gallery page.
 * Directly uses useDatasets hook based on route params.
 */
export function GalleryContainer() {
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
		/>
	);
}
