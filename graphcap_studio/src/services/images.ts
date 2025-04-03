// SPDX-License-Identifier: Apache-2.0
import {
	DatasetListResponseSchema,
	GenericApiResponseSchema,
	ImageListResponseSchema,
	ImageProcessResponseSchema,
} from "@/types";
// Type Imports
import type {
	GenericApiResponse,
	ImageProcessRequest,
	ImageProcessResponse,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithRetry } from "../utils/fetchUtils";
import { getQueryClient } from "../utils/queryClient";

/**
 * Image service for interacting with the Graphcap Media Server
 *
 * This service provides functions for listing, viewing, and processing images
 * using the Graphcap Media Server API.
 *
 * @module ImageService
 */

// const MEDIA_SERVER_URL =
// 	import.meta.env.VITE_MEDIA_SERVER_URL?.replace(
// 		"graphcap_media_server",
// 		"localhost",
// 	) ?? "http://localhost:32400";
const DATASETS_PATH =
	import.meta.env.VITE_DATASETS_PATH ?? "/workspace/datasets";

// console.log("Media Server URL:", MEDIA_SERVER_URL);
console.log("Datasets Path:", DATASETS_PATH);

// Cache for image URLs to avoid redundant requests
const imageUrlCache = new Map<string, string>();

// Cache for image thumbnails
const thumbnailCache = new Map<string, string>();

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

// Query keys for TanStack Query
export const queryKeys = {
	images: ["images"] as const,
	imagesByDirectory: (mediaServerUrl: string, directory?: string) =>
		[...queryKeys.images, directory, { mediaServerUrl }] as const,
	datasets: ["datasets"] as const,
	datasetImages: (mediaServerUrl: string) =>
		[...queryKeys.datasets, "images", { mediaServerUrl }] as const,
};

// Helper function to create a query client
const getClient = () => getQueryClient();

/**
 * Fetch images from a directory.
 */
async function fetchImagesByDirectory(mediaServerUrl: string, directory?: string) {
	console.log("Listing images from directory:", directory);
	if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");

	const url = new URL(`${mediaServerUrl}/api/images`);
	if (directory) {
		url.searchParams.append("directory", directory);
	}

	const response = await fetchWithRetry(url.toString());

	const data = await response.json();
	console.log("Received data:", data);
	return ImageListResponseSchema.parse(data);
}

/**
 * React hook for listing images using TanStack Query
 *
 * @param mediaServerUrl The base URL of the media server.
 * @param directory - Optional directory path
 * @returns Query result with the list of images
 */
export function useListImages(mediaServerUrl: string, directory?: string) {
	return useQuery({
		queryKey: queryKeys.imagesByDirectory(mediaServerUrl, directory),
		queryFn: () => fetchImagesByDirectory(mediaServerUrl, directory),
		enabled: !!mediaServerUrl, // Only run the query if the URL is provided
		meta: {
			errorMessage: "Failed to load images",
		},
	});
}

/**
 * Fetch dataset images list.
 */
async function fetchDatasetImages(mediaServerUrl: string) {
	console.log("Listing dataset images");
	if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");
	try {
		const response = await fetchWithRetry(
			`${mediaServerUrl}/api/datasets/images`,
		);

		const data = await response.json();
		console.log("Received datasets data:", data);
		return DatasetListResponseSchema.parse(data);
	} catch (error) {
		console.error("Error fetching dataset images:", error);
		throw error;
	}
}

/**
 * React hook for listing dataset images using TanStack Query
 *
 * @param mediaServerUrl The base URL of the media server.
 * @returns Query result with the list of datasets and their images
 */
export function useListDatasetImages(mediaServerUrl: string) {
	return useQuery({
		queryKey: queryKeys.datasetImages(mediaServerUrl),
		queryFn: () => fetchDatasetImages(mediaServerUrl),
		enabled: !!mediaServerUrl, // Only run the query if the URL is provided
		meta: {
			errorMessage: "Failed to load dataset images",
		},
	});
}

/**
 * Get the URL for viewing an image
 *
 * @param mediaServerUrl The base URL of the media server.
 * @param imagePath - Path to the image
 * @returns URL for viewing the image
 */
