import { ImageCounter } from "@/components/ui/ImageCounter";
// SPDX-License-Identifier: Apache-2.0
import { ErrorBoundary } from "../ErrorBoundary";
import { useImageCarousel } from "../ImageCarouselContext";
import { ThumbnailStrip } from "../ThumbnailStrip";

interface ThumbnailSectionProps {
	readonly className?: string;
}

/**
 * Thumbnail section component
 *
 * This component displays the thumbnail strip and image counter.
 */
export function ThumbnailSection({ className = "" }: ThumbnailSectionProps) {
	const {
		thumbnailsRef,
		thumbnailContainerRef,
		visibleImages,
		currentIndex,
		visibleStartIndex,
		totalImages,
		selectedImage,
		handleThumbnailSelect,
		thumbnailOptions,
		isLoading,
		imageLoadError,
	} = useImageCarousel();

	const { minWidth, maxWidth, gap, aspectRatio, maxHeight } = thumbnailOptions;

	return (
		<ErrorBoundary>
			<div
				ref={thumbnailContainerRef}
				className={`w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 ${className}`}
			>
				{/* Thumbnails with counter */}
				<div ref={thumbnailsRef} className="w-full relative">
					<ThumbnailStrip
						images={visibleImages}
						selectedIndex={
							selectedImage ? Math.max(0, currentIndex - visibleStartIndex) : 0
						}
						onSelect={handleThumbnailSelect}
						minThumbnailWidth={minWidth}
						maxThumbnailWidth={maxWidth}
						gap={gap}
						aspectRatio={aspectRatio}
						maxHeight={maxHeight}
						className="w-full"
					/>

					{/* Navigation counter - overlaid in the top-right corner */}
					<div className="absolute top-1 right-1 z-10">
						<ImageCounter
							currentIndex={currentIndex}
							totalImages={totalImages}
							isLoading={isLoading || imageLoadError || totalImages <= 0}
							className="bg-gray-800/50 dark:bg-gray-900/70 px-2 py-0.5 rounded"
						/>
					</div>
				</div>
			</div>
		</ErrorBoundary>
	);
}
