import { EmptyState } from "@/components/ui/status/EmptyState";
import { UploadDropzone } from "@/features/datasets/components/image-uploader";
import { Upload } from "lucide-react";
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { useImageCarousel } from "../ImageCarouselContext";

interface CarouselEmptyStateProps {
	className?: string;
}

/**
 * Empty state component for the carousel
 *
 * This component displays a message when no images are available,
 * along with an upload dropzone to add new images.
 */
export function CarouselEmptyState({
	className = "",
}: CarouselEmptyStateProps) {
	const { datasetName, onUploadComplete } = useImageCarousel();

	return (
		<div
			className={`flex items-center justify-center w-full h-full min-h-[320px] ${className}`}
		>
			<div className="w-full max-w-md p-6">
				<EmptyState
					title="No images found"
					description="Upload new images or select a different dataset."
					icon={<Upload className="h-12 w-12 text-gray-400" />}
				/>
				<div className="flex flex-col items-center gap-4 mt-6">
					<p className="text-gray-400">Or drag and drop images here</p>
					<UploadDropzone
						className="w-full h-32"
						onUploadComplete={onUploadComplete}
					/>
				</div>
			</div>
		</div>
	);
}
