import { calculateFitDimensions } from "@/utils/aspectRatio";
// SPDX-License-Identifier: Apache-2.0
import { RefObject, useEffect, useState } from "react";

interface UseImageViewerSizeProps {
	containerRef: RefObject<HTMLElement | null>;
	aspectRatio?: number;
	padding?: number;
}

interface UseImageViewerSizeResult {
	width: number;
	height: number;
	isCalculating: boolean;
}

/**
 * Custom hook to calculate optimal image viewer dimensions
 *
 * This hook handles:
 * - Calculating the optimal width and height for an image viewer
 * - Respecting container boundaries
 * - Maintaining aspect ratio if specified
 * - Updating on container resize
 *
 * @param containerRef - Reference to the container element
 * @param aspectRatio - Optional aspect ratio to maintain (width/height)
 * @param padding - Optional padding to subtract from container dimensions
 * @returns Object containing calculated width, height, and loading state
 */
export function useImageViewerSize({
	containerRef,
	aspectRatio,
	padding = 0,
}: UseImageViewerSizeProps): UseImageViewerSizeResult {
	const [dimensions, setDimensions] = useState<{
		width: number;
		height: number;
	}>({
		width: 0,
		height: 0,
	});
	const [isCalculating, setIsCalculating] = useState<boolean>(true);

	useEffect(() => {
		const calculateDimensions = () => {
			setIsCalculating(true);

			if (containerRef.current) {
				const containerWidth = containerRef.current.clientWidth - padding * 2;
				const containerHeight = containerRef.current.clientHeight - padding * 2;

				// Calculate dimensions that fit within the container while maintaining aspect ratio
				const { width, height } = calculateFitDimensions(
					containerWidth,
					containerHeight,
					aspectRatio,
					"useImageViewerSize",
				);

				setDimensions({ width, height });
			}

			setIsCalculating(false);
		};

		// Initial calculation
		calculateDimensions();

		// Set up resize observer for container
		const resizeObserver = new ResizeObserver(() => {
			calculateDimensions();
		});

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		// Cleanup
		return () => {
			resizeObserver.disconnect();
		};
	}, [containerRef, aspectRatio, padding]);

	return {
		width: dimensions.width,
		height: dimensions.height,
		isCalculating,
	};
}
