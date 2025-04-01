import { ThumbnailImage } from "@/components/responsive-image";
import { UploadDropzone } from "@/features/datasets/components/image-uploader";
import type { Image } from "@/types";
import { Upload } from "lucide-react";
// SPDX-License-Identifier: Apache-2.0
import { memo } from "react";
import { ErrorBoundary } from "../ErrorBoundary";
import { useImageCarousel } from "../ImageCarouselContext";
import { useDynamicThumbnails } from "../hooks";
import styles from "./ThumbnailStrip.module.css";

interface ThumbnailStripProps {
	readonly images: Image[];
	readonly selectedIndex: number;
	readonly onSelect: (index: number) => void;
	readonly className?: string;
	readonly minThumbnailWidth?: number;
	readonly maxThumbnailWidth?: number;
	readonly gap?: number;
	readonly aspectRatio?: number;
	readonly maxHeight?: number;
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
	images,
	selectedIndex,
	onSelect,
	className = "",
	minThumbnailWidth = 32,
	maxThumbnailWidth = 64,
	gap = 4,
	aspectRatio = 1,
	maxHeight = 70,
}: Readonly<ThumbnailStripProps>) {
	// Get dataset name from context
	const { datasetName, onUploadComplete } = useImageCarousel();

	// Use custom hook for dynamic thumbnail sizing
	const {
		containerRef,
		thumbnailWidth,
		thumbnailHeight,
		gap: calculatedGap,
	} = useDynamicThumbnails({
		totalCount: images.length + 1, // Always add 1 for the upload button
		minThumbnailWidth,
		maxThumbnailWidth,
		gap,
		aspectRatio,
		maxHeight,
	});

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onSelect(index);
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			const nextIndex = (index + 1) % images.length;
			onSelect(nextIndex);
			// Focus the next thumbnail
			const nextThumbnail = document.getElementById(`thumbnail-${nextIndex}`);
			if (nextThumbnail) {
				nextThumbnail.focus();
			}
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			const prevIndex = (index - 1 + images.length) % images.length;
			onSelect(prevIndex);
			// Focus the previous thumbnail
			const prevThumbnail = document.getElementById(`thumbnail-${prevIndex}`);
			if (prevThumbnail) {
				prevThumbnail.focus();
			}
		}
	};

	return (
		<div
			ref={containerRef}
			className={`${styles.container} ${className}`}
			style={{ gap: `${calculatedGap}px` }}
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
							datasetName={datasetName}
							className="h-full w-full"
							compact={true}
							onUploadComplete={onUploadComplete}
						/>
					</ErrorBoundary>
				</div>
			</button>

			{images.map((image, index) => (
				<div
					key={image.path}
					id={`thumbnail-${index}`}
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
