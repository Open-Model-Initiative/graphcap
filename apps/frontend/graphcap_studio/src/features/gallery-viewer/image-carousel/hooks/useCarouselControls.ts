// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect } from "react";

/**
 * Props for the useCarouselControls hook
 */
interface UseCarouselControlsProps {
	/**
	 * Function to navigate by a delta value (e.g., -1 for previous, 1 for next)
	 */
	navigateByDelta: (delta: number) => void;
	/**
	 * Whether keyboard navigation is enabled
	 * @default true
	 */
	enabled?: boolean;
}

/**
 * Custom hook for handling keyboard navigation in the carousel
 *
 * This hook adds keyboard event listeners for left/right and up/down arrows
 * to navigate through carousel items.
 *
 * @param props - The hook properties
 * @returns void
 */
export function useCarouselControls({
	navigateByDelta,
	enabled = true,
}: UseCarouselControlsProps): void {
	// Create a stable callback reference for keyboard handling
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowLeft":
				case "ArrowUp":
					navigateByDelta(-1);
					e.preventDefault();
					break;
				case "ArrowRight":
				case "ArrowDown":
					navigateByDelta(1);
					e.preventDefault();
					break;
			}
		},
		[navigateByDelta]
	);

	// Handle keyboard navigation
	useEffect(() => {
		if (!enabled) return;

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown, enabled]);
}
