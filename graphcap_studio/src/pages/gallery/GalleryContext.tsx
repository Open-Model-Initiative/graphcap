import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { useDatasets } from "@/features/datasets/hooks/useDatasets";
import type { Dataset, Image } from "@/types";
// SPDX-License-Identifier: Apache-2.0
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
} from "react";

/**
 * Type for the gallery context state
 */
type GalleryContextType = {
	// Dataset state
	selectedDataset: string | null;
	selectedSubfolder: string | null;
	datasets: Dataset[];
	currentDataset: Dataset | null;
	filteredImages: Image[];
	isLoading: boolean;

	// Action handlers
	handleSelectDataset: (datasetId: string, subfolder?: string | null) => void;
	handleAddToDataset: (
		imagePath: string,
		targetDataset: string,
	) => Promise<void>;
	handleCreateDataset: (name: string) => Promise<void>;
	handleUploadComplete: () => void;
};

/**
 * Props for the GalleryContextProvider component
 */
type GalleryProviderProps = {
	readonly children: ReactNode;
	readonly initialDataset?: string;
};

/**
 * Context for managing gallery UI state
 */
const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

/**
 * Provider component for the GalleryContext
 *
 * This component coordinates between the DatasetContext and EditorContext
 * to provide a unified state management solution for the gallery page.
 */
export function GalleryContextProvider({
	children,
	initialDataset,
}: GalleryProviderProps) {
	// Use the datasets hook to manage dataset state
	const {
		selectedDataset,
		selectedSubfolder,
		datasetsData,
		currentDataset: hookCurrentDataset,
		filteredImages,
		isLoading,
		handleDatasetChange,
		handleAddToDataset,
		handleCreateDataset,
		handleUploadComplete,
	} = useDatasets();

	// Set the initial dataset if provided
	useEffect(() => {
		if (initialDataset && initialDataset !== selectedDataset) {
			// Use handleDatasetChange instead of setSelectedDataset to ensure proper state updates
			handleDatasetChange(initialDataset, null);
		}
	}, [initialDataset, selectedDataset, handleDatasetChange]);

	// Create a memoized value for the context
	const value = useMemo(
		() => ({
			// Dataset state
			selectedDataset,
			selectedSubfolder,
			datasets: datasetsData?.datasets || [],
			currentDataset: hookCurrentDataset || null,
			filteredImages,
			isLoading,

			// Action handlers
			handleSelectDataset: handleDatasetChange,
			handleAddToDataset,
			handleCreateDataset,
			handleUploadComplete,
		}),
		[
			selectedDataset,
			selectedSubfolder,
			datasetsData,
			hookCurrentDataset,
			filteredImages,
			isLoading,
			handleDatasetChange,
			handleAddToDataset,
			handleCreateDataset,
			handleUploadComplete,
		],
	);

	// Provide the gallery context to children
	return (
		<GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
	);
}

/**
 * Hook for accessing the GalleryContext
 *
 * @returns The gallery context state
 * @throws Error if used outside of GalleryContextProvider
 */
export function useGalleryContext() {
	const context = useContext(GalleryContext);

	if (context === undefined) {
		throw new Error(
			"useGalleryContext must be used within a GalleryContextProvider",
		);
	}

	return context;
}

/**
 * Hook for synchronizing the DatasetContext with the GalleryContext
 *
 * @deprecated This hook is being deprecated in favor of the onDatasetSelected prop
 * on the DatasetProvider. Use that instead for new code.
 */
export function useSyncDatasetWithGallery() {
	const galleryContext = useGalleryContext();
	const datasetContext = useDatasetContext();

	// Sync from Gallery to Dataset context
	useEffect(() => {
		if (
			galleryContext.selectedDataset &&
			galleryContext.selectedDataset !== datasetContext.currentDataset
		) {
			datasetContext.setCurrentDataset(galleryContext.selectedDataset);
			datasetContext.setSelectedSubfolder(galleryContext.selectedSubfolder);
		}
	}, [
		galleryContext.selectedDataset,
		galleryContext.selectedSubfolder,
		galleryContext.datasets,
		datasetContext,
	]);

	// Sync from Dataset to Gallery context
	useEffect(() => {
		if (
			datasetContext.currentDataset &&
			datasetContext.currentDataset !== galleryContext.selectedDataset
		) {
			galleryContext.handleSelectDataset(
				datasetContext.currentDataset,
				datasetContext.selectedSubfolder,
			);
		}
	}, [
		datasetContext.currentDataset,
		datasetContext.selectedSubfolder,
		galleryContext,
	]);
}
