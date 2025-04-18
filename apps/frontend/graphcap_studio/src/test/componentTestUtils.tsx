import { RenderOptions, RenderResult, render } from "@testing-library/react";
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { installResizeObserverPolyfill } from "./resizeObserverPolyfill";

/**
 * Options for rendering a component with test utilities
 */
interface TestRenderOptions extends RenderOptions {
	/**
	 * Whether to install the ResizeObserver polyfill
	 * @default true
	 */
	withResizeObserver?: boolean;
}

/**
 * Render a component with test utilities
 *
 * This function wraps the component with necessary providers and installs
 * polyfills to make testing easier with fewer mocks.
 *
 * @param ui The component to render
 * @param options Render options
 * @returns The render result and cleanup function
 */
export function renderWithTestUtils(
	ui: React.ReactElement,
	options: TestRenderOptions = {},
): RenderResult & { cleanup: () => void } {
	const { withResizeObserver = true, ...renderOptions } = options;

	// Setup polyfills and mocks
	const cleanupFunctions: Array<() => void> = [];

	if (withResizeObserver) {
		cleanupFunctions.push(installResizeObserverPolyfill());
	}

	// Render the component
	const result = render(ui, renderOptions);

	// Return the result with a cleanup function
	return {
		...result,
		cleanup: () => {
			cleanupFunctions.forEach((cleanup) => cleanup());
		},
	};
}

/**
 * Create mock images for testing
 *
 * @param count Number of images to create
 * @returns Array of mock images
 */
export function createMockImages(count: number) {
	return Array.from({ length: count }, (_, i) => ({
		path: `/image${i + 1}.jpg`,
		name: `Image ${i + 1}`,
		url: `/image${i + 1}.jpg`,
		directory: "images",
	}));
}
