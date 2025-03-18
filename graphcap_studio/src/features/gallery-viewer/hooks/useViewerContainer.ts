// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";

interface UseViewerContainerResult {
	readonly containerSize: { width: number; height: number };
	readonly setContainerRef: (ref: HTMLDivElement | null) => void;
	readonly thumbnailOptions: {
		readonly minWidth: number;
		readonly maxWidth: number;
		readonly gap: number;
	};
}

/**
 * Custom hook for managing the ViewerContainer component
 *
 * This hook provides:
 * - Container size tracking with ResizeObserver
 * - Thumbnail size calculations based on container dimensions
 *
 * @param props - Properties for the hook
 * @returns Functions and state for the ViewerContainer
 */
export function useViewerContainer(): UseViewerContainerResult {
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
	const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

	// Update container dimensions on resize
	useEffect(() => {
		if (!containerRef) return;

		const updateDimensions = () => {
			const rect = containerRef.getBoundingClientRect();
			setContainerSize({
				width: rect.width,
				height: rect.height,
			});
		};

		// Initial update
		updateDimensions();

		// Create ResizeObserver to track container size changes
		const resizeObserver = new ResizeObserver(updateDimensions);
		resizeObserver.observe(containerRef);

		// Clean up
		return () => {
			resizeObserver.disconnect();
		};
	}, [containerRef]);

	// Calculate thumbnail options based on container size
	const thumbnailOptions = {
		// Dynamically adjust min and max width based on container size
		minWidth: Math.max(
			48, // Absolute minimum
			Math.floor(containerSize.width / 24), // Relative to container
		),
		maxWidth: Math.max(
			96, // Absolute minimum for max width
			Math.min(
				180, // Absolute maximum
				Math.floor(containerSize.width / 8), // Relative to container
			),
		),
		gap: Math.max(4, Math.min(12, Math.floor(containerSize.width / 200))), // Dynamic gap
	};

	return {
		containerSize,
		setContainerRef,
		thumbnailOptions,
	};
}
