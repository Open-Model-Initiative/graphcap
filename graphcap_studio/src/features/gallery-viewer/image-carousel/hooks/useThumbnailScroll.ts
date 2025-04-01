// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef } from "react";

interface UseThumbnailScrollProps {
	selectedIndex: number;
	totalCount: number;
	thumbnailWidth?: number;
}

/**
 * Custom hook for handling thumbnail scrolling in the carousel
 *
 * This hook manages scrolling the thumbnail strip to keep the selected
 * thumbnail in view as the user navigates through images.
 *
 * @param props - The hook properties
 * @returns A ref to attach to the thumbnail container
 */
export function useThumbnailScroll({
	selectedIndex,
	totalCount,
	thumbnailWidth = 80,
}: UseThumbnailScrollProps) {
	// Reference for the thumbnails container
	const containerRef = useRef<HTMLDivElement>(null);

	// Scroll selected thumbnail into view when selectedIndex changes
	useEffect(() => {
		if (containerRef.current && totalCount > 0) {
			// Calculate the scroll position to center the selected thumbnail
			const scrollPosition =
				selectedIndex * thumbnailWidth -
				containerRef.current.clientWidth / 2 +
				thumbnailWidth / 2;

			// Scroll the container to the calculated position
			containerRef.current.scrollTo({
				left: Math.max(0, scrollPosition),
				behavior: "smooth",
			});
		}
	}, [selectedIndex, totalCount, thumbnailWidth]);

	return containerRef;
}
