// SPDX-License-Identifier: Apache-2.0
import type { Dataset } from "@/services/dataset";
import { useAddImageToDataset, useCreateDataset } from "@/services/dataset";
import type { Image } from "@/services/images";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";

/**
 * Interface for the dataset context state
 */
type DatasetContextType = {
	// Dataset state
	datasets: Dataset[];
	currentDataset: string;
	selectedSubfolder: string | null;

	// Image selection state
	selectedImage: Image | null;

	// State setters
	setDatasets: (datasets: Dataset[]) => void;
	setCurrentDataset: (dataset: string) => void;
	setSelectedSubfolder: (subfolder: string | null) => void;
	setSelectedImage: (image: Image | null) => void;

	// Action handlers
	selectImage: (image: Image) => void;
	addToDataset: (imagePath: string, targetDataset: string) => Promise<void>;
	createDataset: (name: string) => Promise<void>;
};

/**
 * Props for the DatasetContextProvider component
 */
type DatasetProviderProps = {
	readonly children: ReactNode;
	readonly initialDatasets?: Dataset[];
	readonly initialCurrentDataset?: string;
	readonly initialSelectedSubfolder?: string | null;
	readonly onAddToDataset?: (
		imagePath: string,
		targetDataset: string,
	) => Promise<void>;
	readonly onCreateDataset?: (name: string) => Promise<void>;
	readonly onDatasetSelected?: (
		datasetId: string,
		subfolder?: string | null,
	) => void;
};

/**
 * Context for managing dataset UI state
 */
export const DatasetContext = createContext<DatasetContextType | undefined>(
	undefined,
);

/**
 * Provider component for the DatasetContext
 */
export function DatasetProvider({
	children,
	initialDatasets = [],
	initialCurrentDataset = "",
	initialSelectedSubfolder = null,
	onAddToDataset,
	onCreateDataset,
	onDatasetSelected,
}: DatasetProviderProps) {
	// Dataset state
	const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets);
	const [currentDataset, setCurrentDataset] = useState<string>(
		initialCurrentDataset,
	);
	const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(
		initialSelectedSubfolder,
	);

	// Image selection state
	const [selectedImage, setSelectedImage] = useState<Image | null>(null);

	// Get mutations from dataset service
	const createDatasetMutation = useCreateDataset();
	const addImageToDatasetMutation = useAddImageToDataset();

	// Notify parent when dataset or subfolder changes
	useEffect(() => {
		if (onDatasetSelected && currentDataset) {
			onDatasetSelected(currentDataset, selectedSubfolder);
		}
	}, [currentDataset, selectedSubfolder, onDatasetSelected]);

	// Action handlers
	const selectImage = useCallback((image: Image) => {
		setSelectedImage(image);
	}, []);

	const addToDataset = useCallback(
		async (imagePath: string, targetDataset: string): Promise<void> => {
			if (!imagePath || !targetDataset) return;

			try {
				// Use the provided handler if available
				if (onAddToDataset) {
					await onAddToDataset(imagePath, targetDataset);
					return;
				}

				// Otherwise use the mutation from dataset service
				const result = await addImageToDatasetMutation.mutateAsync({
					imagePath,
					datasetName: targetDataset,
				});

				if (result.success) {
					toast.success(
						result.message ??
							`Image added to dataset ${targetDataset} successfully`,
					);
				} else {
					toast.error(result.message ?? "Failed to add image to dataset");
				}
			} catch (error) {
				toast.error(
					`Failed to add image to dataset: ${(error as Error).message}`,
				);
				console.error("Error adding image to dataset:", error);
			}
		},
		[onAddToDataset, addImageToDatasetMutation],
	);

	const createDataset = useCallback(
		async (name: string): Promise<void> => {
			try {
				// Use the provided handler if available
				if (onCreateDataset) {
					await onCreateDataset(name);
					return;
				}

				// Otherwise use the mutation from dataset service
				await createDatasetMutation.mutateAsync(name);
				toast.success(`Created dataset ${name}`);
			} catch (error) {
				console.error("Failed to create dataset:", error);
				toast.error(`Failed to create dataset: ${(error as Error).message}`);
				throw error;
			}
		},
		[onCreateDataset, createDatasetMutation],
	);

	const value = useMemo(
		() => ({
			// Dataset state
			datasets,
			currentDataset,
			selectedSubfolder,
			selectedImage,

			// State setters
			setDatasets,
			setCurrentDataset,
			setSelectedSubfolder,
			setSelectedImage,

			// Action handlers
			selectImage,
			addToDataset,
			createDataset,
		}),
		[
			datasets,
			currentDataset,
			selectedSubfolder,
			selectedImage,
			selectImage,
			addToDataset,
			createDataset,
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
