// SPDX-License-Identifier: Apache-2.0
import { Text } from "@chakra-ui/react";

interface ImageCounterProps {
	readonly currentIndex: number;
	readonly totalImages: number;
	readonly className?: string;
	readonly isLoading?: boolean;
}

/**
 * A component for displaying the current image position in a collection
 * with smooth transitions to prevent flickering during loading
 *
 * Designed to work as an overlay on image galleries with semi-transparent
 * background for improved visibility.
 */
export function ImageCounter({
	currentIndex,
	totalImages,
	className = "",
	isLoading = false,
}: ImageCounterProps) {
	// Maintain a consistent layout even when no images are available
	// by rendering a placeholder with the same dimensions
	return (
		<Text
			fontSize="xs"
			color="white"
			fontWeight="medium"
			className={`transition-opacity duration-300 min-w-[3rem] text-center ${className} ${totalImages <= 0 || isLoading ? "opacity-0" : "opacity-100"}`}
			aria-live="polite"
		>
			{totalImages > 0 ? `${currentIndex + 1} / ${totalImages}` : "0 / 0"}
		</Text>
	);
}
