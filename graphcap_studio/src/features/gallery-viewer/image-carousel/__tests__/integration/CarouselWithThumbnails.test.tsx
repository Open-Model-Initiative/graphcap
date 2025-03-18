import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom";
import { imageServiceMock } from "@/test/mocks/servicesMock";
import { CarouselViewer } from "../../CarouselViewer";
import { createMockImages, mockComponents, setupCarouselTestEnvironment } from "../test-utils";

// Setup component mocks
mockComponents.setupImageComponents();
mockComponents.setupUploadDropzone();
mockComponents.setupImageCarouselContext("../../ImageCarouselContext");

const preloadImageMock = imageServiceMock.preloadImage;

// Sample test images - create 5 images for integration test
const mockImages = createMockImages(5);

describe("CarouselViewer with ThumbnailStrip Integration", () => {
	// Setup common test environment
	beforeAll(() => {
		setupCarouselTestEnvironment();
	});

	test("full navigation flow with thumbnails and buttons", () => {
		const onSelectImage = vi.fn();

		render(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[0]}
				onSelectImage={onSelectImage}
				datasetName="test-dataset"
			/>,
		);

		// It should display the main image and thumbnails
		expect(screen.getByTestId("responsive-image")).toBeInTheDocument();
		expect(screen.getAllByTestId("thumbnail-image").length).toBeGreaterThan(0);

		// It should display the upload dropzone
		expect(screen.getByTestId("upload-dropzone")).toBeInTheDocument();
		expect(screen.getByTestId("upload-dropzone")).toHaveAttribute(
			"data-dataset",
			"test-dataset",
		);
		expect(screen.getByTestId("upload-dropzone")).toHaveAttribute(
			"data-compact",
			"true",
		);

		// Clicking a thumbnail should call onSelectImage with the corresponding image
		const thumbnails = screen.getAllByTestId("thumbnail-image");
		fireEvent.click(thumbnails[2]);
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[2]);

		onSelectImage.mockReset();

		// Clicking the next button should call onSelectImage with the next image
		const nextButton = screen.getByLabelText("Next image");
		fireEvent.click(nextButton);
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[1]);

		onSelectImage.mockReset();

		// Clicking the previous button should call onSelectImage with the previous image
		const prevButton = screen.getByLabelText("Previous image");
		fireEvent.click(prevButton);
		expect(onSelectImage).toHaveBeenCalledWith(
			mockImages[mockImages.length - 1],
		);

		onSelectImage.mockReset();

		// Pressing the right arrow key should call onSelectImage with the next image
		fireEvent.keyDown(window, { key: "ArrowRight" });
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[1]);
	});

	test("updates the displayed image when selectedImage prop changes", () => {
		const onSelectImage = vi.fn();

		const { rerender } = render(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[0]}
				onSelectImage={onSelectImage}
				datasetName="test-dataset"
			/>,
		);

		// It should initially display the first image
		const mainImage = screen.getByTestId("responsive-image");
		expect(mainImage).toHaveAttribute("src", mockImages[0].path);

		// When the selectedImage prop changes, the displayed image updates accordingly
		rerender(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[2]}
				onSelectImage={onSelectImage}
				datasetName="test-dataset"
			/>,
		);

		expect(mainImage).toHaveAttribute("src", mockImages[2].path);

		// And the corresponding thumbnail should be marked as selected
		const thumbnails = screen.getAllByTestId("thumbnail-image");
		expect(thumbnails[2]).toHaveAttribute("data-selected", "true");
	});

	test("handles image loading errors and retry", () => {
		const onSelectImage = vi.fn();

		render(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[0]}
				onSelectImage={onSelectImage}
				datasetName="test-dataset"
			/>,
		);

		// Simulate image load error
		const mainImage = screen.getByTestId("responsive-image");
		fireEvent.error(mainImage);

		// It should display an error message and a retry button
		expect(screen.getByText("Failed to load image")).toBeInTheDocument();
		const retryButton = screen.getByText("Retry");
		expect(retryButton).toBeInTheDocument();

		// Clicking retry should call the preloadImage function
		fireEvent.click(retryButton);
		expect(preloadImageMock).toHaveBeenCalledWith(mockImages[0].path, "full");
	});
});
