import { useUploadImage } from "@/services/images";
import { toast } from "@/utils/toast";
// SPDX-License-Identifier: Apache-2.0
// TODO: RESOLVE OLD DATASET NAME SYSTEM
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export interface UseImageUploaderProps {
	readonly datasetName: string;
	readonly onUploadComplete: () => void;
}

export interface UseImageUploaderResult {
	isUploading: boolean;
	uploadProgress: Record<string, number>;
	getRootProps: ReturnType<typeof useDropzone>["getRootProps"];
	getInputProps: ReturnType<typeof useDropzone>["getInputProps"];
	isDragActive: boolean;
}

/**
 * Custom hook for handling image upload functionality with drag and drop
 *
 * @param datasetName - The name of the dataset to upload images to
 * @param onUploadComplete - Callback function to be called when upload is complete
 * @returns Object containing upload state and dropzone props
 */
export function useImageUploader({
	datasetName,
	onUploadComplete,
}: UseImageUploaderProps): UseImageUploaderResult {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
		{},
	);

	// Use the upload image mutation
	const uploadImageMutation = useUploadImage();

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!acceptedFiles || acceptedFiles.length === 0) return;

			setIsUploading(true);
			const totalFiles = acceptedFiles.length;
			let uploadedCount = 0;
			const failedUploads: string[] = [];

			// Initialize progress for each file
			const initialProgress: Record<string, number> = {};
			for (const file of acceptedFiles) {
				initialProgress[file.name] = 0;
			}
			setUploadProgress(initialProgress);

			// Process files sequentially to avoid overwhelming the server
			for (const file of acceptedFiles) {
				try {
					// Update progress to show we're starting this file
					setUploadProgress((prev) => ({
						...prev,
						[file.name]: 10, // Start at 10%
					}));

					// Upload the file to the specified dataset
					await uploadImageMutation.mutateAsync({ file, datasetName });

					// Update progress and count
					uploadedCount++;
					setUploadProgress((prev) => ({
						...prev,
						[file.name]: 100,
					}));

					// Show success toast for each file
					toast.success({ title: `Uploaded ${file.name}` });
				} catch (error) {
					console.error(`Error uploading ${file.name}:`, error);
					failedUploads.push(file.name);

					// Update progress to show failure
					setUploadProgress((prev) => ({
						...prev,
						[file.name]: -1, // Use -1 to indicate failure
					}));

					// Show error toast
					toast.error({ title: `Failed to upload ${file.name}` });
				}
			}

			// Show summary toast
			if (failedUploads.length === 0) {
				if (totalFiles > 1) {
					toast.success({ title: `Successfully uploaded all ${totalFiles} images` });
				}
			} else {
				toast.error({
					title: `Failed to upload ${failedUploads.length} of ${totalFiles} images`,
				});
			}

			setIsUploading(false);
			onUploadComplete();
		},
		[datasetName, onUploadComplete, uploadImageMutation.mutateAsync],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
		},
		disabled: isUploading,
		maxSize: 50 * 1024 * 1024, // 50MB
	});

	return {
		isUploading,
		uploadProgress,
		getRootProps,
		getInputProps,
		isDragActive,
	};
}
