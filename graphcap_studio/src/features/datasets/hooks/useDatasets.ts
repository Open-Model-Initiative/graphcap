import {
	queryKeys,
	useAddImageToDataset as useAddImageToDatasetMutation,
	useCreateDataset as useCreateDatasetMutation,
	useListDatasets,
} from "@/services/dataset";
import { getQueryClient } from "@/utils/queryClient";
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

/**
 * Custom hook for managing datasets
 *
 * This hook provides functionality for listing, creating, and managing datasets
 *
 * @returns Dataset management functions and state
 */
export function useDatasets() {
	const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
	const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(
		null,
	);
	// Track the most recently uploaded images to prioritize them in the sort
	const [recentlyUploadedImages, setRecentlyUploadedImages] = useState<
		Set<string>
	>(new Set());

	// Fetch datasets with TanStack Query
	const { data: datasetsData, isLoading, error, refetch } = useListDatasets();

	// Create dataset mutation
	const createDatasetMutation = useCreateDatasetMutation();

	// Add image to dataset mutation
	const addImageToDatasetMutation = useAddImageToDatasetMutation();

	// Find the currently selected dataset
	const currentDataset = datasetsData?.datasets?.find(
		(d) => d.name === selectedDataset,
	);

	// Filter images by subfolder if selected, and sort with recently uploaded images at the top
	const filteredImages = useMemo(() => {
		const images =
			currentDataset?.images.filter((image) => {
				if (!selectedSubfolder) return true;
				return image.directory.includes(selectedSubfolder);
			}) || [];

		// Sort images with recently uploaded images at the top
		return [...images].sort((a, b) => {
			// First, prioritize recently uploaded images
			const aIsRecent = recentlyUploadedImages.has(a.path);
			const bIsRecent = recentlyUploadedImages.has(b.path);

			if (aIsRecent && !bIsRecent) return -1;
			if (!aIsRecent && bIsRecent) return 1;

			// If both or neither are recent, sort alphabetically by name
			return a.name.localeCompare(b.name);
		});
	}, [currentDataset, selectedSubfolder, recentlyUploadedImages]);

	// Set the first dataset as selected by default
	useEffect(() => {
		if (
			datasetsData?.datasets &&
			datasetsData.datasets.length > 0 &&
			!selectedDataset
		) {
			setSelectedDataset(datasetsData.datasets[0].name);
		}
	}, [datasetsData, selectedDataset]);

	/**
	 * Handle dataset selection
	 */
	const handleDatasetChange = useCallback(
		(datasetName: string, subfolder?: string | null) => {
			setSelectedDataset(datasetName);
			setSelectedSubfolder(subfolder ?? null);
		},
		[],
	);

	/**
	 * Create a new dataset
	 */
	const handleCreateDataset = useCallback(
		async (name: string): Promise<void> => {
			try {
				await createDatasetMutation.mutateAsync(name);

				// Set the newly created dataset as the selected dataset
				setSelectedDataset(name);
				setSelectedSubfolder(null);

				toast.success(`Created dataset ${name}`);
			} catch (error) {
				console.error("Failed to create dataset:", error);
				toast.error(`Failed to create dataset: ${(error as Error).message}`);
				throw error;
			}
		},
		[createDatasetMutation],
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
		[addImageToDatasetMutation],
	);

	/**
	 * Handle upload completion
	 */
	const handleUploadComplete = useCallback(() => {
		// Get the shared query client
		const sharedQueryClient = getQueryClient();

		// Force an immediate refresh to ensure the UI updates with newly uploaded images
		sharedQueryClient
			.refetchQueries({ queryKey: queryKeys.datasetImages })
			.then(() => {
				// After refresh, identify new images and mark them as recently uploaded
				if (currentDataset?.images) {
					const newRecentImages = new Set(recentlyUploadedImages);
					currentDataset.images.forEach((image) => {
						// Add all images from the current dataset to the recent set
						// In a real implementation, you might want to be more selective
						newRecentImages.add(image.path);
					});
					setRecentlyUploadedImages(newRecentImages);

					// Clear the recent uploads set after 5 minutes
					setTimeout(
						() => {
							setRecentlyUploadedImages(new Set());
						},
						5 * 60 * 1000,
					);
				}
			});
	}, [currentDataset, recentlyUploadedImages]);

	return {
		// State
		selectedDataset,
		selectedSubfolder,
		datasetsData,
		currentDataset,
		filteredImages,
		isLoading,
		error,

		// Actions
		setSelectedDataset,
		setSelectedSubfolder,
		handleDatasetChange,
		handleCreateDataset,
		handleAddToDataset,
		handleUploadComplete,
		refetch,
	};
}
