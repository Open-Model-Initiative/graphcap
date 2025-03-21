import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { Image, preloadImage } from "@/services/images";
// SPDX-License-Identifier: Apache-2.0
import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
	useMemo,
} from "react";
import {
	useCarouselControls,
	useCarouselLayout,
	useCarouselNavigation,
	useImagePreloader,
	useThumbnailScroll,
	useWheelNavigation,
} from "./hooks";

interface ImageCarouselContextType {
	// Images and selection
	images: Image[];
	selectedImage: Image | null;
	selectImage: (image: Image) => void;

	// Navigation
	currentIndex: number;
	totalImages: number;
	visibleImages: Image[];
	visibleStartIndex: number;
	navigateByDelta: (delta: number) => void;
	handleThumbnailSelect: (index: number) => void;

	// Layout
	containerRef: React.RefObject<HTMLElement | null>;
	imageContainerRef: React.RefObject<HTMLDivElement | null>;
	thumbnailContainerRef: React.RefObject<HTMLDivElement | null>;
	thumbnailsRef: React.RefObject<HTMLDivElement | null>;
	imageContainerHeight: number;
	isCalculating: boolean;

	// State
	isLoading: boolean;
	isEmpty: boolean;
	imageLoadError: boolean;
	setImageLoadError: (error: boolean) => void;

	// Dataset
	datasetName: string;

	// Upload
	onUploadComplete?: () => void;

	// Thumbnail options
	thumbnailOptions: {
		minWidth: number;
		maxWidth: number;
		gap: number;
		aspectRatio: number;
		maxHeight: number;
	};

	// Error handling
	handleRetry: () => void;
}

const ImageCarouselContext = createContext<
	ImageCarouselContextType | undefined
>(undefined);

interface ImageCarouselProviderProps {
	readonly children: ReactNode;
	readonly images: Image[];
	readonly isLoading?: boolean;
	readonly isEmpty?: boolean;
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
 * Provider component for the ImageCarousel context
 * Makes the dataset name and other shared properties available to all child components
 *
 * @param children - Child components
 * @param images - Array of images
 * @param isLoading - Whether the carousel is loading
 * @param isEmpty - Whether the carousel is empty
 * @param selectedImage - Initial selected image
 * @param onSelectImage - Callback to select an image
 * @param datasetName - Optional override for dataset name
 * @param onUploadComplete - Callback when upload is complete
 * @param thumbnailOptions - Thumbnail options
 * @param preloadOptions - Preload options
 */
export function ImageCarouselProvider({
	children,
	images,
	isLoading = false,
	isEmpty = false,
	selectedImage: initialSelectedImage = null,
	onSelectImage,
	datasetName: propDatasetName,
	onUploadComplete,
	thumbnailOptions = {},
	preloadOptions = {},
}: ImageCarouselProviderProps) {
	// Get dataset context
	const { currentDataset } = useDatasetContext();

	// Use prop datasetName if provided, otherwise use currentDataset from context
	const datasetName = propDatasetName ?? currentDataset;

	// Normalize thumbnail options
	const normalizedThumbnailOptions = {
		minWidth: thumbnailOptions.minWidth ?? 64,
		maxWidth: thumbnailOptions.maxWidth ?? 120,
		gap: thumbnailOptions.gap ?? 8,
		aspectRatio: thumbnailOptions.aspectRatio ?? 1,
		maxHeight: thumbnailOptions.maxHeight ?? 70,
	};

	// Normalize preload options
	const normalizedPreloadOptions = {
		enabled: preloadOptions.enabled !== false,
		preloadCount: preloadOptions.preloadCount ?? 2,
		maxConcurrentPreloads: preloadOptions.maxConcurrentPreloads ?? 3,
	};

	// State for image loading error
	const [imageLoadError, setImageLoadError] = useState<boolean>(false);

	// Use custom hook for carousel layout
	const {
		containerRef,
		imageContainerRef,
		thumbnailContainerRef,
		imageContainerHeight,
		isCalculating,
	} = useCarouselLayout({
		thumbnailHeight: 96, // 6rem
	});

	// Use custom hook for carousel navigation
	const {
		currentIndex,
		visibleImages,
		visibleStartIndex,
		totalImages,
		navigateByDelta,
		handleThumbnailSelect,
	} = useCarouselNavigation({
		images,
		selectedImage: initialSelectedImage,
		onSelectImage,
	});

	// Use custom hook for keyboard navigation
	useCarouselControls({
		navigateByDelta,
		enabled: !isLoading && !isEmpty && images.length > 0,
	});

	// Use custom hook for wheel navigation
	useWheelNavigation({
		containerRef: imageContainerRef,
		navigateByDelta,
		enabled: !isLoading && !isEmpty && images.length > 0,
	});

	// Use custom hook for thumbnail scrolling
	const thumbnailsRef = useThumbnailScroll({
		selectedIndex: initialSelectedImage
			? Math.max(0, currentIndex - visibleStartIndex)
			: 0,
		totalCount: visibleImages.length,
	});

	// Use custom hook for image preloading
	useImagePreloader({
		images,
		currentIndex,
		preloadCount: normalizedPreloadOptions.preloadCount,
		enabled:
			normalizedPreloadOptions.enabled &&
			!isLoading &&
			!isEmpty &&
			images.length > 0,
		maxConcurrentPreloads: normalizedPreloadOptions.maxConcurrentPreloads,
	});

	// Handle retry when image fails to load
	const handleRetry = useCallback(() => {
		if (initialSelectedImage) {
			setImageLoadError(false);
			// Attempt to reload the image
			preloadImage(initialSelectedImage.path, "full");
		}
	}, [initialSelectedImage]);

	// Select image wrapper
	const selectImage = useCallback(
		(image: Image) => {
			setImageLoadError(false);
			onSelectImage(image);
		},
		[onSelectImage],
	);

	const value = useMemo(
		() => ({
			images,
			selectedImage: initialSelectedImage || null,
			selectImage,

			currentIndex,
			totalImages,
			visibleImages,
			visibleStartIndex,
			navigateByDelta,
			handleThumbnailSelect,

			containerRef,
			imageContainerRef,
			thumbnailContainerRef,
			thumbnailsRef,
			imageContainerHeight,
			isCalculating,

			isLoading,
			isEmpty,
			imageLoadError,
			setImageLoadError,

			datasetName,
			onUploadComplete,

			thumbnailOptions: normalizedThumbnailOptions,

			handleRetry,
		}),
		[
			images,
			initialSelectedImage,
			selectImage,
			currentIndex,
			totalImages,
			visibleImages,
			visibleStartIndex,
			navigateByDelta,
			handleThumbnailSelect,
			containerRef,
			imageContainerRef,
			thumbnailContainerRef,
			thumbnailsRef,
			imageContainerHeight,
			isCalculating,
			isLoading,
			isEmpty,
			imageLoadError,
			datasetName,
			onUploadComplete,
			normalizedThumbnailOptions,
			handleRetry,
		],
	);

	return (
		<ImageCarouselContext.Provider value={value}>
			{children}
		</ImageCarouselContext.Provider>
	);
}

/**
 * Hook to access the ImageCarousel context
 * @returns The ImageCarousel context value
 * @throws Error if used outside of an ImageCarouselProvider
 */
export function useImageCarousel() {
	const context = useContext(ImageCarouselContext);
	if (!context) {
		throw new Error(
			"useImageCarousel must be used within an ImageCarouselProvider",
		);
	}
	return context;
}
