import { Image, preloadImage } from "@/services/images";
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

	useEffect(() => {
		if (!enabled || images.length === 0) return;

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
			if (
				preloadQueue.length === 0 ||
				activePreloadsRef.current >= maxConcurrentPreloads
			)
				return;

			const { index, priority } = preloadQueue.shift()!;
			if (index >= 0 && index < images.length) {
				const imagePath = images[index].path;
				if (!preloadedImagesRef.current.has(imagePath)) {
					activePreloadsRef.current += 1;

					// For high priority images (next/prev), preload both thumbnail and full
					if (priority === "high") {
						// Preload thumbnail first for quick display
						preloadImage(imagePath, "thumbnail");

						// Then preload the full image with a slight delay
						setTimeout(() => {
							preloadImage(imagePath, "full");

							// Mark as complete and try next image
							preloadedImagesRef.current.add(imagePath);
							activePreloadsRef.current -= 1;
							preloadNext();
						}, 100);
					} else {
						// For low priority images, just preload thumbnails
						preloadImage(imagePath, "thumbnail");

						// Mark as complete and try next image
						setTimeout(() => {
							preloadedImagesRef.current.add(imagePath);
							activePreloadsRef.current -= 1;
							preloadNext();
						}, 50);
					}
				} else {
					// Already preloaded, try the next one
					preloadNext();
				}
			} else {
				// Invalid index, try the next one
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
	}, [images, currentIndex, preloadCount, enabled, maxConcurrentPreloads]);
}
