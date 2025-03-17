// SPDX-License-Identifier: Apache-2.0
import { RefObject, useEffect, useMemo, useRef, useState } from "react";

interface UseOptimizedImageSizeProps {
	containerRef: RefObject<HTMLElement | null>;
	aspectRatio?: number;
	padding?: number;
	debounceMs?: number;
}

interface UseOptimizedImageSizeResult {
	width: number;
	height: number;
	isCalculating: boolean;
	breakpoints: number[];
	currentBreakpoint: number;
}

/**
 * Custom hook to calculate optimal image dimensions with performance optimizations
 *
 * Features:
 * - Debounced resize calculations to reduce layout thrashing
 * - Memoized calculations to prevent unnecessary re-renders
 * - Breakpoint detection for responsive image loading
 * - ResizeObserver for efficient resize detection
 *
 * @param containerRef - Reference to the container element
 * @param aspectRatio - Optional aspect ratio to maintain (width/height)
 * @param padding - Optional padding to subtract from container dimensions
 * @param debounceMs - Debounce time in milliseconds for resize calculations
 * @returns Object containing calculated dimensions and responsive breakpoints
 */
export function useOptimizedImageSize({
	containerRef,
	aspectRatio,
	padding = 0,
	debounceMs = 100,
}: UseOptimizedImageSizeProps): UseOptimizedImageSizeResult {
	const [dimensions, setDimensions] = useState<{
		width: number;
		height: number;
	}>({
		width: 0,
		height: 0,
	});
	const [isCalculating, setIsCalculating] = useState<boolean>(true);
	const debounceTimerRef = useRef<number | null>(null);

	// Define standard breakpoints for responsive images
	const breakpoints = useMemo(
		() => [640, 750, 828, 1080, 1200, 1920, 2048],
		[],
	);

	// Determine current breakpoint based on container width
	const currentBreakpoint = useMemo(() => {
		const containerWidth = dimensions.width;
		// Find the smallest breakpoint that is larger than the container width
		const nextBreakpoint =
			breakpoints.find((bp) => bp >= containerWidth) ??
			breakpoints[breakpoints.length - 1];
		return nextBreakpoint;
	}, [dimensions.width, breakpoints]);

	useEffect(() => {
		const calculateDimensions = () => {
			setIsCalculating(true);

			if (containerRef.current) {
				const containerWidth = containerRef.current.clientWidth - padding * 2;
				const containerHeight = containerRef.current.clientHeight - padding * 2;

				let width = containerWidth;
				let height = containerHeight;

				// If aspect ratio is provided, maintain it while fitting within container
				if (aspectRatio) {
					const containerRatio = containerWidth / containerHeight;

					if (aspectRatio > containerRatio) {
						// Width constrained
						width = containerWidth;
						height = width / aspectRatio;
					} else {
						// Height constrained
						height = containerHeight;
						width = height * aspectRatio;
					}
				}

				// Only update state if dimensions have actually changed
				setDimensions((prevDimensions) => {
					if (
						Math.abs(prevDimensions.width - width) > 1 ||
						Math.abs(prevDimensions.height - height) > 1
					) {
						return { width, height };
					}
					return prevDimensions;
				});
			}

			setIsCalculating(false);
		};

		// Debounced calculation function
		const debouncedCalculate = () => {
			// Clear any existing timer
			if (debounceTimerRef.current !== null) {
				window.clearTimeout(debounceTimerRef.current);
			}

			// Set a new timer
			debounceTimerRef.current = window.setTimeout(() => {
				calculateDimensions();
				debounceTimerRef.current = null;
			}, debounceMs);
		};

		// Initial calculation (not debounced)
		calculateDimensions();

		// Set up resize observer for container
		const resizeObserver = new ResizeObserver(() => {
			debouncedCalculate();
		});

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		// Cleanup
		return () => {
			if (debounceTimerRef.current !== null) {
				window.clearTimeout(debounceTimerRef.current);
			}
			resizeObserver.disconnect();
		};
	}, [containerRef, aspectRatio, padding, debounceMs]);

	return {
		width: dimensions.width,
		height: dimensions.height,
		isCalculating,
		breakpoints,
		currentBreakpoint,
	};
}
