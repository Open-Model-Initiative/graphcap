// SPDX-License-Identifier: Apache-2.0

import type {
	ImageDeleteResponse,
	ImageProcessResponse,
} from "@/types";
import {
	AddImageToDatasetResponseSchema,
	DatasetCreateResponseSchema,
	DatasetDeleteResponseSchema,
	DatasetListResponseSchema,
	ImageDeleteResponseSchema,
	ImageProcessResponseSchema,
} from "@/types";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { fetchWithRetry } from "../utils/fetchUtils";
import { getQueryClient } from "../utils/queryClient";

/**
 * Dataset service for interacting with the Graphcap Media Server
 *
 * This service provides functions for managing datasets and their images
 * using the Graphcap Media Server API.
 *
 * @module DatasetService
 */
const DATASETS_PATH =
	import.meta.env.VITE_DATASETS_PATH ?? "/workspace/datasets";

console.log("Datasets Path:", DATASETS_PATH);

// Update query keys to potentially include dynamic parts like URL if needed
export const queryKeys = {
	datasets: ["datasets"] as const,
	datasetByName: (name: string) => [...queryKeys.datasets, name] as const,
	datasetImages: (mediaServerUrl: string) =>
		[...queryKeys.datasets, "images", { mediaServerUrl }] as const,
	images: ["images"] as const,
	imagesByDirectory: (directory?: string) => ["images", directory] as const,
};

// Helper function to create a query client
const getClient = () => getQueryClient();

/**
 * Fetches the list of all datasets and their associated images from the API.
 *
 * @returns A promise that resolves with the parsed dataset list response.
 * @throws An error if the fetch request fails or the response is not ok.
 */
async function fetchDatasetList(mediaServerUrl: string) {
	console.log(`Fetching dataset list with images from ${mediaServerUrl}`);
	try {
		// Use the passed mediaServerUrl
		const response = await fetch(`${mediaServerUrl}/api/datasets/images`);
		if (!response.ok) {
			const errorText = await response.text();
			console.error("Error response fetching dataset list:", errorText);
			throw new Error(
				`Failed to list datasets and images: ${response.statusText}`,
			);
		}

		const data = await response.json();
		console.log("Received datasets list data:", data);
		return DatasetListResponseSchema.parse(data);
	} catch (error) {
		console.error("Error in fetchDatasetList:", error);
		throw error; // Re-throw the error to be handled by the caller (useQuery/prefetchQuery)
	}
}

/**
 * React hook for listing all datasets and their images using TanStack Query with Suspense
 *
 * @param mediaServerUrl The base URL of the media server.
 * @returns Query result with the list of datasets and their images
 * 
 * Note: This requires a valid mediaServerUrl. Wrap the component using this in a Suspense boundary.
 */
export function useListDatasets(mediaServerUrl: string) {
	if (!mediaServerUrl) {
		return { data: { datasets: [] } };
	}

	return useSuspenseQuery({
		// Use the dynamic query key
		queryKey: queryKeys.datasetImages(mediaServerUrl),
		// Pass the URL to the query function
		queryFn: () => fetchDatasetList(mediaServerUrl),
		// Add caching configuration to prevent hammering the server
		staleTime: 30 * 1000, // Consider data fresh for 30 seconds
		gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
		// Disable automatic refetching on window focus to reduce API calls
		refetchOnWindowFocus: false,
		// Retry configuration
		retry: 2,
		retryDelay: 1000, // Wait 1 second between retries
		meta: {
			errorMessage: "Failed to load datasets",
		},
	});
}

/**
 * React hook for creating a dataset using TanStack Query
 *
 * @param mediaServerUrl The base URL of the media server.
 * @returns Mutation result for creating a dataset
 */
export function useCreateDataset(mediaServerUrl: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (name: string) => {
			console.log(`Creating dataset: ${name} on ${mediaServerUrl}`);
			if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");

			try {
				// Use the passed mediaServerUrl
				const response = await fetch(
					`${mediaServerUrl}/api/datasets/create`,
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
			queryClient.invalidateQueries({ queryKey: ["datasets", "images"] }); 
		},
		meta: {
			errorMessage: "Failed to create dataset",
		},
	});
}

/**
 * React hook for adding an image to a dataset using TanStack Query
 *
 * @param mediaServerUrl The base URL of the media server.
 * @returns Mutation result for adding an image to a dataset
 */
