// SPDX-License-Identifier: Apache-2.0
import { Image } from "@/services/images";
import { ImageGalleryContent } from "../ImageGalleryContent";
import { GalleryViewerProvider } from "../hooks";

export type ViewMode = "grid" | "carousel";
export const DEFAULT_VIEW_MODE: ViewMode = "carousel";

interface ImageGalleryProps {
	readonly images: Image[];
	readonly isLoading?: boolean;
	readonly isEmpty?: boolean;
	readonly initialViewMode?: ViewMode;
	readonly selectedImage?: Image | null;
	readonly onImageSelected: (image: Image) => void;
	readonly onEditImage?: (image: Image) => void;
	readonly onAddToDataset?: (imagePath: string, datasetName: string) => void;
	readonly onDownload?: (image: Image) => void;
	readonly onDelete?: (image: Image) => void;
	readonly thumbnailOptions?: {
		readonly minWidth?: number;
		readonly maxWidth?: number;
		readonly gap?: number;
	};
}

/**
 * A component for browsing and selecting images with different view modes
 *
 * Features:
 * - Supports both grid and carousel view modes
 * - Displays compact info bar with image actions
 * - Handles loading and empty states
 * - Configurable thumbnail options for carousel view
 *
 * @param images - Array of image objects to display
 * @param isLoading - Whether the gallery is in loading state
 * @param isEmpty - Whether there are no images to display
 * @param initialViewMode - Initial view mode ('grid' or 'carousel'), defaults to DEFAULT_VIEW_MODE
 * @param selectedImage - Currently selected image
 * @param onImageSelected - Callback when an image is selected
 * @param onEditImage - Callback when edit button is clicked
 * @param onAddToDataset - Callback when add to dataset button is clicked
 * @param onDownload - Callback when download button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param thumbnailOptions - Optional configuration for thumbnail display in carousel mode
 */
export function ImageGallery({
	images,
	isLoading,
	isEmpty,
	initialViewMode = DEFAULT_VIEW_MODE,
	selectedImage,
	onImageSelected,
	onEditImage,
	onAddToDataset,
	onDownload,
	onDelete,
	thumbnailOptions,
}: ImageGalleryProps) {
	return (
		<GalleryViewerProvider
			images={images}
			initialViewMode={initialViewMode}
			initialSelectedImage={selectedImage}
			onImageSelected={onImageSelected}
		>
			<ImageGalleryContent
				images={images}
				isLoading={isLoading}
				isEmpty={isEmpty}
				onEditImage={onEditImage}
				onAddToDataset={onAddToDataset}
				onDownload={onDownload}
				onDelete={onDelete}
				thumbnailOptions={thumbnailOptions}
			/>
		</GalleryViewerProvider>
	);
}
