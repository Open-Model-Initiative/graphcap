// SPDX-License-Identifier: Apache-2.0
import type { RefObject } from "react";
import { useEffect } from "react";

interface UseWheelNavigationProps {
	containerRef: RefObject<HTMLDivElement | null>;
	navigateByDelta: (delta: number) => void;
	enabled: boolean;
}

/**
 * Custom hook for handling wheel navigation in the carousel
 *
 * This hook sets up a wheel event listener on the provided container element
 * and triggers navigation based on the wheel direction.
 *
 * @param props - The hook properties
 */
export function useWheelNavigation({
	containerRef,
	navigateByDelta,
	enabled,
}: UseWheelNavigationProps): void {
	useEffect(() => {
		if (!enabled || !containerRef.current) return;

		const element = containerRef.current;

		const handleWheelEvent = (e: WheelEvent) => {
			// Determine direction (positive deltaY means scrolling down)
			const delta = e.deltaY > 0 ? 1 : -1;
			navigateByDelta(delta);
			e.preventDefault();
		};

		// Add wheel event listener with passive: false option
		element.addEventListener("wheel", handleWheelEvent, { passive: false });

		return () => {
			element.removeEventListener("wheel", handleWheelEvent);
		};
	}, [containerRef, navigateByDelta, enabled]);
}
