// SPDX-License-Identifier: Apache-2.0
import { useDatasetContext } from "@/features/datasets/context/DatasetContext";
import { Route } from "@/routes/gallery/$datasetId/content/$contentId";
import { useNavigate } from "@tanstack/react-router";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
} from "react";
import type { ViewMode } from "../components/ImageGallery";

interface GalleryViewerContextType {
	/** The current view mode, either 'grid' or 'carousel' */
	viewMode: ViewMode;
	/** Updates the view mode by modifying the URL search parameter */
	setViewMode: (mode: ViewMode) => void;
	/** The index of the currently selected image in the dataset's images array */
	currentIndex: number;
}

interface GalleryViewerProviderProps {
	readonly children: ReactNode;
}

const GalleryViewerContext = createContext<
	GalleryViewerContextType | undefined
>(undefined);

/**
 * Provider component for the GalleryViewer context
 *
 * This component manages the internal state of the gallery viewer, including:
 * - View mode (derived from URL search param ?view=...)
 * - Current index (derived from DatasetContext)
 *
 * @param children - Child components
 */
export function GalleryViewerProvider({
	children,
}: Readonly<GalleryViewerProviderProps>) {
	// Get navigation function and search params from the specific route
	const navigate = useNavigate({
		from: Route.id,
	});
	const { view } = Route.useSearch();

	// Get data from DatasetContext
	const { selectedDataset, selectedImage } = useDatasetContext();
	const images = selectedDataset?.images ?? [];

	// View mode is now directly from the URL search param
	// The route schema ensures view is always a valid ViewMode
	const viewMode = view as ViewMode;

	// Derived values from context data
	const currentIndex = selectedImage
		? images.findIndex((img) => img.path === selectedImage.path)
		: -1;

	// Updates the URL search parameter to change view mode
	const setViewMode = useCallback(
		(mode: ViewMode) => {
			navigate({
				search: (prev) => ({ ...prev, view: mode }),
				replace: true,
			});
		},
		[navigate],
	);

	// Memoize the context value to prevent unnecessary re-renders
	const contextValue = useMemo(
		() => ({
			viewMode,
			setViewMode,
			currentIndex,
		}),
		[viewMode, setViewMode, currentIndex],
	);

	return (
		<GalleryViewerContext.Provider value={contextValue}>
			{children}
		</GalleryViewerContext.Provider>
	);
}

/**
 * Hook to access the GalleryViewer context
 *
 * @returns The GalleryViewer context value containing view mode and navigation state
 * @throws Error if used outside of a GalleryViewerProvider
 */
export function useGalleryViewerContext(): GalleryViewerContextType {
	const context = useContext(GalleryViewerContext);

	if (context === undefined) {
		throw new Error(
			"useGalleryViewerContext must be used within a GalleryViewerProvider",
		);
	}

	return context;
}
