import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ResponsiveImage } from "@/components/responsive-image";
// SPDX-License-Identifier: Apache-2.0
import { ImageOff } from "lucide-react";
import { useImageCarousel } from "../ImageCarouselContext";

interface MainImageDisplayProps {
	readonly className?: string;
}

/**
 * Component to display the main selected image with error handling
 */
export function MainImageDisplay({ className = "" }: MainImageDisplayProps) {
	const {
		selectedImage,
		currentIndex,
		totalImages,
		imageLoadError,
		setImageLoadError,
		handleRetry,
	} = useImageCarousel();

	if (!selectedImage) {
		return null;
	}

	return (
		<ErrorBoundary fallback={<div>Error loading image</div>}>
			<div
				className={`relative w-full h-full flex items-center justify-center ${className}`}
			>
				<div className="relative max-w-full max-h-full flex items-center justify-center">
					<ResponsiveImage
						imagePath={selectedImage.path}
						alt={selectedImage.name}
						className="flex items-center justify-center"
						objectFit="contain"
						priority={true} // Main image is high priority
						sizes="(max-width: 768px) 100vw, 80vw"
						forceContainerAspect={false} // Allow image to maintain its natural aspect ratio
						maxHeight="calc(100vh - 200px)" // Constrain height to prevent overflow
						onError={() => setImageLoadError(true)}
						aria-labelledby="carousel-image-label"
					/>

					{/* Hidden label for screen readers */}
					<span id="carousel-image-label" className="sr-only">
						{selectedImage.name} - Image {currentIndex + 1} of {totalImages}
					</span>
				</div>

				{/* Show error state if image fails to load */}
				{imageLoadError && (
					<div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80">
						<div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
							<ImageOff className="h-12 w-12 mx-auto text-gray-400" />
							<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
								Failed to load image
							</p>
							<button
								className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
								onClick={handleRetry}
							>
								Retry
							</button>
						</div>
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
}
