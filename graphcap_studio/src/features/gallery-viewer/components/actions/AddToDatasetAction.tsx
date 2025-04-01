// SPDX-License-Identifier: Apache-2.0
import { useAddImageToDataset } from "@/services/dataset"; // Import hook
import type { Dataset } from "@/types/dataset-types"; // Import Dataset type
import type { Image } from "@/types/image-types";
import { toast } from "@/utils/toast"; // Import toast
import { useCallback } from "react"; // Import useCallback
import { AddToDatasetMenu } from "../AddToDatasetMenu"; // Adjust path based on new location

interface AddToDatasetActionProps {
	readonly selectedImage: Image | null;
	readonly allDatasets: Dataset[];
	readonly currentDatasetName: string;
}

export function AddToDatasetAction({
	selectedImage,
	allDatasets,
	currentDatasetName,
}: AddToDatasetActionProps) {
	const { mutate: addImageToDataset } = useAddImageToDataset(); // Get mutation hook

	// Handle add to dataset internally
	const handleAddToDataset = useCallback(
		(imagePath: string, datasetName: string) => {
			addImageToDataset(
				{ imagePath, datasetName },
				{
					onSuccess: () =>
						toast.success({ title: `Image added to ${datasetName}` }),
					onError: (err) =>
						toast.error({
							title: "Failed to add image",
							description: err.message,
						}),
				},
			);
		},
		[addImageToDataset],
	);

	// Render nothing if image is not selected or there aren't multiple datasets
	if (!selectedImage || !allDatasets || allDatasets.length <= 1) {
		return null;
	}

	return (
		<AddToDatasetMenu
			image={selectedImage}
			datasets={allDatasets}
			currentDataset={currentDatasetName}
			onAddToDataset={handleAddToDataset}
		/>
	);
} 