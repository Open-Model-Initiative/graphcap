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
import { getQueryClient } from "../utils/queryClient";

/**
 * Image service for interacting with the Graphcap Media Server
 *
 * This service provides functions for listing, viewing, and processing images
 * using the Graphcap Media Server API.
 *
 * @module ImageService
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

// Cache for image URLs to avoid redundant requests
const imageUrlCache = new Map<string, string>();

// Cache for image thumbnails
const thumbnailCache = new Map<string, string>();

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

// Query keys for TanStack Query
export const queryKeys = {
	images: ["images"] as const,
	imagesByDirectory: (directory?: string) =>
		[...queryKeys.images, directory] as const,
	datasets: ["datasets"] as const,
	datasetImages: ["datasets", "images"] as const,
};

// Helper function to create a query client
const getClient = () => getQueryClient();

/**
 * Enhanced fetch function with retry logic and timeout handling
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param retryCount - Number of retry attempts (default: 3)
 * @param retryDelay - Base delay between retries in ms (default: 1000)
 * @param timeout - Timeout in ms (default: 30000)
 * @returns Promise with the fetch response
 */
async function fetchWithRetry(
	url: string | URL,
	options?: RequestInit,
	retryCount = 3,
	retryDelay = 1000,
	timeout = 30000,
): Promise<Response> {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	try {
		const fetchOptions = {
			...options,
			signal: controller.signal,
		};

		try {
			const response = await fetch(url, fetchOptions);
			if (!response.ok && retryCount > 0) {
				// Exponential backoff with jitter
				const delay =
					retryDelay * 1.5 ** (3 - retryCount) * (0.9 + Math.random() * 0.2);
				console.warn(
					`Request failed with status ${response.status}. Retrying in ${Math.round(delay)}ms. Attempts left: ${retryCount}`,
				);

				await new Promise((resolve) => setTimeout(resolve, delay));
				return fetchWithRetry(
					url,
					options,
					retryCount - 1,
					retryDelay,
					timeout,
				);
			}
			return response;
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				console.error(`Request timed out after ${timeout}ms:`, url);
				throw new Error(
					`Request timed out after ${timeout}ms: ${url.toString()}`,
				);
			}

			if (retryCount > 0) {
				// Exponential backoff with jitter
				const delay =
					retryDelay * 1.5 ** (3 - retryCount) * (0.9 + Math.random() * 0.2);
				console.warn(
					`Request failed with error: ${error}. Retrying in ${Math.round(delay)}ms. Attempts left: ${retryCount}`,
				);

				await new Promise((resolve) => setTimeout(resolve, delay));
				return fetchWithRetry(
					url,
					options,
					retryCount - 1,
					retryDelay,
					timeout,
				);
			}
			throw error;
		}
	} finally {
		clearTimeout(id);
	}
}

/**
 * React hook for listing images using TanStack Query
 *
 * @param directory - Optional directory path
 * @returns Query result with the list of images
 */
export function useListImages(directory?: string) {
	return useQuery({
		queryKey: queryKeys.imagesByDirectory(directory),
		queryFn: async () => {
			console.log("Listing images from directory:", directory);

			const url = new URL(`${MEDIA_SERVER_URL}/api/images`);
			if (directory) {
				url.searchParams.append("directory", directory);
			}

			const response = await fetchWithRetry(url.toString());

			const data = await response.json();
			console.log("Received data:", data);
			return ImageListResponseSchema.parse(data);
		},
		meta: {
			errorMessage: "Failed to load images",
		},
	});
}

/**
 * React hook for listing dataset images using TanStack Query
 *
 * @returns Query result with the list of datasets and their images
 */
export function useListDatasetImages() {
	return useQuery({
		queryKey: queryKeys.datasetImages,
		queryFn: async () => {
			console.log("Listing dataset images");

			try {
				const response = await fetchWithRetry(
					`${MEDIA_SERVER_URL}/api/datasets/images`,
				);

				const data = await response.json();
				console.log("Received datasets data:", data);
				return DatasetListResponseSchema.parse(data);
			} catch (error) {
				console.error("Error fetching dataset images:", error);
				throw error;
			}
		},
		meta: {
			errorMessage: "Failed to load dataset images",
		},
	});
}

/**
 * Get the URL for viewing an image
 *
 * @param imagePath - Path to the image
 * @returns URL for viewing the image
 */
