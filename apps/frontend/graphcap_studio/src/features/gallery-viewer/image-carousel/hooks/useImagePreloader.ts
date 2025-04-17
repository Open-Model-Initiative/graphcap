import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import { preloadImage } from "@/services/images";
import type { Image } from "@/types";
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef } from "react";

interface UseImagePreloaderProps {
	readonly images: Image[];
	readonly currentIndex: number;
	readonly preloadCount?: number;
	readonly enabled?: boolean;
	readonly maxConcurrentPreloads?: number;
}

/**
 * Custom hook for preloading images in a carousel
 *
 * This hook preloads a specified number of images before and after the current image
 * to improve the user experience when navigating through the carousel. It limits
 * the number of concurrent preloads to avoid overwhelming the browser.
 *
 * @param images - Array of images in the carousel
 * @param currentIndex - Index of the currently displayed image
 * @param preloadCount - Number of images to preload before and after the current image (default: 2)
 * @param enabled - Whether preloading is enabled (default: true)
 * @param maxConcurrentPreloads - Maximum number of concurrent image preloads (default: 3)
 */
export function useImagePreloader({
	images,
	currentIndex,
	preloadCount = 20,
	enabled = true,
	maxConcurrentPreloads = 3,
}: UseImagePreloaderProps): void {
	// Use a ref to track which images we've already preloaded
	// This persists across renders and prevents unnecessary preloading
	const preloadedImagesRef = useRef<Set<string>>(new Set());
	// Use a ref to track active preloads
	const activePreloadsRef = useRef<number>(0);

	// Get connections state and find media server URL
	const { connections } = useServerConnections();
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? "";

	useEffect(() => {
		if (!enabled || images.length === 0 || !mediaServerUrl) return;

		// Create a queue of images to preload in order of priority
		const preloadQueue: Array<{ index: number; priority: "high" | "low" }> = [];

		// Add current image with highest priority
		preloadQueue.push({ index: currentIndex, priority: "high" });

		// Add next and previous images with high priority
		preloadQueue.push({ index: currentIndex + 1, priority: "high" });
		preloadQueue.push({ index: currentIndex - 1, priority: "high" });

		// Add remaining images with lower priority
		for (let i = 2; i <= preloadCount; i++) {
			preloadQueue.push({ index: currentIndex + i, priority: "low" });
			preloadQueue.push({ index: currentIndex - i, priority: "low" });
		}

		// Function to preload the next image in the queue
		const preloadNext = () => {
			// Check if queue is empty or max concurrent preloads reached
			if (
				preloadQueue.length === 0 ||
				activePreloadsRef.current >= maxConcurrentPreloads
			) {
				return;
			}

			// Safely get the next item from the queue
			const item = preloadQueue.shift();
			// If the queue was empty (e.g., due to concurrent access), stop
			if (!item) {
				return;
			}

			const { index, priority } = item;

			// Check if index is valid
			if (index >= 0 && index < images.length) {
				const imagePath = images[index].path;

				// Check if already preloaded or being preloaded
				if (!preloadedImagesRef.current.has(imagePath)) {
					// Mark as preloading and increment active count
					preloadedImagesRef.current.add(imagePath);
					activePreloadsRef.current += 1;

					// Simulate completion callback to decrement count and trigger next
					// We assume preloadImage initiates the request; browser handles concurrency.
					// We decrement immediately to allow the next preload to start sooner.
					const onPreloadInitiated = () => {
						activePreloadsRef.current -= 1;
						// Immediately try to preload the next image
						preloadNext();
					};

					// High priority: preload thumbnail then full
					if (priority === "high") {
						preloadImage(mediaServerUrl, imagePath, "thumbnail");
						preloadImage(mediaServerUrl, imagePath, "full");
						// Call completion handler *after* initiating both
						onPreloadInitiated();
					} else {
						// Low priority: preload only thumbnail
						preloadImage(mediaServerUrl, imagePath, "thumbnail");
						// Call completion handler *after* initiating the preload
						onPreloadInitiated();
					}
				} else {
					// Already preloaded/preloading, try the next one immediately
					preloadNext();
				}
			} else {
				// Invalid index, try the next one immediately
				preloadNext();
			}
		};

		// Start preloading up to maxConcurrentPreloads images
		for (let i = 0; i < maxConcurrentPreloads; i++) {
			preloadNext();
		}

		// Clean up the preloaded images set when the component unmounts
		return () => {
			preloadedImagesRef.current.clear();
			activePreloadsRef.current = 0;
		};
	}, [images, currentIndex, preloadCount, enabled, maxConcurrentPreloads, mediaServerUrl]);
}