export function useAddImageToDataset(mediaServerUrl: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			imagePath,
			datasetName,
		}: { imagePath: string; datasetName: string }) => {
			console.log(
				`Adding image ${imagePath} to dataset ${datasetName} on ${mediaServerUrl}`,
			);
			if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");

			try {
				// Ensure we're using the correct datasets path
				const targetDatasetPath = `${DATASETS_PATH}/${datasetName}`;

				// Use the passed mediaServerUrl
				const response = await fetch(
					`${mediaServerUrl}/api/datasets/add-image`,
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
			console.log(
				`Invalidating queries after adding image to ${variables.datasetName}`,
			);
			queryClient.invalidateQueries({ queryKey: ["datasets", "images"] });
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
 * @param mediaServerUrl The base URL of the media server.
 */
export async function prefetchDatasets(mediaServerUrl: string): Promise<void> {
	const queryClient = getClient();
	// Ensure URL is provided before prefetching
	if (!mediaServerUrl) {
		console.warn("Cannot prefetch datasets without Media Server URL.");
		return;
	}
	await queryClient.prefetchQuery({
		// Use the dynamic query key
		queryKey: queryKeys.datasetImages(mediaServerUrl),
		// Pass the URL to the query function
		queryFn: () => fetchDatasetList(mediaServerUrl),
		// Add caching configuration to prevent hammering the server
		staleTime: 30 * 1000, // Consider data fresh for 30 seconds
	});
}

/**
 * React hook for deleting a dataset using TanStack Query
 *
 * @param mediaServerUrl The base URL of the media server.
 * @returns Mutation result for deleting a dataset
 */
export function useDeleteDataset(mediaServerUrl: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (name: string) => {
			console.log(`Deleting dataset: ${name} on ${mediaServerUrl}`);
			if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");

			try {
				// Use the passed mediaServerUrl
				const response = await fetch(
					`${mediaServerUrl}/api/datasets/${name}`,
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
			// Invalidate datasets query to refresh data (similar challenge with URL in onSuccess)
			queryClient.invalidateQueries({ queryKey: ["datasets", "images"] });
			// Also potentially invalidate the specific dataset name if relevant keys exist elsewhere
			// queryClient.invalidateQueries({ queryKey: queryKeys.datasets }); // Base dataset key if used
		},
		meta: {
			errorMessage: "Failed to delete dataset",
		},
	});
}

/**
 * React hook for uploading an image directly to a dataset using TanStack Query
 *
 * @param mediaServerUrl The base URL of the media server.
 * @returns Mutation result for uploading an image to a dataset
 */
export function useUploadImage(mediaServerUrl: string) {
	const queryClient = useQueryClient();

	return useMutation<
		ImageProcessResponse,
		Error,
		{ file: File; datasetName: string }
	>({
		mutationFn: async ({
			file,
			datasetName,
		}: { file: File; datasetName: string }) => {
			console.log(
				`Uploading image ${file.name} to dataset ${datasetName} on ${mediaServerUrl}`,
			);
			if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");

			const formData = new FormData();
			formData.append("image", file);
			formData.append("dataset", datasetName);

			// Use the passed mediaServerUrl
			const response = await fetchWithRetry(
				`${mediaServerUrl}/api/datasets/upload`,
				{
					method: "POST",
					body: formData,
				},
				3,
				2000,
				60000,
			);

			const data = await response.json();
			console.log("Upload result:", data);

			return ImageProcessResponseSchema.parse(data);
		},
		onSuccess: (_, variables) => {
			// Invalidate dataset queries to refresh data (similar challenge with URL in onSuccess)
			console.log(
				`Invalidating queries after uploading image to ${variables.datasetName}`,
			);
			queryClient.invalidateQueries({ queryKey: ["datasets", "images"] });
			queryClient.invalidateQueries({
				queryKey: queryKeys.datasetByName(variables.datasetName),
			});

			// Also invalidate general image queries that might show the new image
			queryClient.invalidateQueries({ queryKey: queryKeys.images });
		},
		meta: {
			errorMessage: "Failed to upload image to dataset",
		},
	});
}

/**
 * React hook for deleting an image from a dataset using TanStack Query
 *
 * @param mediaServerUrl The base URL of the media server.
 * @returns Mutation result for deleting an image
 */
export function useDeleteImage(mediaServerUrl: string) {
	const queryClient = useQueryClient();
	return useMutation<
		ImageDeleteResponse,
		Error,
		{ datasetName: string; imageName: string }
	>({
		mutationFn: async ({ datasetName, imageName }) => {
			console.log(
				`Deleting image ${imageName} from dataset ${datasetName} on ${mediaServerUrl}`,
			);
			if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");

			// Construct the URL carefully, ensuring proper encoding if needed
			// Assuming imageName might contain special characters, though ideally IDs are safer.
			const encodedImageName = encodeURIComponent(imageName);
			// Use the passed mediaServerUrl
			const url = `${mediaServerUrl}/api/datasets/${datasetName}/images/${encodedImageName}`;

			try {
				const response = await fetch(url, {
					method: "DELETE",
				});

				if (!response.ok) {
					const errorText = await response.text();
					console.error("Error response deleting image:", errorText);
					// Handle specific error cases
					if (response.status === 404) {
						throw new Error(
							`Image "${imageName}" not found in dataset "${datasetName}" (404)`,
						);
					}
					throw new Error(
						`Failed to delete image: ${response.statusText}`,
					);
				}

				const data = await response.json();
				console.log("Image deleted successfully:", data);
				return ImageDeleteResponseSchema.parse(data);
			} catch (error) {
				console.error("Error deleting image:", error);
				throw error;
			}
		},
		onSuccess: (_, variables) => {
			// Invalidate relevant queries to refresh data (similar challenge with URL in onSuccess)
			console.log(
				`Invalidating queries after deleting image from ${variables.datasetName}`,
			);
			queryClient.invalidateQueries({ queryKey: ["datasets", "images"] });
			queryClient.invalidateQueries({
				queryKey: queryKeys.datasetByName(variables.datasetName),
			});
			// Potentially invalidate general image/directory listings if they exist
			queryClient.invalidateQueries({ queryKey: queryKeys.images });
			// Assuming image names might relate to directories, invalidate relevant directory keys if used
			// We need to know the directory structure or have a more specific key if possible.
			// For now, invalidating the base 'images' key might suffice.
		},
		meta: {
			errorMessage: "Failed to delete image",
		},
	});
}
