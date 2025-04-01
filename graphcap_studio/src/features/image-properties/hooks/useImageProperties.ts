import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import type { Image } from "@/types";
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";

export interface ImagePropertiesData {	
	title: string;
	description: string;
	tags: string[];
	rating: number;
	metadata: Record<string, string>;
}

/**
 * Custom hook for managing image properties
 *
 * This hook handles loading, saving, and modifying image properties.
 * It uses localStorage for persistence in the demo version.
 */
export function useImageProperties(image: Image | null) {
	const {
		selectedDataset,
		isLoadingDataset,
		datasetError,
	} = useDatasetContext();

	const [properties, setProperties] = useState<ImagePropertiesData | null>(null);
	const [newTag, setNewTag] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Load/initialize properties when image or dataset context changes
	useEffect(() => {
		// Reset state initially
		setError(null);
		setProperties(null);

		if (!image) {
			setError("No image selected");
			return;
		}

		// Wait for dataset context to be ready
		if (isLoadingDataset) {
			return;
		}

		// Handle dataset context error state
		if (datasetError) {
			setError(`Cannot load properties: Dataset error - ${datasetError.message}`);
			return;
		}

		// Handle case where context resolved but dataset is missing
		if (!selectedDataset) {
			setError("Cannot load properties: Dataset not found.");
			return;
		}

		// --- Context is ready, image exists, dataset is selected --- //
		// Now attempt to load/initialize properties specifically for this image

		try {
			const savedProps = localStorage.getItem(`image-props:${image.path}`);
			if (savedProps) {
				setProperties(JSON.parse(savedProps));
			} else {
				// Initialize with default properties
				setProperties({
					title: image.name || "Untitled",
					description: "",
					tags: [],
					rating: 0,
					metadata: {
						path: image.path,
						directory: image.directory,
						url: image.url,
						datasetName: selectedDataset.name,
					},
				});
			}
		} catch (err) {
			console.error("Error loading/initializing image properties from storage:", err);
			// Set local error for issues specific to property loading/parsing
			setError("Failed to load or initialize properties for this image.");
			setProperties(null);
		}
	}, [image, selectedDataset, isLoadingDataset, datasetError]);

	const handlePropertyChange = <K extends keyof ImagePropertiesData>(
		key: K,
		value: ImagePropertiesData[K],
	) => {
		setProperties((prev) => {
			if (!prev) return null;
			return {
				...prev,
				[key]: value,
			};
		});
	};

	const handleAddTag = () => {
		if (!newTag.trim()) return;

		setProperties((prev) => {
			if (!prev) return null;
			return {
				...prev,
				tags: [...prev.tags, newTag.trim()],
			};
		});
		setNewTag("");
	};

	const handleRemoveTag = (tag: string) => {
		setProperties((prev) => {
			if (!prev) return null;
			return {
				...prev,
				tags: prev.tags.filter((t) => t !== tag),
			};
		});
	};

	const handleSave = () => {
		if (!image || !properties) {
			console.error("Cannot save: Image or properties are missing.");
			return;
		}

		// Save to localStorage for demo purposes
		localStorage.setItem(
			`image-props:${image.path}`,
			JSON.stringify(properties),
		);
		setIsEditing(false);
	};

	return {
		properties,
		newTag,
		isEditing,
		error,
		handlePropertyChange,
		handleAddTag,
		handleRemoveTag,
		setNewTag,
		setIsEditing,
		handleSave,
	};
}
