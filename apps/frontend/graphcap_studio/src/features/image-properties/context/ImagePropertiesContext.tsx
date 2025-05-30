import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import type { Image } from "@/types";
// SPDX-License-Identifier: Apache-2.0
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	getPropertiesFromStorage,
	savePropertiesToStorage,
} from "../utils/localStorage";

// Define a specific type for metadata
export interface ImageMetadata {
	path: string;
	width?: number; // Optional as they might not always be available
	height?: number;
	size?: number;
	format?: string;
}

// Define the properties data interface
export interface ImagePropertiesData {
	title: string;
	description: string;
	tags: string[];
	rating: number;
	metadata: ImageMetadata; // Use the specific type
}

// Define the context type
interface ImagePropertiesContextType {
	// Data
	properties: ImagePropertiesData | null;
	newTag: string;
	isEditing: boolean;
	isLoading: boolean;
	error: string | null;
	image: Image | null;

	// Actions
	setNewTag: (tag: string) => void;
	setIsEditing: (isEditing: boolean) => void;
	handlePropertyChange: (
		key: keyof ImagePropertiesData,
		value: ImagePropertiesData[keyof ImagePropertiesData]
	) => void;
	handleAddTag: () => void;
	handleRemoveTag: (tag: string) => void;
	handleSave: () => void;
	toggleEditing: () => void;
}

// Create the context with a default undefined value
export const ImagePropertiesContext = createContext<
	ImagePropertiesContextType | undefined
>(undefined);

// Provider props
interface ImagePropertiesProviderProps {
	readonly children: ReactNode;
	readonly image: Image | null;
}

/**
 * Provider component for image properties context
 *
 * This provider manages the state for image properties, including loading,
 * editing, and saving functionality.
 */
export function ImagePropertiesProvider({
	children,
	image,
}: ImagePropertiesProviderProps) {
	const { selectedDataset: dataset } = useDatasetContext();

	const [properties, setProperties] = useState<ImagePropertiesData | null>(
		null,
	);
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
			// Get data from localStorage
			const datasetId = dataset?.name ?? "unknown";
			const storedProperties = getPropertiesFromStorage(datasetId, image.name);

			if (storedProperties) {
				setProperties(storedProperties);
			} else {
				// Set default properties if none exist
				setProperties({
					title: image.name,
					description: "",
					tags: [],
					rating: 0,
					metadata: {
						path: image.path,
						width: 0, // Default since not in Image type
						height: 0, // Default since not in Image type
						size: 0, // Default since not in Image type
						format: "", // Default since not in Image type
					},
				});
			}

			setIsLoading(false);
		} catch (error) {
			console.error("Error loading image properties:", error);
			setError("Failed to load image properties");
			setIsLoading(false);
		}
	}, [image, dataset]);

	// Handler for property changes
	const handlePropertyChange = useCallback((key: keyof ImagePropertiesData, value: ImagePropertiesData[keyof ImagePropertiesData]) => {
		if (!properties) return;

		setProperties((prev) => {
			if (!prev) return null;
			return {
				...prev,
				[key]: value,
			};
		});
	}, [properties]);

	// Handler for adding a tag
	const handleAddTag = useCallback(() => {
		if (!newTag.trim() || !properties) return;

		// Don't add duplicate tags
		if (properties.tags.includes(newTag.trim())) {
			setNewTag("");
			return;
		}

		setProperties((prev) => {
			if (!prev) return null;
			return {
				...prev,
				tags: [...prev.tags, newTag.trim()],
			};
		});

		setNewTag("");
	}, [newTag, properties]);

	// Handler for removing a tag
	const handleRemoveTag = useCallback((tag: string) => {
		if (!properties) return;

		setProperties((prev) => {
			if (!prev) return null;
			return {
				...prev,
				tags: prev.tags.filter((t) => t !== tag),
			};
		});
	}, [properties]);

	// Handler for saving properties
	const handleSave = useCallback(() => {
		if (!properties || !image || !dataset) return;

		try {
			// Save to localStorage
			savePropertiesToStorage(dataset.name, image.name, properties);
			setIsEditing(false);
		} catch (error) {
			console.error("Error saving image properties:", error);
			setError("Failed to save image properties");
		}
	}, [properties, image, dataset]);

	// Toggle editing state
	const toggleEditing = useCallback(() => setIsEditing((prev) => !prev), []);

	// Create the context value
	const contextValue = useMemo(
		() => ({
			// Data state
			properties,
			newTag,
			isEditing,
			isLoading,
			error,
			image,

			// Actions
			setNewTag,
			setIsEditing,
			handlePropertyChange,
			handleAddTag,
			handleRemoveTag,
			handleSave,
			toggleEditing,
		}),
		[
			properties,
			newTag,
			isEditing,
			isLoading,
			error,
			image,
			handleAddTag,
			handleRemoveTag,
			handlePropertyChange,
			handleSave,
			toggleEditing,
		],
	);

	return (
		<ImagePropertiesContext.Provider value={contextValue}>
			{children}
		</ImagePropertiesContext.Provider>
	);
}

/**
 * Custom hook to access the image properties context
 * Throws an error if used outside of a provider
 */
export function useImagePropertiesContext() {
	const context = useContext(ImagePropertiesContext);

	if (!context) {
		throw new Error(
			"useImagePropertiesContext must be used within an ImagePropertiesProvider",
		);
	}

	return context;
}
