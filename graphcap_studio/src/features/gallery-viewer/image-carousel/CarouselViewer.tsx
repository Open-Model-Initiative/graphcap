import type { Image } from "@/types";
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { ImageCarouselProvider } from "./ImageCarouselContext";
import { CarouselEmptyState } from "./components/CarouselEmptyState";
import { CarouselLayout } from "./components/CarouselLayout";
import { CarouselLoadingState } from "./components/CarouselLoadingState";

interface CarouselViewerProps {
	readonly images: Image[];
	readonly isLoading?: boolean;
	readonly isEmpty?: boolean;
	readonly className?: string;
	readonly selectedImage?: Image | null;
	readonly onSelectImage: (image: Image) => void;
	readonly datasetName?: string;
	readonly onUploadComplete?: () => void;
	readonly thumbnailOptions?: {
		readonly minWidth?: number;
		readonly maxWidth?: number;
		readonly gap?: number;
		readonly aspectRatio?: number;
		readonly maxHeight?: number;
	};
	readonly preloadOptions?: {
		readonly enabled?: boolean;
		readonly preloadCount?: number;
		readonly maxConcurrentPreloads?: number;
	};
}

/**
 * A carousel-based image viewer component with sliding window pagination and upload capability
 *
 * This component displays images in a carousel view with navigation controls
 * and thumbnails. It uses a sliding window approach to load only a subset of
 * images at a time, improving performance for large image collections.
 * It also provides an option to upload new images directly from the carousel.
 *
 * @param images - Array of image objects to display
 * @param isLoading - Whether the carousel is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param className - Additional CSS classes
 * @param selectedImage - Currently selected image
 * @param onSelectImage - Callback when an image is selected
 * @param datasetName - Name of the dataset to upload images to
 * @param onUploadComplete - Callback when upload is complete
 * @param thumbnailOptions - Optional configuration for thumbnail display
 * @param preloadOptions - Optional configuration for image preloading
 */
export function CarouselViewer({
	images,
	isLoading = false,
	isEmpty = false,
	className = "",
	selectedImage,
	onSelectImage,
	datasetName,
	onUploadComplete,
	thumbnailOptions = {},
	preloadOptions = {},
}: Readonly<CarouselViewerProps>) {
	// Show loading state
	if (isLoading) {
		return <CarouselLoadingState className={className} />;
	}

	// Show empty state
	if (isEmpty || images.length === 0) {
		return (
			<ImageCarouselProvider
				images={[]}
				selectedImage={null}
				onSelectImage={onSelectImage}
				isLoading={isLoading}
				isEmpty={true}
				datasetName={datasetName}
				onUploadComplete={onUploadComplete}
			>
				<CarouselEmptyState className={className} />
			</ImageCarouselProvider>
		);
	}

	return (
		<ErrorBoundary>
			<ImageCarouselProvider
				images={images}
				selectedImage={selectedImage}
				onSelectImage={onSelectImage}
				isLoading={isLoading}
				isEmpty={isEmpty}
				datasetName={datasetName}
				onUploadComplete={onUploadComplete}
				thumbnailOptions={thumbnailOptions}
				preloadOptions={preloadOptions}
			>
				<CarouselLayout className={className} />
			</ImageCarouselProvider>
		</ErrorBoundary>
	);
}
