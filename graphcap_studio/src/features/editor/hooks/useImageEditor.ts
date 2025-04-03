import { SERVER_IDS } from "@/features/server-connections/constants";
import { useServerConnections } from "@/features/server-connections/useServerConnections";
import { queryKeys } from "@/services/dataset";
import type { Image } from "@/types";
import { toast } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useState } from "react";

interface UseImageEditorProps {
	selectedDataset: string | null;
}

/**
 * Custom hook for managing image editing
 *
 * This hook provides functionality for editing images
 *
 * @param props - Hook properties
 * @returns Image editing functions and state
 */
export function useImageEditor({ selectedDataset }: UseImageEditorProps) {
	const [isEditing, setIsEditing] = useState(false);
	const queryClient = useQueryClient();

	const { connections } = useServerConnections();
	const mediaServerConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.MEDIA_SERVER,
	);
	const mediaServerUrl = mediaServerConnection?.url ?? "";

	/**
	 * Start editing an image
	 */
	const handleEditImage = useCallback((selectedImage: Image | null) => {
		if (selectedImage) {
			setIsEditing(true);
		} else {
			toast.error({ title: "Please select an image to edit" });
		}
	}, []);

	/**
	 * Save edited image
	 */
	const handleSave = useCallback(() => {
		toast.success({ title: "Image saved successfully" });
		setIsEditing(false);

		// Invalidate cache for this dataset to refresh the images
		if (selectedDataset && mediaServerUrl) {
			queryClient.invalidateQueries({
				queryKey: queryKeys.datasetByName(selectedDataset),
			});

			queryClient.invalidateQueries({ queryKey: queryKeys.datasetImages(mediaServerUrl) });
		} else {
			console.warn("Cannot invalidate queries: Dataset name or Media Server URL missing.");
		}
	}, [queryClient, selectedDataset, mediaServerUrl]);

	/**
	 * Cancel editing
	 */
	const handleCancel = useCallback(() => {
		setIsEditing(false);
	}, []);

	return {
		// State
		isEditing,

		// Actions
		setIsEditing,
		handleEditImage,
		handleSave,
		handleCancel,
	};
}
