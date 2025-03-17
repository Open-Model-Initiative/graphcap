// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { ErrorBoundary } from "../ErrorBoundary";
import { useImageCarousel } from "../ImageCarouselContext";
import { MainImageDisplay } from "./MainImageDisplay";
import { NavigationControls } from "./NavigationControls";
import { ThumbnailSection } from "./ThumbnailSection";

interface CarouselLayoutProps {
	className?: string;
}

/**
 * Main layout component for the carousel
 *
 * This component combines the main image display, navigation controls, and thumbnail section.
 */
export function CarouselLayout({ className = "" }: CarouselLayoutProps) {
	const {
		containerRef,
		imageContainerRef,
		imageContainerHeight,
		isCalculating,
	} = useImageCarousel();

	return (
		<ErrorBoundary>
			<section
				ref={containerRef}
				className={`w-full h-full flex flex-col bg-white dark:bg-gray-900 ${className}`}
				aria-label="Image carousel"
			>
				{/* Main image display with navigation controls */}
				<div
					ref={imageContainerRef}
					className="relative flex-1 min-h-0"
					style={{
						height: isCalculating ? "auto" : `${imageContainerHeight}px`,
					}}
				>
					<MainImageDisplay />
					<NavigationControls />

					{/* Skip navigation link for keyboard users */}
					<button
						className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:p-2 focus:bg-white focus:text-black"
						onClick={() => {
							// Find and focus the first interactive element after the carousel
							const carousel = containerRef.current;
							if (carousel) {
								const nextFocusableElement =
									carousel.nextElementSibling?.querySelector(
										'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
									);
								if (nextFocusableElement instanceof HTMLElement) {
									nextFocusableElement.focus();
								}
							}
						}}
					>
						Skip carousel navigation
					</button>
				</div>

				{/* Thumbnails section */}
				<ThumbnailSection />
			</section>
		</ErrorBoundary>
	);
}
