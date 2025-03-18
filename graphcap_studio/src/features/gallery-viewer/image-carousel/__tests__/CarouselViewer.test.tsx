import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom"; // Import jest-dom matchers
import { MockImage, imageServiceMock } from "@/test/mocks/servicesMock";
import { CarouselViewer } from "../CarouselViewer";
import { createMockImages, mockComponents, setupCarouselTestEnvironment } from "./test-utils";

// Setup component mocks
mockComponents.setupImageComponents();
mockComponents.setupUploadDropzone();
mockComponents.setupImageCarouselContext("../ImageCarouselContext");

const preloadImageMock = imageServiceMock.preloadImage;

// Sample test images
const mockImages = createMockImages(3);

describe("CarouselViewer", () => {
	// Setup common test environment
	beforeAll(() => {
		setupCarouselTestEnvironment();
	});

	// Test the loading state
	test("renders loading state correctly", () => {
		// GIVEN a CarouselViewer in loading state
		render(
			<CarouselViewer
				images={[]}
				isLoading={true}
				onSelectImage={vi.fn()}
				datasetName="test-dataset"
			/>,
		);

		// THEN it should display a loading spinner
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	// Test the empty state
	test("renders empty state when no images are provided", () => {
		// GIVEN a CarouselViewer with no images
		render(
			<CarouselViewer
				images={[]}
				isEmpty={true}
				onSelectImage={vi.fn()}
				datasetName="test-dataset"
			/>,
		);

		// THEN it should display the empty state message
		expect(screen.getByText("No images found")).toBeInTheDocument();

		// AND it should display the upload dropzone
		expect(screen.getByTestId("upload-dropzone")).toBeInTheDocument();
		expect(screen.getByTestId("upload-dropzone")).toHaveAttribute(
			"data-dataset",
			"test-dataset",
		);
	});

	// Test the normal state with images
	test("renders images and navigation when images are provided", () => {
		// GIVEN a CarouselViewer with images and a selected image
		render(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[0]}
				onSelectImage={vi.fn()}
				datasetName="test-dataset"
			/>,
		);

		// THEN it should display the main image
		expect(screen.getByTestId("responsive-image")).toBeInTheDocument();

		// AND it should display navigation buttons
		expect(screen.getByLabelText("Previous image")).toBeInTheDocument();
		expect(screen.getByLabelText("Next image")).toBeInTheDocument();

		// AND it should display the image counter
		expect(screen.getByText(/Image 1 of 3/)).toBeInTheDocument();

		// AND it should display the upload thumbnail in the thumbnail strip
		expect(screen.getByTestId("upload-dropzone")).toBeInTheDocument();
		expect(screen.getByTestId("upload-dropzone")).toHaveAttribute(
			"data-dataset",
			"test-dataset",
		);
		expect(screen.getByTestId("upload-dropzone")).toHaveAttribute(
			"data-compact",
			"true",
		);
	});

	// Test navigation button interaction
	test("calls onSelectImage when next button is clicked", () => {
		// GIVEN a CarouselViewer with images and a selected image
		const onSelectImage = vi.fn();
		render(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[0]}
				onSelectImage={onSelectImage}
				datasetName="test-dataset"
			/>,
		);

		// WHEN the next button is clicked
		const nextButton = screen.getByLabelText("Next image");
		fireEvent.click(nextButton);

		// THEN onSelectImage should be called with the next image
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[1]);
	});

	test("calls onSelectImage when previous button is clicked", () => {
		// GIVEN a CarouselViewer with images and a selected image (not the first one)
		const onSelectImage = vi.fn();
		render(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[1]}
				onSelectImage={onSelectImage}
				datasetName="test-dataset"
			/>,
		);

		// WHEN the previous button is clicked
		const prevButton = screen.getByLabelText("Previous image");
		fireEvent.click(prevButton);

		// THEN onSelectImage should be called with the previous image
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[0]);
	});

	// Test keyboard navigation
	test("navigates to next image when right arrow key is pressed", () => {
		// GIVEN a CarouselViewer with images and a selected image
		const onSelectImage = vi.fn();
		render(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[0]}
				onSelectImage={onSelectImage}
				datasetName="test-dataset"
			/>,
		);

		// WHEN the right arrow key is pressed
		fireEvent.keyDown(window, { key: "ArrowRight" });

		// THEN onSelectImage should be called with the next image
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[1]);
	});

	test("navigates to previous image when left arrow key is pressed", () => {
		// GIVEN a CarouselViewer with images and a selected image (not the first one)
		const onSelectImage = vi.fn();
		render(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[1]}
				onSelectImage={onSelectImage}
				datasetName="test-dataset"
			/>,
		);

		// WHEN the left arrow key is pressed
		fireEvent.keyDown(window, { key: "ArrowLeft" });

		// THEN onSelectImage should be called with the previous image
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[0]);
	});

	// Test error handling
	test("displays error state when image fails to load", () => {
		// GIVEN a CarouselViewer with images and a selected image
		render(
			<CarouselViewer
				images={mockImages}
				selectedImage={mockImages[0]}
				onSelectImage={vi.fn()}
				datasetName="test-dataset"
			/>,
		);

		// WHEN the image fails to load
		const image = screen.getByTestId("responsive-image");
		fireEvent.error(image);

		// THEN it should display the error message
		expect(screen.getByText("Failed to load image")).toBeInTheDocument();

		// AND it should display a retry button
		const retryButton = screen.getByText("Retry");
		expect(retryButton).toBeInTheDocument();

		// WHEN the retry button is clicked
		fireEvent.click(retryButton);

		// THEN the preloadImage function should be called
		expect(preloadImageMock).toHaveBeenCalledWith(mockImages[0].path, "full");
	});
});
