// SPDX-License-Identifier: Apache-2.0
import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import { useListDatasets } from "@/services/dataset";
import type { Dataset, Image } from "@/types";
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
interface DatasetContextType {
	/** The fully resolved Dataset object matching the currently targeted ID, or null if loading/not found/not selected. */
	selectedDataset: Dataset | null;
	/** Indicates if the context is fetching the list OR resolving the selected dataset. */
	isLoadingDataset: boolean;
	/** Stores any error encountered while loading the list or finding the selected dataset. */
	datasetError: Error | null;
	/** The original list of all datasets fetched. */
	allDatasets: Dataset[];
	/** Indicates if the initial fetch of all datasets is loading. */
	isLoadingList: boolean;
	/** Function to tell the context which dataset ID to attempt to select. */
	selectDatasetById: (id: string | undefined) => void;

	// Image selection state
	selectedImage: Image | null;

	// State setters
	setSelectedImage: (image: Image | null) => void;
	// Keep subfolder state? Assume yes for now.
	selectedSubfolder: string | null;
	setSelectedSubfolder: (subfolder: string | null) => void;
}

/**
 * Props for the DatasetContextProvider component
 */
interface DatasetProviderProps {
	children: ReactNode;
}

/**
 * Context for managing dataset UI state
 */
const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

/**
 * Provider component for the DatasetContext
 * Manages dataset state, including fetching the list internally.
 */
export function DatasetProvider({ children }: DatasetProviderProps) {
	const { connections } = useServerConnections();
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? "";

	const {
		data: datasetListResponse,
		isLoading: isLoadingList,
		error: listError,
	} = useListDatasets(mediaServerUrl);

	// State for the *target* ID that we want to select
	const [targetDatasetId, setTargetDatasetId] = useState<string | undefined>(
		undefined,
	);
	// State for the resolved selected dataset object
	const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
	// State specifically for the process of finding the dataset after the list is loaded
	const [isResolving, setIsResolving] = useState<boolean>(false); // Start as false, trigger on targetId change
	// State for errors specific to finding the dataset (e.g., not found)
	const [resolveError, setResolveError] = useState<Error | null>(null);

	// Keep existing image and subfolder state from original implementation
	const [selectedImage, setSelectedImage] = useState<Image | null>(null);
	const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);

	const allDatasets = useMemo(
		() => datasetListResponse?.datasets ?? [],
		[datasetListResponse],
	);

	// Define the setter function that consumers will call
	const selectDatasetById = useCallback((id: string | undefined) => {
		setTargetDatasetId(id); // Update the target ID state
		setSelectedImage(null); // Also reset selected image when dataset changes
		setSelectedSubfolder(null); // Reset subfolder when dataset changes
	}, []);

	// useEffect to find the selected dataset when the TARGET ID or list changes
	useEffect(() => {
		if (!targetDatasetId) {
			setSelectedDataset(null);
			setIsResolving(false);
			setResolveError(null);
			return;
		}

		if (isLoadingList || listError) {
			setIsResolving(true);
			setSelectedDataset(null);
			setResolveError(null);
			return;
		}

		setIsResolving(true);
		const foundDataset = allDatasets.find((ds) => ds.name === targetDatasetId);

		if (foundDataset) {
			setSelectedDataset(foundDataset);
			setResolveError(null);
		} else {
			setSelectedDataset(null);
			if (!isLoadingList) {
				setResolveError(new Error(`Dataset "${targetDatasetId}" not found.`));
			}
		}
		setIsResolving(false);
	}, [targetDatasetId, allDatasets, isLoadingList, listError]);


	const isLoadingDataset = isLoadingList || isResolving;
	const datasetError = listError instanceof Error ? listError : resolveError;

	// Provide the new context value structure, including the setter and kept state
	const value = useMemo(
		() => ({
			selectedDataset,
			isLoadingDataset,
			datasetError,
			allDatasets,
			isLoadingList,
			selectDatasetById,
			selectedImage,
			setSelectedImage, 
			selectedSubfolder,
			setSelectedSubfolder, 
		}),
		[ 
			selectedDataset,
			isLoadingDataset,
			datasetError,
			allDatasets,
			isLoadingList,
			selectDatasetById,
			selectedImage,
			selectedSubfolder,
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
export function useDatasetContext(): DatasetContextType {
	const context = useContext(DatasetContext);

	if (context === undefined) {
		throw new Error("useDatasetContext must be used within a DatasetProvider");
	}

	return context;
}
