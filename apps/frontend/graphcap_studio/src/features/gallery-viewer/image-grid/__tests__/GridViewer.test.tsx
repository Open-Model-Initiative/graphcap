// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom";
import { GridViewer } from "../GridViewer";
import { mockImages } from "./setup";

// Mock the LazyImage component to simplify testing
vi.mock("../LazyImage", () => ({
	LazyImage: ({ image, isSelected, onSelect, ImageComponent }: any) => (
		<button
			data-testid="lazy-image"
			data-image-path={image.path}
			data-selected={isSelected.toString()}
			data-has-custom-renderer={(!!ImageComponent).toString()}
			aria-pressed={isSelected}
			onClick={() => onSelect(image)}
		>
			{ImageComponent ? <ImageComponent imagePath={image.path} /> : image.name}
		</button>
	),
}));

// Mock the react-window FixedSizeGrid component
vi.mock("react-window", () => ({
	FixedSizeGrid: ({ children, columnCount, rowCount, width, height }: any) => {
		const items = [];
		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
				items.push(
					children({
						columnIndex,
						rowIndex,
						style: {
							position: "absolute",
							left: columnIndex * 200,
							top: rowIndex * 200,
							width: 200,
							height: 200,
						},
					}),
				);
			}
		}
		return (
			<div data-testid="grid" style={{ width, height }}>
				{items.map((item, index) => (
					<div key={mockImages[index]?.path || `grid-item-${index}`}>
						{item}
					</div>
				))}
			</div>
		);
	},
}));

// Create a mock ImageComponent for testing
const MockImageComponent = vi.fn(({ imagePath }: { imagePath: string }) => (
	<div data-testid="mock-image-component">{imagePath}</div>
));

describe("GridViewer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("renders loading state when isLoading is true", () => {
		// GIVEN a GridViewer in loading state
		render(<GridViewer images={[]} isLoading={true} onSelectImage={vi.fn()} />);

		// THEN it should display a loading spinner
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	test("renders empty state when isEmpty is true", () => {
		// GIVEN a GridViewer with empty state
		render(<GridViewer images={[]} isEmpty={true} onSelectImage={vi.fn()} />);

		// THEN it should display the empty state message
		expect(screen.getByText("No images found")).toBeInTheDocument();
	});

	test("renders empty state when images array is empty", () => {
		// GIVEN a GridViewer with an empty images array
		render(<GridViewer images={[]} onSelectImage={vi.fn()} />);

		// THEN it should display the empty state message
		expect(screen.getByText("No images found")).toBeInTheDocument();
	});

	test("renders grid with images when images are provided", () => {
		// GIVEN a GridViewer with images
		render(
			<GridViewer
				images={mockImages}
				onSelectImage={vi.fn()}
				containerWidth={800}
				containerHeight={600}
			/>,
		);

		// THEN it should render the grid
		expect(screen.getByTestId("grid")).toBeInTheDocument();

		// AND it should render LazyImage components for each image
		const lazyImages = screen.getAllByTestId("lazy-image");
		expect(lazyImages.length).toBe(mockImages.length);

		// AND each LazyImage should have the correct image path
		mockImages.forEach((image) => {
			expect(screen.getByText(image.name)).toBeInTheDocument();
		});
	});

	test("passes selectedImage to LazyImage components", () => {
		// GIVEN a GridViewer with a selected image
		render(
			<GridViewer
				images={mockImages}
				selectedImage={mockImages[1]}
				onSelectImage={vi.fn()}
				containerWidth={800}
				containerHeight={600}
			/>,
		);

		// THEN the LazyImage for the selected image should have data-selected="true"
		const lazyImages = screen.getAllByTestId("lazy-image");
		const selectedImage = lazyImages.find(
			(img) => img.getAttribute("data-image-path") === mockImages[1].path,
		);

		expect(selectedImage).toHaveAttribute("data-selected", "true");

		// AND other LazyImages should have data-selected="false"
		const nonSelectedImages = lazyImages.filter(
			(img) => img.getAttribute("data-image-path") !== mockImages[1].path,
		);

		nonSelectedImages.forEach((img) => {
			expect(img).toHaveAttribute("data-selected", "false");
		});
	});

	test("calls onSelectImage when an image is clicked", () => {
		// GIVEN a GridViewer with images and an onSelectImage handler
		const onSelectImage = vi.fn();
		render(
			<GridViewer
				images={mockImages}
				onSelectImage={onSelectImage}
				containerWidth={800}
				containerHeight={600}
			/>,
		);

		// WHEN an image is clicked
		const lazyImages = screen.getAllByTestId("lazy-image");
		fireEvent.click(lazyImages[2]); // Click the third image

		// THEN onSelectImage should be called with the clicked image
		expect(onSelectImage).toHaveBeenCalledWith(mockImages[2]);
	});

	test("passes ImageComponent to LazyImage components when provided", () => {
		// GIVEN a GridViewer with a custom ImageComponent
		render(
			<GridViewer
				images={mockImages}
				onSelectImage={vi.fn()}
				containerWidth={800}
				containerHeight={600}
				ImageComponent={MockImageComponent}
			/>,
		);

		// THEN each LazyImage should have data-has-custom-renderer="true"
		const lazyImages = screen.getAllByTestId("lazy-image");
		lazyImages.forEach((img) => {
			expect(img).toHaveAttribute("data-has-custom-renderer", "true");
		});
	});

	test("does not pass ImageComponent to LazyImage components when not provided", () => {
		// GIVEN a GridViewer without a custom ImageComponent
		render(
			<GridViewer
				images={mockImages}
				onSelectImage={vi.fn()}
				containerWidth={800}
				containerHeight={600}
			/>,
		);

		// THEN each LazyImage should have data-has-custom-renderer="false"
		const lazyImages = screen.getAllByTestId("lazy-image");
		lazyImages.forEach((img) => {
			expect(img).toHaveAttribute("data-has-custom-renderer", "false");
		});
	});
});
