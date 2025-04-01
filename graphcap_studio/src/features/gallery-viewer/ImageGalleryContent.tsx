import { CarouselViewer } from "@/features/gallery-viewer/image-carousel";
import { GridViewer } from "@/features/gallery-viewer/image-grid/GridViewer";
// SPDX-License-Identifier: Apache-2.0
import { ImageViewer } from "./ImageViewer";
import { CompactActionBar } from "./components/CompactActionBar";
import { useGalleryViewerContext } from "./hooks";

interface ImageGalleryContentProps {
	readonly thumbnailOptions?: {
		readonly minWidth?: number;
		readonly maxWidth?: number;
		readonly gap?: number;
	};
}

/**
 * Internal component that uses the GalleryViewerContext
 *
 * This component is meant to be used within a GalleryViewerProvider.
 * It accesses the context to get the current view mode and selected image.
 *
 * @param thumbnailOptions - Optional configuration for thumbnail display in carousel mode
 */
export function ImageGalleryContent({
	thumbnailOptions,
}: ImageGalleryContentProps) {
	const {
		viewMode,
		currentIndex,
	} = useGalleryViewerContext();

	return (
		<div className="h-full w-full flex flex-col bg-gray-900 overflow-hidden">
			{/* Compact action bar at the top */}
			<div className="shrink-0">
				<CompactActionBar
					currentIndex={currentIndex}
					className="border-b border-gray-700"
				/>
			</div>

			{/* Main content area - flex-grow to take available space */}
			<div className="flex-grow overflow-hidden">
				{viewMode === "grid" ? (
					<GridViewer
						ImageComponent={ImageViewer}
						className="h-full w-full"
					/>
				) : (
					<CarouselViewer
						thumbnailOptions={thumbnailOptions}
						className="h-full w-full"
					/>
				)}
			</div>
		</div>
	);
}
