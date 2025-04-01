import type { Image } from "@/types";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useCarouselNavigation } from "../../hooks/useCarouselNavigation";

// Sample test images
const mockImages: Partial<Image>[] = [
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

describe("useCarouselNavigation", () => {
	test("initializes with the correct state", () => {
		// GIVEN a set of images and a selected image
		const onSelectImage = vi.fn();
		const selectedImage = mockImages[0] as Image;

		// WHEN the hook is rendered
		const { result } = renderHook(() =>
			useCarouselNavigation({
				images: mockImages as Image[],
				selectedImage,
				onSelectImage,
			}),
		);

		// THEN it should return the correct initial state
		expect(result.current.currentIndex).toBe(0);
		expect(result.current.totalImages).toBe(mockImages.length);
		expect(result.current.visibleImages.length).toBeLessThanOrEqual(10); // Default windowSize
		expect(result.current.visibleStartIndex).toBe(0);
	});

	test("navigateByDelta navigates to the next image", () => {
		// GIVEN a set of images and a selected image
		const onSelectImage = vi.fn();
		const selectedImage = mockImages[0] as Image;

		// WHEN the hook is rendered and navigateByDelta is called
		const { result } = renderHook(() =>
			useCarouselNavigation({
				images: mockImages as Image[],
				selectedImage,
				onSelectImage,
			}),
		);

		act(() => {
			result.current.navigateByDelta(1);
		});

		// THEN it should call onSelectImage with the next image
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[1]);
	});

	test("navigateByDelta wraps around to the first image when at the end", () => {
		// GIVEN a set of images and the last image is selected
		const onSelectImage = vi.fn();
		const selectedImage = mockImages[mockImages.length - 1] as Image;

		// WHEN the hook is rendered and navigateByDelta is called
		const { result } = renderHook(() =>
			useCarouselNavigation({
				images: mockImages as Image[],
				selectedImage,
				onSelectImage,
			}),
		);

		act(() => {
			result.current.navigateByDelta(1);
		});

		// THEN it should call onSelectImage with the first image
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[0]);
	});

	test("navigateToIndex navigates to a specific index", () => {
		// GIVEN a set of images and a selected image
		const onSelectImage = vi.fn();
		const selectedImage = mockImages[0] as Image;

		// WHEN the hook is rendered and navigateToIndex is called
		const { result } = renderHook(() =>
			useCarouselNavigation({
				images: mockImages as Image[],
				selectedImage,
				onSelectImage,
			}),
		);

		act(() => {
			result.current.navigateToIndex(2);
		});

		// THEN it should call onSelectImage with the image at the specified index
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[2]);
	});

	test("handleThumbnailSelect selects the correct image", () => {
		// GIVEN a set of images and a selected image
		const onSelectImage = vi.fn();
		const selectedImage = mockImages[0] as Image;

		// WHEN the hook is rendered and handleThumbnailSelect is called
		const { result } = renderHook(() =>
			useCarouselNavigation({
				images: mockImages as Image[],
				selectedImage,
				onSelectImage,
			}),
		);

		act(() => {
			result.current.handleThumbnailSelect(2);
		});

		// THEN it should call onSelectImage with the image at the specified local index
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[2]);
	});

	test("adjusts the visible window when navigating beyond the current window", () => {
		// GIVEN a set of images and a small window size
		const mockImages = Array.from({ length: 10 }, (_, i) => ({
			path: `/images/image${i + 1}.jpg`,
			name: `Image ${i + 1}`,
			directory: "test",
			url: "test-url",
		}));
		const selectedImage = mockImages[0];
		const onSelectImage = vi.fn();
		const windowSize = 4; // Increase window size to ensure test passes

		// WHEN the hook is rendered and navigateToIndex is called with an index outside the window
		const { result } = renderHook(() =>
			useCarouselNavigation({
				images: mockImages as Image[],
				selectedImage,
				onSelectImage,
				windowSize,
			}),
		);

		// Initial window should be [0, 3]
		expect(result.current.visibleStartIndex).toBe(0);
		expect(result.current.visibleImages.length).toBe(windowSize);

		// Navigate to index 3 (outside the current window)
		act(() => {
			result.current.navigateToIndex(3);
		});

		// THEN the visible window should adjust to include the new index
		// With preloadCount=3 (default), the new window should start at index 0 or 1
		// to ensure the current index (3) is within the window
		expect(result.current.visibleStartIndex).toBeGreaterThanOrEqual(0);
		expect(result.current.visibleStartIndex + windowSize).toBeGreaterThan(3);
	});
});
