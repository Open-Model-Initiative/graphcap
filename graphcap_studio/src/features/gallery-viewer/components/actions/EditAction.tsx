// SPDX-License-Identifier: Apache-2.0
import { EditButton } from "@/components/ui/buttons";
import { Tooltip } from "@/components/ui/tooltip";
import { useDatasetContext } from "@/features/datasets/context/DatasetContext"; // Import context hook
import { useImageEditor } from "@/features/editor/hooks"; // Import hook
import type { Image } from "@/types/image-types";
import { useCallback } from "react";

interface EditActionProps {
	readonly selectedImage: Image | null;
}

export function EditAction({ selectedImage }: EditActionProps) {
	const { selectedDataset } = useDatasetContext(); // Get dataset name
	const { handleEditImage: startEditing } = useImageEditor({
		selectedDataset: selectedDataset?.name ?? null,
	});

	const handleEditClick = useCallback(() => {
		if (selectedImage) {
			startEditing(selectedImage);
		}
	}, [selectedImage, startEditing]);

	return (
		<Tooltip content="Edit Image">
			<EditButton
				aria-label="Edit Image"
				onClick={handleEditClick} // Use internal handler
				disabled={!selectedImage}
				size="sm"
			/>
		</Tooltip>
	);
} 