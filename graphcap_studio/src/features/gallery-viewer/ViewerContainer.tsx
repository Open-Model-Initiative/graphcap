// SPDX-License-Identifier: Apache-2.0
import type { Image } from "@/types";
import { ImageGalleryContent } from "./ImageGalleryContent";
import { ViewModeToggle } from "./components";
import { DEFAULT_VIEW_MODE, type ViewMode } from "./components/ImageGallery";
import { useViewerContainer } from "./hooks";
import { GalleryViewerProvider } from "./hooks/useGalleryViewerContext";

interface ViewerContainerProps {
	readonly className?: string;
	readonly initialViewMode?: ViewMode;
	readonly onAddToDataset?: (imagePath: string, datasetName: string) => void;
	readonly showViewModeToggle?: boolean;
	readonly title?: string;
	readonly onUpload?: () => void;
	readonly onClose?: () => void;
	readonly onUploadComplete?: () => void;
}

/**
 * A container component for the image viewer that handles responsive layout
 *
 * This component renders the ImageGallery component and handles responsive layout
 * adjustments for different screen sizes and zoom levels. Uses DatasetContext for
 * image data and selection state.
 *
 * @param className - Additional CSS classes
 * @param initialViewMode - Initial view mode ('grid' or 'carousel'), defaults to 'carousel'
 * @param onAddToDataset - Callback when add to dataset button is clicked
 * @param showViewModeToggle - Whether to show the view mode toggle
 * @param title - Title to display in the header bar
 * @param onUpload - Callback when upload button is clicked
 * @param onClose - Callback when close button is clicked
 * @param onUploadComplete - Callback when upload is complete
 */
export function ViewerContainer({
	className = "",
	onAddToDataset,
	showViewModeToggle = true,
	title = "Image Viewer",
	onUpload,
	onClose,
	onUploadComplete,
}: ViewerContainerProps) {
	// Use our custom hook for container management
	const { setContainerRef, thumbnailOptions } = useViewerContainer();

	return (
		<GalleryViewerProvider
			onUploadComplete={onUploadComplete}
		>
			<div
				ref={setContainerRef}
				className={`h-full w-full overflow-hidden flex flex-col ${className}`}
			>
				{/* Header bar with title, upload button, close button, and view mode toggle */}
				<div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
					<div className="flex items-center space-x-4">
						<h4 className="text-xl font-semibold">{title}</h4>
					</div>
					<div className="flex items-center space-x-2">
						{showViewModeToggle && <ViewModeToggle />}
						{onUpload && (
							<button
								type="button"
								onClick={onUpload}
								className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
							>
								Upload Images
							</button>
						)}
						{onClose && (
							<button
								type="button"
								onClick={onClose}
								className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
							>
								Close
							</button>
						)}
					</div>
				</div>

				<div className="flex-grow relative">
					<ImageGalleryContent
						onAddToDataset={onAddToDataset}
						thumbnailOptions={thumbnailOptions}
					/>
				</div>
			</div>
		</GalleryViewerProvider>
	);
}
