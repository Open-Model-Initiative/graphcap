import { useDatasetContext } from "@/features/datasets";
// SPDX-License-Identifier: Apache-2.0
import { useEditorContext } from "@/features/editor/context/EditorContext";

/**
 * A hook that provides access to shared context across features
 *
 * This hook combines multiple context hooks to provide a unified interface
 * for accessing state and actions from different features.
 *
 * @returns Combined context from multiple features
 */
export function useSharedContext() {
	// Get editor context
	const editorContext = useEditorContext();

	// Get dataset context
	const datasetContext = useDatasetContext();

	// Combine contexts
	return {
		// Editor context
		...editorContext,

		// Dataset context
		datasets: datasetContext.datasets,
		currentDataset: datasetContext.currentDataset,
		selectedSubfolder: datasetContext.selectedSubfolder,
		setCurrentDataset: datasetContext.setCurrentDataset,
		setSelectedSubfolder: datasetContext.setSelectedSubfolder,
		handleAddToDataset: datasetContext.handleAddToDataset,
		handleCreateDataset: datasetContext.handleCreateDataset,

		// Add more contexts as needed
	};
}
