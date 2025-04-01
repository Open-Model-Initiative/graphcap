import { ThumbnailImage } from "@/components/responsive-image";
import { UploadDropzone } from "@/features/datasets/components/image-uploader";
// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { Upload } from "lucide-react";
import { memo, useEffect, useLayoutEffect, useRef } from "react";
import { ErrorBoundary } from "../ErrorBoundary";
import { useDynamicThumbnails } from "../hooks";
import styles from "./ThumbnailStrip.module.css";

interface ThumbnailStripProps {
	readonly selectedIndex: number;
	readonly onSelect: (index: number) => void;
	readonly className?: string;
	readonly minThumbnailWidth?: number;
	readonly maxThumbnailWidth?: number;
	readonly gap?: number;
	readonly aspectRatio?: number;
	readonly maxHeight?: number;
	readonly visibleImages?: { path: string; name: string }[];
}

/**
 * A horizontal strip of thumbnails for navigating between images
 *
 * This component displays a scrollable strip of image thumbnails,
 * highlighting the currently selected image and allowing users to
 * click on thumbnails to navigate to specific images. The thumbnails
 * are dynamically sized based on the available container width.
 *
 * The component is accessible, with proper ARIA attributes for screen readers
 * and keyboard navigation support.
 */
function ThumbnailStripBase({
	selectedIndex,
	onSelect,
	className = "",
	minThumbnailWidth = 32,
	maxThumbnailWidth = 64,
	gap = 4,
	aspectRatio = 1,
	maxHeight = 70,
	visibleImages,
}: Readonly<ThumbnailStripProps>) {
	// Get dataset and images from context
	const { selectedDataset, isLoadingDataset, datasetError } =
		useDatasetContext();
	// Use provided visibleImages if available, otherwise fallback to context
	const images = visibleImages ?? selectedDataset?.images ?? [];

	// Ref for the main scrollable container (for keyboard focus check)
	const containerRef = useRef<HTMLDivElement>(null);
	// Ref array to hold references to each thumbnail div
	const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Use custom hook for dynamic thumbnail sizing
	const {
		containerRef: sizeCalcContainerRef,
		thumbnailWidth,
		thumbnailHeight,
	} = useDynamicThumbnails({
		totalCount: images.length + 1, // Always add 1 for the upload button
		minThumbnailWidth,
		maxThumbnailWidth,
		gap,
		aspectRatio,
		maxHeight,
	});

	// Ensure the refs array is the correct size
	useEffect(() => {
		thumbnailRefs.current = thumbnailRefs.current.slice(0, images.length);
	}, [images.length]);

	// Scroll the selected thumbnail into view using useLayoutEffect for timing
	// We use useLayoutEffect because scrolling needs to happen after the DOM
	// mutations (potentially including size changes) are complete but before paint.
	// NOTE: Linter might warn about thumbnailWidth/Height dependencies, but they are
	// needed here to ensure the effect re-runs if dimensions change, as scroll
	// calculation depends on the element having the correct size applied.
	useLayoutEffect(() => {
		const selectedThumbnail = thumbnailRefs.current[selectedIndex];
		if (selectedThumbnail) {
			selectedThumbnail.scrollIntoView({
				behavior: "auto",
				block: "nearest",
				inline: "center",
			});
		}
	}, [selectedIndex]);

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
		const activeElement = document.activeElement;
		// Check focus using the containerRef
		const isThumbnailFocused =
			activeElement &&
			thumbnailRefs.current.includes(activeElement as HTMLDivElement) &&
			containerRef.current?.contains(activeElement);

		if (!isThumbnailFocused && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
			return;
		}

		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onSelect(index);
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			const nextIndex = (index + 1) % images.length;
			onSelect(nextIndex);
			// Focus the next thumbnail using refs
			thumbnailRefs.current[nextIndex]?.focus();
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			const prevIndex = (index - 1 + images.length) % images.length;
			onSelect(prevIndex);
			// Focus the previous thumbnail using refs
			thumbnailRefs.current[prevIndex]?.focus();
		}
	};

	// Loading State
	if (isLoadingDataset) {
		return (
			<div className={`${styles.container} ${className} ${styles.loading}`}>
				Loading thumbnails...
			</div>
		);
	}

	// Error State
	if (datasetError) {
		return (
			<div className={`${styles.container} ${className} ${styles.error}`}>
				Error loading thumbnails: {datasetError.message}
			</div>
		);
	}

	return (
		<div
			ref={(el) => {
				containerRef.current = el;
				if (sizeCalcContainerRef && 'current' in sizeCalcContainerRef) {
					(sizeCalcContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
				}
			}}
			className={`${styles.container} ${className}`}
			data-testid="thumbnail-strip"
			role="tablist"
			aria-label="Image thumbnails"
		>
			{/* Upload dropzone at the start of the thumbnail strip - ALWAYS SHOW IT */}
			<button
				type="submit"
				style={{
					width: `${thumbnailWidth * 2}px`,
					height: `${thumbnailHeight}px`,
					backgroundColor: "transparent",
					flexShrink: 0,
				}}
				className={styles.uploadThumbnail}
				aria-label="Upload images"
				data-testid="upload-thumbnail"
			>
				<div className="h-full w-full flex items-center justify-center">
					<ErrorBoundary
						fallback={<Upload className="text-gray-400" size={16} />}
					>
						<UploadDropzone
							className="h-full w-full"
							compact={true}
						/>
					</ErrorBoundary>
				</div>
			</button>

			{images.map((image, index) => (
				<div
					key={image.path}
					ref={(el: HTMLDivElement | null) => {
						thumbnailRefs.current[index] = el;
					}}
					style={{
						width: `${thumbnailWidth}px`,
						height: `${thumbnailHeight}px`,
						flexShrink: 0,
					}}
					role="tab"
					aria-selected={index === selectedIndex}
					aria-controls="carousel-image"
					tabIndex={index === selectedIndex ? 0 : -1}
					onKeyDown={(e) => handleKeyDown(e, index)}
				>
					<ThumbnailImage
						imagePath={image.path}
						alt={`Thumbnail for ${image.name}`}
						isSelected={index === selectedIndex}
						aspectRatio={aspectRatio}
						className="h-full w-full"
						onClick={() => onSelect(index)}
					/>
				</div>
			))}
		</div>
	);
}

// Memoize the component to prevent unnecessary re-renders
export const ThumbnailStrip = memo(ThumbnailStripBase);