export function getImageUrl(imagePath: string): string {
	// Check if URL is in cache
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
	const url = `${MEDIA_SERVER_URL}/api/images/view${normalizedPath}?${cacheBuster}`;

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
 * @param imagePath - Path to the image
 * @param width - Desired width of the thumbnail
 * @param height - Desired height of the thumbnail
 * @returns URL for the thumbnail
 */
export function getThumbnailUrl(
	imagePath: string,
	width = 200,
	height = 200,
	format?: string,
): string {
	const fmt = format ?? "webp";
	const cacheKey = `${imagePath}_${width}x${height}_${fmt}`;

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
	const url = `${MEDIA_SERVER_URL}/api/images/view${normalizedPath}?width=${width}&height=${height}&format=${fmt}&${cacheBuster}`;

	thumbnailCache.set(cacheKey, url);
	setTimeout(() => {
		thumbnailCache.delete(cacheKey);
	}, CACHE_EXPIRATION);

	return url;
}

/**
 * Preload an image to cache it in the browser
 *
 * @param imagePath - Path to the image
 * @param size - Size of the image to preload ('thumbnail' or 'full')
 */
export function preloadImage(
	imagePath: string,
	size: "thumbnail" | "full" = "thumbnail",
): void {
	const url =
		size === "thumbnail" ? getThumbnailUrl(imagePath) : getImageUrl(imagePath);

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
			const cacheKey = `${imagePath}_200x200_webp`;
			thumbnailCache.delete(cacheKey);
		} else {
			imageUrlCache.delete(imagePath);
		}
	};
}

/**
 * React hook for processing an image using TanStack Query
 *
 * @returns Mutation result for processing an image
 */
export function useProcessImage() {
	const queryClient = useQueryClient();

	return useMutation<ImageProcessResponse, Error, ImageProcessRequest>({
		mutationFn: async (variables: ImageProcessRequest) => {
			console.log("Processing image:", variables.imagePath);

			const response = await fetchWithRetry(
				`${MEDIA_SERVER_URL}/api/images/process`,
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
			queryClient.invalidateQueries({ queryKey: queryKeys.images });
			queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages });
		},
		meta: {
			errorMessage: "Failed to process image",
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
				const response = await fetchWithRetry(
					`${MEDIA_SERVER_URL}/api/datasets/create`,
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

				console.log("Dataset created successfully:", name);
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
 * React hook for uploading an image using TanStack Query
 *
 * @returns Mutation result for uploading an image
 */
export function useUploadImage() {
	const queryClient = useQueryClient();

	return useMutation<
		ImageProcessResponse,
		Error,
		{ file: File; datasetName?: string }
	>({
		mutationFn: async ({
			file,
			datasetName,
		}: { file: File; datasetName?: string }) => {
			console.log(
				"Uploading image:",
				file.name,
				datasetName ? `to dataset: ${datasetName}` : "",
			);

			const formData = new FormData();
			formData.append("image", file);

			// If dataset name is provided, add it to the form data
			if (datasetName) {
				formData.append("dataset", datasetName);

				// Ensure we're using the correct datasets path
				const targetPath = `${DATASETS_PATH}/${datasetName}`;
				formData.append("targetPath", targetPath);
			}

			const response = await fetchWithRetry(
				`${MEDIA_SERVER_URL}/api/images/upload`,
				{
					method: "POST",
					body: formData,
				},
				3, // retryCount
				2000, // retryDelay
				60000, // timeout (60s for uploads)
			);

			const data = await response.json();
			console.log("Upload result:", data);

			return ImageProcessResponseSchema.parse(data);
		},
		onSuccess: (_, variables) => {
			// Invalidate relevant queries to refresh data
			queryClient.invalidateQueries({ queryKey: queryKeys.images });

			// If uploaded to a dataset, invalidate dataset queries
			if (variables.datasetName) {
				queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages });
			}
		},
		meta: {
			errorMessage: "Failed to upload image",
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

			try {
				// Ensure we're using the correct datasets path
				const targetDatasetPath = `${DATASETS_PATH}/${datasetName}`;

				const response = await fetchWithRetry(
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

				const data = await response.json();
				console.log("Add image to dataset result:", data);

				return GenericApiResponseSchema.parse(data);
			} catch (error) {
				console.error("Error adding image to dataset:", error);
				return {
					success: false,
					message:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
		onSuccess: () => {
			// Invalidate dataset queries to refresh data
			queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages });
		},
		meta: {
			errorMessage: "Failed to add image to dataset",
		},
	});
}

/**
 * Prefetch images data to populate the query cache
 *
 * @param directory - Optional directory to prefetch images from
 */
export async function prefetchImages(directory?: string): Promise<void> {
	const queryClient = getClient();
	await queryClient.prefetchQuery({
		queryKey: queryKeys.imagesByDirectory(directory),
		queryFn: async () => {
			const url = new URL(`${MEDIA_SERVER_URL}/api/images`);
			if (directory) {
				url.searchParams.append("directory", directory);
			}

			const response = await fetchWithRetry(url.toString());
			const data = await response.json();
			return ImageListResponseSchema.parse(data);
		},
	});
}

/**
 * Prefetch dataset images data to populate the query cache
 */
export async function prefetchDatasetImages(): Promise<void> {
	const queryClient = getClient();
	await queryClient.prefetchQuery({
		queryKey: queryKeys.datasetImages,
		queryFn: async () => {
			const response = await fetchWithRetry(
				`${MEDIA_SERVER_URL}/api/datasets/images`,
			);
			const data = await response.json();
			return DatasetListResponseSchema.parse(data);
		},
	});
}
