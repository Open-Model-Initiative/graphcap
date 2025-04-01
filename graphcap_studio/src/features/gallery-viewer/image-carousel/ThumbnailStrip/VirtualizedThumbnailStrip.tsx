import { ThumbnailImage } from "@/components/responsive-image";
import type { Image } from "@/types";
// SPDX-License-Identifier: Apache-2.0
import { memo, useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { useDynamicThumbnails } from "../hooks";
import styles from "./ThumbnailStrip.module.css";

interface VirtualizedThumbnailStripProps {
	readonly images: Image[];
	readonly selectedIndex: number;
	readonly onSelect: (index: number) => void;
	readonly className?: string;
	readonly minThumbnailWidth?: number;
	readonly maxThumbnailWidth?: number;
	readonly gap?: number;
	readonly aspectRatio?: number;
	readonly maxHeight?: number;
	readonly virtualizeThreshold?: number;
}

/**
 * A virtualized horizontal strip of thumbnails for navigating between images
 *
 * This component displays a scrollable strip of image thumbnails using virtualization
 * for improved performance with large collections. It only renders the thumbnails
 * that are currently visible in the viewport, plus a small overscan buffer.
 *
 * The component is accessible, with proper ARIA attributes for screen readers
 * and keyboard navigation support.
 */
function VirtualizedThumbnailStripBase({
	images,
	selectedIndex,
	onSelect,
	className = "",
	minThumbnailWidth = 32,
	maxThumbnailWidth = 64,
	gap = 4,
	aspectRatio = 1,
	maxHeight = 70,
	virtualizeThreshold = 50,
}: Readonly<VirtualizedThumbnailStripProps>) {
	// State to track container width
	const [containerWidth, setContainerWidth] = useState<number>(0);

	// Use custom hook for dynamic thumbnail sizing
	const {
		containerRef,
		thumbnailWidth,
		thumbnailHeight,
		gap: calculatedGap,
	} = useDynamicThumbnails({
		totalCount: images.length,
		minThumbnailWidth,
		maxThumbnailWidth,
		gap,
		aspectRatio,
		maxHeight,
	});

	// Update container width when it changes
	useEffect(() => {
		if (containerRef.current) {
			setContainerWidth(containerRef.current.clientWidth);

			// Set up resize observer to update width when container resizes
			const resizeObserver = new ResizeObserver(() => {
				if (containerRef.current) {
					setContainerWidth(containerRef.current.clientWidth);
				}
			});

			resizeObserver.observe(containerRef.current);

			return () => {
				if (containerRef.current) {
					resizeObserver.unobserve(containerRef.current);
				}
			};
		}
	}, [containerRef]);

	// Calculate item size (thumbnail width + gap)
	const itemSize = thumbnailWidth + calculatedGap;

	// Calculate list width (limited by container width)
	const listWidth = containerWidth || 500;

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onSelect(index);
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			const nextIndex = (index + 1) % images.length;
			onSelect(nextIndex);
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			const prevIndex = (index - 1 + images.length) % images.length;
			onSelect(prevIndex);
		}
	};

	// Render function for each thumbnail item
	const renderThumbnail = ({
		index,
		style,
	}: { index: number; style: React.CSSProperties }) => (
		<div
			key={images[index].path}
			id={`thumbnail-${index}`}
			style={{
				...style,
				width: thumbnailWidth,
				height: thumbnailHeight,
			}}
			role="tab"
			aria-selected={index === selectedIndex}
			aria-controls="carousel-image-label"
			tabIndex={index === selectedIndex ? 0 : -1}
			onKeyDown={(e) => handleKeyDown(e, index)}
		>
			<ThumbnailImage
				imagePath={images[index].path}
				alt={`Thumbnail for ${images[index].name}`}
				isSelected={index === selectedIndex}
				aspectRatio={aspectRatio}
				className="h-full w-full"
				onClick={() => onSelect(index)}
			/>
		</div>
	);

	// Use standard rendering for small collections, virtualized for large ones
	const shouldVirtualize = images.length > virtualizeThreshold;

	return (
		<div
			ref={containerRef}
			className={`${styles.container} ${className}`}
			style={{ gap: `${calculatedGap}px` }}
			data-testid="thumbnail-strip"
			role="tablist"
			aria-label="Image thumbnails"
		>
			{shouldVirtualize && containerWidth > 0 ? (
				<List
					height={thumbnailHeight}
					itemCount={images.length}
					itemSize={itemSize}
					layout="horizontal"
					width={listWidth}
					overscanCount={5}
					initialScrollOffset={selectedIndex * itemSize}
				>
					{renderThumbnail}
				</List>
			) : (
				images.map((image, index) => (
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
						aria-controls="carousel-image-label"
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
				))
			)}
		</div>
	);
}

// Memoize the component to prevent unnecessary re-renders
export const VirtualizedThumbnailStrip = memo(VirtualizedThumbnailStripBase);
