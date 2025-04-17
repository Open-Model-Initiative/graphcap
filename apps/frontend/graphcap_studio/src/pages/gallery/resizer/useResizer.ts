// SPDX-License-Identifier: Apache-2.0
import { RefObject, useEffect, useState } from "react";

export interface ResizerOptions {
	defaultWidth: number;
	minWidth: number;
	maxWidthFn?: (containerWidth: number) => number;
	containerRef: RefObject<HTMLElement | null>;
	onWidthChange?: (width: number) => void;
	direction?: "left" | "right";
}

export interface ResizerState {
	width: number;
	isResizing: boolean;
	handleResizerMouseDown: (e: React.MouseEvent) => void;
	setWidth: (width: number) => void;
}

/**
 * A hook for handling resizable panels
 *
 * This hook provides state and handlers for creating resizable panels.
 * It handles mouse events for dragging, respects min/max constraints,
 * and cleans up event listeners.
 */
export function useResizer({
	defaultWidth,
	minWidth,
	maxWidthFn,
	containerRef,
	onWidthChange,
	direction = "right",
}: ResizerOptions): ResizerState {
	const [width, setWidth] = useState(defaultWidth);
	const [isResizing, setIsResizing] = useState(false);
	const [startX, setStartX] = useState(0);
	const [startWidth, setStartWidth] = useState(0);
	const [containerWidth, setContainerWidth] = useState(0);

	// Update container width on resize
	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setContainerWidth(rect.width);
			}
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, [containerRef]);

	// Handle mouse down for resizer
	const handleResizerMouseDown = (e: React.MouseEvent) => {
		setIsResizing(true);
		setStartX(e.clientX);
		setStartWidth(width);
		e.preventDefault();
	};

	// Handle mouse move for resizing
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isResizing) {
				// Calculate new width based on direction
				const delta =
					direction === "right" ? e.clientX - startX : startX - e.clientX;

				let newWidth = Math.max(minWidth, startWidth + delta);

				// Apply max width constraint if provided
				if (maxWidthFn && containerWidth > 0) {
					const maxWidth = maxWidthFn(containerWidth);
					newWidth = Math.min(newWidth, maxWidth);
				}

				setWidth(newWidth);

				if (onWidthChange) {
					onWidthChange(newWidth);
				}
			}
		};

		const handleMouseUp = () => {
			setIsResizing(false);
		};

		if (isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [
		isResizing,
		startX,
		startWidth,
		minWidth,
		maxWidthFn,
		containerWidth,
		direction,
		onWidthChange,
	]);

	return {
		width,
		isResizing,
		handleResizerMouseDown,
		setWidth,
	};
}
