import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import type { Image } from "@/types";
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { ImageCarouselProvider } from "./ImageCarouselContext";
import { CarouselEmptyState } from "./components/CarouselEmptyState";
import { CarouselLayout } from "./components/CarouselLayout";
import { CarouselLoadingState } from "./components/CarouselLoadingState";

interface CarouselViewerProps {
	readonly className?: string;
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
 * and thumbnails. It relies on DatasetContext for image data and selection state.
 *
 * @param className - Additional CSS classes
 * @param onUploadComplete - Callback when upload is complete
 * @param thumbnailOptions - Optional configuration for thumbnail display
 * @param preloadOptions - Optional configuration for image preloading
 */
export function CarouselViewer({
	className = "",
	onUploadComplete,
	thumbnailOptions = {},
	preloadOptions = {},
}: Readonly<CarouselViewerProps>) {
	// Get data from context
	const {
		selectedDataset,
		isLoadingDataset,
		selectedImage,
	} = useDatasetContext();

	// Derive state from context
	const isLoading = isLoadingDataset;
	const images = selectedDataset?.images ?? [];
	const isEmpty = !isLoading && images.length === 0;
	const datasetName = selectedDataset?.name;

	// Show loading state
	if (isLoading) {
		return <CarouselLoadingState className={className} />;
	}

	// Show empty state
	if (isEmpty) {
		return (
			<ImageCarouselProvider
				onUploadComplete={onUploadComplete}
			>
				<CarouselEmptyState className={className} />
			</ImageCarouselProvider>
		);
	}

	return (
		<ErrorBoundary>
			<ImageCarouselProvider
				onUploadComplete={onUploadComplete}
				thumbnailOptions={thumbnailOptions}
				preloadOptions={preloadOptions}
			>
				<CarouselLayout className={className} />
			</ImageCarouselProvider>
		</ErrorBoundary>
	);
}
