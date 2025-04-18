// SPDX-License-Identifier: Apache-2.0
import { DatasetSelector } from "@/features/datasets/components";
import { ImageGalleryContent } from "./ImageGalleryContent";
import { ViewModeToggle } from "./components";
import { useViewerContainer } from "./hooks";
import { GalleryViewerProvider } from "./hooks/useGalleryViewerContext";

interface ViewerContainerProps {
	/** Additional CSS classes to apply to the container */
	readonly className?: string;
	/** Whether to show the view mode toggle button */
	readonly showViewModeToggle?: boolean;
	/** Callback when the upload button is clicked */
	readonly onUpload?: () => void;
	/** Callback when the close button is clicked */
	readonly onClose?: () => void;
}

/**
 * A container component for the image viewer that handles responsive layout
 *
 * This component renders the ImageGallery component and handles responsive layout
 * adjustments for different screen sizes and zoom levels. Uses DatasetContext for
 * image data and selection state. View mode is managed through URL parameters.
 *
 * @param className - Additional CSS classes
 * @param showViewModeToggle - Whether to show the view mode toggle
 * @param title - Title to display in the header bar
 * @param onUpload - Callback when upload button is clicked
 * @param onClose - Callback when close button is clicked
 */
export function ViewerContainer({
	className = "",
	showViewModeToggle = true,
	onUpload,
	onClose,
}: ViewerContainerProps) {
	// Use our custom hook for container management
	const { setContainerRef, thumbnailOptions } = useViewerContainer();


	return (
		<GalleryViewerProvider>
			<div
				ref={setContainerRef}
				className={`h-full w-full overflow-hidden flex flex-col ${className}`}
			>
				{/* Header bar with title, upload button, close button, and view mode toggle */}
				<div className="flex items-center justify-between border-b border-gray-700" style={{ padding: "2px" }}>
					<div className="flex items-center space-x-6">
						<span className="text-sm font-medium">Dataset:</span>
						<DatasetSelector />
					</div>
					<div className="flex items-center space-x-4">
						{showViewModeToggle && <ViewModeToggle />}
						{onUpload && (
							<button
								type="button"
								onClick={onUpload}
								className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
							>
								Upload Images
							</button>
						)}
						{onClose && (
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
							>
								Close
							</button>
						)}
					</div>
				</div>



				<div className="flex-1 min-h-0 relative overflow-auto">
					<ImageGalleryContent
						thumbnailOptions={thumbnailOptions}
					/>
				</div>
			</div>
		</GalleryViewerProvider>
	);
}
