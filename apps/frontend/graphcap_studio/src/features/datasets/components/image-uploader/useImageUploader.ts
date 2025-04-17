import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import { useUploadImage } from "@/services/dataset";
import { toast } from "@/utils/toast";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useDatasetContext } from "../../context/DatasetContext"; // Import context hook

export interface UseImageUploaderProps {
	readonly onUploadComplete: () => void;
}

export interface UseImageUploaderResult {
	isUploading: boolean;
	uploadProgress: Record<string, number>;
	getRootProps: ReturnType<typeof useDropzone>["getRootProps"];
	getInputProps: ReturnType<typeof useDropzone>["getInputProps"];
	isDragActive: boolean;
	isDisabled: boolean;
	handlePaste: (event: ClipboardEvent) => void;
}

/**
 * Custom hook for handling image upload functionality with drag and drop
 *
 * Uses the current dataset from DatasetContext for uploads.
 * @param onUploadComplete - Callback function to be called when upload is complete
 * @returns Object containing upload state and dropzone props
 */
export function useImageUploader({
	// datasetName, // Remove datasetName prop
	onUploadComplete,
}: UseImageUploaderProps): UseImageUploaderResult {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
		{},
	);
	// Get current dataset state from context
	const {
		selectedDataset,
		isLoadingDataset,
		datasetError,
	} = useDatasetContext();


	const { connections } = useServerConnections();
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? "";

	const uploadImageMutation = useUploadImage(mediaServerUrl); // Pass URL to hook

	// Determine if the uploader should be disabled (no valid dataset, loading, or error)
	const isDisabled = !selectedDataset || isLoadingDataset || !!datasetError || !mediaServerUrl;

	const processFiles = useCallback(
		async (files: File[]) => {
			// Ensure a dataset is selected and not loading/erroring before uploading
			if (!selectedDataset || isLoadingDataset || datasetError) {
				toast.error({
					title: "Cannot Upload",
					description:
						!selectedDataset && !isLoadingDataset
							? "Please select a dataset first."
							: "Dataset is currently loading or has an error.",
				});
				return;
			}
			if (!files || files.length === 0) return;

			setIsUploading(true);
			const totalFiles = files.length;
			let uploadedCount = 0;
			const failedUploads: string[] = [];

			// Initialize progress for each file
			const initialProgress: Record<string, number> = {};
			for (const file of files) {
				initialProgress[file.name] = 0;
			}
			setUploadProgress(initialProgress);

			// Process files sequentially to avoid overwhelming the server
			for (const file of files) {
				try {
					// Update progress to show we're starting this file
					setUploadProgress((prev) => ({
						...prev,
						[file.name]: 10, // Start at 10%
					}));

					// Upload the file to the selected dataset
					await uploadImageMutation.mutateAsync({
						file,
						datasetName: selectedDataset.name, // Use name from selectedDataset
					});

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
		// Update dependencies
		[
			selectedDataset,
			isLoadingDataset,
			datasetError,
			onUploadComplete,
			uploadImageMutation.mutateAsync,
		],
	);

	const onDrop = useCallback(
		(acceptedFiles: File[]): void => {
			processFiles(acceptedFiles);
		},
		[processFiles]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
		},
		disabled: isUploading || isDisabled, // Disable if uploading OR no dataset selected
		maxSize: 50 * 1024 * 1024, // 50MB
	});

	// Handler for clipboard paste events
	const handlePaste = useCallback(
		(event: ClipboardEvent): void => {
			if (isDisabled || isUploading) return;
			
			const items = event.clipboardData?.items;
			if (!items) return;
			
			const imageFiles: File[] = [];
			
			for (const item of Array.from(items)) {
				// Check if the clipboard item is an image
				if (item.type.indexOf('image') !== -1) {
					const file = item.getAsFile();
					if (file) {
						// Generate a name with timestamp to ensure uniqueness
						const timestamp = new Date().getTime();
						const newFile = new File(
							[file], 
							`pasted-image-${timestamp}.${file.type.split('/')[1] || 'png'}`,
							{ type: file.type }
						);
						imageFiles.push(newFile);
					}
				}
			}
			
			if (imageFiles.length > 0) {
				processFiles(imageFiles);
			}
		},
		[isDisabled, isUploading, processFiles]
	);

	return {
		isUploading,
		uploadProgress,
		getRootProps,
		getInputProps,
		isDragActive,
		isDisabled,
		handlePaste,
	};
}
