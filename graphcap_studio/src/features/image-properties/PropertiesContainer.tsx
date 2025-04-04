// SPDX-License-Identifier: Apache-2.0
import { ImageProperties } from "@/features/image-properties";
import type { Image } from "@/types";
import { ImagePropertiesProvider } from "./context";

interface PropertiesContainerProps {
	readonly className?: string;
	readonly selectedImage?: Image | null;
}

/**
 * A container component for the properties panel
 *
 * This component renders the image properties and actions.
 * It wraps the ImageProperties component with the ImagePropertiesProvider.
 */
export function PropertiesContainer({
	className = "",
	selectedImage = null,
}: Readonly<PropertiesContainerProps>) {
	if (!selectedImage) {
		return (
			<div
				className={`flex h-full w-full flex-col items-center justify-center bg-gray-800 p-6 ${className}`}
			>
				<svg
					className="w-16 h-16 text-gray-500 mb-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<title>No image selected icon</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<h3 className="text-lg font-medium text-gray-300 mb-2">
					No Image Selected
				</h3>
				<p className="text-gray-400 text-center mb-4">
					Select an image from the gallery to view and edit its properties.
				</p>
				<div className="bg-gray-700 rounded-lg p-4 w-full max-w-xs">
					<h4 className="text-sm font-medium text-gray-300 mb-2">
						Quick Tips:
					</h4>
					<ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
						<li>Click on any image in the gallery to select it</li>
						<li>Use the grid view for browsing multiple images</li>
						<li>Switch to carousel view for a larger preview</li>
					</ul>
				</div>
			</div>
		);
	}

	return (
		<div className={`h-full w-full overflow-hidden bg-gray-800 ${className}`}>
			<ImagePropertiesProvider image={selectedImage}>
				<ImageProperties />
			</ImagePropertiesProvider>
		</div>
	);
}
