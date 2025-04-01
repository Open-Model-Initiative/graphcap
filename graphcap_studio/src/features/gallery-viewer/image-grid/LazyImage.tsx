// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { Route } from "@/routes/gallery/$datasetId/content/$contentId";
import type { Image as ImageType } from "@/types"; // Renamed import to avoid conflict
import { Box, Image, Text } from "@chakra-ui/react"; // Import Chakra components
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/**
 * Props for the ImageComponent override if provided
 * Note: If using this, it needs to handle its own loading/error states
 */
interface ImageRendererProps {
	readonly imagePath: string;
	readonly alt?: string;
	readonly className?: string;
	readonly onLoad?: () => void;
	readonly onError?: (error: Error) => void;
}

interface LazyImageProps {
	readonly image: ImageType;
	readonly isSelected: boolean;
	readonly ImageComponent?: React.ComponentType<ImageRendererProps>;
}

// Removed React.memo for now
const LazyImageInner = (
	{
		image,
		isSelected,
		ImageComponent, // Allow custom component, but default uses Chakra Image
	}: LazyImageProps
) => {
	const navigate = useNavigate({ from: Route.id });
	const { selectedDataset } = useDatasetContext();

	const [isInView, setIsInView] = useState(false);
	const containerRef = useRef<HTMLButtonElement>(null);

	// Intersection Observer setup
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					setIsInView(true);
					if (containerRef.current) {
						observer.unobserve(containerRef.current);
					}
				}
			},
			{
				rootMargin: "200px", // Load slightly before entering viewport
				threshold: 0.01,
			},
		);

		const currentRef = containerRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
			observer.disconnect();
		};
	}, []);

	// Handle click navigation
	const handleClick = () => {
		const datasetId = selectedDataset?.name;
		const contentId = image?.name;

		if (datasetId && contentId) {
			navigate({
				to: "/gallery/$datasetId/content/$contentId",
				params: { datasetId, contentId },
				search: (prev) => ({ ...prev }),
			});
		} else {
			console.warn("Cannot navigate: Missing datasetId or contentId", {
				datasetId,
				contentId,
			});
		}
	};

	return (
		<Box
			ref={containerRef}
			as="button"
			className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg h-full w-full text-left ${isSelected
				? "border-blue-500 shadow-md"
				: "border-transparent hover:border-gray-600"
			}`}
			onClick={handleClick}
			aria-label={`Select image ${image.name}`}
			aria-pressed={isSelected}
			display="flex"
			flexDirection="column"
			minHeight="100px"
			minWidth="100px"
			bg="gray.800"
		>
			{/* Image container */}
			<Box position="relative" h="full" w="full" flexGrow={1}>
				{isInView && // Conditionally render the actual image content
					(ImageComponent ? (
						<ImageComponent
							imagePath={image.path}
							alt={image.name}
							className="absolute inset-0 h-full w-full object-cover"
							// Pass onError/onLoad if ImageComponent needs them
						/>
					) : (
						<Image
							src={image.path}
							alt={image.name}
							position="absolute"
							inset="0"
							h="full"
							w="full"
							objectFit="cover"
							// Chakra Image might have internal loading/error states or fallbacks
							// We are removing explicit React state management for this
						/>
					))}

				{/* Overlay with image name */}
				<Box
					position="absolute"
					insetX="0"
					bottom="0"
					bgGradient="linear(to-t, blackAlpha.800, transparent)"
					p="3"
					opacity={0}
					transition="opacity 0.2s"
					_groupHover={{ opacity: 1 }}
				>
					<Text
						fontSize="sm"
						fontWeight="medium"
						color="white"
						overflow="hidden"
						whiteSpace="nowrap"
						textOverflow="ellipsis"
					>
						{image.name}
					</Text>
				</Box>
			</Box>
		</Box>
	);
};

export const LazyImage = LazyImageInner;
