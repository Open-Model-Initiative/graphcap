// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { Route } from "@/routes/gallery/$datasetId/content/$contentId";
import type { Image } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/**
 * Props for the default image renderer component
 */
interface ImageRendererProps {
	readonly imagePath: string;
	readonly alt?: string;
	readonly className?: string;
	readonly onLoad?: () => void;
	readonly onError?: (error: Error) => void;
}

interface LazyImageProps {
	readonly image: Image;
	readonly isSelected: boolean;
	readonly ImageComponent?: React.ComponentType<ImageRendererProps>;
}

/**
 * A component for lazy loading images in the grid view
 *
 * Features:
 * - Intersection Observer for loading images only when in viewport
 * - Loading states with placeholders
 * - Selection state visual feedback
 * - Hover effects for image information
 * - Customizable image rendering via ImageComponent prop
 *
 * @param image - The image object to display
 * @param isSelected - Whether this image is currently selected
 * @param ImageComponent - Optional custom component to render the image
 */
export function LazyImage({
	image,
	isSelected,
	ImageComponent,
}: LazyImageProps) {
	const navigate = useNavigate({ from: Route.id });
	const { selectedDataset } = useDatasetContext();

	const [isLoaded, setIsLoaded] = useState(false);
	const [isInView, setIsInView] = useState(false);
	const imageRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setIsInView(true);
						observer.unobserve(entry.target);
					}
				}
			},
			{
				rootMargin: "100px",
				threshold: 0.1,
			},
		);

		if (imageRef.current) {
			observer.observe(imageRef.current);
		}

		return () => {
			observer.disconnect();
		};
	}, []);

	// Handle click with navigation
	const handleClick = () => {
		const datasetId = selectedDataset?.name;
		const contentId = image?.name; // Using name as contentId

		if (datasetId && contentId) {
			navigate({
				to: "/gallery/$datasetId/content/$contentId",
				params: { datasetId, contentId },
				search: (prev) => ({ ...prev }), // Preserve existing search params
			});
		} else {
			console.warn("Cannot navigate: Missing datasetId or contentId", { datasetId, contentId });
		}
	};

	return (
		<button
			ref={imageRef}
			type="button"
			className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg h-full w-full text-left ${
				isSelected
					? "border-blue-500 shadow-md"
					: "border-transparent hover:border-gray-600"
			}`}
			onClick={handleClick}
			aria-label={`Select image ${image.name}`}
			aria-pressed={isSelected}
			style={{ display: "flex", flexDirection: "column" }}
		>
			{/* Image container with aspect ratio */}
			<div className="relative h-full w-full flex-grow">
				{isInView ? (
					<>
						{/* Low-quality placeholder or blur while loading */}
						{!isLoaded && (
							<div className="absolute inset-0 flex items-center justify-center bg-gray-800">
								<div className="h-6 w-6 animate-pulse rounded-full bg-gray-700" />
							</div>
						)}

						{/* Render image using provided component or fallback to default img */}
						<div
							className={`absolute inset-0 transition-opacity duration-300 ${
								isLoaded ? "opacity-100" : "opacity-0"
							}`}
						>
							{ImageComponent ? (
								<ImageComponent
									imagePath={image.path}
									alt={image.name}
									className="h-full w-full object-cover"
									onLoad={() => setIsLoaded(true)}
									onError={(error) => {
										console.error(`Failed to load image: ${image.path}`, error);
										setIsLoaded(true);
									}}
								/>
							) : (
								<img
									src={image.path}
									alt={image.name}
									className="h-full w-full object-cover"
									onLoad={() => setIsLoaded(true)}
									onError={(error) => {
										console.error(`Failed to load image: ${image.path}`, error);
										setIsLoaded(true);
									}}
								/>
							)}
						</div>
					</>
				) : (
					// Placeholder when not in view
					<div className="absolute inset-0 bg-gray-800" />
				)}

				{/* Overlay with image name */}
				<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
					<p className="truncate text-sm font-medium text-white">
						{image.name}
					</p>
				</div>
			</div>
		</button>
	);
}