export function getImageUrl(mediaServerUrl: string, imagePath: string): string {
	if (!mediaServerUrl) {
		console.warn("Cannot get image URL: Media Server URL not available.");
		return ""; // Or return a placeholder image URL
	}
	// Check if URL is in cache (Note: Cache key should ideally include mediaServerUrl if multiple servers are possible)
	const cachedUrl = imageUrlCache.get(imagePath);
	if (cachedUrl) {
		return cachedUrl;
	}

	// Ensure the path starts with a slash and doesn't have duplicate slashes
	let normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

	// Check if the path needs the workspace prefix
	// If the path doesn't start with /workspace and doesn't include datasets, add /workspace
	if (
		!normalizedPath.startsWith("/workspace") &&
		!normalizedPath.includes("/workspace/") &&
		normalizedPath.includes(DATASETS_PATH)
	) {
		console.log("Adding workspace prefix to path:", normalizedPath);
		normalizedPath = `/workspace${normalizedPath}`;
	}

	// Add a cache-busting parameter to prevent CORS caching issues
	const cacheBuster = `_cb=${Date.now()}`;

	// Construct the URL with the media server URL and normalized path
	const url = `${mediaServerUrl}/api/images/view${normalizedPath}?${cacheBuster}`;

	console.debug("Generated image URL:", url, "from path:", imagePath);

	// Cache the URL
	imageUrlCache.set(imagePath, url);

	// Set cache expiration
	setTimeout(() => {
		imageUrlCache.delete(imagePath);
	}, CACHE_EXPIRATION);

	return url;
}

/**
 * Get the URL for a thumbnail version of an image
 *
 * @param mediaServerUrl The base URL of the media server.
 * @param imagePath - Path to the image
 * @param width - Desired width of the thumbnail
 * @param height - Desired height of the thumbnail
 * @returns URL for the thumbnail
 */
export function getThumbnailUrl(
	mediaServerUrl: string,
	imagePath: string,
	width = 200,
	height = 200,
	format?: string,
): string {
	if (!mediaServerUrl) {
		console.warn("Cannot get thumbnail URL: Media Server URL not available.");
		return ""; // Or return a placeholder image URL
	}
	const fmt = format ?? "webp";
	const cacheKey = `${imagePath}_${width}x${height}_${fmt}`; // Note: Cache key should ideally include mediaServerUrl

	const cachedUrl = thumbnailCache.get(cacheKey);
	if (cachedUrl) {
		return cachedUrl;
	}

	let normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

	if (
		!normalizedPath.startsWith("/workspace") &&
		!normalizedPath.includes("/workspace/") &&
		normalizedPath.includes(DATASETS_PATH)
	) {
		normalizedPath = `/workspace${normalizedPath}`;
	}

	const cacheBuster = `_cb=${Date.now()}`;
	const url = `${mediaServerUrl}/api/images/view${normalizedPath}?width=${width}&height=${height}&format=${fmt}&${cacheBuster}`;

	thumbnailCache.set(cacheKey, url);
	setTimeout(() => {
		thumbnailCache.delete(cacheKey);
	}, CACHE_EXPIRATION);

	return url;
}

/**
 * Preload an image to cache it in the browser
 *
 * @param mediaServerUrl The base URL of the media server.
 * @param imagePath - Path to the image
 * @param size - Size of the image to preload ('thumbnail' or 'full')
 */
export function preloadImage(
	mediaServerUrl: string,
	imagePath: string,
	size: "thumbnail" | "full" = "thumbnail",
): void {
	if (!mediaServerUrl) {
		console.warn("Cannot preload image: Media Server URL not available.");
		return;
	}
	const url =
		size === "thumbnail" ? getThumbnailUrl(mediaServerUrl, imagePath) : getImageUrl(mediaServerUrl, imagePath);

	const img = new Image();
	img.src = url;

	// Add event listeners to track load/error
	img.onload = () => {
		console.debug(`Preloaded image (${size}): ${imagePath}`);
	};

	img.onerror = () => {
		console.warn(`Failed to preload image (${size}): ${imagePath}`);
		// Remove from cache if loading failed
		if (size === "thumbnail") {
			const cacheKey = `${imagePath}_200x200_webp`; // Note: Needs refinement if width/height vary
			thumbnailCache.delete(cacheKey);
		} else {
			imageUrlCache.delete(imagePath);
		}
	};
}

/**
 * React hook for processing an image using TanStack Query
 *
 * @param mediaServerUrl The base URL of the media server.
 * @returns Mutation result for processing an image
 */
