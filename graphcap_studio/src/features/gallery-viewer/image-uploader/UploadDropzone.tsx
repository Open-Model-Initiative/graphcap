// SPDX-License-Identifier: Apache-2.0
// TODO: RESOLVE OLD DATASET NAME SYSTEM
import { Plus, Upload } from "lucide-react";
import { useImageUploader } from "./useImageUploader";

interface UploadDropzoneProps {
	readonly datasetName: string;
	readonly className?: string;
	readonly compact?: boolean;
	readonly onUploadComplete?: () => void;
}

/**
 * A compact version of the ImageUploader component designed to fit in smaller spaces
 * like thumbnail strips. Provides drag and drop functionality for image uploads.
 */
export function UploadDropzone({
	datasetName,
	className = "",
	compact = false,
	onUploadComplete = () => {},
}: UploadDropzoneProps) {
	const { isUploading, getRootProps, getInputProps, isDragActive } =
		useImageUploader({
			datasetName,
			onUploadComplete,
		});

	return (
		<div
			{...getRootProps()}
			className={`
        ${className}
        flex items-center justify-center rounded-md transition-colors
        ${compact ? "border border-dashed p-1" : "border-2 border-dashed p-3"}
        ${
					isDragActive
						? "border-blue-500 bg-blue-500/10"
						: "border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50"
				}
        ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
			title="Upload images"
			aria-label="Upload images"
		>
			<input {...getInputProps()} />

			{isDragActive ? (
				<Plus className="text-blue-300" size={compact ? 16 : 24} />
			) : (
				<Upload className="text-gray-400" size={compact ? 16 : 24} />
			)}
		</div>
	);
}
