import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import {
	queryKeys,
	useAddImageToDataset as useAddImageToDatasetMutation,
	useCreateDataset as useCreateDatasetMutation,
} from "@/services/dataset";
import { getQueryClient } from "@/utils/queryClient";
import { toast } from "@/utils/toast";
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDatasetNavigation } from "../components/dataset-tree/hooks/useDatasetNavigation";
import { useDatasetContext } from "../context/DatasetContext";

/**
 * Custom hook for managing datasets and their interactions within a specific context.
 *
 * It relies on DatasetContext for the currently selected dataset state,
 * which is driven by the datasetId provided to this hook (usually from route params).
 *
 * @param datasetId - The ID (name) of the dataset to manage, typically from route params.
 * @returns Dataset management functions and derived state related to the selected dataset.
 */
export function useDatasets(datasetId: string | undefined) {
	// Get state and setter from the refactored DatasetContext
	const {
		selectDatasetById,
		selectedDataset, 
		isLoadingDataset, 
		datasetError, 
		allDatasets, 
		selectedSubfolder, 
	} = useDatasetContext();

	const { navigateToDataset } = useDatasetNavigation();

	const { connections } = useServerConnections();
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? "";

	// Track the most recently uploaded images to prioritize them in the sort
	const [recentlyUploadedImages, setRecentlyUploadedImages] = useState<Set<string>>(new Set());

	// Effect to tell the context which dataset to select when the ID changes
	useEffect(() => {
		selectDatasetById(datasetId);
	}, [datasetId, selectDatasetById]);

	const createDatasetMutation = useCreateDatasetMutation(mediaServerUrl);
	const addImageToDatasetMutation = useAddImageToDatasetMutation(mediaServerUrl);

	// Filter images based on the selectedDataset from context and the subfolder
	const filteredImages = useMemo(() => {
		const images = selectedDataset?.images.filter((image) => {
			if (!selectedSubfolder) return true;
			// Ensure directory check is safe
			return image.directory?.includes(selectedSubfolder);
		}) || [];

		// Sort images with recently uploaded images at the top
		return [...images].sort((a, b) => {
			const aIsRecent = recentlyUploadedImages.has(a.path);
			const bIsRecent = recentlyUploadedImages.has(b.path);

			if (aIsRecent && !bIsRecent) return -1;
			if (!aIsRecent && bIsRecent) return 1;

			return a.name.localeCompare(b.name);
		});
	}, [selectedDataset, selectedSubfolder, recentlyUploadedImages]);

	/**
	 * Create a new dataset and navigate to it
	 */
	const handleCreateDataset = useCallback(
		async (name: string): Promise<void> => {
			try {
				await createDatasetMutation.mutateAsync(name);
				navigateToDataset({ id: name, name: name, iconType: 'dataset' });
				toast.success({ title: `Created dataset ${name}` });
			} catch (error) {
				console.error("Failed to create dataset:", error);
				toast.error({ title: `Failed to create dataset: ${(error as Error).message}` });
				throw error;
			}
		},
		[createDatasetMutation, navigateToDataset],
	);

	/**
	 * Add an image to a dataset
	 */
	const handleAddToDataset = useCallback(
		async (imagePath: string, targetDataset: string) => {
			if (!imagePath || !targetDataset) return;
			try {
				const result = await addImageToDatasetMutation.mutateAsync({
					imagePath,
					datasetName: targetDataset,
				});
				if (result.success) {
					toast.success({
						title: result.message ??
							`Image added to dataset ${targetDataset} successfully`
					});
				} else {
					toast.error({ title: result.message ?? "Failed to add image to dataset" });
				}
			} catch (error) {
				toast.error({
					title: `Failed to add image to dataset: ${(error as Error).message}`
				});
				console.error("Error adding image to dataset:", error);
			}
		},
		[addImageToDatasetMutation],
	);

	/**
	 * Handle upload completion - Refresh might need adjustment based on context invalidation
	 */
	const handleUploadComplete = useCallback(() => {
		const sharedQueryClient = getQueryClient();

		if (mediaServerUrl) {
			sharedQueryClient.invalidateQueries({ queryKey: queryKeys.datasetImages(mediaServerUrl) });
		} else {
			console.warn("Cannot invalidate dataset images: Media Server URL not available.");
		}

		// Optionally, manage recent images state locally as before
		if (selectedDataset?.images) {
			const newRecentImages = new Set(recentlyUploadedImages);
			for (const image of selectedDataset.images) {
				newRecentImages.add(image.path);
			}
			setRecentlyUploadedImages(newRecentImages);
			setTimeout(() => {
				setRecentlyUploadedImages(new Set());
			}, 5 * 60 * 1000);
		}

	}, [selectedDataset, recentlyUploadedImages, mediaServerUrl]); // Added mediaServerUrl

	// Function to refetch datasets (might not be needed if context invalidates properly)
	const refetch = useCallback(() => {
		const sharedQueryClient = getQueryClient();
		if (mediaServerUrl) {
			sharedQueryClient.refetchQueries({ queryKey: queryKeys.datasetImages(mediaServerUrl) });
		} else {
			console.warn("Cannot refetch dataset images: Media Server URL not available.");
		}
	}, [mediaServerUrl]); 

	return {
		// State derived directly from the refactored context
		selectedDataset, // The actual Dataset object
		selectedSubfolder, // From context
		allDatasets, // Full list from context
		filteredImages, // Derived from selectedDataset and subfolder
		isLoading: isLoadingDataset, // Use context's loading state
		error: datasetError, // Use context's error state

		// Actions - mostly unchanged, but rely on context for current dataset info implicitly
		handleCreateDataset,
		handleAddToDataset,
		handleUploadComplete,
		refetch, // Expose refetch if needed
	};
}
