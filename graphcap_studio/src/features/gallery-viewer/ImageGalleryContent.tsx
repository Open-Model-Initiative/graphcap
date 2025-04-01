// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { ImageEditor } from "@/features/editor/components/ImageEditor";
import { useImageEditor } from "@/features/editor/hooks";
import { CarouselViewer } from "@/features/gallery-viewer/image-carousel";
import { GridViewer } from "@/features/gallery-viewer/image-grid/GridViewer";
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
 * It handles three view modes:
 * - grid: Displays images in a responsive grid layout
 * - carousel: Displays images in a carousel with thumbnails
 * - edit: Shows the image editor for the selected image
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

	const { selectedDataset, selectedImage } = useDatasetContext();

	// Use custom hook for image editing state
	const { handleSave, handleCancel } = useImageEditor({
		selectedDataset: selectedDataset?.name ?? null,
	});

	// Only show action bar in grid/carousel modes
	const showActionBar = viewMode !== "edit";

	// Determine the content based on viewMode and selectedImage
	let content: React.ReactNode;
	if (viewMode === "edit" && selectedImage) {
		content = (
			<ImageEditor
				imagePath={selectedImage.path}
				onSave={handleSave}
				onCancel={handleCancel}
			/>
		);
	} else if (viewMode === "grid") {
		content = (
			<GridViewer
				ImageComponent={ImageViewer}
				className="h-full w-full"
			/>
		);
	} else {
		content = (
			<CarouselViewer
				thumbnailOptions={thumbnailOptions}
				className="h-full w-full"
			/>
		);
	}

	return (
		<div className="h-full w-full flex flex-col bg-gray-900 overflow-hidden">
			{/* Compact action bar at the top */}
			{showActionBar && (
				<div className="shrink-0">
					<CompactActionBar
						currentIndex={currentIndex}
						className="border-b border-gray-700"
					/>
				</div>
			)}

			{/* Main content area - flex-grow to take available space */}
			<div className="flex-grow overflow-hidden">
				{content}
			</div>
		</div>
	);
}
