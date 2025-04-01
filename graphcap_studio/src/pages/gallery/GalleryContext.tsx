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
}: GalleryProviderProps) {
	// Use the datasets hook to manage dataset state
	const {
		selectedDataset,
		selectedSubfolder,
		datasetsData,
		currentDataset: hookCurrentDataset,
		filteredImages,
		isLoading,
		handleAddToDataset,
		handleCreateDataset,
		handleUploadComplete,
	} = useDatasets();

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
			// REMOVED: handleSelectDataset
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
			// Ensure handleDatasetChange is fully removed from dependencies
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
