// SPDX-License-Identifier: Apache-2.0
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Setup global mocks for all tests

// Mock ResizeObserver
class ResizeObserverMock {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}

// Assign the mock to the global object
global.ResizeObserver = ResizeObserverMock as any;

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
	readonly root: Element | Document | null = null;
	readonly rootMargin: string = "0px";
	readonly thresholds: ReadonlyArray<number> = [0];

	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback;
	}

	callback: IntersectionObserverCallback;
	observe = vi.fn((element: Element) => {
		// Simulate an intersection immediately for testing purposes
		const entry = {
			isIntersecting: true,
			target: element,
			boundingClientRect: {} as DOMRectReadOnly,
			intersectionRatio: 1,
			intersectionRect: {} as DOMRectReadOnly,
			isVisible: true,
			rootBounds: null,
			time: Date.now(),
		} as IntersectionObserverEntry;

		this.callback([entry], this as unknown as IntersectionObserver);
	});
	unobserve = vi.fn();
	disconnect = vi.fn();
	takeRecords = vi.fn().mockReturnValue([]);
}

// Assign the mock to the global object
global.IntersectionObserver = IntersectionObserverMock as any;

// Mock the image service
vi.mock("@/services/images", async () => {
	const actual = await vi.importActual("@/services/images");
	return {
		...actual,
		getImageUrl: vi.fn((path) => path),
		preloadImage: vi.fn(),
	};
});

// Sample test images for reuse
export const mockImages = [
	{
		path: "/images/image1.jpg",
		name: "Image 1",
		directory: "test",
		url: "test-url",
	},
	{
		path: "/images/image2.jpg",
		name: "Image 2",
		directory: "test",
		url: "test-url",
	},
	{
		path: "/images/image3.jpg",
		name: "Image 3",
		directory: "test",
		url: "test-url",
	},
	{
		path: "/images/image4.jpg",
		name: "Image 4",
		directory: "test",
		url: "test-url",
	},
	{
		path: "/images/image5.jpg",
		name: "Image 5",
		directory: "test",
		url: "test-url",
	},
];
