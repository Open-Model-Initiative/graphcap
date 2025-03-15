// SPDX-License-Identifier: Apache-2.0
import { EditorContainer } from '@/features/editor/containers/EditorContainer';
import { GalleryContextProvider, useGalleryContext } from './GalleryContext';
import { DatasetProvider } from '@/features/datasets/context/DatasetContext';
import { EditorContextProvider } from '@/features/editor/context/EditorContext';

/**
 * Inner component that uses the GalleryContext to coordinate between
 * the DatasetContext and EditorContext
 */
function GalleryContainerInner() {
  const {
    selectedDataset,
    selectedSubfolder,
    datasets,
    currentDataset,
    handleAddToDataset,
    handleCreateDataset,
    handleSelectDataset,
  } = useGalleryContext();

  return (
    <DatasetProvider
      initialDatasets={datasets}
      initialCurrentDataset={selectedDataset ?? ''}
      initialSelectedSubfolder={selectedSubfolder}
      onAddToDataset={handleAddToDataset}
      onCreateDataset={handleCreateDataset}
      onDatasetSelected={handleSelectDataset}
    >
      <EditorContextProvider dataset={currentDataset}>
        <div className="h-full w-full overflow-hidden">
          <EditorContainer 
            dataset={currentDataset} 
            directory={selectedSubfolder ?? undefined}
          />
        </div>
      </EditorContextProvider>
    </DatasetProvider>
  );
}

/**
 * Container component for the gallery page
 * 
 * This component provides the GalleryContext and coordinates between
 * the DatasetContext and EditorContext.
 * 
 * @param initialDataset - Optional dataset ID to select initially
 */
export function GalleryContainer({ initialDataset }: Readonly<{ initialDataset?: string }>) {
  return (
    <GalleryContextProvider initialDataset={initialDataset}>
      <GalleryContainerInner />
    </GalleryContextProvider>
  );
} 