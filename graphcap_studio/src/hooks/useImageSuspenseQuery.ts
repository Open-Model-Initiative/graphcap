import { getImageUrl, getThumbnailUrl } from "@/services/images";
// SPDX-License-Identifier: Apache-2.0
import { useSuspenseQuery } from "@tanstack/react-query";

interface UseImageSuspenseQueryOptions {
	size?: "thumbnail" | "full";
	width?: number;
	height?: number;
	format?: string;
	aspectRatio?: number;
}

/**
 * A custom hook for loading images using React Suspense
 *
 * This hook leverages TanStack Query's useSuspenseQuery to provide
 * a clean and reliable way to load images with automatic retry
 * and proper error handling.
 *
 * @param imagePath - Path to the image
 * @param options - Configuration options for image loading
 * @returns Object with the loaded image URL
 */
export function useImageSuspenseQuery(
	imagePath: string,
	options?: UseImageSuspenseQueryOptions,
) {
	const {
		size = "full",
		width = 400,
		height = 400,
		format = "webp",
		aspectRatio,
	} = options || {};

	const heightParam = aspectRatio ? Math.round(width / aspectRatio) : height;

	return useSuspenseQuery({
		queryKey: ["image", imagePath, size, width, heightParam, format],
		queryFn: async () => {
			// Create a new Image object to preload the image
			const img = new Image();

			// Set the image source based on size
			const src =
				size === "thumbnail"
					? getThumbnailUrl(imagePath, width, heightParam, format)
					: getImageUrl(imagePath);

			// Return a promise that resolves when the image loads
			return new Promise<string>((resolve, reject) => {
				img.onload = () => resolve(src);
				img.onerror = () =>
					reject(new Error(`Failed to load image: ${imagePath}`));
				img.src = src;
			});
		},
		retry: 2,
		retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000),
	});
}
