// SPDX-License-Identifier: Apache-2.0
import {
	AddImageToDatasetResponseSchema,
	DatasetCreateResponseSchema,
	DatasetDeleteResponseSchema,
	DatasetListResponseSchema,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryClient } from "../utils/queryClient";

/**
 * Dataset service for interacting with the Graphcap Media Server
 *
 * This service provides functions for managing datasets and their images
 * using the Graphcap Media Server API.
 *
 * @module DatasetService
 */

// Define the base URL for the media server API
// Use localhost instead of container name for browser access
const MEDIA_SERVER_URL =
	import.meta.env.VITE_MEDIA_SERVER_URL?.replace(
		"graphcap_media_server",
		"localhost",
	) ?? "http://localhost:32400";
const DATASETS_PATH =
	import.meta.env.VITE_DATASETS_PATH ?? "/workspace/datasets";

// Log the media server URL for debugging
console.log("Media Server URL:", MEDIA_SERVER_URL);
console.log("Datasets Path:", DATASETS_PATH);

// Query keys for TanStack Query
export const queryKeys = {
	datasets: ["datasets"] as const,
	datasetByName: (name: string) => [...queryKeys.datasets, name] as const,
	datasetImages: ["datasets", "images"] as const,
};

// Helper function to create a query client
const getClient = () => getQueryClient();

/**
 * React hook for listing all datasets and their images using TanStack Query
 *
 * @returns Query result with the list of datasets and their images
 */
export function useListDatasets() {
	return useQuery({
		queryKey: queryKeys.datasetImages,
		queryFn: async () => {
			console.log("Listing datasets and their images");

			try {
				const response = await fetch(`${MEDIA_SERVER_URL}/api/datasets/images`);
				if (!response.ok) {
					const errorText = await response.text();
					console.error("Error response:", errorText);
					throw new Error(`Failed to list datasets: ${response.statusText}`);
				}

				const data = await response.json();
				console.log("Received datasets data:", data);
				return DatasetListResponseSchema.parse(data);
			} catch (error) {
				console.error("Error fetching datasets:", error);
				throw error;
			}
		},
		meta: {
			errorMessage: "Failed to load datasets",
		},
	});
}

/**
 * React hook for creating a dataset using TanStack Query
 *
 * @returns Mutation result for creating a dataset
 */
export function useCreateDataset() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (name: string) => {
			console.log("Creating dataset:", name);

			try {
				const response = await fetch(
					`${MEDIA_SERVER_URL}/api/datasets/create`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ name }),
					},
				);

				if (!response.ok) {
					const errorText = await response.text();
					console.error("Error response:", errorText);

					// Handle specific error cases
					if (response.status === 409) {
						throw new Error(`Dataset "${name}" already exists (409)`);
					}
					throw new Error(`Failed to create dataset: ${response.statusText}`);
				}

				const data = await response.json();
				console.log("Dataset created successfully:", data);
				return DatasetCreateResponseSchema.parse(data);
			} catch (error) {
				console.error("Error creating dataset:", error);
				throw error;
			}
		},
		onSuccess: () => {
			// Invalidate datasets query to refresh data
			queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
			queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages });
		},
		meta: {
			errorMessage: "Failed to create dataset",
		},
	});
}

/**
 * React hook for adding an image to a dataset using TanStack Query
 *
 * @returns Mutation result for adding an image to a dataset
 */
export function useAddImageToDataset() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			imagePath,
			datasetName,
		}: { imagePath: string; datasetName: string }) => {
			console.log(
				"Adding image to dataset:",
				imagePath,
				"to dataset:",
				datasetName,
			);

			try {
				// Ensure we're using the correct datasets path
				const targetDatasetPath = `${DATASETS_PATH}/${datasetName}`;

				const response = await fetch(
					`${MEDIA_SERVER_URL}/api/datasets/add-image`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							imagePath,
							datasetName,
							targetPath: targetDatasetPath,
						}),
					},
				);

				if (!response.ok) {
					const errorText = await response.text();
					console.error("Error response:", errorText);

					// Handle specific error cases
					if (
						response.status === 404 &&
						errorText.includes("Dataset not found")
					) {
						throw new Error(`Dataset "${datasetName}" not found`);
					}
					if (
						response.status === 404 &&
						errorText.includes("Image not found")
					) {
						throw new Error(`Image "${imagePath}" not found`);
					}
					if (response.status === 409) {
						throw new Error("Image already exists in the dataset");
					}
					throw new Error(
						`Failed to add image to dataset: ${response.statusText}`,
					);
				}

				const data = await response.json();
				console.log("Add image to dataset result:", data);

				return AddImageToDatasetResponseSchema.parse(data);
			} catch (error) {
				console.error("Error adding image to dataset:", error);
				throw error;
			}
		},
		onSuccess: (_, variables) => {
			// Invalidate dataset queries to refresh data
			queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages });
			queryClient.invalidateQueries({
				queryKey: queryKeys.datasetByName(variables.datasetName),
			});
		},
		meta: {
			errorMessage: "Failed to add image to dataset",
		},
	});
}

/**
 * Prefetch datasets data to populate the query cache
 */
export async function prefetchDatasets(): Promise<void> {
	const queryClient = getClient();
	await queryClient.prefetchQuery({
		queryKey: queryKeys.datasetImages,
		queryFn: async () => {
			const response = await fetch(`${MEDIA_SERVER_URL}/api/datasets/images`);
			if (!response.ok) {
				throw new Error(`Failed to list datasets: ${response.statusText}`);
			}

			const data = await response.json();
			return DatasetListResponseSchema.parse(data);
		},
	});
}

/**
 * React hook for deleting a dataset using TanStack Query
 *
 * @returns Mutation result for deleting a dataset
 */
export function useDeleteDataset() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (name: string) => {
			console.log("Deleting dataset:", name);

			try {
				const response = await fetch(
					`${MEDIA_SERVER_URL}/api/datasets/${name}`,
					{
						method: "DELETE",
					},
				);

				if (!response.ok) {
					const errorText = await response.text();
					console.error("Error response:", errorText);

					// Handle specific error cases
					if (response.status === 404) {
						throw new Error(`Dataset "${name}" not found (404)`);
					}
					throw new Error(`Failed to delete dataset: ${response.statusText}`);
				}

				const data = await response.json();
				console.log("Dataset deleted successfully:", data);
				return DatasetDeleteResponseSchema.parse(data);
			} catch (error) {
				console.error("Error deleting dataset:", error);
				throw error;
			}
		},
		onSuccess: () => {
			// Invalidate datasets query to refresh data
			queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
			queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages });
		},
		meta: {
			errorMessage: "Failed to delete dataset",
		},
	});
}
