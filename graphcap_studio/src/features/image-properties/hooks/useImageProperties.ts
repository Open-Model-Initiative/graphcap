import { useEditorContext } from "@/features/editor/context/EditorContext";
import type { Image } from "@/types";
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";

export interface ImagePropertiesData {
	title: string;
	description: string;
	tags: string[];
	rating: number;
	metadata: Record<string, any>;
}

/**
 * Custom hook for managing image properties
 *
 * This hook handles loading, saving, and modifying image properties.
 * It uses localStorage for persistence in the demo version.
 */
export function useImageProperties(image: Image | null) {
	const { dataset } = useEditorContext();

	const [properties, setProperties] = useState<ImagePropertiesData>({
		title: "",
		description: "",
		tags: [],
		rating: 0,
		metadata: {},
	});
	const [newTag, setNewTag] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load properties from localStorage if available
	useEffect(() => {
		if (!image) {
			setError("No image selected");
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const savedProps = localStorage.getItem(`image-props:${image.path}`);
			if (savedProps) {
				setProperties(JSON.parse(savedProps));
			} else {
				// Initialize with default properties and image info
				setProperties({
					title: image.name || "Untitled",
					description: "",
					tags: [],
					rating: 0,
					metadata: {
						path: image.path,
						directory: image.directory,
						url: image.url,
						datasetName: dataset?.name ?? undefined,
					},
				});
			}
			setIsLoading(false);
		} catch (error) {
			console.error("Error loading image properties:", error);
			setError("Failed to load properties");
			setIsLoading(false);
		}
	}, [image, dataset]);

	const handlePropertyChange = (key: keyof ImagePropertiesData, value: any) => {
		setProperties((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleAddTag = () => {
		if (!newTag.trim()) return;

		setProperties((prev) => ({
			...prev,
			tags: [...prev.tags, newTag.trim()],
		}));
		setNewTag("");
	};

	const handleRemoveTag = (tag: string) => {
		setProperties((prev) => ({
			...prev,
			tags: prev.tags.filter((t) => t !== tag),
		}));
	};

	const handleSave = () => {
		if (!image) return;

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
		isLoading,
		error,
		handlePropertyChange,
		handleAddTag,
		handleRemoveTag,
		setNewTag,
		setIsEditing,
		handleSave,
	};
}
