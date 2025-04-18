import {
	calculateHeightFromAspectRatio,
	calculateWidthFromAspectRatio,
} from "@/utils/aspectRatio";
// SPDX-License-Identifier: Apache-2.0
import { type RefObject, useEffect, useRef, useState } from "react";

interface UseDynamicThumbnailsProps {
	totalCount: number;
	minThumbnailWidth?: number;
	maxThumbnailWidth?: number;
	gap?: number;
	aspectRatio?: number;
	maxHeight?: number;
}

interface UseDynamicThumbnailsResult {
	containerRef: RefObject<HTMLDivElement>;
	thumbnailWidth: number;
	thumbnailHeight: number;
	visibleCount: number;
	gap: number;
}

/**
 * Custom hook for dynamically sizing thumbnails based on available container space
 *
 * This hook calculates the optimal thumbnail size and count based on the
 * available container width, ensuring thumbnails are properly sized and spaced.
 * It automatically adjusts when the container is resized.
 *
 * @param props - The hook properties
 * @returns The calculated thumbnail dimensions and container ref
 */
export function useDynamicThumbnails({
	totalCount,
	minThumbnailWidth = 64,
	maxThumbnailWidth = 120,
	gap = 8,
	aspectRatio = 1,
	maxHeight = 80, // Default max height (5rem - padding)
}: UseDynamicThumbnailsProps): UseDynamicThumbnailsResult {
	// Reference for the container element
	const containerRef = useRef<HTMLDivElement>(
		null,
	) as RefObject<HTMLDivElement>;

	// State for thumbnail dimensions
	const [thumbnailWidth, setThumbnailWidth] = useState(minThumbnailWidth);
	const [thumbnailHeight, setThumbnailHeight] = useState(
		calculateHeightFromAspectRatio(
			minThumbnailWidth,
			aspectRatio,
			"useDynamicThumbnails-init",
		),
	);
	const [visibleCount, setVisibleCount] = useState(0);

	// Calculation logic moved inside useEffect, no need for useCallback here

	// Recalculate on resize or when dependencies change
	useEffect(() => {
		// Define calculation logic directly inside useEffect
		const calculateThumbnailSize = () => {
			const currentRef = containerRef.current;
			if (!currentRef) return;

			const containerWidth = currentRef.clientWidth;

			// First, determine the maximum height we can use
			const maxThumbnailHeight = maxHeight;

			// Calculate the maximum width based on the height constraint and aspect ratio
			const heightConstrainedWidth = calculateWidthFromAspectRatio(
				maxThumbnailHeight,
				aspectRatio,
				"useDynamicThumbnails-heightConstrained",
			);

			// Use the smaller of the height-constrained width and the maxThumbnailWidth
			const effectiveMaxWidth = Math.min(
				heightConstrainedWidth ?? 0,
				maxThumbnailWidth ?? 0,
			);

			// Calculate how many thumbnails can fit at minimum size
			const maxPossibleCount = Math.floor(
				(containerWidth + gap) / (minThumbnailWidth + gap),
			);

			// Calculate how many thumbnails can fit at maximum size
			const minPossibleCount = Math.max(
				1,
				Math.floor((containerWidth + gap) / (effectiveMaxWidth + gap)),
			);

			// Determine the optimal count
			let optimalCount: number; // Add explicit type

			if (totalCount <= minPossibleCount) {
				// If we have fewer images than can fit at max size, use max size
				optimalCount = totalCount;
			} else {
				// Try to fit as many as possible while keeping them reasonably sized
				optimalCount = Math.min(maxPossibleCount, totalCount);
			}

			// Calculate the optimal width based on the count
			const availableWidth = containerWidth - (optimalCount - 1) * gap;
			const calculatedWidth = Math.floor(availableWidth / optimalCount);

			// Ensure width is within bounds
			const boundedWidth = Math.min(
				Math.max(calculatedWidth, minThumbnailWidth),
				effectiveMaxWidth,
			);

			// Calculate height based on aspect ratio
			const calculatedHeight = calculateHeightFromAspectRatio(
				boundedWidth,
				aspectRatio,
				"useDynamicThumbnails-final",
			);

			// Ensure height doesn't exceed max height
			const boundedHeight = Math.min(calculatedHeight ?? 0, maxHeight ?? 0);

			// Update state
			setThumbnailWidth(boundedWidth);
			setThumbnailHeight(boundedHeight);
			setVisibleCount(optimalCount);
		};

		calculateThumbnailSize(); // Initial calculation

		const handleResize = () => {
			calculateThumbnailSize(); // Recalculate on resize
		};

		// Set up resize observer
		const resizeObserver = new ResizeObserver(handleResize);
		const currentRef = containerRef.current; // Capture value for effect cleanup

		if (currentRef) {
			resizeObserver.observe(currentRef);
		}

		// Clean up
		return () => {
			// Use the captured ref value in cleanup
			if (currentRef) {
				resizeObserver.unobserve(currentRef);
			}
		};
		// Effect dependencies now include all props used in the calculation and the ref
	}, [minThumbnailWidth, maxThumbnailWidth, gap, totalCount, aspectRatio, maxHeight, containerRef]);

	return {
		containerRef,
		thumbnailWidth: thumbnailWidth ?? 0,
		thumbnailHeight: thumbnailHeight ?? 0,
		visibleCount: visibleCount ?? 0,
		gap,
	};
}
