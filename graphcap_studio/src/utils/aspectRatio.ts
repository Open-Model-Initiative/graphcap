// SPDX-License-Identifier: Apache-2.0

/**
 * Utility functions for handling aspect ratio calculations
 *
 * This module provides functions for calculating dimensions based on aspect ratios,
 * with logging to help track down issues.
 */

// Disable detailed logging for aspect ratio calculations
// Set to true to re-enable logging if needed for debugging
const DEBUG_ASPECT_RATIO = false;

// Default aspect ratio is removed - we should preserve the original image's aspect ratio

/**
 * Calculate height from width and aspect ratio
 *
 * When no aspect ratio is provided, this function will return undefined,
 * indicating that the caller should preserve the original image's aspect ratio.
 *
 * @param width - The width value
 * @param aspectRatio - The aspect ratio (width/height)
 * @param source - Optional source identifier for logging
 * @returns The calculated height or undefined to preserve original aspect ratio
 */
export function calculateHeightFromAspectRatio(
	width: number,
	aspectRatio: number | undefined,
	source?: string,
): number | undefined {
	if (!aspectRatio) {
		if (DEBUG_ASPECT_RATIO) {
			console.log(
				`[AspectRatio] ${source ?? "Unknown"}: No aspect ratio provided, preserving original image aspect ratio`,
			);
		}
		return undefined; // Return undefined to indicate original aspect ratio should be preserved
	}

	if (aspectRatio <= 0) {
		console.warn(
			`[AspectRatio] ${source ?? "Unknown"}: Invalid aspect ratio (${aspectRatio}), must be positive`,
		);
		return undefined; // Return undefined for invalid aspect ratios
	}

	const height = Math.round(width / aspectRatio);

	if (DEBUG_ASPECT_RATIO) {
		console.log(
			`[AspectRatio] ${source ?? "Unknown"}: Width ${width} ÷ Aspect ${aspectRatio} = Height ${height}`,
		);
	}

	return height;
}

/**
 * Calculate width from height and aspect ratio
 *
 * When no aspect ratio is provided, this function will return undefined,
 * indicating that the caller should preserve the original image's aspect ratio.
 *
 * @param height - The height value
 * @param aspectRatio - The aspect ratio (width/height)
 * @param source - Optional source identifier for logging
 * @returns The calculated width or undefined to preserve original aspect ratio
 */
export function calculateWidthFromAspectRatio(
	height: number,
	aspectRatio: number | undefined,
	source?: string,
): number | undefined {
	if (!aspectRatio) {
		if (DEBUG_ASPECT_RATIO) {
			console.log(
				`[AspectRatio] ${source ?? "Unknown"}: No aspect ratio provided, preserving original image aspect ratio`,
			);
		}
		return undefined; // Return undefined to indicate original aspect ratio should be preserved
	}

	if (aspectRatio <= 0) {
		console.warn(
			`[AspectRatio] ${source ?? "Unknown"}: Invalid aspect ratio (${aspectRatio}), must be positive`,
		);
		return undefined; // Return undefined for invalid aspect ratios
	}

	const width = Math.round(height * aspectRatio);

	if (DEBUG_ASPECT_RATIO) {
		console.log(
			`[AspectRatio] ${source ?? "Unknown"}: Height ${height} × Aspect ${aspectRatio} = Width ${width}`,
		);
	}

	return width;
}

/**
 * Calculate dimensions that fit within a container while maintaining aspect ratio
 *
 * When no aspect ratio is provided, this function will return the container dimensions,
 * allowing the image to fill the container while preserving its original aspect ratio.
 *
 * @param containerWidth - The container width
 * @param containerHeight - The container height
 * @param aspectRatio - The aspect ratio (width/height)
 * @param source - Optional source identifier for logging
 * @returns The calculated width and height
 */
export function calculateFitDimensions(
	containerWidth: number,
	containerHeight: number,
	aspectRatio: number | undefined,
	source?: string,
): { width: number; height: number } {
	if (!aspectRatio) {
		if (DEBUG_ASPECT_RATIO) {
			console.log(
				`[AspectRatio] ${source ?? "Unknown"}: No aspect ratio provided, using container dimensions (${containerWidth}x${containerHeight})`,
			);
		}
		return { width: containerWidth, height: containerHeight };
	}

	if (aspectRatio <= 0) {
		console.warn(
			`[AspectRatio] ${source ?? "Unknown"}: Invalid aspect ratio (${aspectRatio}), must be positive`,
		);
		return { width: containerWidth, height: containerHeight };
	}

	const containerRatio = containerWidth / containerHeight;
	let width = containerWidth;
	let height = containerHeight;

	if (DEBUG_ASPECT_RATIO) {
		console.log(
			`[AspectRatio] ${source ?? "Unknown"}: Container ${containerWidth}x${containerHeight} (ratio: ${containerRatio.toFixed(2)}), Target aspect: ${aspectRatio.toFixed(2)}`,
		);
	}

	if (aspectRatio > containerRatio) {
		// Width constrained
		width = containerWidth;
		const calculatedHeight = calculateHeightFromAspectRatio(
			width,
			aspectRatio,
			`${source}-fit-width-constrained`,
		);
		if (calculatedHeight !== undefined) {
			height = calculatedHeight;
		}
	} else {
		// Height constrained
		height = containerHeight;
		const calculatedWidth = calculateWidthFromAspectRatio(
			height,
			aspectRatio,
			`${source}-fit-height-constrained`,
		);
		if (calculatedWidth !== undefined) {
			width = calculatedWidth;
		}
	}

	if (DEBUG_ASPECT_RATIO) {
		console.log(
			`[AspectRatio] ${source ?? "Unknown"}: Fit result: ${width}x${height}`,
		);
	}

	return { width, height };
}

/**
 * Format an aspect ratio for CSS
 *
 * @param aspectRatio - The aspect ratio (width/height)
 * @returns A string suitable for CSS aspect-ratio property, or undefined if no aspect ratio
 */
export function formatAspectRatioForCSS(
	aspectRatio: number | undefined,
): string | undefined {
	if (!aspectRatio) {
		return undefined;
	}

	return `${aspectRatio}`;
}