export function useProcessImage(mediaServerUrl: string) {
	const queryClient = useQueryClient();

	return useMutation<ImageProcessResponse, Error, ImageProcessRequest>({
		mutationFn: async (variables: ImageProcessRequest) => {
			console.log("Processing image:", variables.imagePath);
			if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");

			const response = await fetchWithRetry(
				`${mediaServerUrl}/api/images/process`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(variables),
				},
			);

			const data = await response.json();
			console.log("Processed image result:", data);

			// Clear caches for this image path to ensure fresh data
			const imagePath = variables.imagePath;
			imageUrlCache.delete(imagePath);

			// Clear all thumbnail cache entries for this image
			for (const key of thumbnailCache.keys()) {
				if (key.startsWith(`${imagePath}_`)) {
					thumbnailCache.delete(key);
				}
			}

			return ImageProcessResponseSchema.parse(data);
		},
		onSuccess: () => {
			// Invalidate relevant queries to refresh data
			// Use the passed URL for invalidation
			if (mediaServerUrl) {
				queryClient.invalidateQueries({ queryKey: [...queryKeys.images, { mediaServerUrl }] }); // Base images key with URL
				queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages(mediaServerUrl) });
			} else {
				console.warn("Cannot invalidate queries: Media Server URL not available.");
			}
		},
		meta: {
			errorMessage: "Failed to process image",
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
			console.log("Creating dataset:", name);
			if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");

			try {
				const response = await fetchWithRetry(
					`${mediaServerUrl}/api/datasets/create`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ name }),
					},
				);

				// Handle specific error cases
				if (response.status === 409) {
					throw new Error(`Dataset "${name}" already exists (409)`);
				}
				// Assuming success if no error thrown by fetchWithRetry or status check
				console.log("Dataset created successfully:", name);
				// Return something indicating success if needed, or void
			} catch (error) {
				console.error("Error creating dataset:", error);
				throw error;
			}
		},
		onSuccess: () => {
			// Invalidate datasets query to refresh data
			if (mediaServerUrl) {
				queryClient.invalidateQueries({ queryKey: queryKeys.datasets }); // This key doesn't include URL yet, might need update
				queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages(mediaServerUrl) });
			} else {
				console.warn("Cannot invalidate queries: Media Server URL not available.");
			}
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

	return useMutation<
		GenericApiResponse,
		Error,
		{ imagePath: string; datasetName: string }
	>({
		mutationFn: async ({
			imagePath,
			datasetName,
		}: { imagePath: string; datasetName: string }) => {
			console.log(`Adding image ${imagePath} to dataset ${datasetName}`);
			if (!mediaServerUrl) throw new Error("Media Server URL is not configured.");

			try {
				// Ensure we're using the correct datasets path
				const targetDatasetPath = `${DATASETS_PATH}/${datasetName}`;

				const response = await fetchWithRetry(
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

				const data = await response.json();
				console.log("Add image to dataset result:", data);

				return GenericApiResponseSchema.parse(data);
			} catch (error) {
				console.error("Error adding image to dataset:", error);
				// Ensure a consistent return type on error matching the mutation definition
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error occurred";
				throw new Error(errorMessage); // Re-throw for react-query to handle
			}
		},
		onSuccess: () => {
			// Invalidate dataset queries to refresh data
			if (mediaServerUrl) {
				queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages(mediaServerUrl) });
			} else {
				console.warn("Cannot invalidate queries: Media Server URL not available.");
			}
		},
		meta: {
			errorMessage: "Failed to add image to dataset",
		},
	});
}

/**
 * Prefetch images data to populate the query cache
 *
 * @param mediaServerUrl The base URL of the media server.
 * @param directory - Optional directory to prefetch images from
 */
export async function prefetchImages(mediaServerUrl: string, directory?: string): Promise<void> {
	if (!mediaServerUrl) {
		console.warn("Cannot prefetch images: Media Server URL not available.");
		return;
	}
	const queryClient = getClient();
	await queryClient.prefetchQuery({
		queryKey: queryKeys.imagesByDirectory(mediaServerUrl, directory),
		queryFn: () => fetchImagesByDirectory(mediaServerUrl, directory),
	});
}

/**
 * Prefetch dataset images data to populate the query cache
 * @param mediaServerUrl The base URL of the media server.
 */
export async function prefetchDatasetImages(mediaServerUrl: string): Promise<void> {
	if (!mediaServerUrl) {
		console.warn("Cannot prefetch dataset images: Media Server URL not available.");
		return;
	}
	const queryClient = getClient();
	await queryClient.prefetchQuery({
		queryKey: queryKeys.datasetImages(mediaServerUrl),
		queryFn: () => fetchDatasetImages(mediaServerUrl),
	});
}
