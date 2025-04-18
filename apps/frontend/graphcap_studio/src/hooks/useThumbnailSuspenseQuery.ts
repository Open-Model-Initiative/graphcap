import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import { getThumbnailUrl } from "@/services/images";
// SPDX-License-Identifier: Apache-2.0
import { useSuspenseQuery } from "@tanstack/react-query";

interface UseThumbnailSuspenseQueryOptions {
	width?: number;
	height?: number;
	format?: string;
	aspectRatio?: number;
}

/**
 * A custom hook for loading image thumbnails using React Suspense
 *
 * This hook is optimized specifically for thumbnails with appropriate
 * sizing, caching, and preloading strategies.
 *
 * @param imagePath - Path to the image
 * @param options - Configuration options for thumbnail loading
 * @returns Object with the loaded thumbnail URL
 */
export function useThumbnailSuspenseQuery(
	imagePath: string,
	options?: UseThumbnailSuspenseQueryOptions,
) {
	const {
		width = 150,
		height = 150,
		format = "webp",
		aspectRatio,
	} = options || {};

	// Get connections state and find media server URL
	const { connections } = useServerConnections();
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? "";

	const heightParam = aspectRatio ? Math.round(width / aspectRatio) : height;

	return useSuspenseQuery({
		queryKey: ["thumbnail", imagePath, width, heightParam, format, mediaServerUrl],
		queryFn: async () => {
			// Create a new Image object to preload the thumbnail
			const img = new Image();

			// Get the thumbnail URL, passing the mediaServerUrl
			const src = getThumbnailUrl(mediaServerUrl, imagePath, width, heightParam, format);

			// Return a promise that resolves when the thumbnail loads
			return new Promise<string>((resolve, reject) => {
				img.onload = () => resolve(src);
				img.onerror = () =>
					reject(new Error(`Failed to load thumbnail: ${imagePath}`));
				img.src = src;
			});
		},
		retry: 2,
		retryDelay: (attempt) => Math.min(500 * Math.pow(2, attempt), 5000),
		// Thumbnails should stay in cache longer and have higher priority
		gcTime: 30 * 60 * 1000, // 30 minutes
	});
}
