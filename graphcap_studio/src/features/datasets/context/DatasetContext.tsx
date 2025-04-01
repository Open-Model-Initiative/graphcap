// SPDX-License-Identifier: Apache-2.0
import { useListDatasets } from "@/services/dataset";
import type { Dataset, Image } from "@/types";
import { toast } from "@/utils/toast";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

/**
 * Interface for the dataset context state
 */
type DatasetContextType = {
	// Dataset state
	datasets: Dataset[];
	isLoadingDatasets: boolean;
	currentDataset: string;
	selectedSubfolder: string | null;

	// Image selection state
	selectedImage: Image | null;

	// State setters
	setCurrentDataset: (dataset: string) => void;
	setSelectedSubfolder: (subfolder: string | null) => void;
	setSelectedImage: (image: Image | null) => void;

	// Action handlers
	selectImage: (image: Image) => void;
};

/**
 * Props for the DatasetContextProvider component
 */
type DatasetProviderProps = {
	readonly children: ReactNode;
};

/**
 * Context for managing dataset UI state
 */
export const DatasetContext = createContext<DatasetContextType | undefined>(
	undefined,
);

/**
 * Provider component for the DatasetContext
 * Manages dataset state, including fetching the list internally.
 */
export function DatasetProvider({ children }: DatasetProviderProps) {
	// Fetch datasets internally
	const { data: datasetsData, isLoading: isLoadingDatasets } = useListDatasets();

	// Dataset state (managed internally or derived from query)
	const datasets = useMemo(() => datasetsData?.datasets || [], [datasetsData]);
	const [currentDataset, setCurrentDataset] = useState<string>(""); // Initial empty, set by route
	const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);

	// Image selection state
	const [selectedImage, setSelectedImage] = useState<Image | null>(null);

	// Action handlers
	const selectImage = useCallback((image: Image) => {
		setSelectedImage(image);
	}, []);

	const value = useMemo(
		() => ({
			// Dataset state
			datasets,
			isLoadingDatasets,
			currentDataset,
			selectedSubfolder,
			selectedImage,

			// State setters
			setCurrentDataset,
			setSelectedSubfolder,
			setSelectedImage,

			// Action handlers
			selectImage,
		}),
		[
			datasets,
			isLoadingDatasets,
			currentDataset,
			selectedSubfolder,
			selectedImage,
			selectImage,
		],
	);

	return (
		<DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
	);
}

/**
 * Hook for accessing the DatasetContext
 *
 * @returns The dataset context state
 * @throws Error if used outside of DatasetProvider
 */
export function useDatasetContext() {
	const context = useContext(DatasetContext);

	if (context === undefined) {
		throw new Error("useDatasetContext must be used within a DatasetProvider");
	}

	return context;
}
