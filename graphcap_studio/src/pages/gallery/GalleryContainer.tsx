// SPDX-License-Identifier: Apache-2.0
import { EditorContainer } from "@/features/editor/containers/EditorContainer";
import { EditorContextProvider } from "@/features/editor/context/EditorContext";
import { GalleryContextProvider, useGalleryContext } from "./GalleryContext";

/**
 * Inner component that uses the GalleryContext to coordinate between
 * the DatasetContext and EditorContext
 */
function GalleryContainerInner() {
	const {
		selectedSubfolder,
		currentDataset,
	} = useGalleryContext();

	return (
			<EditorContextProvider dataset={currentDataset}>
				<div className="h-full w-full overflow-hidden">
					<EditorContainer
						dataset={currentDataset}
						directory={selectedSubfolder ?? undefined}
					/>
				</div>
			</EditorContextProvider>
	);
}

/**
 * Container component for the gallery page
 *
 * This component provides the GalleryContext and coordinates between
 * the DatasetContext and EditorContext.
 */
export function GalleryContainer() {
	return (
		<GalleryContextProvider>
			<GalleryContainerInner />
		</GalleryContextProvider>
	);
}
