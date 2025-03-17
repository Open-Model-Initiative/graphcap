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

// Mock Element.scrollTo
Element.prototype.scrollTo = function (_x: number, _y: number) {
	// Mock implementation
} as any;

// Mock the preloadImage function
vi.mock("@/services/images", async () => {
	const actual = await vi.importActual("@/services/images");
	return {
		...actual,
		preloadImage: vi.fn(),
	};
});

// Mock the ResponsiveImage component - using a factory function instead of JSX
vi.mock("@/common/components/responsive-image", () => {
	return {
		ResponsiveImage: function ({
			alt,
			imagePath,
			onError,
		}: { alt: string; imagePath: string; onError?: () => void }) {
			const img = document.createElement("img");
			img.src = imagePath;
			img.alt = alt;
			img.dataset.testid = "responsive-image";
			if (onError) img.onerror = onError;
			return img;
		},
		ThumbnailImage: function ({
			alt,
			imagePath,
			isSelected,
			onClick,
		}: {
			alt: string;
			imagePath: string;
			isSelected: boolean;
			onClick: () => void;
		}) {
			const img = document.createElement("img");
			img.src = imagePath;
			img.alt = alt;
			img.dataset.testid = "thumbnail-image";
			img.dataset.selected = String(isSelected);
			img.onclick = onClick;
			return img;
		},
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
